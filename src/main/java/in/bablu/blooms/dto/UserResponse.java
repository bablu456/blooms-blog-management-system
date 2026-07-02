package in.bablu.blooms.dto;

import in.bablu.blooms.models.SocialLinks;

public class UserResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private String profileUrl;
    private String phoneNumber;
    private String role;
    private String bio;
    private String website;
    private SocialLinks socialLinks;

    public UserResponse() {
    }

    public UserResponse(
            String id,
            String username,
            String email,
            String name,
            String profileUrl,
            String phoneNumber,
            String role,
            String bio,
            String website,
            SocialLinks socialLinks
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.name = name;
        this.profileUrl = profileUrl;
        this.phoneNumber = phoneNumber;
        this.role = role;
        this.bio = bio;
        this.website = website;
        this.socialLinks = socialLinks;
    }

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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getWebsite() {
        return website;
    }

    public void setWebsite(String website) {
        this.website = website;
    }

    public SocialLinks getSocialLinks() {
        return socialLinks;
    }

    public void setSocialLinks(SocialLinks socialLinks) {
        this.socialLinks = socialLinks;
    }
}
