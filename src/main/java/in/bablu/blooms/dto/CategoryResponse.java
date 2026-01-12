package in.bablu.blooms.dto;

import java.util.List;

// Ye wo packet hai jo Server se Client (UI) ke paas jayega.
// Hum Model (Category) ko direct nahi bhejte, balki is wrapper me daal kar bhejte hain.
public class CategoryResponse {

    private String id;      // Frontend ko ID chahiye taaki wo edit/delete button bana sake
    private String title;   // Name
    private String desc;    // Description
    private String cUrl;    // Image URL

    // 1. Default Constructor
    // (Zaruri hota hai jab frameworks JSON se Object banate hain)
    public CategoryResponse() {
    }

    // 2. Parameterized Constructor
    // Taaki hum ek line me pura object bana sakein: new CategoryResponse(id, t, d, u)
    public CategoryResponse(String id, String title, String desc, String cUrl) {
        this.id = id;
        this.title = title;
        this.desc = desc;
        this.cUrl = cUrl;
    }
    // --- Getters and Setters ---


    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

}
