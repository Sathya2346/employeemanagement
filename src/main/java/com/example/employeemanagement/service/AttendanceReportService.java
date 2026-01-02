package com.example.employeemanagement.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Stream;

import org.springframework.stereotype.Service;

import com.example.employeemanagement.model.Attendance;
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

@Service
public class AttendanceReportService {

    public ByteArrayInputStream generateAttendanceReport(List<Attendance> attendanceList, String employeeName, String fromDate, String toDate) {
        Document document = new Document(PageSize.A4, 40, 40, 50, 50);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 🔹 Title
            Font titleFont = new Font(Font.FontFamily.HELVETICA, 18, Font.BOLD, BaseColor.BLACK);
            Paragraph title = new Paragraph("Attendance Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(10);
            document.add(title);

            // 🔹 Employee Info and Date Range
            Font infoFont = new Font(Font.FontFamily.HELVETICA, 12, Font.NORMAL, new BaseColor(80, 80, 80));
            Paragraph empInfo = new Paragraph(
                    "Employee: " + employeeName + "\nFrom: " + fromDate + "   To: " + toDate,
                    infoFont);
            empInfo.setAlignment(Element.ALIGN_CENTER);
            empInfo.setSpacingAfter(15);
            document.add(empInfo);

            // 🔹 Table Setup
            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{2, 3, 3, 3, 3, 3});

            // Header style
            Font headFont = new Font(Font.FontFamily.HELVETICA, 12, Font.BOLD, BaseColor.WHITE);
            Stream.of("Date", "Check In", "Check Out", "Work Time", "Break Time", "Status")
                    .forEach(headerTitle -> {
                        PdfPCell header = new PdfPCell();
                        header.setBackgroundColor(new BaseColor(33, 150, 243)); // blue header
                        header.setPadding(8);
                        header.setPhrase(new Phrase(headerTitle, headFont));
                        header.setHorizontalAlignment(Element.ALIGN_CENTER);
                        table.addCell(header);
                    });

            // Body style
            Font bodyFont = new Font(Font.FontFamily.HELVETICA, 11, Font.NORMAL, BaseColor.BLACK);
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

            for (Attendance a : attendanceList) {
                table.addCell(new PdfPCell(new Phrase(a.getAttendanceDate().toString(), bodyFont)));
                table.addCell(new PdfPCell(new Phrase(a.getCheckInTime() != null ? a.getCheckInTime().format(timeFormatter) : "-", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(a.getCheckOutTime() != null ? a.getCheckOutTime().format(timeFormatter) : "-", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(a.getTotalWorkTime() != null ? a.getTotalWorkTime().toString() : "-", bodyFont)));
                table.addCell(new PdfPCell(new Phrase(a.getTotalBreakTime() != null ? a.getTotalBreakTime().toString() : "-", bodyFont)));
                PdfPCell statusCell = new PdfPCell(new Phrase(a.getStatus(), bodyFont));
                statusCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                table.addCell(statusCell);
            }

            document.add(table);

            // 🔹 Footer
            ZoneId ist = ZoneId.of("Asia/Kolkata");
            Paragraph footer = new Paragraph(
                    "Generated on: " + LocalDateTime.now(ist).format(DateTimeFormatter.ofPattern("dd-MM-yyyy hh:mm a")),
                    new Font(Font.FontFamily.HELVETICA, 9, Font.ITALIC, new BaseColor(120, 120, 120))
            );
            footer.setAlignment(Element.ALIGN_RIGHT);
            footer.setSpacingBefore(15);
            document.add(footer);

            document.close();

        } catch (DocumentException ex) {
            ex.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}
