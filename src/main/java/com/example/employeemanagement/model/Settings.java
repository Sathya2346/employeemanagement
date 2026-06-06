package com.example.employeemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_settings")
public class Settings {
    @Id
    private String id = "default";
    
    private int initialPaidLeave = 12;
    private int initialSickLeave = 5;
    private int initialCasualLeave = 1;

    @Column(columnDefinition = "TEXT")
    private String welcomeEmailSubject = "🎉 Welcome to Employee Management System — Your Login Credentials";

    @Column(columnDefinition = "TEXT")
    private String welcomeEmailBody = "Hello,\n\n"
            + "Your employee account has been created. Use the credentials below to log in:\n\n"
            + "  Login URL : http://localhost:8085/login\n"
            + "  Username  : {username}\n"
            + "  Email     : {email}\n"
            + "  Password  : {password}\n\n"
            + "After logging in, you will be directed to the Employee Onboarding Portal where you must\n"
            + "complete your profile (personal details, Aadhar, banking info, photo & certificates).\n\n"
            + "Your access to attendance, leave and other portal pages will be granted only after\n"
            + "HR reviews and approves all your submitted details.\n\n"
            + "Regards,\nHR Team";

    @Column(columnDefinition = "TEXT")
    private String receiptEmailSubject = "📋 Onboarding Details Submitted Successfully";

    @Column(columnDefinition = "TEXT")
    private String receiptEmailBody = "Dear {name},\n\n"
            + "We have successfully received your onboarding details. The HR/Admin team will review your submission shortly.\n\n"
            + "You will receive an email once the verification is complete or if any changes are required.\n\n"
            + "Regards,\nHR Team";

    @Column(columnDefinition = "TEXT")
    private String rejectionEmailSubject = "⚠️ Onboarding — Action Required";

    @Column(columnDefinition = "TEXT")
    private String rejectionEmailBody = "Dear {name},\n\n"
            + "The following fields in your onboarding submission need corrections:\n\n"
            + "{rejections}\n\n"
            + "Please correct these and resubmit.\n\n"
            + "Regards,\nHR Team";

    @Column(columnDefinition = "TEXT")
    private String approvalEmailSubject = "✅ Onboarding Fully Approved!";

    @Column(columnDefinition = "TEXT")
    private String approvalEmailBody = "Dear {name},\n\n"
            + "All your details have been fully approved by HR. You now have complete access to the portal.\n\n"
            + "Regards,\nHR Team";

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getInitialPaidLeave() {
        return initialPaidLeave;
    }

    public void setInitialPaidLeave(int initialPaidLeave) {
        this.initialPaidLeave = initialPaidLeave;
    }

    public int getInitialSickLeave() {
        return initialSickLeave;
    }

    public void setInitialSickLeave(int initialSickLeave) {
        this.initialSickLeave = initialSickLeave;
    }

    public int getInitialCasualLeave() {
        return initialCasualLeave;
    }

    public void setInitialCasualLeave(int initialCasualLeave) {
        this.initialCasualLeave = initialCasualLeave;
    }

    public String getWelcomeEmailSubject() {
        return welcomeEmailSubject;
    }

    public void setWelcomeEmailSubject(String welcomeEmailSubject) {
        this.welcomeEmailSubject = welcomeEmailSubject;
    }

    public String getWelcomeEmailBody() {
        return welcomeEmailBody;
    }

    public void setWelcomeEmailBody(String welcomeEmailBody) {
        this.welcomeEmailBody = welcomeEmailBody;
    }

    public String getReceiptEmailSubject() {
        return receiptEmailSubject;
    }

    public void setReceiptEmailSubject(String receiptEmailSubject) {
        this.receiptEmailSubject = receiptEmailSubject;
    }

    public String getReceiptEmailBody() {
        return receiptEmailBody;
    }

    public void setReceiptEmailBody(String receiptEmailBody) {
        this.receiptEmailBody = receiptEmailBody;
    }

    public String getRejectionEmailSubject() {
        return rejectionEmailSubject;
    }

    public void setRejectionEmailSubject(String rejectionEmailSubject) {
        this.rejectionEmailSubject = rejectionEmailSubject;
    }

    public String getRejectionEmailBody() {
        return rejectionEmailBody;
    }

    public void setRejectionEmailBody(String rejectionEmailBody) {
        this.rejectionEmailBody = rejectionEmailBody;
    }

    public String getApprovalEmailSubject() {
        return approvalEmailSubject;
    }

    public void setApprovalEmailSubject(String approvalEmailSubject) {
        this.approvalEmailSubject = approvalEmailSubject;
    }

    public String getApprovalEmailBody() {
        return approvalEmailBody;
    }

    public void setApprovalEmailBody(String approvalEmailBody) {
        this.approvalEmailBody = approvalEmailBody;
    }
}
