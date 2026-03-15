package com.hyundai.dms.config;

import com.hyundai.dms.security.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.*;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final JwtTokenProvider tokenProvider;

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(tokenProvider, userDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/auth/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/lookup/**").authenticated()
                .requestMatchers("/employees/**").hasAnyRole("ADMIN", "SALES_MANAGER")
                .requestMatchers("/vehicles/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER", "SALES_MANAGER", "SALES_EXECUTIVE")
                .requestMatchers("/customers/**").hasAnyRole("ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "ACCOUNTS")
                .requestMatchers("/leads/**").hasAnyRole("ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE")
                .requestMatchers("/bookings/**").hasAnyRole("ADMIN", "SALES_MANAGER", "SALES_EXECUTIVE", "ACCOUNTS")
                .requestMatchers("/service/**").hasAnyRole("ADMIN", "SERVICE_ADVISOR", "MECHANIC")
                .requestMatchers("/parts/**").hasAnyRole("ADMIN", "INVENTORY_MANAGER", "SERVICE_ADVISOR")
                .requestMatchers("/finance/**").hasAnyRole("ADMIN", "ACCOUNTS", "SALES_MANAGER")
                .requestMatchers("/reports/**").hasAnyRole("ADMIN", "SALES_MANAGER")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:4200"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
