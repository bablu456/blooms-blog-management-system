package in.bablu.blooms.dto;

public class SubCategoryResponse {
    private String id;
    private String categoryId;  // UI ko batane ke liye ki parent kaun hai
    private String name;
    private String description;

    // Constructor
    public SubCategoryResponse() {
    }

    // Parameterized Constructor for easy object creation
    public SubCategoryResponse(String id, String categoryId, String name, String description) {
        this.id = id;
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
