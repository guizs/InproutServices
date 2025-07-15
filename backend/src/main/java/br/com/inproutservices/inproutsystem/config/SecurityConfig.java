package br.com.inproutservices.inproutsystem.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())

                // Desativa o CSRF, que não é usualmente necessário para APIs stateless
                .csrf(AbstractHttpConfigurer::disable)

                // Permite todas as requisições (sem necessidade de login/autenticação)
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())

                .build();
    }

    // 2. ADICIONE ESTE BEAN: Define as regras de CORS para toda a aplicação
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Define quais origens (front-ends) são permitidas
        configuration.setAllowedOrigins(List.of("*"));

        // Define quais métodos HTTP são permitidos
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        // Define quais cabeçalhos são permitidos
        configuration.setAllowedHeaders(List.of("*"));

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Aplica esta configuração a todos os endpoints da API ("/**")
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}