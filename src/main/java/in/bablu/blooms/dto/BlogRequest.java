package in.bablu.blooms.dto;

import in.bablu.blooms.models.CategoryMapping;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public class BlogRequest {
    private String id;

    @NotBlank(message = "Blog title is required")
    @Size(min = 3, max = 180, message = "Blog title must be 3-180 characters")
    private String title;

    @NotBlank(message = "Blog description is required")
    @Size(min = 10, max = 400, message = "Blog description must be 10-400 characters")
    private String description;

    @NotBlank(message = "Blog content is required")
    private String content;

    @Size(max = 1024, message = "Image URL is too long")
    private String imageUrl;

    @NotBlank(message = "Author ID is required")
    private String authorId;

    private List<CategoryMapping>  categoryMappings;

    public BlogRequest() {}

    public BlogRequest(
            String title,
            String description,
            String content,
            String imageUrl,
            String authorId,
            List<CategoryMapping> categoryMappings
    ) {
        this.title = title;
        this.description = description;
        this.content = content;
        this.imageUrl = imageUrl;
        this.authorId = authorId;
        this.categoryMappings = categoryMappings;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public List<CategoryMapping> getCategoryMappings() { return categoryMappings; }
    public void setCategoryMappings(List<CategoryMapping> categoryMappings) {
        this.categoryMappings = categoryMappings;
    }
}
