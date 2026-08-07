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
            + "  Login URL : http://localhost:3000/login\n"
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

    @Column(columnDefinition = "TEXT")
    private String otpEmailSubject = "🔐 Employee Management - Password Reset OTP";

    @Column(columnDefinition = "TEXT")
    private String otpEmailBody = "Your password reset OTP is: {otp}. It is valid for {expiry_minutes} minutes.";

    @Column(columnDefinition = "TEXT")
    private String adminAlertEmailSubject = "📋 Onboarding Details Submitted - {name}";

    @Column(columnDefinition = "TEXT")
    private String adminAlertEmailBody = "Employee {name} ({email}) has submitted onboarding details for review.\n\nDetails Submitted:\n{summary}\n\nRegards,\nEMS System";

    @Column(columnDefinition = "TEXT")
    private String leaveApprovedEmailSubject = "✅ Leave Request Approved - {leave_type}";

    @Column(columnDefinition = "TEXT")
    private String leaveApprovedEmailBody = "Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been approved.\n\nRegards,\nHR Team";

    @Column(columnDefinition = "TEXT")
    private String leaveRejectedEmailSubject = "❌ Leave Request Rejected - {leave_type}";

    @Column(columnDefinition = "TEXT")
    private String leaveRejectedEmailBody = "Dear {name},\n\nYour leave request for {leave_type} from {from_date} to {to_date} has been rejected.\n\nRegards,\nHR Team";

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

    public String getOtpEmailSubject() {
        return otpEmailSubject;
    }

    public void setOtpEmailSubject(String otpEmailSubject) {
        this.otpEmailSubject = otpEmailSubject;
    }

    public String getOtpEmailBody() {
        return otpEmailBody;
    }

    public void setOtpEmailBody(String otpEmailBody) {
        this.otpEmailBody = otpEmailBody;
    }

    public String getAdminAlertEmailSubject() {
        return adminAlertEmailSubject;
    }

    public void setAdminAlertEmailSubject(String adminAlertEmailSubject) {
        this.adminAlertEmailSubject = adminAlertEmailSubject;
    }

    public String getAdminAlertEmailBody() {
        return adminAlertEmailBody;
    }

    public void setAdminAlertEmailBody(String adminAlertEmailBody) {
        this.adminAlertEmailBody = adminAlertEmailBody;
    }

    public String getLeaveApprovedEmailSubject() {
        return leaveApprovedEmailSubject;
    }

    public void setLeaveApprovedEmailSubject(String leaveApprovedEmailSubject) {
        this.leaveApprovedEmailSubject = leaveApprovedEmailSubject;
    }

    public String getLeaveApprovedEmailBody() {
        return leaveApprovedEmailBody;
    }

    public void setLeaveApprovedEmailBody(String leaveApprovedEmailBody) {
        this.leaveApprovedEmailBody = leaveApprovedEmailBody;
    }

    public String getLeaveRejectedEmailSubject() {
        return leaveRejectedEmailSubject;
    }

    public void setLeaveRejectedEmailSubject(String leaveRejectedEmailSubject) {
        this.leaveRejectedEmailSubject = leaveRejectedEmailSubject;
    }

    public String getLeaveRejectedEmailBody() {
        return leaveRejectedEmailBody;
    }

    public void setLeaveRejectedEmailBody(String leaveRejectedEmailBody) {
        this.leaveRejectedEmailBody = leaveRejectedEmailBody;
    }
}
