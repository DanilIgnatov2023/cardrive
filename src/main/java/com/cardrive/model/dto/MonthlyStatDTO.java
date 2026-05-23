package com.cardrive.model.dto;

import java.math.BigDecimal;

public class MonthlyStatDTO {
    private String month;
    private Integer year;
    private BigDecimal amount;
    private Integer expenseCount;

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getExpenseCount() { return expenseCount; }
    public void setExpenseCount(Integer expenseCount) { this.expenseCount = expenseCount; }
}