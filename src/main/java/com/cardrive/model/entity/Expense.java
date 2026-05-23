package com.cardrive.model.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    private Integer odometer;

    @Column(name = "fuel_liters", precision = 10, scale = 2)
    private BigDecimal fuelLiters;

    @Column(name = "fuel_price_per_liter", precision = 10, scale = 2)
    private BigDecimal fuelPricePerLiter;

    private String comment;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "automobile_id", nullable = false)
    private Automobile automobile;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ExpenseCategory category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private ExpenseSubcategory subcategory;

    @Column(name = "created_at")
    private LocalDate createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDate.now();
    }

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
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Automobile getAutomobile() { return automobile; }
    public void setAutomobile(Automobile automobile) { this.automobile = automobile; }
    public ExpenseCategory getCategory() { return category; }
    public void setCategory(ExpenseCategory category) { this.category = category; }
    public ExpenseSubcategory getSubcategory() { return subcategory; }
    public void setSubcategory(ExpenseSubcategory subcategory) { this.subcategory = subcategory; }
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
}