package com.example.employeemanagement.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeDetailsService;
import com.example.employeemanagement.service.NotificationService;

import jakarta.servlet.http.HttpSession;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Controller
public class OnboardingController {

    @Autowired
    private EmployeeDetailsService detailsService;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/user/onboarding")
    public String showUserOnboardingForm(HttpSession session, Model model) {
        Long employeeId = (Long) session.getAttribute("employeeId");
        if (employeeId == null) return "redirect:/login";

        Employee e = employeeRepository.findById(employeeId).orElse(null);
        if (e == null) return "redirect:/login";

        EmployeeDetails details = detailsService.getDetailsByEmployeeId(employeeId);
        if (details == null) {
            details = new EmployeeDetails();
            if (e.getDateOfBirth() != null) details.setPersonalDateOfBirth(e.getDateOfBirth().toString());
            details.setPersonalGender(e.getGender());
            details.setPersonalPhone(e.getPhone());
            details.setPersonalAddress(e.getAddress());
            details.setPersonalCity(e.getCity());
        }

        model.addAttribute("employee", e);
        model.addAttribute("details", details);
        model.addAttribute("overallStatus", e.getOverallStatus());

        return "user/onboardingForm";
    }

    @PostMapping("/user/onboarding/submit")
    public String submitUserOnboarding(
            HttpSession session,
            @ModelAttribute EmployeeDetails details,
            @RequestParam(name = "photoFile", required = false) MultipartFile photoFile,
            @RequestParam(name = "aadharFile", required = false) MultipartFile aadharFile,
            @RequestParam(name = "panFile", required = false) MultipartFile panFile,
            @RequestParam(name = "mark10thFile", required = false) MultipartFile mark10thFile,
            @RequestParam(name = "mark12thFile", required = false) MultipartFile mark12thFile,
            @RequestParam(name = "sem1File", required = false) MultipartFile sem1File,
            @RequestParam(name = "sem2File", required = false) MultipartFile sem2File,
            @RequestParam(name = "sem3File", required = false) MultipartFile sem3File,
            @RequestParam(name = "sem4File", required = false) MultipartFile sem4File,
            @RequestParam(name = "sem5File", required = false) MultipartFile sem5File,
            @RequestParam(name = "sem6File", required = false) MultipartFile sem6File,
            @RequestParam(name = "sem7File", required = false) MultipartFile sem7File,
            @RequestParam(name = "sem8File", required = false) MultipartFile sem8File,
            @RequestParam(name = "transferCertFile", required = false) MultipartFile transferCertFile,
            @RequestParam(name = "provisionalCertFile", required = false) MultipartFile provisionalCertFile,
            @RequestParam(name = "courseCompletionFile", required = false) MultipartFile courseCompletionFile) throws IOException {

        Long employeeId = (Long) session.getAttribute("employeeId");
        if (employeeId != null) {
            if (photoFile != null && !photoFile.isEmpty()) details.setPhotoData(compressImage(photoFile.getBytes()));
            if (aadharFile != null && !aadharFile.isEmpty()) details.setAadharData(compressImage(aadharFile.getBytes()));
            if (panFile != null && !panFile.isEmpty()) details.setPanData(compressImage(panFile.getBytes()));
            if (mark10thFile != null && !mark10thFile.isEmpty()) details.setMark10thData(compressImage(mark10thFile.getBytes()));
            if (mark12thFile != null && !mark12thFile.isEmpty()) details.setMark12thData(compressImage(mark12thFile.getBytes()));
            if (sem1File != null && !sem1File.isEmpty()) details.setSem1Data(compressImage(sem1File.getBytes()));
            if (sem2File != null && !sem2File.isEmpty()) details.setSem2Data(compressImage(sem2File.getBytes()));
            if (sem3File != null && !sem3File.isEmpty()) details.setSem3Data(compressImage(sem3File.getBytes()));
            if (sem4File != null && !sem4File.isEmpty()) details.setSem4Data(compressImage(sem4File.getBytes()));
            if (sem5File != null && !sem5File.isEmpty()) details.setSem5Data(compressImage(sem5File.getBytes()));
            if (sem6File != null && !sem6File.isEmpty()) details.setSem6Data(compressImage(sem6File.getBytes()));
            if (sem7File != null && !sem7File.isEmpty()) details.setSem7Data(compressImage(sem7File.getBytes()));
            if (sem8File != null && !sem8File.isEmpty()) details.setSem8Data(compressImage(sem8File.getBytes()));
            if (transferCertFile != null && !transferCertFile.isEmpty()) details.setTransferCertData(compressImage(transferCertFile.getBytes()));
            if (provisionalCertFile != null && !provisionalCertFile.isEmpty()) details.setProvisionalCertData(compressImage(provisionalCertFile.getBytes()));
            if (courseCompletionFile != null && !courseCompletionFile.isEmpty()) details.setCourseCompletionData(compressImage(courseCompletionFile.getBytes()));

            detailsService.submitDetails(details, employeeId);
        }
        return "redirect:/user/onboarding";
    }

    private byte[] compressImage(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) return imageBytes;
        try {
            java.io.ByteArrayInputStream bais = new java.io.ByteArrayInputStream(imageBytes);
            java.awt.image.BufferedImage originalImage = javax.imageio.ImageIO.read(bais);
            if (originalImage == null) {
                return imageBytes;
            }

            int maxWidth = 900;
            int maxHeight = 900;
            int width = originalImage.getWidth();
            int height = originalImage.getHeight();

            double scale = Math.min((double) maxWidth / width, (double) maxHeight / height);
            if (scale > 1.0) scale = 1.0;

            int newWidth = Math.max(1, (int) (width * scale));
            int newHeight = Math.max(1, (int) (height * scale));

            java.awt.image.BufferedImage resizedImage = new java.awt.image.BufferedImage(
                newWidth, newHeight, java.awt.image.BufferedImage.TYPE_INT_RGB
            );

            java.awt.Graphics2D g2d = resizedImage.createGraphics();
            g2d.setRenderingHint(java.awt.RenderingHints.KEY_INTERPOLATION, java.awt.RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
            g2d.dispose();

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            java.util.Iterator<javax.imageio.ImageWriter> writers = javax.imageio.ImageIO.getImageWritersByFormatName("jpg");
            if (writers.hasNext()) {
                javax.imageio.ImageWriter writer = writers.next();
                javax.imageio.stream.ImageOutputStream ios = javax.imageio.ImageIO.createImageOutputStream(baos);
                writer.setOutput(ios);

                javax.imageio.ImageWriteParam param = writer.getDefaultWriteParam();
                if (param.canWriteCompressed()) {
                    param.setCompressionMode(javax.imageio.ImageWriteParam.MODE_EXPLICIT);
                    param.setCompressionQuality(0.65f);
                }

                writer.write(null, new javax.imageio.IIOImage(resizedImage, null, null), param);
                writer.dispose();
                ios.close();
            } else {
                javax.imageio.ImageIO.write(resizedImage, "jpg", baos);
            }
            return baos.toByteArray();
        } catch (Exception e) {
            return imageBytes;
        }
    }

    @GetMapping("/admin/onboarding/pending")
    public String listPendingReviews(Model model) {
        notificationService.markNotificationsAsRead("Admin", "Onboarding");
        model.addAttribute("adminUnreadCount", notificationService.countUnreadForAdmin());
        List<Employee> pendingEmployees = employeeRepository.findAll().stream()
                .filter(e -> "DETAILS_SUBMITTED".equals(e.getOverallStatus()) || "CHANGES_REQUESTED".equals(e.getOverallStatus()))
                .collect(Collectors.toList());
        model.addAttribute("pendingEmployees", pendingEmployees);
        return "admin/pendingOnboarding";
    }

    @GetMapping("/admin/onboarding/review/{id}")
    public String showReviewPage(@PathVariable Long id, Model model) {
        Employee e = employeeRepository.findById(id).orElse(null);
        if (e == null) return "redirect:/admin/onboarding/pending";
        EmployeeDetails details = detailsService.getDetailsByEmployeeId(id);
        if (details == null) details = new EmployeeDetails();
        model.addAttribute("employee", e);
        model.addAttribute("details", details);
        return "admin/reviewOnboarding";
    }

    @PostMapping("/admin/onboarding/review/{id}")
    public String submitReview(@PathVariable Long id, @ModelAttribute EmployeeDetails detailsForm) {
        detailsService.reviewDetails(id, detailsForm);
        return "redirect:/admin/onboarding/pending";
    }
}
