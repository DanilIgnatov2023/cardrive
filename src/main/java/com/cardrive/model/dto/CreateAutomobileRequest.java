package com.cardrive.model.dto;

public class CreateAutomobileRequest {
    private String plateNumber;
    private Integer year;
    private String vinCode;
    private Integer startOdometer;
    private String comment;
    private Long brandId;
    private Long modelId;

    // Геттеры и сеттеры
    public String getPlateNumber() { return plateNumber; }
    public void setPlateNumber(String plateNumber) { this.plateNumber = plateNumber; }
    public Integer getYear() { return year; }
    public void setYear(Integer year) { this.year = year; }
    public String getVinCode() { return vinCode; }
    public void setVinCode(String vinCode) { this.vinCode = vinCode; }
    public Integer getStartOdometer() { return startOdometer; }
    public void setStartOdometer(Integer startOdometer) { this.startOdometer = startOdometer; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Long getBrandId() { return brandId; }
    public void setBrandId(Long brandId) { this.brandId = brandId; }
    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
}