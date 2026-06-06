package com.example.employeemanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import com.example.employeemanagement.model.EmployeeDetails;
import com.example.employeemanagement.model.Employee;
import com.example.employeemanagement.model.Notification;
import com.example.employeemanagement.model.Settings;
import com.example.employeemanagement.repository.EmployeeDetailsRepository;
import com.example.employeemanagement.repository.EmployeeRepository;
import com.example.employeemanagement.repository.NotificationRepository;
import com.example.employeemanagement.repository.SettingsRepository;

@Service
public class EmployeeDetailsService {

    @Autowired private EmployeeDetailsRepository detailsRepository;
    @Autowired private EmployeeRepository employeeRepository;
    @Autowired private JavaMailSender mailSender;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private SettingsRepository settingsRepository;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String senderEmail;

    public EmployeeDetails getDetailsByEmployeeId(Long employeeId) {
        return detailsRepository.findByEmployeeId(employeeId);
    }

    @Transactional
    public void submitDetails(EmployeeDetails form, Long employeeId) {
        Employee e = employeeRepository.findById(employeeId).orElse(null);
        if (e == null) return;

        EmployeeDetails ex = detailsRepository.findByEmployeeId(employeeId);
        if (ex != null) {
            // Update fields only if NOT already APPROVED
            if (!"APPROVED".equals(ex.getPhoneStatus()))     { ex.setPersonalPhone(form.getPersonalPhone());     ex.setPhoneStatus("PENDING");     ex.setPhoneRejectionReason(null); }
            if (!"APPROVED".equals(ex.getAddressStatus()))   { ex.setPersonalAddress(form.getPersonalAddress()); ex.setAddressStatus("PENDING");   ex.setAddressRejectionReason(null); }
            if (!"APPROVED".equals(ex.getCityStatus()))      { ex.setPersonalCity(form.getPersonalCity());       ex.setCityStatus("PENDING");      ex.setCityRejectionReason(null); }
            if (!"APPROVED".equals(ex.getGenderStatus()))    { ex.setPersonalGender(form.getPersonalGender());   ex.setGenderStatus("PENDING");    ex.setGenderRejectionReason(null); }
            if (!"APPROVED".equals(ex.getDobStatus()))       { ex.setPersonalDateOfBirth(form.getPersonalDateOfBirth()); ex.setDobStatus("PENDING"); ex.setDobRejectionReason(null); }
            if (!"APPROVED".equals(ex.getEmergencyStatus())) { ex.setPersonalEmergencyNumber(form.getPersonalEmergencyNumber()); ex.setEmergencyStatus("PENDING"); ex.setEmergencyRejectionReason(null); }
            if (!"APPROVED".equals(ex.getMaritalFieldStatus())) { ex.setPersonalMaritalStatus(form.getPersonalMaritalStatus()); ex.setMaritalFieldStatus("PENDING"); ex.setMaritalFieldRejectionReason(null); }
            if (!"APPROVED".equals(ex.getLanguageStatus()))  { ex.setPersonalLanguage(form.getPersonalLanguage()); ex.setLanguageStatus("PENDING"); ex.setLanguageRejectionReason(null); }
            if (!"APPROVED".equals(ex.getBloodStatus()))     { ex.setPersonalBloodGroup(form.getPersonalBloodGroup()); ex.setBloodStatus("PENDING"); ex.setBloodRejectionReason(null); }

            // Aadhar & PAN
            if (!"APPROVED".equals(ex.getAadharStatus())) { 
                ex.setAadharNumber(form.getAadharNumber()); 
                if (form.getAadharData() != null) ex.setAadharData(form.getAadharData());
                ex.setAadharStatus("PENDING"); ex.setAadharRejectionReason(null); 
            }
            if (!"APPROVED".equals(ex.getPanStatus())) { 
                ex.setPanNumber(form.getPanNumber()); 
                if (form.getPanData() != null) ex.setPanData(form.getPanData());
                ex.setPanStatus("PENDING"); ex.setPanRejectionReason(null); 
            }

            // Education
            if (!"APPROVED".equals(ex.getDegreeNameStatus())) { ex.setDegreeName(form.getDegreeName()); ex.setDegreeNameStatus("PENDING"); ex.setDegreeNameRejectionReason(null); }
            if (!"APPROVED".equals(ex.getDegreeInstStatus())) { ex.setDegreeInstitution(form.getDegreeInstitution()); ex.setDegreeInstStatus("PENDING"); ex.setDegreeInstRejectionReason(null); }

            // Banking
            if (!"APPROVED".equals(ex.getAccountStatus()))   { ex.setAccountNumber(form.getAccountNumber()); ex.setAccountStatus("PENDING"); ex.setAccountRejectionReason(null); }
            if (!"APPROVED".equals(ex.getBankNameStatus()))  { ex.setBankName(form.getBankName()); ex.setBankNameStatus("PENDING"); ex.setBankNameRejectionReason(null); }
            if (!"APPROVED".equals(ex.getIfscStatus()))      { ex.setIfscCode(form.getIfscCode()); ex.setIfscStatus("PENDING"); ex.setIfscRejectionReason(null); }
            if (!"APPROVED".equals(ex.getBranchStatus()))    { ex.setPersonalBranch(form.getPersonalBranch()); ex.setBranchStatus("PENDING"); ex.setBranchRejectionReason(null); }

            // Documents (Update only if new file provided)
            if (form.getPhotoData() != null && !"APPROVED".equals(ex.getPhotoStatus())) { ex.setPhotoData(form.getPhotoData()); ex.setPhotoStatus("PENDING"); ex.setPhotoRejectionReason(null); }
            if (form.getMark10thData() != null && !"APPROVED".equals(ex.getMark10thStatus())) { ex.setMark10thData(form.getMark10thData()); ex.setMark10thStatus("PENDING"); ex.setMark10thRejectionReason(null); }
            if (form.getMark12thData() != null && !"APPROVED".equals(ex.getMark12thStatus())) { ex.setMark12thData(form.getMark12thData()); ex.setMark12thStatus("PENDING"); ex.setMark12thRejectionReason(null); }
            
            if (form.getSem1Data() != null && !"APPROVED".equals(ex.getSem1Status())) { ex.setSem1Data(form.getSem1Data()); ex.setSem1Status("PENDING"); ex.setSem1RejectionReason(null); }
            if (form.getSem2Data() != null && !"APPROVED".equals(ex.getSem2Status())) { ex.setSem2Data(form.getSem2Data()); ex.setSem2Status("PENDING"); ex.setSem2RejectionReason(null); }
            if (form.getSem3Data() != null && !"APPROVED".equals(ex.getSem3Status())) { ex.setSem3Data(form.getSem3Data()); ex.setSem3Status("PENDING"); ex.setSem3RejectionReason(null); }
            if (form.getSem4Data() != null && !"APPROVED".equals(ex.getSem4Status())) { ex.setSem4Data(form.getSem4Data()); ex.setSem4Status("PENDING"); ex.setSem4RejectionReason(null); }
            if (form.getSem5Data() != null && !"APPROVED".equals(ex.getSem5Status())) { ex.setSem5Data(form.getSem5Data()); ex.setSem5Status("PENDING"); ex.setSem5RejectionReason(null); }
            if (form.getSem6Data() != null && !"APPROVED".equals(ex.getSem6Status())) { ex.setSem6Data(form.getSem6Data()); ex.setSem6Status("PENDING"); ex.setSem6RejectionReason(null); }
            if (form.getSem7Data() != null && !"APPROVED".equals(ex.getSem7Status())) { ex.setSem7Data(form.getSem7Data()); ex.setSem7Status("PENDING"); ex.setSem7RejectionReason(null); }
            if (form.getSem8Data() != null && !"APPROVED".equals(ex.getSem8Status())) { ex.setSem8Data(form.getSem8Data()); ex.setSem8Status("PENDING"); ex.setSem8RejectionReason(null); }
            
            if (form.getTransferCertData() != null && !"APPROVED".equals(ex.getTransferCertStatus())) { ex.setTransferCertData(form.getTransferCertData()); ex.setTransferCertStatus("PENDING"); ex.setTransferCertRejectionReason(null); }
            if (form.getProvisionalCertData() != null && !"APPROVED".equals(ex.getProvisionalCertStatus())) { ex.setProvisionalCertData(form.getProvisionalCertData()); ex.setProvisionalCertStatus("PENDING"); ex.setProvisionalCertRejectionReason(null); }
            if (form.getCourseCompletionData() != null && !"APPROVED".equals(ex.getCourseCompletionStatus())) { ex.setCourseCompletionData(form.getCourseCompletionData()); ex.setCourseCompletionStatus("PENDING"); ex.setCourseCompletionRejectionReason(null); }

            detailsRepository.save(ex);
        } else {
            form.setEmployee(e);
            detailsRepository.save(form);
        }

        e.setOverallStatus("DETAILS_SUBMITTED");
        e.setNotifyAdminFlag(true);
        employeeRepository.save(e);
        notificationService.sendAdminNotification(
            "Onboarding Submitted",
            e.getFirstname() + " " + e.getLastname() + " has submitted their onboarding details for review.",
            "Onboarding",
            e.getId()
        );

        // Fetch latest saved details and send email to Admin/HR
        // EmployeeDetails savedDetails = detailsRepository.findByEmployeeId(employeeId);
        // if (savedDetails != null) {
        //     sendOnboardingDetailsEmail(e, savedDetails);
        // }
        sendOnboardingReceiptEmail(e);
    }

    private void sendOnboardingDetailsEmail(Employee e, EmployeeDetails details) {
        try {
            StringBuilder sb = new StringBuilder();
            sb.append("Dear HR / Admin,\n\n");
            sb.append("A new onboarding form has been submitted. Here are the employee's details:\n\n");

            sb.append("=== Basic Info ===\n");
            sb.append("Employee ID: ").append(e.getId()).append("\n");
            sb.append("Name: ").append(e.getFirstname()).append(" ").append(e.getLastname()).append("\n");
            sb.append("Username: ").append(e.getUsername()).append("\n");
            sb.append("Email: ").append(e.getEmail()).append("\n\n");

            sb.append("=== Personal Information ===\n");
            sb.append("Phone: ").append(details.getPersonalPhone()).append("\n");
            sb.append("Address: ").append(details.getPersonalAddress()).append("\n");
            sb.append("City: ").append(details.getPersonalCity()).append("\n");
            sb.append("Gender: ").append(details.getPersonalGender()).append("\n");
            sb.append("Date of Birth: ").append(details.getPersonalDateOfBirth()).append("\n");
            sb.append("Emergency Number: ").append(details.getPersonalEmergencyNumber()).append("\n");
            sb.append("Marital Status: ").append(details.getPersonalMaritalStatus()).append("\n");
            sb.append("Language: ").append(details.getPersonalLanguage()).append("\n");
            sb.append("Blood Group: ").append(details.getPersonalBloodGroup()).append("\n\n");

            sb.append("=== Identity Info ===\n");
            sb.append("Aadhar Number: ").append(details.getAadharNumber()).append("\n");
            sb.append("PAN Number: ").append(details.getPanNumber()).append("\n\n");

            sb.append("=== Banking Details ===\n");
            sb.append("Account Number: ").append(details.getAccountNumber()).append("\n");
            sb.append("Bank Name: ").append(details.getBankName()).append("\n");
            sb.append("IFSC Code: ").append(details.getIfscCode()).append("\n");
            sb.append("Branch Name: ").append(details.getPersonalBranch()).append("\n\n");

            sb.append("=== Education Details ===\n");
            sb.append("Degree Name: ").append(details.getDegreeName()).append("\n");
            sb.append("Institution: ").append(details.getDegreeInstitution()).append("\n\n");

            sb.append("=== Uploaded Documents ===\n");
            sb.append("Photo: ").append(details.getPhotoData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("Aadhar Document: ").append(details.getAadharData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("PAN Document: ").append(details.getPanData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("10th Marksheet: ").append(details.getMark10thData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("12th Marksheet: ").append(details.getMark12thData() != null ? "Uploaded" : "Not Provided").append("\n");
            int semCount = 0;
            if (details.getSem1Data() != null) semCount++;
            if (details.getSem2Data() != null) semCount++;
            if (details.getSem3Data() != null) semCount++;
            if (details.getSem4Data() != null) semCount++;
            if (details.getSem5Data() != null) semCount++;
            if (details.getSem6Data() != null) semCount++;
            if (details.getSem7Data() != null) semCount++;
            if (details.getSem8Data() != null) semCount++;
            sb.append("Semester Marksheets: ").append(semCount).append(" uploaded\n");
            sb.append("Transfer Cert: ").append(details.getTransferCertData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("Provisional Cert: ").append(details.getProvisionalCertData() != null ? "Uploaded" : "Not Provided").append("\n");
            sb.append("Course Completion Cert: ").append(details.getCourseCompletionData() != null ? "Uploaded" : "Not Provided").append("\n\n");

            sb.append("Regards,\nEMS Onboarding System");

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(senderEmail);
            msg.setTo(senderEmail); // Send to HR/Admin Gmail
            msg.setSubject("📋 Onboarding Details Submitted - " + e.getFirstname() + " " + e.getLastname());
            msg.setText(sb.toString());
            mailSender.send(msg);
        } catch (Exception ex) {
            System.err.println("Failed to send onboarding details email: " + ex.getMessage());
        }
    }

    @Transactional
    public void reviewDetails(Long employeeId, EmployeeDetails review) {
        EmployeeDetails ex = detailsRepository.findByEmployeeId(employeeId);
        Employee e = employeeRepository.findById(employeeId).orElse(null);
        if (ex == null || e == null) return;

        // Apply admin decisions (with null checks)
        if (review.getPhoneStatus() != null) ex.setPhoneStatus(review.getPhoneStatus());
        if (review.getPhoneRejectionReason() != null) ex.setPhoneRejectionReason(review.getPhoneRejectionReason());
        
        if (review.getAddressStatus() != null) {
            ex.setAddressStatus(review.getAddressStatus());
            ex.setCityStatus(review.getAddressStatus()); // Sync City with Address
        }
        if (review.getAddressRejectionReason() != null) {
            ex.setAddressRejectionReason(review.getAddressRejectionReason());
            ex.setCityRejectionReason(review.getAddressRejectionReason());
        }

        if (review.getGenderStatus() != null) ex.setGenderStatus(review.getGenderStatus());
        if (review.getGenderRejectionReason() != null) ex.setGenderRejectionReason(review.getGenderRejectionReason());

        if (review.getDobStatus() != null) ex.setDobStatus(review.getDobStatus());
        if (review.getDobRejectionReason() != null) ex.setDobRejectionReason(review.getDobRejectionReason());

        if (review.getEmergencyStatus() != null) ex.setEmergencyStatus(review.getEmergencyStatus());
        if (review.getEmergencyRejectionReason() != null) ex.setEmergencyRejectionReason(review.getEmergencyRejectionReason());

        if (review.getMaritalFieldStatus() != null) ex.setMaritalFieldStatus(review.getMaritalFieldStatus());
        if (review.getMaritalFieldRejectionReason() != null) ex.setMaritalFieldRejectionReason(review.getMaritalFieldRejectionReason());

        if (review.getLanguageStatus() != null) ex.setLanguageStatus(review.getLanguageStatus());
        if (review.getLanguageRejectionReason() != null) ex.setLanguageRejectionReason(review.getLanguageRejectionReason());

        if (review.getBloodStatus() != null) ex.setBloodStatus(review.getBloodStatus());
        if (review.getBloodRejectionReason() != null) ex.setBloodRejectionReason(review.getBloodRejectionReason());

        if (review.getAadharStatus() != null) ex.setAadharStatus(review.getAadharStatus());
        if (review.getAadharRejectionReason() != null) ex.setAadharRejectionReason(review.getAadharRejectionReason());

        if (review.getPanStatus() != null) ex.setPanStatus(review.getPanStatus());
        if (review.getPanRejectionReason() != null) ex.setPanRejectionReason(review.getPanRejectionReason());

        if (review.getDegreeNameStatus() != null) ex.setDegreeNameStatus(review.getDegreeNameStatus());
        if (review.getDegreeNameRejectionReason() != null) ex.setDegreeNameRejectionReason(review.getDegreeNameRejectionReason());

        if (review.getDegreeInstStatus() != null) ex.setDegreeInstStatus(review.getDegreeInstStatus());
        if (review.getDegreeInstRejectionReason() != null) ex.setDegreeInstRejectionReason(review.getDegreeInstRejectionReason());

        if (review.getAccountStatus() != null) ex.setAccountStatus(review.getAccountStatus());
        if (review.getAccountRejectionReason() != null) ex.setAccountRejectionReason(review.getAccountRejectionReason());

        if (review.getBankNameStatus() != null) ex.setBankNameStatus(review.getBankNameStatus());
        if (review.getBankNameRejectionReason() != null) ex.setBankNameRejectionReason(review.getBankNameRejectionReason());

        if (review.getIfscStatus() != null) ex.setIfscStatus(review.getIfscStatus());
        if (review.getIfscRejectionReason() != null) ex.setIfscRejectionReason(review.getIfscRejectionReason());

        if (review.getBranchStatus() != null) ex.setBranchStatus(review.getBranchStatus());
        if (review.getBranchRejectionReason() != null) ex.setBranchRejectionReason(review.getBranchRejectionReason());

        if (review.getPhotoStatus() != null) ex.setPhotoStatus(review.getPhotoStatus());
        if (review.getPhotoRejectionReason() != null) ex.setPhotoRejectionReason(review.getPhotoRejectionReason());

        if (review.getMark10thStatus() != null) ex.setMark10thStatus(review.getMark10thStatus());
        if (review.getMark10thRejectionReason() != null) ex.setMark10thRejectionReason(review.getMark10thRejectionReason());

        if (review.getMark12thStatus() != null) ex.setMark12thStatus(review.getMark12thStatus());
        if (review.getMark12thRejectionReason() != null) ex.setMark12thRejectionReason(review.getMark12thRejectionReason());
        
        if (review.getSem1Status() != null) ex.setSem1Status(review.getSem1Status()); if (review.getSem1RejectionReason() != null) ex.setSem1RejectionReason(review.getSem1RejectionReason());
        if (review.getSem2Status() != null) ex.setSem2Status(review.getSem2Status()); if (review.getSem2RejectionReason() != null) ex.setSem2RejectionReason(review.getSem2RejectionReason());
        if (review.getSem3Status() != null) ex.setSem3Status(review.getSem3Status()); if (review.getSem3RejectionReason() != null) ex.setSem3RejectionReason(review.getSem3RejectionReason());
        if (review.getSem4Status() != null) ex.setSem4Status(review.getSem4Status()); if (review.getSem4RejectionReason() != null) ex.setSem4RejectionReason(review.getSem4RejectionReason());
        if (review.getSem5Status() != null) ex.setSem5Status(review.getSem5Status()); if (review.getSem5RejectionReason() != null) ex.setSem5RejectionReason(review.getSem5RejectionReason());
        if (review.getSem6Status() != null) ex.setSem6Status(review.getSem6Status()); if (review.getSem6RejectionReason() != null) ex.setSem6RejectionReason(review.getSem6RejectionReason());
        if (review.getSem7Status() != null) ex.setSem7Status(review.getSem7Status()); if (review.getSem7RejectionReason() != null) ex.setSem7RejectionReason(review.getSem7RejectionReason());
        if (review.getSem8Status() != null) ex.setSem8Status(review.getSem8Status()); if (review.getSem8RejectionReason() != null) ex.setSem8RejectionReason(review.getSem8RejectionReason());
        
        if (review.getTransferCertStatus() != null) ex.setTransferCertStatus(review.getTransferCertStatus()); if (review.getTransferCertRejectionReason() != null) ex.setTransferCertRejectionReason(review.getTransferCertRejectionReason());
        if (review.getProvisionalCertStatus() != null) ex.setProvisionalCertStatus(review.getProvisionalCertStatus()); if (review.getProvisionalCertRejectionReason() != null) ex.setProvisionalCertRejectionReason(review.getProvisionalCertRejectionReason());
        if (review.getCourseCompletionStatus() != null) ex.setCourseCompletionStatus(review.getCourseCompletionStatus()); if (review.getCourseCompletionRejectionReason() != null) ex.setCourseCompletionRejectionReason(review.getCourseCompletionRejectionReason());

        detailsRepository.save(ex);

        // Check if ALL fields are APPROVED
        boolean allApproved = 
            "APPROVED".equals(ex.getPhoneStatus()) && "APPROVED".equals(ex.getAddressStatus()) &&
            "APPROVED".equals(ex.getCityStatus()) && "APPROVED".equals(ex.getGenderStatus()) &&
            "APPROVED".equals(ex.getDobStatus()) && "APPROVED".equals(ex.getEmergencyStatus()) &&
            "APPROVED".equals(ex.getMaritalFieldStatus()) && "APPROVED".equals(ex.getLanguageStatus()) &&
            "APPROVED".equals(ex.getBloodStatus()) && "APPROVED".equals(ex.getAadharStatus()) &&
            "APPROVED".equals(ex.getPanStatus()) && "APPROVED".equals(ex.getDegreeNameStatus()) &&
            "APPROVED".equals(ex.getDegreeInstStatus()) && "APPROVED".equals(ex.getAccountStatus()) &&
            "APPROVED".equals(ex.getBankNameStatus()) && "APPROVED".equals(ex.getIfscStatus()) &&
            "APPROVED".equals(ex.getPhotoStatus()) && "APPROVED".equals(ex.getMark10thStatus()) &&
            "APPROVED".equals(ex.getMark12thStatus()) && "APPROVED".equals(ex.getSem1Status()) &&
            "APPROVED".equals(ex.getSem2Status()) && "APPROVED".equals(ex.getSem3Status()) &&
            "APPROVED".equals(ex.getSem4Status()) && "APPROVED".equals(ex.getSem5Status()) &&
            "APPROVED".equals(ex.getSem6Status()) && "APPROVED".equals(ex.getSem7Status()) &&
            "APPROVED".equals(ex.getSem8Status()) && "APPROVED".equals(ex.getBranchStatus()) &&
            "APPROVED".equals(ex.getTransferCertStatus()) &&
            "APPROVED".equals(ex.getProvisionalCertStatus()) && "APPROVED".equals(ex.getCourseCompletionStatus());

        if (allApproved) {
            e.setPhone(ex.getPersonalPhone());
            e.setAddress(ex.getPersonalAddress());
            e.setCity(ex.getPersonalCity());
            e.setGender(ex.getPersonalGender());
            e.setEmergencyNumber(ex.getPersonalEmergencyNumber());
            e.setMaritalStatus(ex.getPersonalMaritalStatus());
            e.setLanguage(ex.getPersonalLanguage());
            e.setBlood(ex.getPersonalBloodGroup());
            
            // ✅ Fix: Copy Date of Birth (Parse String to LocalDate)
            if (ex.getPersonalDateOfBirth() != null && !ex.getPersonalDateOfBirth().isEmpty()) {
                try {
                    e.setDateOfBirth(java.time.LocalDate.parse(ex.getPersonalDateOfBirth()));
                } catch (Exception exDob) { System.err.println("DOB Parse failed: " + exDob.getMessage()); }
            }
            
            // Transfer banking and identification details to Employee entity
            if (e.getBankDetails() == null) e.setBankDetails(new com.example.employeemanagement.model.BankDetails());
            e.getBankDetails().setAccNumber(ex.getAccountNumber());
            e.getBankDetails().setBankName(ex.getBankName());
            e.getBankDetails().setIfscCode(ex.getIfscCode());
            e.getBankDetails().setBranchName(ex.getPersonalBranch());
            e.getBankDetails().setPanCard(ex.getPanNumber());
            // Acc holder name is required in BankDetails
            e.getBankDetails().setAccHolderName(e.getFirstname() + " " + e.getLastname());
            
            if (ex.getPhotoData() != null) e.setProfile(ex.getPhotoData());
            e.setOverallStatus("FULLY_APPROVED");
            e.setNotifyAdminFlag(false);
            employeeRepository.save(e);
            
            notificationService.sendNotification(
                "Onboarding Approved",
                "Congratulations! Your onboarding profile has been fully approved. You now have full access to the portal.",
                "Onboarding",
                e.getId(),
                e.getUsername()
            );
            notifyUserOfApproval(e.getEmail(), e.getFirstname() + " " + e.getLastname());
        } else {
            e.setOverallStatus("CHANGES_REQUESTED");
            e.setNotifyAdminFlag(false);
            employeeRepository.save(e);
            
            notificationService.sendNotification(
                "Changes Requested",
                "Your onboarding profile requires some changes. Please check the rejected fields and resubmit.",
                "Onboarding",
                e.getId(),
                e.getUsername()
            );
            notifyUserOfRejections(e.getEmail(), e.getFirstname() + " " + e.getLastname(), ex);
        }
    }

    private void createAdminNotification(String message) {
        try {
            Notification n = new Notification();
            n.setEmployeeName("Admin");
            n.setTitle("Onboarding Submission");
            n.setDescription(message);
            n.setReadStatus(false);
            n.setCreatedAt(java.time.LocalDateTime.now(com.example.employeemanagement.util.AppConstants.IST));
            notificationRepository.save(n);
        } catch (Exception ex) { System.err.println("Failed to create admin notification: " + ex.getMessage()); }
    }

    private void notifyUserOfApproval(String email, String name) {
        try {
            Settings settings = settingsRepository.findById("default").orElseGet(() -> {
                Settings ds = new Settings();
                return settingsRepository.save(ds);
            });
            String subject = settings.getApprovalEmailSubject();
            String body = settings.getApprovalEmailBody()
                    .replace("{name}", name);

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(senderEmail);
            msg.setTo(email);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ex) {
            System.err.println("Approval email failed: " + ex.getMessage());
        }
    }

    private void notifyUserOfRejections(String email, String name, EmployeeDetails d) {
        try {
            Settings settings = settingsRepository.findById("default").orElseGet(() -> {
                Settings ds = new Settings();
                return settingsRepository.save(ds);
            });

            StringBuilder rejections = new StringBuilder();
            addIf(rejections, d.getPhoneStatus(), "Phone", d.getPhoneRejectionReason());
            addIf(rejections, d.getAddressStatus(), "Address", d.getAddressRejectionReason());
            addIf(rejections, d.getCityStatus(), "City", d.getCityRejectionReason());
            addIf(rejections, d.getGenderStatus(), "Gender", d.getGenderRejectionReason());
            addIf(rejections, d.getDobStatus(), "Date of Birth", d.getDobRejectionReason());
            addIf(rejections, d.getEmergencyStatus(), "Emergency Contact", d.getEmergencyRejectionReason());
            addIf(rejections, d.getMaritalFieldStatus(), "Marital Status", d.getMaritalFieldRejectionReason());
            addIf(rejections, d.getLanguageStatus(), "Language", d.getLanguageRejectionReason());
            addIf(rejections, d.getBloodStatus(), "Blood Group", d.getBloodRejectionReason());
            addIf(rejections, d.getAadharStatus(), "Aadhar Number", d.getAadharRejectionReason());
            addIf(rejections, d.getPanStatus(), "PAN Number", d.getPanRejectionReason());
            addIf(rejections, d.getAccountStatus(), "Bank Account", d.getAccountRejectionReason());
            addIf(rejections, d.getBankNameStatus(), "Bank Name", d.getBankNameRejectionReason());
            addIf(rejections, d.getIfscStatus(), "IFSC Code", d.getIfscRejectionReason());
            addIf(rejections, d.getBranchStatus(), "Bank Branch", d.getBranchRejectionReason());
            addIf(rejections, d.getDegreeNameStatus(), "Degree Name", d.getDegreeNameRejectionReason());
            addIf(rejections, d.getDegreeInstStatus(), "University/College", d.getDegreeInstRejectionReason());
            addIf(rejections, d.getPhotoStatus(), "Profile Photo", d.getPhotoRejectionReason());
            addIf(rejections, d.getMark10thStatus(), "10th Marksheet", d.getMark10thRejectionReason());
            addIf(rejections, d.getMark12thStatus(), "12th Marksheet", d.getMark12thRejectionReason());
            for (int i = 1; i <= 8; i++) {
                String status = (String) d.getClass().getMethod("getSem" + i + "Status").invoke(d);
                String reason = (String) d.getClass().getMethod("getSem" + i + "RejectionReason").invoke(d);
                addIf(rejections, status, "Semester " + i + " Marksheet", reason);
            }
            addIf(rejections, d.getTransferCertStatus(), "Transfer Certificate", d.getTransferCertRejectionReason());
            addIf(rejections, d.getProvisionalCertStatus(), "Provisional Certificate", d.getProvisionalCertRejectionReason());
            addIf(rejections, d.getCourseCompletionStatus(), "Course Completion Cert", d.getCourseCompletionRejectionReason());

            String subject = settings.getRejectionEmailSubject();
            String body = settings.getRejectionEmailBody()
                    .replace("{name}", name)
                    .replace("{rejections}", rejections.toString().trim());

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(senderEmail);
            msg.setTo(email);
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ex) {
            System.err.println("Rejection email failed: " + ex.getMessage());
        }
    }

    private void sendOnboardingReceiptEmail(Employee e) {
        try {
            Settings settings = settingsRepository.findById("default").orElseGet(() -> {
                Settings ds = new Settings();
                return settingsRepository.save(ds);
            });
            String name = e.getFirstname() + " " + e.getLastname();
            String subject = settings.getReceiptEmailSubject();
            String body = settings.getReceiptEmailBody()
                    .replace("{name}", name);

            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(senderEmail);
            msg.setTo(e.getEmail());
            msg.setSubject(subject);
            msg.setText(body);
            mailSender.send(msg);
        } catch (Exception ex) {
            System.err.println("Receipt email failed: " + ex.getMessage());
        }
    }

    private void addIf(StringBuilder sb, String status, String label, String reason) {
        if (status != null && "REJECTED".equalsIgnoreCase(status.trim())) {
            sb.append("  ❌ ").append(label).append(" — ")
              .append((reason != null && !reason.trim().isEmpty()) ? reason.trim() : "Please correct")
              .append("\n");
        }
    }
}
