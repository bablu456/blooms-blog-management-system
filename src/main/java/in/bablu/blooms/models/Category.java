package in.bablu.blooms.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "categories")
public class Category {

    //1. Unique ID har category ke liye
    @Id
    private String id;

    private String name; //2. Category ka naam (e.g., "Technology", "Health")

    private String description; //3. Category ka chhota sa details

    private String imageUrl; //4. Category ka image URL (agar koi ho)

    private boolean active; //5. Active (Soft Delete Flag) - BAHUT IMPORTANT True = Dikhao, False = Chuupao do (Delete mat karna, Bas Hide Karo)

    private LocalDateTime createdDTTM; //6. Category kab bani (Date Time Timestamp)

    private String createdBy; //7. Category kisne banayi (User ID or Audit Ke liye)\

    private String status; //8. Category ka status published/draft/deleted
    // abhi string hai future me enum kar sakte hain

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedDTTM() {
        return createdDTTM;
    }

    public void setCreatedDTTM(LocalDateTime createdDTTM) {
        this.createdDTTM = createdDTTM;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
