package com.example.employeemanagement.model;

import jakarta.persistence.*;
import java.util.Base64;

@Entity
@Table(name = "employee_details")
public class EmployeeDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "employee_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Employee employee;

    // Personal Information
    @Column(name = "personal_phone", length = 20) private String personalPhone;
    @Column(name = "phone_status", length = 20) private String phoneStatus = "PENDING";
    @Column(name = "phone_rejection_reason", columnDefinition = "TEXT") private String phoneRejectionReason;

    @Column(name = "personal_address", length = 500) private String personalAddress;
    @Column(name = "address_status", length = 20) private String addressStatus = "PENDING";
    @Column(name = "address_rejection_reason", columnDefinition = "TEXT") private String addressRejectionReason;

    @Column(name = "personal_city", length = 100) private String personalCity;
    @Column(name = "city_status", length = 20) private String cityStatus = "PENDING";
    @Column(name = "city_rejection_reason", columnDefinition = "TEXT") private String cityRejectionReason;

    @Column(name = "personal_gender", length = 20) private String personalGender;
    @Column(name = "gender_status", length = 20) private String genderStatus = "PENDING";
    @Column(name = "gender_rejection_reason", columnDefinition = "TEXT") private String genderRejectionReason;

    @Column(name = "personal_date_of_birth", length = 20) private String personalDateOfBirth;
    @Column(name = "dob_status", length = 20) private String dobStatus = "PENDING";
    @Column(name = "dob_rejection_reason", columnDefinition = "TEXT") private String dobRejectionReason;

    @Column(name = "personal_emergency_number", length = 20) private String personalEmergencyNumber;
    @Column(name = "emergency_status", length = 20) private String emergencyStatus = "PENDING";
    @Column(name = "emergency_rejection_reason", columnDefinition = "TEXT") private String emergencyRejectionReason;

    @Column(name = "personal_marital_status", length = 20) private String personalMaritalStatus;
    @Column(name = "marital_field_status", length = 20) private String maritalFieldStatus = "PENDING";
    @Column(name = "marital_field_rejection_reason", columnDefinition = "TEXT") private String maritalFieldRejectionReason;

    @Column(name = "personal_language", length = 100) private String personalLanguage;
    @Column(name = "language_status", length = 20) private String languageStatus = "PENDING";
    @Column(name = "language_rejection_reason", columnDefinition = "TEXT") private String languageRejectionReason;

    @Column(name = "personal_blood_group", length = 10) private String personalBloodGroup;
    @Column(name = "blood_status", length = 20) private String bloodStatus = "PENDING";
    @Column(name = "blood_rejection_reason", columnDefinition = "TEXT") private String bloodRejectionReason;

    // Identity Documents
    @Column(name = "aadhar_number", length = 20) private String aadharNumber;
    @Column(name = "aadhar_status", length = 20) private String aadharStatus = "PENDING";
    @Column(name = "aadhar_rejection_reason", columnDefinition = "TEXT") private String aadharRejectionReason;

    @Column(name = "pan_number", length = 20) private String panNumber;
    @Column(name = "pan_status", length = 20) private String panStatus = "PENDING";
    @Column(name = "pan_rejection_reason", columnDefinition = "TEXT") private String panRejectionReason;

    @Lob @Column(name = "pan_data", columnDefinition = "LONGBLOB") private byte[] panData;
    @Lob @Column(name = "aadhar_data", columnDefinition = "LONGBLOB") private byte[] aadharData;

    // Banking Details
    @Column(name = "account_number", length = 50) private String accountNumber;
    @Column(name = "account_status", length = 20) private String accountStatus = "PENDING";
    @Column(name = "account_rejection_reason", columnDefinition = "TEXT") private String accountRejectionReason;

    @Column(name = "bank_name", length = 100) private String bankName;
    @Column(name = "bank_name_status", length = 20) private String bankNameStatus = "PENDING";
    @Column(name = "bank_name_rejection_reason", columnDefinition = "TEXT") private String bankNameRejectionReason;

    @Column(name = "ifsc_code", length = 20) private String ifscCode;
    @Column(name = "ifsc_status", length = 20) private String ifscStatus = "PENDING";
    @Column(name = "ifsc_rejection_reason", columnDefinition = "TEXT") private String ifscRejectionReason;
    
    @Column(name = "branch_name", length = 100) private String personalBranch;
    @Column(name = "branch_status", length = 20) private String branchStatus = "PENDING";
    @Column(name = "branch_rejection_reason", columnDefinition = "TEXT") private String branchRejectionReason;

    // Photo
    @Lob @Column(name = "photo_data", columnDefinition = "LONGBLOB") private byte[] photoData;
    @Column(name = "photo_status", length = 20) private String photoStatus = "PENDING";
    @Column(name = "photo_rejection_reason", columnDefinition = "TEXT") private String photoRejectionReason;

    // Educational Documents
    @Lob @Column(name = "mark10th_data", columnDefinition = "LONGBLOB") private byte[] mark10thData;
    @Column(name = "mark10th_status", length = 20) private String mark10thStatus = "PENDING";
    @Column(name = "mark10th_rejection_reason", columnDefinition = "TEXT") private String mark10thRejectionReason;

    @Lob @Column(name = "mark12th_data", columnDefinition = "LONGBLOB") private byte[] mark12thData;
    @Column(name = "mark12th_status", length = 20) private String mark12thStatus = "PENDING";
    @Column(name = "mark12th_rejection_reason", columnDefinition = "TEXT") private String mark12thRejectionReason;

    // College Semesters
    @Lob @Column(name = "sem1_data", columnDefinition = "LONGBLOB") private byte[] sem1Data;
    @Column(name = "sem1_status", length = 20) private String sem1Status = "PENDING";
    @Column(name = "sem1_rejection_reason", columnDefinition = "TEXT") private String sem1RejectionReason;

    @Lob @Column(name = "sem2_data", columnDefinition = "LONGBLOB") private byte[] sem2Data;
    @Column(name = "sem2_status", length = 20) private String sem2Status = "PENDING";
    @Column(name = "sem2_rejection_reason", columnDefinition = "TEXT") private String sem2RejectionReason;

    @Lob @Column(name = "sem3_data", columnDefinition = "LONGBLOB") private byte[] sem3Data;
    @Column(name = "sem3_status", length = 20) private String sem3Status = "PENDING";
    @Column(name = "sem3_rejection_reason", columnDefinition = "TEXT") private String sem3RejectionReason;

    @Lob @Column(name = "sem4_data", columnDefinition = "LONGBLOB") private byte[] sem4Data;
    @Column(name = "sem4_status", length = 20) private String sem4Status = "PENDING";
    @Column(name = "sem4_rejection_reason", columnDefinition = "TEXT") private String sem4RejectionReason;

    @Lob @Column(name = "sem5_data", columnDefinition = "LONGBLOB") private byte[] sem5Data;
    @Column(name = "sem5_status", length = 20) private String sem5Status = "PENDING";
    @Column(name = "sem5_rejection_reason", columnDefinition = "TEXT") private String sem5RejectionReason;

    @Lob @Column(name = "sem6_data", columnDefinition = "LONGBLOB") private byte[] sem6Data;
    @Column(name = "sem6_status", length = 20) private String sem6Status = "PENDING";
    @Column(name = "sem6_rejection_reason", columnDefinition = "TEXT") private String sem6RejectionReason;

    @Lob @Column(name = "sem7_data", columnDefinition = "LONGBLOB") private byte[] sem7Data;
    @Column(name = "sem7_status", length = 20) private String sem7Status = "PENDING";
    @Column(name = "sem7_rejection_reason", columnDefinition = "TEXT") private String sem7RejectionReason;

    @Lob @Column(name = "sem8_data", columnDefinition = "LONGBLOB") private byte[] sem8Data;
    @Column(name = "sem8_status", length = 20) private String sem8Status = "PENDING";
    @Column(name = "sem8_rejection_reason", columnDefinition = "TEXT") private String sem8RejectionReason;

    // Exit Certificates
    @Lob @Column(name = "transfer_cert_data", columnDefinition = "LONGBLOB") private byte[] transferCertData;
    @Column(name = "transfer_cert_status", length = 20) private String transferCertStatus = "PENDING";
    @Column(name = "transfer_cert_rejection_reason", columnDefinition = "TEXT") private String transferCertRejectionReason;

    @Lob @Column(name = "provisional_cert_data", columnDefinition = "LONGBLOB") private byte[] provisionalCertData;
    @Column(name = "provisional_cert_status", length = 20) private String provisionalCertStatus = "PENDING";
    @Column(name = "provisional_cert_rejection_reason", columnDefinition = "TEXT") private String provisionalCertRejectionReason;

    @Lob @Column(name = "course_completion_data", columnDefinition = "LONGBLOB") private byte[] courseCompletionData;
    @Column(name = "course_completion_status", length = 20) private String courseCompletionStatus = "PENDING";
    @Column(name = "course_completion_rejection_reason", columnDefinition = "TEXT") private String courseCompletionRejectionReason;

    // Degree Info
    @Column(name = "degree_name", length = 100) private String degreeName;
    @Column(name = "degree_name_status", length = 20) private String degreeNameStatus = "PENDING";
    @Column(name = "degree_name_rejection_reason", columnDefinition = "TEXT") private String degreeNameRejectionReason;

    @Column(name = "degree_institution", length = 255) private String degreeInstitution;
    @Column(name = "degree_inst_status", length = 20) private String degreeInstStatus = "PENDING";
    @Column(name = "degree_inst_rejection_reason", columnDefinition = "TEXT") private String degreeInstRejectionReason;

    // Legacy field
    @Lob @Column(name = "certificate_data", columnDefinition = "LONGBLOB") private byte[] certificateData;
    @Column(name = "certificate_status", length = 20) private String certificateStatus = "PENDING";
    @Column(name = "certificate_rejection_reason", columnDefinition = "TEXT") private String certificateRejectionReason;

    // Getters and Setters ... (Keeping them same)
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Employee getEmployee() { return employee; }
    public void setEmployee(Employee employee) { this.employee = employee; }
    public String getPersonalPhone() { return personalPhone; }
    public void setPersonalPhone(String v) { this.personalPhone = v; }
    public String getPhoneStatus() { return phoneStatus; }
    public void setPhoneStatus(String v) { this.phoneStatus = v; }
    public String getPhoneRejectionReason() { return phoneRejectionReason; }
    public void setPhoneRejectionReason(String v) { this.phoneRejectionReason = v; }
    public String getPersonalAddress() { return personalAddress; }
    public void setPersonalAddress(String v) { this.personalAddress = v; }
    public String getAddressStatus() { return addressStatus; }
    public void setAddressStatus(String v) { this.addressStatus = v; }
    public String getAddressRejectionReason() { return addressRejectionReason; }
    public void setAddressRejectionReason(String v) { this.addressRejectionReason = v; }
    public String getPersonalCity() { return personalCity; }
    public void setPersonalCity(String v) { this.personalCity = v; }
    public String getCityStatus() { return cityStatus; }
    public void setCityStatus(String v) { this.cityStatus = v; }
    public String getCityRejectionReason() { return cityRejectionReason; }
    public void setCityRejectionReason(String v) { this.cityRejectionReason = v; }
    public String getPersonalGender() { return personalGender; }
    public void setPersonalGender(String v) { this.personalGender = v; }
    public String getGenderStatus() { return genderStatus; }
    public void setGenderStatus(String v) { this.genderStatus = v; }
    public String getGenderRejectionReason() { return genderRejectionReason; }
    public void setGenderRejectionReason(String v) { this.genderRejectionReason = v; }
    public String getPersonalDateOfBirth() { return personalDateOfBirth; }
    public void setPersonalDateOfBirth(String v) { this.personalDateOfBirth = v; }
    public String getDobStatus() { return dobStatus; }
    public void setDobStatus(String v) { this.dobStatus = v; }
    public String getDobRejectionReason() { return dobRejectionReason; }
    public void setDobRejectionReason(String v) { this.dobRejectionReason = v; }
    public String getPersonalEmergencyNumber() { return personalEmergencyNumber; }
    public void setPersonalEmergencyNumber(String v) { this.personalEmergencyNumber = v; }
    public String getEmergencyStatus() { return emergencyStatus; }
    public void setEmergencyStatus(String v) { this.emergencyStatus = v; }
    public String getEmergencyRejectionReason() { return emergencyRejectionReason; }
    public void setEmergencyRejectionReason(String v) { this.emergencyRejectionReason = v; }
    public String getPersonalMaritalStatus() { return personalMaritalStatus; }
    public void setPersonalMaritalStatus(String v) { this.personalMaritalStatus = v; }
    public String getMaritalFieldStatus() { return maritalFieldStatus; }
    public void setMaritalFieldStatus(String v) { this.maritalFieldStatus = v; }
    public String getMaritalFieldRejectionReason() { return maritalFieldRejectionReason; }
    public void setMaritalFieldRejectionReason(String v) { this.maritalFieldRejectionReason = v; }
    public String getPersonalLanguage() { return personalLanguage; }
    public void setPersonalLanguage(String v) { this.personalLanguage = v; }
    public String getLanguageStatus() { return languageStatus; }
    public void setLanguageStatus(String v) { this.languageStatus = v; }
    public String getLanguageRejectionReason() { return languageRejectionReason; }
    public void setLanguageRejectionReason(String v) { this.languageRejectionReason = v; }
    public String getPersonalBloodGroup() { return personalBloodGroup; }
    public void setPersonalBloodGroup(String v) { this.personalBloodGroup = v; }
    public String getBloodStatus() { return bloodStatus; }
    public void setBloodStatus(String v) { this.bloodStatus = v; }
    public String getBloodRejectionReason() { return bloodRejectionReason; }
    public void setBloodRejectionReason(String v) { this.bloodRejectionReason = v; }
    public String getAadharNumber() { return aadharNumber; }
    public void setAadharNumber(String v) { this.aadharNumber = v; }
    public String getAadharStatus() { return aadharStatus; }
    public void setAadharStatus(String v) { this.aadharStatus = v; }
    public String getAadharRejectionReason() { return aadharRejectionReason; }
    public void setAadharRejectionReason(String v) { this.aadharRejectionReason = v; }
    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String v) { this.panNumber = v; }
    public String getPanStatus() { return panStatus; }
    public void setPanStatus(String v) { this.panStatus = v; }
    public String getPanRejectionReason() { return panRejectionReason; }
    public void setPanRejectionReason(String v) { this.panRejectionReason = v; }
    public byte[] getPanData() { return panData; }
    public void setPanData(byte[] v) { this.panData = v; }
    public byte[] getAadharData() { return aadharData; }
    public void setAadharData(byte[] v) { this.aadharData = v; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String v) { this.accountNumber = v; }
    public String getAccountStatus() { return accountStatus; }
    public void setAccountStatus(String v) { this.accountStatus = v; }
    public String getAccountRejectionReason() { return accountRejectionReason; }
    public void setAccountRejectionReason(String v) { this.accountRejectionReason = v; }
    public String getBankName() { return bankName; }
    public void setBankName(String v) { this.bankName = v; }
    public String getBankNameStatus() { return bankNameStatus; }
    public void setBankNameStatus(String v) { this.bankNameStatus = v; }
    public String getBankNameRejectionReason() { return bankNameRejectionReason; }
    public void setBankNameRejectionReason(String v) { this.bankNameRejectionReason = v; }
    public String getIfscCode() { return ifscCode; }
    public void setIfscCode(String v) { this.ifscCode = v; }
    public String getIfscStatus() { return ifscStatus; }
    public void setIfscStatus(String v) { this.ifscStatus = v; }
    public String getIfscRejectionReason() { return ifscRejectionReason; }
    public void setIfscRejectionReason(String v) { this.ifscRejectionReason = v; }
    public String getPersonalBranch() { return personalBranch; }
    public void setPersonalBranch(String v) { this.personalBranch = v; }
    public String getBranchStatus() { return branchStatus; }
    public void setBranchStatus(String v) { this.branchStatus = v; }
    public String getBranchRejectionReason() { return branchRejectionReason; }
    public void setBranchRejectionReason(String v) { this.branchRejectionReason = v; }
    public byte[] getPhotoData() { return photoData; }
    public void setPhotoData(byte[] v) { this.photoData = v; }
    public String getPhotoStatus() { return photoStatus; }
    public void setPhotoStatus(String v) { this.photoStatus = v; }
    public String getPhotoRejectionReason() { return photoRejectionReason; }
    public void setPhotoRejectionReason(String v) { this.photoRejectionReason = v; }
    public byte[] getMark10thData() { return mark10thData; }
    public void setMark10thData(byte[] v) { this.mark10thData = v; }
    public String getMark10thStatus() { return mark10thStatus; }
    public void setMark10thStatus(String v) { this.mark10thStatus = v; }
    public String getMark10thRejectionReason() { return mark10thRejectionReason; }
    public void setMark10thRejectionReason(String v) { this.mark10thRejectionReason = v; }
    public byte[] getMark12thData() { return mark12thData; }
    public void setMark12thData(byte[] v) { this.mark12thData = v; }
    public String getMark12thStatus() { return mark12thStatus; }
    public void setMark12thStatus(String v) { this.mark12thStatus = v; }
    public String getMark12thRejectionReason() { return mark12thRejectionReason; }
    public void setMark12thRejectionReason(String v) { this.mark12thRejectionReason = v; }
    public byte[] getSem1Data() { return sem1Data; } public void setSem1Data(byte[] v) { this.sem1Data = v; }
    public String getSem1Status() { return sem1Status; } public void setSem1Status(String v) { this.sem1Status = v; }
    public String getSem1RejectionReason() { return sem1RejectionReason; } public void setSem1RejectionReason(String v) { this.sem1RejectionReason = v; }
    public byte[] getSem2Data() { return sem2Data; } public void setSem2Data(byte[] v) { this.sem2Data = v; }
    public String getSem2Status() { return sem2Status; } public void setSem2Status(String v) { this.sem2Status = v; }
    public String getSem2RejectionReason() { return sem2RejectionReason; } public void setSem2RejectionReason(String v) { this.sem2RejectionReason = v; }
    public byte[] getSem3Data() { return sem3Data; } public void setSem3Data(byte[] v) { this.sem3Data = v; }
    public String getSem3Status() { return sem3Status; } public void setSem3Status(String v) { this.sem3Status = v; }
    public String getSem3RejectionReason() { return sem3RejectionReason; } public void setSem3RejectionReason(String v) { this.sem3RejectionReason = v; }
    public byte[] getSem4Data() { return sem4Data; } public void setSem4Data(byte[] v) { this.sem4Data = v; }
    public String getSem4Status() { return sem4Status; } public void setSem4Status(String v) { this.sem4Status = v; }
    public String getSem4RejectionReason() { return sem4RejectionReason; } public void setSem4RejectionReason(String v) { this.sem4RejectionReason = v; }
    public byte[] getSem5Data() { return sem5Data; } public void setSem5Data(byte[] v) { this.sem5Data = v; }
    public String getSem5Status() { return sem5Status; } public void setSem5Status(String v) { this.sem5Status = v; }
    public String getSem5RejectionReason() { return sem5RejectionReason; } public void setSem5RejectionReason(String v) { this.sem5RejectionReason = v; }
    public byte[] getSem6Data() { return sem6Data; } public void setSem6Data(byte[] v) { this.sem6Data = v; }
    public String getSem6Status() { return sem6Status; } public void setSem6Status(String v) { this.sem6Status = v; }
    public String getSem6RejectionReason() { return sem6RejectionReason; } public void setSem6RejectionReason(String v) { this.sem6RejectionReason = v; }
    public byte[] getSem7Data() { return sem7Data; } public void setSem7Data(byte[] v) { this.sem7Data = v; }
    public String getSem7Status() { return sem7Status; } public void setSem7Status(String v) { this.sem7Status = v; }
    public String getSem7RejectionReason() { return sem7RejectionReason; } public void setSem7RejectionReason(String v) { this.sem7RejectionReason = v; }
    public byte[] getSem8Data() { return sem8Data; } public void setSem8Data(byte[] v) { this.sem8Data = v; }
    public String getSem8Status() { return sem8Status; } public void setSem8Status(String v) { this.sem8Status = v; }
    public String getSem8RejectionReason() { return sem8RejectionReason; } public void setSem8RejectionReason(String v) { this.sem8RejectionReason = v; }
    public byte[] getTransferCertData() { return transferCertData; }
    public void setTransferCertData(byte[] v) { this.transferCertData = v; }
    public String getTransferCertStatus() { return transferCertStatus; }
    public void setTransferCertStatus(String v) { this.transferCertStatus = v; }
    public String getTransferCertRejectionReason() { return transferCertRejectionReason; }
    public void setTransferCertRejectionReason(String v) { this.transferCertRejectionReason = v; }
    public byte[] getProvisionalCertData() { return provisionalCertData; }
    public void setProvisionalCertData(byte[] v) { this.provisionalCertData = v; }
    public String getProvisionalCertStatus() { return provisionalCertStatus; }
    public void setProvisionalCertStatus(String v) { this.provisionalCertStatus = v; }
    public String getProvisionalCertRejectionReason() { return provisionalCertRejectionReason; }
    public void setProvisionalCertRejectionReason(String v) { this.provisionalCertRejectionReason = v; }
    public byte[] getCourseCompletionData() { return courseCompletionData; }
    public void setCourseCompletionData(byte[] v) { this.courseCompletionData = v; }
    public String getCourseCompletionStatus() { return courseCompletionStatus; }
    public void setCourseCompletionStatus(String v) { this.courseCompletionStatus = v; }
    public String getCourseCompletionRejectionReason() { return courseCompletionRejectionReason; }
    public void setCourseCompletionRejectionReason(String v) { this.courseCompletionRejectionReason = v; }
    public String getDegreeName() { return degreeName; }
    public void setDegreeName(String v) { this.degreeName = v; }
    public String getDegreeNameStatus() { return degreeNameStatus; }
    public void setDegreeNameStatus(String v) { this.degreeNameStatus = v; }
    public String getDegreeNameRejectionReason() { return degreeNameRejectionReason; }
    public void setDegreeNameRejectionReason(String v) { this.degreeNameRejectionReason = v; }
    public String getDegreeInstitution() { return degreeInstitution; }
    public void setDegreeInstitution(String v) { this.degreeInstitution = v; }
    public String getDegreeInstStatus() { return degreeInstStatus; }
    public void setDegreeInstStatus(String v) { this.degreeInstStatus = v; }
    public String getDegreeInstRejectionReason() { return degreeInstRejectionReason; }
    public void setDegreeInstRejectionReason(String v) { this.degreeInstRejectionReason = v; }
    public byte[] getCertificateData() { return certificateData; }
    public void setCertificateData(byte[] v) { this.certificateData = v; }
    public String getCertificateStatus() { return certificateStatus; }
    public void setCertificateStatus(String v) { this.certificateStatus = v; }
    public String getCertificateRejectionReason() { return certificateRejectionReason; }
    public void setCertificateRejectionReason(String v) { this.certificateRejectionReason = v; }

    // Base64 helpers
    public String getPhotoBase64() { return photoData != null ? Base64.getEncoder().encodeToString(photoData) : null; }
    public String getCertificateBase64() { return certificateData != null ? Base64.getEncoder().encodeToString(certificateData) : null; }
    public String getPanBase64() { return panData != null ? Base64.getEncoder().encodeToString(panData) : null; }
    public String getAadharBase64() { return aadharData != null ? Base64.getEncoder().encodeToString(aadharData) : null; }
    public String getMark10thBase64() { return mark10thData != null ? Base64.getEncoder().encodeToString(mark10thData) : null; }
    public String getMark12thBase64() { return mark12thData != null ? Base64.getEncoder().encodeToString(mark12thData) : null; }
    public String getSem1Base64() { return sem1Data != null ? Base64.getEncoder().encodeToString(sem1Data) : null; }
    public String getSem2Base64() { return sem2Data != null ? Base64.getEncoder().encodeToString(sem2Data) : null; }
    public String getSem3Base64() { return sem3Data != null ? Base64.getEncoder().encodeToString(sem3Data) : null; }
    public String getSem4Base64() { return sem4Data != null ? Base64.getEncoder().encodeToString(sem4Data) : null; }
    public String getSem5Base64() { return sem5Data != null ? Base64.getEncoder().encodeToString(sem5Data) : null; }
    public String getSem6Base64() { return sem6Data != null ? Base64.getEncoder().encodeToString(sem6Data) : null; }
    public String getSem7Base64() { return sem7Data != null ? Base64.getEncoder().encodeToString(sem7Data) : null; }
    public String getSem8Base64() { return sem8Data != null ? Base64.getEncoder().encodeToString(sem8Data) : null; }
    public String getTransferCertBase64() { return transferCertData != null ? Base64.getEncoder().encodeToString(transferCertData) : null; }
    public String getProvisionalCertBase64() { return provisionalCertData != null ? Base64.getEncoder().encodeToString(provisionalCertData) : null; }
    public String getCourseCompletionBase64() { return courseCompletionData != null ? Base64.getEncoder().encodeToString(courseCompletionData) : null; }
}
