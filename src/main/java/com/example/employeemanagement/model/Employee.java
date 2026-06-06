package com.example.employeemanagement.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import com.example.employeemanagement.config.GlobalAuditListener;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import java.io.Serializable;

@EntityListeners(GlobalAuditListener.class)
@Entity
@Table(name = "employees")
public class Employee implements Serializable {
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50, message = "First name must be between 2 and 50 characters")
    private String firstname;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50, message = "Last name must be between 2 and 50 characters")
    private String lastname;

    private String gender;
    @jakarta.validation.constraints.Past(message = "Date of Birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @org.springframework.format.annotation.DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;

    @Column(unique = true)
    @jakarta.validation.constraints.Email(message = "Invalid email format")
    private String email;

    @Column(unique = true)
    private String phone;
    
    private String address;

    private String city;

    private String blood;
    private String emergencyNumber;
    private String language;
    private String maritalStatus;

    @Column(length = 20)
    private String overallStatus = "PENDING";
    
    private Boolean notifyAdminFlag = false;

    @Column(length = 20)
    private String activityStatus = "Idle"; // Working, Idle, Leave, Absent

    public String getActivityStatus() { return activityStatus; }
    public void setActivityStatus(String activityStatus) { this.activityStatus = activityStatus; }

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }
    public Boolean getNotifyAdminFlag() { return notifyAdminFlag; }
    public void setNotifyAdminFlag(Boolean notifyAdminFlag) { this.notifyAdminFlag = notifyAdminFlag; }

    @NotBlank(message = "Username is required")
    private String username;

    private String password;

    private String userType;
    private String otp;
    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalDateTime otpExpiry = LocalDateTime.now(ZoneId.of("Asia/Kolkata"));

    @JsonFormat(pattern = "yyyy-MM-dd hh:mm:ss a", timezone = "Asia/Kolkata")
    private LocalDateTime lastLoginDate;

    // 🟢 Leave balance tracking
    private int totalLeaves = 18;
    private int paidLeaveBalance = 12;
    private int sickLeaveBalance = 5;
    private int casualLeaveBalance = 1;

    // leave balance tracking
    private int leaveBalance;


    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Leave> leaves;

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<HourlyReport> hourlyReports;

    @OneToOne(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private EmployeeDetails employeeDetails;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] profile;

    @Transient
    private String base64Image;

    public String getBase64Image() {
        if (profile != null && profile.length > 0) {
            return Base64.getEncoder().encodeToString(profile);
        }
        return null;
    }

    public String getProfileImageSrc() {
        if (profile != null && profile.length > 0) {
            return "data:image/png;base64," + Base64.getEncoder().encodeToString(profile);
        }
        return "/images/default-avatar.png";
    }

    @OneToMany(mappedBy = "employee", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Attendance> attendances;


    public List<Attendance> getAttendances() {
        return attendances;
    }

    public void setAttendances(List<Attendance> attendances) {
        this.attendances = attendances;
    }

    @Embedded
    @Valid
    private CompanyDetails companyDetails;

    @Embedded
    @Valid
    private BankDetails bankDetails;

    public CompanyDetails getCompanyDetails() {
        return companyDetails;
    }

    public void setCompanyDetails(CompanyDetails companyDetails) {
        this.companyDetails = companyDetails;
    }

    public BankDetails getBankDetails() {
        return bankDetails;
    }

    public void setBankDetails(BankDetails bankDetails) {
        this.bankDetails = bankDetails;
    }

    // Getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstname() { return firstname; }
    public void setFirstname(String firstname) { this.firstname = firstname; }

    public String getLastname() { return lastname; }
    public void setLastname(String lastname) { this.lastname = lastname; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getBlood() { return blood; }
    public void setBlood(String blood) { this.blood = blood; }

    public String getEmergencyNumber() { return emergencyNumber; }
    public void setEmergencyNumber(String emergencyNumber) { this.emergencyNumber = emergencyNumber; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getMaritalStatus() { return maritalStatus; }
    public void setMaritalStatus(String maritalStatus) { this.maritalStatus = maritalStatus; }

    public byte[] getProfile() { return profile; }
    public void setProfile(byte[] profile) { this.profile = profile; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }

    public int getTotalLeaves() { return totalLeaves; }
    public void setTotalLeaves(int totalLeaves) { this.totalLeaves = totalLeaves; }

    public int getPaidLeaveBalance() { return paidLeaveBalance; }
    public void setPaidLeaveBalance(int paidLeaveBalance) { this.paidLeaveBalance = paidLeaveBalance; }

    public int getSickLeaveBalance() { return sickLeaveBalance; }
    public void setSickLeaveBalance(int sickLeaveBalance) { this.sickLeaveBalance = sickLeaveBalance; }

    public int getCasualLeaveBalance() { return casualLeaveBalance; }
    public void setCasualLeaveBalance(int casualLeaveBalance) { this.casualLeaveBalance = casualLeaveBalance; }

    public int getLeaveBalance() {
        return leaveBalance;
    }

    public void setLeaveBalance(int leaveBalance) {
        this.leaveBalance = leaveBalance;
    }

    public List<Leave> getLeaves() {
        return leaves;
    }

    public void setLeaves(List<Leave> leaves) {
        this.leaves = leaves;
    }

    public List<HourlyReport> getHourlyReports() {
        return hourlyReports;
    }

    public void setHourlyReports(List<HourlyReport> hourlyReports) {
        this.hourlyReports = hourlyReports;
    }

    public EmployeeDetails getEmployeeDetails() {
        return employeeDetails;
    }

    public void setEmployeeDetails(EmployeeDetails employeeDetails) {
        this.employeeDetails = employeeDetails;
    }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public LocalDateTime getOtpExpiry() { return otpExpiry; }
    public void setOtpExpiry(LocalDateTime otpExpiry) { this.otpExpiry = otpExpiry; }

    public LocalDateTime getLastLoginDate() { return lastLoginDate; }
    public void setLastLoginDate(LocalDateTime lastLoginDate) { this.lastLoginDate = lastLoginDate; }
}
