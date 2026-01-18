package in.bablu.blooms.dto;

import in.bablu.blooms.models.CategoryMapping;
import in.bablu.blooms.models.SubCategory;

import java.util.List;

public class BlogRequest {
    private String id;
    private String title;
    private String description;
    private String content;
    private String authorId;

    private List<CategoryMapping>  categoryMappings;

    public BlogRequest() {}

    public BlogRequest(String title, String description, String content, String authorId, String categoryId, String subCategoryId, List<CategoryMapping> categoryMappings){
        this.title = title;
        this.description = description;
        this.content = content;
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
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public List<CategoryMapping> getCategoryMappings() { return categoryMappings; }
    public void setCategoryMappings(List<CategoryMapping> categoryMappings) {
        this.categoryMappings = categoryMappings;
    }
}
