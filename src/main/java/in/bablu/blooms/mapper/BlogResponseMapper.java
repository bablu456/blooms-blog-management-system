package in.bablu.blooms.mapper;

import in.bablu.blooms.dto.BlogResponse;
import in.bablu.blooms.models.Blog;
import in.bablu.blooms.models.User;
import in.bablu.blooms.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class BlogResponseMapper {
    private static final DateTimeFormatter CREATED_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    @Autowired
    private UserService userService;

    public BlogResponse toResponse(Blog blog) {
        String authorName = "Unknown Author";
        if (blog.getAuthorId() != null) {
            authorName = userService.getUserById(blog.getAuthorId())
                    .map(User::getName)
                    .filter(name -> name != null && !name.trim().isEmpty())
                    .orElse("Unknown Author");
        }

        String createdTime = null;
        if (blog.getCreatedAt() != null) {
            createdTime = CREATED_TIME_FORMATTER.format(
                    blog.getCreatedAt().toInstant().atZone(ZoneId.systemDefault())
            );
        }

        return new BlogResponse(
                blog.getId(),
                blog.getTitle(),
                blog.getDescription(),
                blog.getContent(),
                blog.getImageUrl(),
                blog.getAuthorId(),
                authorName,
                blog.getStatus(),
                blog.getCreatedAt(),
                createdTime,
                blog.getLikes(),
                blog.getLikeCount(),
                blog.getCategoryMappings()
        );
    }

    public List<BlogResponse> toResponses(List<Blog> blogs) {
        return blogs.stream().map(this::toResponse).toList();
    }
}
