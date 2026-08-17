package com.example.employeemanagement.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;
import com.example.employeemanagement.model.EmailTemplate;
import com.example.employeemanagement.repository.EmailTemplateRepository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class EmailTemplateService implements CommandLineRunner {

    @Autowired
    private EmailTemplateRepository templateRepository;

    @Override
    public void run(String... args) {
        initDefaultTemplates();
    }

    public void initDefaultTemplates() {
        createIfMissing("WELCOME_EMAIL", "Welcome Email", 
            "Sent when a new employee account is created.", 
            "🎉 Welcome to Employee Management System — Your Login Credentials", 
            "Hello,\n\nYour employee account has been created. Use the credentials below to log in:\n\n  Username : {username}\n  Email    : {email}\n  Password : {password}\n\nAfter logging in, please complete your onboarding profile.\n\nRegards,\nHR Team");

        createIfMissing("ONBOARDING_RECEIPT", "Onboarding Receipt Email", 
            "Sent to user after submitting onboarding details.", 
            "📋 Onboarding Details Submitted Successfully", 
            "Dear {name},\n\nWe have successfully received your onboarding details. The HR/Admin team will review your submission shortly.\n\nRegards,\nHR Team");

        createIfMissing("ONBOARDING_REJECTION", "Onboarding Rejection Email", 
            "Sent to user when onboarding fields are rejected.", 
            "⚠️ Onboarding — Action Required", 
            "Dear {name},\n\nThe following fields in your onboarding submission need corrections:\n\n{rejections}\n\nPlease correct these and resubmit.\n\nRegards,\nHR Team");

        createIfMissing("ONBOARDING_APPROVAL", "Onboarding Approval Email", 
            "Sent to user when onboarding details are approved.", 
            "✅ Onboarding Fully Approved!", 
            "Dear {name},\n\nAll your details have been fully approved by HR. You now have complete access to the portal.\n\nRegards,\nHR Team");

        createIfMissing("PASSWORD_RESET_OTP", "Password Reset OTP Email", 
            "Sent when a user requests password reset OTP.", 
            "🔐 Employee Management - Password Reset OTP", 
            "Your password reset OTP is: {otp}. It is valid for {expiry_minutes} minutes.");

        createIfMissing("ADMIN_ONBOARDING_ALERT", "Admin Onboarding Alert Email", 
            "Sent to Admin/HR when a user submits onboarding.", 
            "📋 Onboarding Details Submitted - {name}", 
            "Employee {name} ({email}) has submitted onboarding details for review.\n\nDetails Submitted:\n{summary}\n\nRegards,\nEMS System");

        createIfMissing("LEAVE_APPROVED", "Leave Approval Email", 
            "Sent to employee when their leave request is approved.", 
            "✅ Leave Request Approved - {leave_type}", 
            "Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been approved.\n\nRegards,\nHR Team");

        createIfMissing("LEAVE_REJECTED", "Leave Rejection Email", 
            "Sent to employee when their leave request is rejected.", 
            "❌ Leave Request Rejected - {leave_type}", 
            "Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been rejected.\n\nRegards,\nHR Team");
    }

    private void createIfMissing(String key, String name, String desc, String subject, String body) {
        if (templateRepository.findByTemplateKey(key).isEmpty()) {
            templateRepository.save(new EmailTemplate(key, name, desc, subject, body));
        }
    }

    public List<EmailTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public Optional<EmailTemplate> getTemplateByKey(String key) {
        return templateRepository.findByTemplateKey(key);
    }

    public EmailTemplate updateTemplate(Long id, EmailTemplate updated) {
        EmailTemplate existing = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with ID: " + id));
        if (updated.getSubject() != null) existing.setSubject(updated.getSubject());
        if (updated.getBody() != null) existing.setBody(updated.getBody());
        if (updated.getTemplateName() != null) existing.setTemplateName(updated.getTemplateName());
        if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
        return templateRepository.save(existing);
    }

    public String[] renderTemplate(String key, Map<String, String> placeholders, String defaultSubject, String defaultBody) {
        Optional<EmailTemplate> opt = templateRepository.findByTemplateKey(key);
        String subject = opt.isPresent() ? opt.get().getSubject() : defaultSubject;
        String body = opt.isPresent() ? opt.get().getBody() : defaultBody;

        if (placeholders != null) {
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                String k = "{" + entry.getKey() + "}";
                String val = entry.getValue() != null ? entry.getValue() : "";
                subject = subject.replace(k, val);
                body = body.replace(k, val);
            }
        }
        return new String[]{subject, body};
    }
}
