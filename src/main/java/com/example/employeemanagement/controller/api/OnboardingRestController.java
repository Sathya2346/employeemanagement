package com.example.employeemanagement.controller.api;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.service.EmployeeDetailsService;

@RestController
@RequestMapping("/api/onboarding")
@CrossOrigin(origins = "*")
public class OnboardingRestController {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private EmployeeDetailsService detailsService;

    @PostMapping("/submit")
    public ResponseEntity<?> submitOnboarding(
            @ModelAttribute EmployeeDetails details,
            @RequestParam(name = "employeeId", required = false) Long employeeId,
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
            @RequestParam(name = "courseCompletionFile", required = false) MultipartFile courseCompletionFile) {
        
        try {
            if (employeeId == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee ID is required.");
                return ResponseEntity.badRequest().body(err);
            }

            Employee emp = employeeRepository.findById(employeeId).orElse(null);
            if (emp == null) {
                Map<String, Object> err = new HashMap<>();
                err.put("success", false);
                err.put("message", "Employee not found.");
                return ResponseEntity.badRequest().body(err);
            }

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

            Employee saved = employeeRepository.findById(employeeId).orElse(emp);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Onboarding submitted successfully!");
            response.put("employee", saved);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> err = new HashMap<>();
            err.put("success", false);
            err.put("message", "Failed to submit onboarding: " + e.getMessage());
            return ResponseEntity.internalServerError().body(err);
        }
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
}
