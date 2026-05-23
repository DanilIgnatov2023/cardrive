package com.cardrive.config;

import com.cardrive.model.entity.*;
import com.cardrive.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CarBrandRepository carBrandRepository;
    private final CarModelRepository carModelRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final UserRepository userRepository;
    private final AutomobileRepository automobileRepository;
    private final ExpenseRepository expenseRepository;

    public DataInitializer(CarBrandRepository carBrandRepository,
                           CarModelRepository carModelRepository,
                           ExpenseCategoryRepository expenseCategoryRepository,
                           UserRepository userRepository,
                           AutomobileRepository automobileRepository,
                           ExpenseRepository expenseRepository) {
        this.carBrandRepository = carBrandRepository;
        this.carModelRepository = carModelRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.userRepository = userRepository;
        this.automobileRepository = automobileRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Создать категории расходов
        if (expenseCategoryRepository.count() == 0) {
            createCategories();
            System.out.println("✅ Создано " + expenseCategoryRepository.count() + " категорий");
        }

        // 2. Создать бренды и модели
        if (carBrandRepository.count() == 0) {
            createBrandsAndModels();
            System.out.println("✅ Созданы бренды и модели");
        }
    }

    private void createCategories() {
        String[][] categories = {
                {"Топливо", "⛽", "#10b981"},
                {"Страховка", "🛡️", "#3b82f6"},
                {"Ремонт", "🔧", "#ef4444"},
                {"ТО", "🔧", "#f59e0b"},
                {"Мойка", "🧼", "#06b6d4"},
                {"Парковка", "🅿️", "#8b5cf6"},
                {"Штрафы", "📜", "#ef4444"},
                {"Шины", "🛞", "#6b7280"},
                {"Другое", "📦", "#6b7280"}
        };

        for (String[] cat : categories) {
            ExpenseCategory category = new ExpenseCategory();
            category.setName(cat[0]);
            category.setIcon(cat[1]);
            category.setColor(cat[2]);
            category.setIsDefault(true);
            expenseCategoryRepository.save(category);
        }
    }

    private void createBrandsAndModels() {
        // Toyota
        CarBrand toyota = new CarBrand();
        toyota.setName("Toyota");
        toyota.setCountry("Japan");
        carBrandRepository.save(toyota);

        CarModel camry = new CarModel();
        camry.setName("Camry");
        camry.setBrand(toyota);
        carModelRepository.save(camry);

        CarModel corolla = new CarModel();
        corolla.setName("Corolla");
        corolla.setBrand(toyota);
        carModelRepository.save(corolla);

        // BMW
        CarBrand bmw = new CarBrand();
        bmw.setName("BMW");
        bmw.setCountry("Germany");
        carBrandRepository.save(bmw);

        CarModel x5 = new CarModel();
        x5.setName("X5");
        x5.setBrand(bmw);
        carModelRepository.save(x5);

        // Lada
        CarBrand lada = new CarBrand();
        lada.setName("Lada");
        lada.setCountry("Russia");
        carBrandRepository.save(lada);

        CarModel vesta = new CarModel();
        vesta.setName("Vesta");
        vesta.setBrand(lada);
        carModelRepository.save(vesta);
    }
}