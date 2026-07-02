package in.bablu.blooms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SubCategoryRequest {
    @NotBlank(message = "Category ID is required")
    private String categoryId;  // Parent Connection (Kis Category me add Karna hai )

    @NotBlank(message = "Sub-category name is required")
    @Size(min = 2, max = 80, message = "Sub-category name must be 2-80 characters")
    private String name; // Name (E.g "Core Java")

    @NotBlank(message = "Sub-category description is required")
    @Size(min = 5, max = 300, message = "Sub-category description must be 5-300 characters")
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

