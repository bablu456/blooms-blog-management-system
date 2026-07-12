package in.bablu.blooms.services;

import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.BlogRepository;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class RagService {
    private static final int CONTEXT_BLOG_LIMIT = 5;
    private static final int SUMMARY_MAX_LENGTH = 280;
    private static final String SYSTEM_PROMPT_PREFIX =
            "You are the Blooms blog assistant. Use the retrieved MongoDB blog context to answer the user. "
                    + "If the context does not contain the answer, say so clearly and do not invent blog facts.\n\n";
    private static final Pattern AUTHOR_PATTERN = Pattern.compile(
            "\\b(?:author|written by|blogs? by|posts? by|by|from)\\s+([A-Za-z0-9@._'\\- ]+)",
            Pattern.CASE_INSENSITIVE
    );

    @Autowired
    private BlogRepository blogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AiService aiService;

    public List<Blog> retrieveRelevantBlogs(String userQuery) {
        if (!hasText(userQuery)) {
            return blogRepository.findTop5ByOrderByCreatedAtDesc();
        }

        String authorHint = extractAuthorHint(userQuery);
        if (hasText(authorHint)) {
            List<Blog> authorBlogs = findBlogsByAuthor(authorHint);
            if (!authorBlogs.isEmpty()) {
                return authorBlogs;
            }
        }

        RetrievalIntent intent = determineIntent(userQuery);
        return switch (intent) {
            case POPULAR -> blogRepository.findTop5ByOrderByLikeCountDesc();
            case LATEST -> blogRepository.findTop5ByOrderByCreatedAtDesc();
            case AUTHOR -> fallbackSearch(userQuery);
            case SEARCH -> fallbackSearch(userQuery);
        };
    }

    public String buildContext(List<Blog> blogs) {
        if (blogs == null || blogs.isEmpty()) {
            return "No relevant blog context was found in MongoDB.";
        }

        Map<String, String> authorNames = resolveAuthorNames(blogs);
        StringBuilder context = new StringBuilder("Retrieved blog context from MongoDB:\n");

        int index = 1;
        for (Blog blog : blogs) {
            context.append("\nBlog ").append(index++).append(":\n");
            context.append("Title: ").append(defaultValue(blog.getTitle(), "Untitled Blog")).append('\n');
            context.append("Author: ")
                    .append(authorNames.getOrDefault(blog.getAuthorId(), "Unknown Author"))
                    .append('\n');
            context.append("Likes: ").append(blog.getLikeCount()).append('\n');
            context.append("Summary: ").append(buildSummary(blog)).append('\n');
        }

        return context.toString().trim();
    }

    public String buildContextForQuery(String userQuery) {
        return buildContext(retrieveRelevantBlogs(userQuery));
    }

    public String generateReply(String userMessage) {
        String context = buildContextForQuery(userMessage);
        return aiService.callOpenRouter(buildSystemPrompt(context), userMessage);
    }

    private RetrievalIntent determineIntent(String userQuery) {
        if (hasText(extractAuthorHint(userQuery))) {
            return RetrievalIntent.AUTHOR;
        }

        String normalized = userQuery.toLowerCase(Locale.ENGLISH);
        if (containsAny(normalized, "popular", "most liked", "top liked", "top blogs", "trending")) {
            return RetrievalIntent.POPULAR;
        }
        if (containsAny(normalized, "latest", "recent", "newest", "fresh", "new blogs")) {
            return RetrievalIntent.LATEST;
        }
        return RetrievalIntent.SEARCH;
    }

    private List<Blog> findBlogsByAuthor(String authorHint) {
        Optional<User> author = resolveAuthor(authorHint);
        if (author.isEmpty()) {
            return Collections.emptyList();
        }

        return blogRepository.findByAuthorIdOrderByCreatedAtDesc(author.get().getId())
                .stream()
                .limit(CONTEXT_BLOG_LIMIT)
                .collect(Collectors.toList());
    }

    private Optional<User> resolveAuthor(String authorHint) {
        if (!hasText(authorHint)) {
            return Optional.empty();
        }

        String normalizedHint = authorHint.trim();

        Optional<User> directMatch = userRepository.findById(normalizedHint)
                .or(() -> userRepository.findByUsername(normalizedHint))
                .or(() -> userRepository.findByEmail(normalizedHint));

        if (directMatch.isPresent()) {
            return directMatch;
        }

        List<User> users = userRepository.findAll();

        Optional<User> exactDisplayMatch = users.stream()
                .filter(user -> equalsIgnoreCase(user.getName(), normalizedHint)
                        || equalsIgnoreCase(user.getUsername(), normalizedHint)
                        || equalsIgnoreCase(user.getEmail(), normalizedHint))
                .findFirst();

        if (exactDisplayMatch.isPresent()) {
            return exactDisplayMatch;
        }

        String loweredHint = normalizedHint.toLowerCase(Locale.ENGLISH);
        return users.stream()
                .filter(user -> containsIgnoreCase(user.getName(), loweredHint)
                        || containsIgnoreCase(user.getUsername(), loweredHint)
                        || containsIgnoreCase(user.getEmail(), loweredHint))
                .findFirst();
    }

    private List<Blog> fallbackSearch(String userQuery) {
        List<Blog> matchedBlogs = blogRepository.findByTitleContainingIgnoreCase(userQuery.trim())
                .stream()
                .limit(CONTEXT_BLOG_LIMIT)
                .collect(Collectors.toList());

        if (!matchedBlogs.isEmpty()) {
            return matchedBlogs;
        }

        return blogRepository.findTop5ByOrderByCreatedAtDesc();
    }

    private Map<String, String> resolveAuthorNames(List<Blog> blogs) {
        List<String> authorIds = blogs.stream()
                .map(Blog::getAuthorId)
                .filter(this::hasText)
                .distinct()
                .collect(Collectors.toList());

        if (authorIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, String> authorNames = new HashMap<>();
        for (User user : userRepository.findAllById(authorIds)) {
            authorNames.put(user.getId(), buildAuthorDisplayName(user));
        }
        return authorNames;
    }

    private String buildSummary(Blog blog) {
        String source = firstNonBlank(blog.getDescription(), blog.getContent());
        if (!hasText(source)) {
            return "No summary available.";
        }

        String normalized = source.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= SUMMARY_MAX_LENGTH) {
            return normalized;
        }

        return normalized.substring(0, SUMMARY_MAX_LENGTH - 3).trim() + "...";
    }

    private String buildAuthorDisplayName(User user) {
        return firstNonBlank(user.getName(), user.getUsername(), user.getEmail(), "Unknown Author");
    }

    private String buildSystemPrompt(String context) {
        return SYSTEM_PROMPT_PREFIX + context;
    }

    private String extractAuthorHint(String userQuery) {
        if (!hasText(userQuery)) {
            return null;
        }

        Matcher matcher = AUTHOR_PATTERN.matcher(userQuery.trim());
        if (!matcher.find()) {
            return null;
        }

        String authorHint = matcher.group(1);
        if (authorHint == null) {
            return null;
        }

        String cleaned = authorHint
                .replaceAll("(?i)\\b(?:blogs?|posts?)\\b", "")
                .replaceAll("[?.!,;:]+$", "")
                .trim();

        return cleaned.isEmpty() ? null : cleaned;
    }

    private boolean containsAny(String value, String... candidates) {
        for (String candidate : candidates) {
            if (value.contains(candidate)) {
                return true;
            }
        }
        return false;
    }

    private boolean containsIgnoreCase(String value, String loweredNeedle) {
        return value != null && value.toLowerCase(Locale.ENGLISH).contains(loweredNeedle);
    }

    private boolean equalsIgnoreCase(String left, String right) {
        return left != null && right != null && left.equalsIgnoreCase(right);
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private String defaultValue(String value, String fallback) {
        return hasText(value) ? value.trim() : fallback;
    }

    private String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }

        for (String value : values) {
            if (hasText(value)) {
                return value.trim();
            }
        }
        return null;
    }

    private enum RetrievalIntent {
        LATEST,
        POPULAR,
        AUTHOR,
        SEARCH
    }
}
