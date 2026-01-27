package in.bablu.blooms.dto;

// DTO (Data Transfer Object) - Ye wo parchhi hai jo User bharke dega.
// Isme sirf wo data hota hai jo User se server tak aana chahiye.
public class CategoryRequest {
    private String title;   // Category ka naam (e.g. "Tech")
    private String desc;    // Description
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
}
