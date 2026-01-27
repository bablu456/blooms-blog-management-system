package in.bablu.blooms.dto;

public class SubCategoryRequest {
    private String categoryId;  // Parent Connection (Kis Category me add Karna hai )
    private String name; // Name (E.g "Core Java")
    private String description; // Description

    //Default Constructor
    public SubCategoryRequest() {}

    public SubCategoryRequest(String categoryId, String name, String description) {
        this.categoryId = categoryId;
        this.name = name;
        this.description = description;
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

