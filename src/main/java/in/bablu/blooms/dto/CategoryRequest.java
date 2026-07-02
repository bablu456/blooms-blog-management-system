package in.bablu.blooms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// DTO (Data Transfer Object) - Ye wo parchhi hai jo User bharke dega.
// Isme sirf wo data hota hai jo User se server tak aana chahiye.
public class CategoryRequest {
    @NotBlank(message = "Category title is required")
    @Size(min = 2, max = 80, message = "Category title must be 2-80 characters")
    private String title;   // Category ka naam (e.g. "Tech")

    @NotBlank(message = "Category description is required")
    @Size(min = 5, max = 300, message = "Category description must be 5-300 characters")
    private String desc;    // Description

    @Size(max = 1024, message = "Image URL is too long")
    private String cUrl; // Image URL (Short variable name use kiya hai sir ne)

    // Default Constructor (Frameworks ko kabhi-kabhi khali constructor chahiye hota hai)
    public CategoryRequest(){
    }

    public CategoryRequest( String title, String desc, String cUrl) {
        this.title = title;
        this.desc = desc;
        this.cUrl = cUrl;
    }





    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDesc() {
        return desc;
    }

    public void setDesc(String desc) {
        this.desc = desc;
    }

    public String getcUrl() {
        return cUrl;
    }

    public void setcUrl(String cUrl) {
        this.cUrl = cUrl;
    }

    // Backward-compatible aliases for frontend consistency
    public String getImageUrl() {
        return cUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.cUrl = imageUrl;
    }
}
