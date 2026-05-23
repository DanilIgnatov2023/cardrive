package com.cardrive.service;

import com.cardrive.model.entity.User;
import com.cardrive.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        System.out.println("🔍 Поиск пользователя: " + email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("❌ Пользователь не найден: " + email);
                    return new UsernameNotFoundException("User not found: " + email);
                });

        System.out.println("✅ Пользователь найден: " + user.getEmail());
        System.out.println("🔐 Хэш пароля в БД: " + user.getPasswordHash());
        System.out.println("👤 Роли: " + user.getRoles().stream().map(r -> r.getName()).collect(Collectors.joining(", ")));

        return org.springframework.security.core.userdetails.User
                .builder()
                .username(user.getEmail())
                .password(user.getPasswordHash())
                .authorities(user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.getName()))
                        .collect(Collectors.toList()))
                .build();
    }
}