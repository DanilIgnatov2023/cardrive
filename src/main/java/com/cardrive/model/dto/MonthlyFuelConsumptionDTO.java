package com.cardrive.model.dto;

import java.math.BigDecimal;

public class MonthlyFuelConsumptionDTO {
    private String month;
    private Integer year;
    private BigDecimal fuelLiters;
    private Integer distanceKm;
    private BigDecimal consumptionPer100Km;

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public BigDecimal getFuelLiters() { return fuelLiters; }
    public void setFuelLiters(BigDecimal fuelLiters) { this.fuelLiters = fuelLiters; }
    public Integer getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Integer distanceKm) { this.distanceKm = distanceKm; }
    public BigDecimal getConsumptionPer100Km() { return consumptionPer100Km; }
    public void setConsumptionPer100Km(BigDecimal consumptionPer100Km) { this.consumptionPer100Km = consumptionPer100Km; }
}
