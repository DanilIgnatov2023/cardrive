package com.cardrive.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseDTO {
    private Long id;
    private LocalDate date;
    private BigDecimal amount;
    private Integer odometer;
    private BigDecimal fuelLiters;
    private BigDecimal fuelPricePerLiter;
    private String comment;
    private String categoryName;
    private Long categoryId;
    private String subcategoryName;
    private Long subcategoryId;
    private Long automobileId;
    private String automobilePlateNumber;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Integer getOdometer() { return odometer; }
    public void setOdometer(Integer odometer) { this.odometer = odometer; }
    public BigDecimal getFuelLiters() { return fuelLiters; }
    public void setFuelLiters(BigDecimal fuelLiters) { this.fuelLiters = fuelLiters; }
    public BigDecimal getFuelPricePerLiter() { return fuelPricePerLiter; }
    public void setFuelPricePerLiter(BigDecimal fuelPricePerLiter) { this.fuelPricePerLiter = fuelPricePerLiter; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getSubcategoryName() { return subcategoryName; }
    public void setSubcategoryName(String subcategoryName) { this.subcategoryName = subcategoryName; }
    public Long getSubcategoryId() { return subcategoryId; }
    public void setSubcategoryId(Long subcategoryId) { this.subcategoryId = subcategoryId; }
    public Long getAutomobileId() { return automobileId; }
    public void setAutomobileId(Long automobileId) { this.automobileId = automobileId; }
    public String getAutomobilePlateNumber() { return automobilePlateNumber; }
    public void setAutomobilePlateNumber(String automobilePlateNumber) { this.automobilePlateNumber = automobilePlateNumber; }
}