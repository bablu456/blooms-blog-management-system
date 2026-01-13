package in.bablu.blooms.dto;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private String profileUrl;

    public UserResponse() {}

    // Constructor  For Easy conversation
    public UserResponse(String id, String username, String email, String name, String profileUrl) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.profileUrl = profileUrl;
    }

    // ---- getters and setters ----

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}
