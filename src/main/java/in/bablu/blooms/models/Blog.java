package in.bablu.blooms.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

// Yeh class ek blueprint hai ki hamara Blog post kaisa dikhega
@Document(collection = "blogs")
public class Blog {

    @Id
    private String id;

    private String title;

    private String description;

    private String content;

    private String imageUrl;

    private String status;

    private String authorId;

//    private Timestamp createdDTTM;

    private Date createdAt;

    private Set<String> likes = new LinkedHashSet<>();

    private long likeCount;

    private List<CategoryMapping> categoryMappings;

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Set<String> getLikes() {
        if (likes == null) {
            likes = new LinkedHashSet<>();
        }
        return likes;
    }

    public void setLikes(Set<String> likes) {
        this.likes = likes == null ? new LinkedHashSet<>() : new LinkedHashSet<>(likes);
        this.likeCount = this.likes.size();
    }

    public long getLikeCount() {
        if (likeCount != getLikes().size()) {
            likeCount = getLikes().size();
        }
        return likeCount;
    }

    public void setLikeCount(long likeCount) {
        this.likeCount = Math.max(likeCount, 0);
    }

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

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

//    public Timestamp getCreatedDTTM() {
//        return createdDTTM;
//    }
//
//    public void setCreatedDTTM(Timestamp createdDTTM) {
//        this.createdDTTM = createdDTTM;
//    }

    public List<CategoryMapping> getCategoryMappings(){
        return categoryMappings;
    }

    public void setCategoryMappings(List<CategoryMapping> categoryMappings) {
        this.categoryMappings = categoryMappings;
    }
}
