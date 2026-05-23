package com.cardrive.model.dto;

import java.math.BigDecimal;

public class BudgetDTO {
    private Long id;
    private Integer year;
    private Integer month;
    private BigDecimal limitAmount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private Double progressPercent;
    private Boolean isExceeded;
    private String automobilePlateNumber;
    private Long automobileId;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
    public BigDecimal getSpentAmount() { return spentAmount; }
    public void setSpentAmount(BigDecimal spentAmount) { this.spentAmount = spentAmount; }
    public BigDecimal getRemainingAmount() { return remainingAmount; }
    public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
    public Double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Double progressPercent) { this.progressPercent = progressPercent; }
    public Boolean getIsExceeded() { return isExceeded; }
    public void setIsExceeded(Boolean isExceeded) { this.isExceeded = isExceeded; }
    public String getAutomobilePlateNumber() { return automobilePlateNumber; }
    public void setAutomobilePlateNumber(String automobilePlateNumber) { this.automobilePlateNumber = automobilePlateNumber; }
    public Long getAutomobileId() { return automobileId; }
    public void setAutomobileId(Long automobileId) { this.automobileId = automobileId; }
}