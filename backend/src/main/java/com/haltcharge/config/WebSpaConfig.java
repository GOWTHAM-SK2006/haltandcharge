package com.haltcharge.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

@Configuration
public class WebSpaConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/admin").setViewName("forward:/admin/index.html");
        registry.addViewController("/admin/").setViewName("forward:/admin/index.html");
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Admin SPA route forwarding
        registry.addResourceHandler("/admin/**")
                .addResourceLocations("classpath:/static/admin/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        if (resourcePath == null || resourcePath.isEmpty() || resourcePath.equals("/")) {
                            return new ClassPathResource("/static/admin/index.html");
                        }
                        Resource requested = location.createRelative(resourcePath);
                        return (requested.exists() && requested.isReadable() && requested.getFilename() != null && requested.getFilename().contains("."))
                                ? requested
                                : new ClassPathResource("/static/admin/index.html");
                    }
                });

        // Customer Web SPA route forwarding
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        // Do not intercept backend APIs, swagger, actuator, or websockets
                        if (resourcePath.startsWith("api") ||
                            resourcePath.startsWith("actuator") ||
                            resourcePath.startsWith("ws") ||
                            resourcePath.startsWith("swagger-ui") ||
                            resourcePath.startsWith("v3/api-docs")) {
                            return null;
                        }
                        if (resourcePath.startsWith("admin")) {
                            return null;
                        }
                        if (resourcePath.isEmpty() || resourcePath.equals("/")) {
                            return new ClassPathResource("/static/index.html");
                        }
                        Resource requested = location.createRelative(resourcePath);
                        return (requested.exists() && requested.isReadable() && requested.getFilename() != null && requested.getFilename().contains("."))
                                ? requested
                                : new ClassPathResource("/static/index.html");
                    }
                });
    }
}
