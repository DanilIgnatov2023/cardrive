package com.cardrive.service;

import com.cardrive.model.dto.AutomobileDTO;
import com.cardrive.model.dto.CreateAutomobileRequest;
import com.cardrive.model.entity.Automobile;
import com.cardrive.model.entity.CarBrand;
import com.cardrive.model.entity.CarModel;
import com.cardrive.model.entity.User;
import com.cardrive.repository.AutomobileRepository;
import com.cardrive.repository.CarBrandRepository;
import com.cardrive.repository.CarModelRepository;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AutomobileService {

    private final AutomobileRepository automobileRepository;
    private final UserRepository userRepository;
    private final CarBrandRepository carBrandRepository;
    private final CarModelRepository carModelRepository;

    public AutomobileService(AutomobileRepository automobileRepository,
                             UserRepository userRepository,
                             CarBrandRepository carBrandRepository,
                             CarModelRepository carModelRepository) {
        this.automobileRepository = automobileRepository;
        this.userRepository = userRepository;
        this.carBrandRepository = carBrandRepository;
        this.carModelRepository = carModelRepository;
    }

    private User getCurrentUser() {
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private AutomobileDTO convertToDTO(Automobile auto) {
        AutomobileDTO dto = new AutomobileDTO();
        dto.setId(auto.getId());
        dto.setPlateNumber(auto.getPlateNumber());
        dto.setYear(auto.getYear());
        dto.setVinCode(auto.getVinCode());
        dto.setStartOdometer(auto.getStartOdometer());
        dto.setComment(auto.getComment());
        if (auto.getBrand() != null) {
            dto.setBrandName(auto.getBrand().getName());
            dto.setBrandId(auto.getBrand().getId());
        }
        if (auto.getModel() != null) {
            dto.setModelName(auto.getModel().getName());
            dto.setModelId(auto.getModel().getId());
        }
        return dto;
    }

    public List<AutomobileDTO> getUserAutomobiles() {
        User currentUser = getCurrentUser();
        return automobileRepository.findByUser(currentUser)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AutomobileDTO createAutomobile(CreateAutomobileRequest request) {
        User currentUser = getCurrentUser();

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        CarModel model = carModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        Automobile auto = new Automobile();
        auto.setPlateNumber(request.getPlateNumber());
        auto.setYear(request.getYear());
        auto.setVinCode(request.getVinCode());
        auto.setStartOdometer(request.getStartOdometer());
        auto.setComment(request.getComment());
        auto.setUser(currentUser);
        auto.setBrand(brand);
        auto.setModel(model);

        return convertToDTO(automobileRepository.save(auto));
    }

    @Transactional
    public AutomobileDTO updateAutomobile(Long id, CreateAutomobileRequest request) {
        User currentUser = getCurrentUser();
        Automobile auto = automobileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!auto.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new RuntimeException("Brand not found"));
        CarModel model = carModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new RuntimeException("Model not found"));

        auto.setPlateNumber(request.getPlateNumber());
        auto.setYear(request.getYear());
        auto.setVinCode(request.getVinCode());
        auto.setStartOdometer(request.getStartOdometer());
        auto.setComment(request.getComment());
        auto.setBrand(brand);
        auto.setModel(model);

        return convertToDTO(automobileRepository.save(auto));
    }

    @Transactional
    public void deleteAutomobile(Long id) {
        User currentUser = getCurrentUser();
        Automobile auto = automobileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Automobile not found"));

        if (!auto.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }

        automobileRepository.delete(auto);
    }
}