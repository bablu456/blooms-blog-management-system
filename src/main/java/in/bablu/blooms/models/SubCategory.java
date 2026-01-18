package in.bablu.blooms.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.sql.Timestamp;

@Document(collection = "subcategories")
public class SubCategory {
    //1. Apni unique Pehchan (Unique ID)
    @Id
    private String id;

    //2. Connection Line (Sabse Important)
    //ye batata hai ki ye sub-category kis parent category se judi hai
    private String categoryId;

    //3. Naam (Eg., "Core Java", "Spring boot"
    private String name;

    private String description; //4. Chhota sa details

    private boolean active; //5. Active (Soft Delete Flag) - BAHUT IMPORTANT True = Dikhao, False = Chuupao do (Delete mat karna, Bas Hide Karo)

    private String status; //6. sub-category ka status published /draft/

    // 7. Audit Fields (Kisne banaya aur kab banaya)
    private String createdBy;
    private Timestamp createdDTTM;

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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public Timestamp getCreatedDTTM() {
        return createdDTTM;
    }

    public void setCreatedDTTM(Timestamp createdDTTM) {
        this.createdDTTM = createdDTTM;
    }
}
