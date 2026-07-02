package in.bablu.blooms.dto;

import in.bablu.blooms.models.SocialLinks;

public class UserRequest {
    private String username;
    private String email;
    private String name;
    private String password;
    private String profileUrl;
    private String phoneNumber;
    private String bio;
    private String website;
    private SocialLinks socialLinks;

    public UserRequest() {

    }

    public UserRequest(String username, String email, String name, String password, String profileUrl,
            String phoneNumber) {
        this.username = username;
        this.email = email;
        this.name = name;
        this.password = password;
        this.profileUrl = profileUrl;
        this.phoneNumber = phoneNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getProfileUrl() {
        return profileUrl;
    }

    public void setProfileUrl(String profileUrl) {
        this.profileUrl = profileUrl;
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
