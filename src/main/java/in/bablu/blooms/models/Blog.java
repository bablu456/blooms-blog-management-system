package in.bablu.blooms.models;

import java.sql.Timestamp;
import java.util.List;

// Yeh class ek blueprint hai ki hamara Blog post kaisa dikhega
public class Blog {

    // 1. ID: Har blog ki ek unique pehchan honi chahiye (jaise Aadhaar card number)
    // String isliye kyunki hum bada random number (UUID) use karenge
    private String id;

    // 2. Title: Blog ka main headline
    private String title;

    // 3. Description: Chhota sa summary jo card pe dikhega
    private String description;

    // 4. Content: Pura blog post (HTML ya text) yahan aayega
    private String content;

    // 5. Status: Blog abhi "Draft" hai, "Published" hai, ya "Deleted" hai
    // Iske liye hum String use kar rahe hain (baad me Enum bhi use kar sakte hain)
    private String status;

    // 6. AuthorID: Ye blog kisne likha?
    // Hame pura User object yahan rakhne ki zarurat nahi, bas User ki ID kaafi hai.
    // Isse 'Loose Coupling' kehte hain (database load kam padta hai).
    private String authorId;

    // 7. CreatedDTTM: Blog kab bana? (DTTM = Date Time Timestamp)
    // java.sql.Timestamp database ke saath time match karne ke liye best hai.
    private Timestamp createdDTTM;

    // 8. CategoryMapping (Sabse Important Line):
    // Ek blog multiple categories ka hissa ho sakta hai.
    // Isliye humne 'List' use kiya.
    // CategoryMapping ek alag class hogi jo batayegi ki ye blog kis-kis category se juda hai.
    private List<CategoryMapping> categoryMappings;

    // --- Getters and Setters ---
    // (Inka kaam hai private data ko bahar supply karna aur naya data set karna)

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAuthorId() {
        return authorId;
    }

    public void setAuthorId(String authorId) {
        this.authorId = authorId;
    }

    public Timestamp getCreatedDTTM() {
        return createdDTTM;
    }

    public void setCreatedDTTM(Timestamp createdDTTM) {
        this.createdDTTM = createdDTTM;
    }

    public List<CategoryMapping> getCategoryMappings() {
        return categoryMappings;
    }

    public void setCategoryMappings(List<CategoryMapping> categoryMappings) {
        this.categoryMappings = categoryMappings;
    }
}