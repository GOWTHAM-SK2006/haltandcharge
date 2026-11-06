package com.haltcharge.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI haltChargeOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Halt & Charge EV Charging Platform API")
                        .description("REST API specifications for Halt & Charge EV charging management platform, Virtual Charger Simulator, and Admin Dashboard.")
                        .version("1.0.0")
                        .contact(new Contact().name("Halt & Charge Architecture Team").email("dev@haltcharge.com"))
                        .license(new License().name("Proprietary - Halt & Charge")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .name("BearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}

