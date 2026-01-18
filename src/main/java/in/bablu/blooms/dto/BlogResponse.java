package in.bablu.blooms.dto;

import in.bablu.blooms.models.CategoryMapping;

import java.util.List;

public class BlogResponse {
    private String id;
    private String title;
    private String description;
    private String content;
    private String authorName;
    private String status;
    private String createdTime;   // Readable Time

    private List<CategoryMapping> categoryMappings;

    public BlogResponse() {}

    public BlogResponse(String id, String title, String description, String content, String authorName, List<CategoryMapping> categoryMappings) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.content = content;
        this.authorName = authorName;
        this.categoryMappings = categoryMappings;
    }

    // --- Getters & Setters ---
    // (Generate using IDE: Right Click -> Generate -> Getters and Setters)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getCreatedTime() { return createdTime; }
    public void setCreatedTime(String createdTime) { this.createdTime = createdTime; }
    public List<CategoryMapping> getCategoryMappings() { return categoryMappings; }
    public void setCategoryMappings(List<CategoryMapping> categoryMappings) { this.categoryMappings = categoryMappings; }
}
