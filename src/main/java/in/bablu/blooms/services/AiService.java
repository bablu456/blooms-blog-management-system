package in.bablu.blooms.services;

import in.bablu.blooms.config.OpenRouterConfig;
import in.bablu.blooms.dto.ChatRequest;
import in.bablu.blooms.dto.ChatResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
public class AiService {
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(60);
    private static final Double DEFAULT_TEMPERATURE = 0.4;
    private static final Integer DEFAULT_MAX_TOKENS = 700;

    @Autowired
    @Qualifier("openRouterWebClient")
    private WebClient openRouterWebClient;

    @Autowired
    private OpenRouterConfig openRouterConfig;

    public String callOpenRouter(String systemPrompt, String userMessage) {
        return callOpenRouterAsync(systemPrompt, userMessage)
                .blockOptional(REQUEST_TIMEOUT)
                .orElseThrow(() -> new IllegalStateException("OpenRouter returned no content"));
    }

    public Mono<String> callOpenRouterAsync(String systemPrompt, String userMessage) {
        validateInput(userMessage);
        validateApiKey();

        String primaryModel = safeTrim(openRouterConfig.getModel());
        String fallbackModel = safeTrim(openRouterConfig.getFallbackModel());

        Mono<String> primaryCall = sendChatCompletion(primaryModel, systemPrompt, userMessage);

        if (!hasText(fallbackModel) || fallbackModel.equals(primaryModel)) {
            return primaryCall;
        }

        return primaryCall.onErrorResume(primaryError ->
                sendChatCompletion(fallbackModel, systemPrompt, userMessage)
                        .onErrorResume(fallbackError -> Mono.error(
                                new IllegalStateException(buildFallbackErrorMessage(primaryError, fallbackError), fallbackError)
                        ))
        );
    }

    private Mono<String> sendChatCompletion(String model, String systemPrompt, String userMessage) {
        if (!hasText(model)) {
            return Mono.error(new IllegalStateException("No OpenRouter model configured"));
        }

        ChatRequest request = new ChatRequest();
        request.setModel(model);
        request.setMessages(buildMessages(systemPrompt, userMessage));
        request.setStream(false);
        request.setTemperature(DEFAULT_TEMPERATURE);
        request.setMaxTokens(DEFAULT_MAX_TOKENS);

        return openRouterWebClient.post()
                .uri("/chat/completions")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(ChatResponse.class)
                .switchIfEmpty(Mono.error(new IllegalStateException("OpenRouter returned an empty response body")))
                .map(this::extractAssistantMessage)
                .onErrorMap(WebClientResponseException.class, this::mapWebClientException)
                .timeout(REQUEST_TIMEOUT);
    }

    private List<ChatRequest.Message> buildMessages(String systemPrompt, String userMessage) {
        List<ChatRequest.Message> messages = new ArrayList<>();

        if (hasText(systemPrompt)) {
            messages.add(new ChatRequest.Message("system", systemPrompt.trim()));
        }

        messages.add(new ChatRequest.Message("user", userMessage.trim()));
        return messages;
    }

    private String extractAssistantMessage(ChatResponse response) {
        if (response == null || response.getChoices() == null || response.getChoices().isEmpty()) {
            throw new IllegalStateException("OpenRouter returned no choices");
        }

        ChatResponse.Choice firstChoice = response.getChoices().get(0);
        if (firstChoice == null || firstChoice.getMessage() == null || !hasText(firstChoice.getMessage().getContent())) {
            throw new IllegalStateException("OpenRouter returned an empty assistant message");
        }

        return firstChoice.getMessage().getContent().trim();
    }

    private RuntimeException mapWebClientException(WebClientResponseException exception) {
        String responseBody = safeTrim(exception.getResponseBodyAsString());
        String message = "OpenRouter request failed with status " + exception.getStatusCode().value();

        if (hasText(responseBody)) {
            message = message + ": " + responseBody;
        }

        return new IllegalStateException(message, exception);
    }

    private void validateInput(String userMessage) {
        if (!hasText(userMessage)) {
            throw new IllegalArgumentException("User message must not be blank");
        }
    }

    private void validateApiKey() {
        if (!hasText(openRouterConfig.getApiKey())) {
            throw new IllegalStateException("OpenRouter API key is missing. Set OPENROUTER_API_KEY before calling the AI service.");
        }
    }

    private String buildFallbackErrorMessage(Throwable primaryError, Throwable fallbackError) {
        return "OpenRouter failed for both configured models. Primary error: "
                + safeTrim(primaryError.getMessage())
                + " | Fallback error: "
                + safeTrim(fallbackError.getMessage());
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
