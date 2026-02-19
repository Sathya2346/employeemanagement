package com.example.employeemanagement.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class BankDetails{
    private String accHolderName;
    private String branchName;
    private String bankName;
    private String accNumber;
    private String ifscCode;
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