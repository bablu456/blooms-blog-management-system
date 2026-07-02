package in.bablu.blooms.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentRequest {

    @JsonAlias("content")
    @NotBlank(message = "Comment text is required")
    @Size(max = 2000, message = "Comment text must be 2000 characters or fewer")
    private String text;

    @NotBlank(message = "Blog ID is required")
    private String blogId;

    @NotBlank(message = "User ID is required")
    private String userId;

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
}
