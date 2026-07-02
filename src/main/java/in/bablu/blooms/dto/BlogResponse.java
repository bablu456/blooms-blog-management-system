package in.bablu.blooms.dto;

import in.bablu.blooms.models.CategoryMapping;

import java.util.Date;
import java.util.List;
import java.util.Set;

public class BlogResponse {
    private String id;
    private String title;
    private String description;
    private String content;
    private String imageUrl;
    private String authorId;
    private String authorName;
    private String status;
    private Date createdAt;
    private String createdTime;   // Readable Time

    private Set<String> likes;
    private long likeCount;

    private List<CategoryMapping> categoryMappings;

    public BlogResponse() {}

    public BlogResponse(
            String id,
            String title,
            String description,
            String content,
            String imageUrl,
            String authorId,
            String authorName,
            String status,
            Date createdAt,
            String createdTime,
            Set<String> likes,
            long likeCount,
            List<CategoryMapping> categoryMappings
    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.content = content;
        this.imageUrl = imageUrl;
        this.authorId = authorId;
        this.authorName = authorName;
        this.status = status;
        this.createdAt = createdAt;
        this.createdTime = createdTime;
        this.likes = likes;
        this.likeCount = likeCount;
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
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public String getCreatedTime() { return createdTime; }
    public void setCreatedTime(String createdTime) { this.createdTime = createdTime; }
    public Set<String> getLikes() { return likes; }
    public void setLikes(Set<String> likes) { this.likes = likes; }
    public long getLikeCount() { return likeCount; }
    public void setLikeCount(long likeCount) { this.likeCount = likeCount; }
    public List<CategoryMapping> getCategoryMappings() { return categoryMappings; }
    public void setCategoryMappings(List<CategoryMapping> categoryMappings) { this.categoryMappings = categoryMappings; }
}
