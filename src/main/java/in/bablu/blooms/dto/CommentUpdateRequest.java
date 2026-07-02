package in.bablu.blooms.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommentUpdateRequest {

    @JsonAlias("content")
    @NotBlank(message = "Comment text is required")
    @Size(max = 2000, message = "Comment text must be 2000 characters or fewer")
    private String text;

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}
