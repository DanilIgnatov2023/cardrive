package com.cardrive.model.dto;

import java.math.BigDecimal;

public class SummaryDTO {
    private BigDecimal totalExpenses;
    private BigDecimal costPerKm;
    private Integer totalDistance;
    private Double avgFuelConsumption;
    private String periodStart;
    private String periodEnd;
    private String automobilePlateNumber;

    public SummaryDTO() {}

    public SummaryDTO(BigDecimal totalExpenses, BigDecimal costPerKm, Integer totalDistance,
                      Double avgFuelConsumption, String periodStart, String periodEnd, String automobilePlateNumber) {
        this.totalExpenses = totalExpenses;
        this.costPerKm = costPerKm;
        this.totalDistance = totalDistance;
        this.avgFuelConsumption = avgFuelConsumption;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.automobilePlateNumber = automobilePlateNumber;
    }

    public BigDecimal getTotalExpenses() { return totalExpenses; }
    public void setTotalExpenses(BigDecimal totalExpenses) { this.totalExpenses = totalExpenses; }
    public BigDecimal getCostPerKm() { return costPerKm; }
    public void setCostPerKm(BigDecimal costPerKm) { this.costPerKm = costPerKm; }
    public Integer getTotalDistance() { return totalDistance; }
    public void setTotalDistance(Integer totalDistance) { this.totalDistance = totalDistance; }
    public Double getAvgFuelConsumption() { return avgFuelConsumption; }
    public void setAvgFuelConsumption(Double avgFuelConsumption) { this.avgFuelConsumption = avgFuelConsumption; }
    public String getPeriodStart() { return periodStart; }
    public void setPeriodStart(String periodStart) { this.periodStart = periodStart; }
    public String getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(String periodEnd) { this.periodEnd = periodEnd; }
    public String getAutomobilePlateNumber() { return automobilePlateNumber; }
    public void setAutomobilePlateNumber(String automobilePlateNumber) { this.automobilePlateNumber = automobilePlateNumber; }
}