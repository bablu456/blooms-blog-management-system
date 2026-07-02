package in.bablu.blooms.dto;

import java.time.Instant;

public class CommentResponse {
    private String id;
    private String text;
    private String blogId;
    private String userId;
    private String commenterName;
    private Instant createdAt;

    public CommentResponse() {
    }

    public CommentResponse(
            String id,
            String text,
            String blogId,
            String userId,
            String commenterName,
            Instant createdAt
    ) {
        this.id = id;
        this.text = text;
        this.blogId = blogId;
        this.userId = userId;
        this.commenterName = commenterName;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getBlogId() {
        return blogId;
    }

    public void setBlogId(String blogId) {
        this.blogId = blogId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getCommenterName() {
        return commenterName;
    }

    public void setCommenterName(String commenterName) {
        this.commenterName = commenterName;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
