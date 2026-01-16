package in.bablu.blooms.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {
    @Id
    private String id; //1. Unique ID har user ke liye
    private String username; //2. Username login id jise daal kar wo login karega (Unique honi chahiye)
    private String email; //3. Contact Info
    private String name; //4. Real Name: Display karne ke liye(Eg., "Bablu Kumar")
    private String profileUrl;//5. Photo Link: Profile picture ka url String
    // 6. Security Key: Login karne ke liye
    // NOTE: Real projects mein hum isse Encrypt (Hash) karke rakhte hain.
    private String password;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
