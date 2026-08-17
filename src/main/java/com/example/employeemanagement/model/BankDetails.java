package com.example.employeemanagement.model;

import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

@Embeddable
public class BankDetails implements Serializable {
    private static final long serialVersionUID = 1L;
    @NotBlank(message = "Account holder name is required")
    private String accHolderName;

    @NotBlank(message = "Branch name is required")
    private String branchName;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "Account number is required")
    @Size(min = 9, max = 18, message = "Account number must be between 9 and 18 digits")
    private String accNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Invalid IFSC code format (e.g., ABCD0123456)")
    private String ifscCode;

    @NotBlank(message = "PAN card is required")
    @Pattern(regexp = "[A-Z]{5}[0-9]{4}[A-Z]{1}", message = "Invalid PAN card format (e.g., ABCDE1234F)")
    private String panCard;

    
    public String getAccHolderName() { 
        return accHolderName; 
    }
    public void setAccHolderName(String accHolderName) { 
        this.accHolderName = accHolderName; 
    }

    public String getBranchName() { 
        return branchName; 
    }
    public void setBranchName(String branchName) { 
        this.branchName = branchName; 
    }

    public String getBankName() { 
        return bankName; 
    }
    public void setBankName(String bankName) { 
        this.bankName = bankName; 
    }

    public String getAccNumber() { 
        return accNumber; 
    }
    public void setAccNumber(String accNumber) { 
        this.accNumber = accNumber; 
    }

    public String getIfscCode() { 
        return ifscCode; 
    }
    public void setIfscCode(String ifscCode) { 
        this.ifscCode = ifscCode; 
    }

    public String getPanCard() { 
        return panCard; 
    }
    public void setPanCard(String panCard) { 
        this.panCard = panCard; 
    }
}