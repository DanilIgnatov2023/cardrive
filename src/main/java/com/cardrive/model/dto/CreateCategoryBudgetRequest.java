package com.cardrive.model.dto;

import java.math.BigDecimal;

public class CreateCategoryBudgetRequest {
    private Long categoryId;
    private Long automobileId;
    private Integer year;
    private Integer month;
    private BigDecimal limitAmount;

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Long getAutomobileId() { return automobileId; }
    public void setAutomobileId(Long automobileId) { this.automobileId = automobileId; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public Integer getMonth() { return month; }
    public void setMonth(Integer month) { this.month = month; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public void setLimitAmount(BigDecimal limitAmount) { this.limitAmount = limitAmount; }
}
