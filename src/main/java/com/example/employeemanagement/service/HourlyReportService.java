package com.example.employeemanagement.service;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.HourlyReport;
import com.example.employeemanagement.repository.HourlyReportRepository;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Document;
import com.itextpdf.text.DocumentException;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Phrase;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

import jakarta.servlet.http.HttpServletResponse;

@Service
public class HourlyReportService {

    @Autowired
    private HourlyReportRepository repository;

    @Autowired
    private EmployeeService employeeService;

    public List<HourlyReport> getReportsByEmployeeId(Long employeeId) {
        return repository.findByEmployee_Id(employeeId);
    }

    public void saveAll(List<HourlyReport> reports) {
        for (HourlyReport r : reports) {
            // Ensure proper Employee mapping
            if (r.getEmployee() == null && r.getEmployeeName() != null && r.getEmployeeName().trim().length() > 0) {
                // Optional: infer employee from name, but better if frontend sends employeeId
            }

            // 🔹 FIX: frontend sends employeeId in JSON, so we manually attach Employee
            if (r.getEmployee() == null && r.getEmployeeId() != null) {
                Employee emp = employeeService.getEmployeeById(Long.parseLong(r.getEmployeeId()));
                r.setEmployee(emp);
            }

            if (r.getCreatedAt() == null) {
                r.setCreatedAt(LocalDateTime.now());
            }
        }
        repository.saveAll(reports);
    }

    // ✅ PDF Export(iText5)
    public void exportReportAsPdf(Long employeeId, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=HourlyReport_" + employeeId + ".pdf");

        List<HourlyReport> reports = repository.findByEmployee_Id(employeeId);

        try {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, response.getOutputStream());
            document.open();

            // 🔹 Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
            Paragraph title = new Paragraph("Employee Hourly Report\n\n", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            // 🔹 Table setup
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setWidths(new float[]{2.5f, 4f, 2.5f, 3f});

            Font headFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);

            Stream.of("Time Slot", "Task Description", "Status", "Date").forEach(headerTitle -> {
                PdfPCell header = new PdfPCell(new Phrase(headerTitle, headFont));
                header.setBackgroundColor(new BaseColor(33, 150, 243)); // blue header
                header.setHorizontalAlignment(Element.ALIGN_CENTER);
                header.setPadding(8);
                table.addCell(header);
            });

            Font bodyFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.BLACK);

            for (HourlyReport r : reports) {
                table.addCell(new Phrase(r.getTimeSlot() != null ? r.getTimeSlot() : "-", bodyFont));
                table.addCell(new Phrase(r.getTaskDescription() != null ? r.getTaskDescription() : "-", bodyFont));
                table.addCell(new Phrase(r.getStatus() != null ? r.getStatus() : "-", bodyFont));
                table.addCell(new Phrase(r.getCreatedAt() != null ? r.getCreatedAt().toString() : "-", bodyFont));
            }

            document.add(table);

            // 🔹 Footer
            Font footerFont = new Font(Font.FontFamily.HELVETICA, 10, Font.ITALIC, new BaseColor(120, 120, 120));
            Paragraph footer = new Paragraph(
                    "Generated on: " + LocalDateTime.now(ZoneId.of("Asia/Kolkata")).toString(),
                    footerFont
            );
            footer.setAlignment(Element.ALIGN_RIGHT);
            footer.setSpacingBefore(20);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            e.printStackTrace();
        }
    }

    // ✅ Helper: String → LocalDateTime
    private LocalDateTime parseDate(String date, boolean endOfDay) {
        if (date == null || date.isEmpty()) return null;
        LocalDate d = LocalDate.parse(date);
        return endOfDay ? d.atTime(23, 59, 59) : d.atStartOfDay();
    }

    // ✅ Global filter
    public List<HourlyReport> filterReports(String fromDate, String toDate, String timeSlot, String status) {
        LocalDateTime from = parseDate(fromDate, false);
        LocalDateTime to = parseDate(toDate, true);
        return repository.filterReports(from, to, timeSlot, status);
    }

    // ✅ Per employee filter
    public List<HourlyReport> filterReportsForEmployee(Long employeeId, String fromDate, String toDate, String timeSlot, String status) {
        LocalDateTime from = parseDate(fromDate, false);
        LocalDateTime to = parseDate(toDate, true);
        List<HourlyReport> result = repository.filterReportsForEmployee(employeeId, from, to, timeSlot, status);

        System.out.println("🔍 Filter result for EmpID " + employeeId + " => " + result.size() + " records");
        return result;
    }
}
