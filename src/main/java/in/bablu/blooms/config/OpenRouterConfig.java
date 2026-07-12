package in.bablu.blooms.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OpenRouterConfig {

    @Value("${app.ai.openrouter.api-key:}")
    private String apiKey;

    @Value("${app.ai.openrouter.base-url:https://openrouter.ai/api/v1}")
    private String baseUrl;

    @Value("${app.ai.openrouter.model:google/gemini-2.5-flash:free}")
    private String model;

    @Value("${app.ai.openrouter.fallback-model:meta-llama/llama-3-8b-instruct:free}")
    private String fallbackModel;

    @Value("${app.ai.openrouter.site-url:http://localhost:8080}")
    private String siteUrl;

    @Value("${app.ai.openrouter.app-title:Blooms Blog Chatbot}")
    private String appTitle;

    @Bean(name = "openRouterWebClient")
    public WebClient openRouterWebClient() {
        WebClient.Builder builder = WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);

        if (hasText(apiKey)) {
            builder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey.trim());
        }

        if (hasText(siteUrl)) {
            builder.defaultHeader("HTTP-Referer", siteUrl.trim());
        }

        if (hasText(appTitle)) {
            builder.defaultHeader("X-OpenRouter-Title", appTitle.trim());
        }

        return builder.build();
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getModel() {
        return model;
    }

    public String getFallbackModel() {
        return fallbackModel;
    }

    public String getSiteUrl() {
        return siteUrl;
    }

    public String getAppTitle() {
        return appTitle;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
