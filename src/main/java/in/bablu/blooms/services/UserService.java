package in.bablu.blooms.services;

import in.bablu.blooms.dto.AuthTokenResponse;
import in.bablu.blooms.dto.OtpDispatchResponse;
import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.models.OtpPurpose;
import in.bablu.blooms.models.SocialLinks;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.UserRepository;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpService otpService;

    @Autowired
    private AuthSessionService authSessionService;

    @Autowired
    private JwtTokenService jwtTokenService;

    public String registerUser(User user) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().trim().isEmpty()) {
            return "Error: Phone number is required";
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            return "Error: Password must be at least 6 characters";
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            return "Error: Username " + user.getUsername() + " already exists";
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Error: Email " + user.getEmail() + " is already registered";
        }
        if (userRepository.findByPhoneNumber(user.getPhoneNumber()).isPresent()) {
            return "Error: Phone number " + user.getPhoneNumber() + " is already registered";
        }

        user.setPhoneNumber(user.getPhoneNumber().trim());
        user.setWebsite(normalizeOptionalField(user.getWebsite()));
        user.setSocialLinks(normalizeSocialLinks(user.getSocialLinks()));
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);

        return "Success: User registered with ID: " + savedUser.getId();
    }

    public UserResponse loginUser(String phoneNumber, String password) {
        return verifyPasswordCredentials(phoneNumber, password)
                .map(this::toUserResponse)
                .orElse(null);
    }

    public AuthTokenResponse loginWithPassword(String phoneNumber, String password) {
        User user = verifyPasswordCredentials(phoneNumber, password)
                .orElseThrow(() -> new IllegalArgumentException("Invalid phone number or password"));
        return authSessionService.issueTokens(user);
    }

    private Optional<User> verifyPasswordCredentials(String phoneNumber, String password) {
        if (phoneNumber == null || password == null) {
            return Optional.empty();
        }
        Optional<User> user = userRepository.findByPhoneNumber(phoneNumber.trim());

        if (user.isEmpty()) {
            return Optional.empty();
        }

        User userEntity = user.get();
        if (!matchesPasswordOrLegacy(password, userEntity.getPassword())) {
            return Optional.empty();
        }

        if (isLegacyPlainTextPassword(userEntity.getPassword(), password)) {
            userEntity.setPassword(passwordEncoder.encode(password));
            userEntity = userRepository.save(userEntity);
        }

        return Optional.of(userEntity);
    }

    public OtpDispatchResponse requestLoginOtp(String phoneNumber) {
        return otpService.sendOtp(phoneNumber, OtpPurpose.LOGIN);
    }

    public UserResponse loginWithOtpLegacy(String phoneNumber, String otp) {
        User user = otpService.verifyOtp(phoneNumber, otp, OtpPurpose.LOGIN);
        return toUserResponse(user);
    }

    public AuthTokenResponse loginWithOtp(String phoneNumber, String otp) {
        User user = otpService.verifyOtp(phoneNumber, otp, OtpPurpose.LOGIN);
        return authSessionService.issueTokens(user);
    }

    public OtpDispatchResponse requestPasswordResetOtp(String phoneNumber) {
        return otpService.sendOtp(phoneNumber, OtpPurpose.PASSWORD_RESET);
    }

    public void resetPasswordWithOtp(String phoneNumber, String otp, String newPassword) {
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        User user = otpService.verifyOtp(phoneNumber, otp, OtpPurpose.PASSWORD_RESET);
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        authSessionService.revokeAllUserSessions(user.getId());
    }

    public AuthTokenResponse refreshSession(String refreshToken) {
        return authSessionService.refreshSession(refreshToken);
    }

    public void logout(String refreshToken) {
        authSessionService.revokeRefreshToken(refreshToken);
    }

    public UserResponse getCurrentUserFromAccessToken(String authorizationHeader) {
        return toUserResponse(getCurrentUserEntityFromAccessToken(authorizationHeader));
    }

    public User getCurrentUserEntityFromAccessToken(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank() || !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalArgumentException("Missing or invalid Authorization header");
        }

        String token = authorizationHeader.substring(7).trim();
        if (token.isEmpty()) {
            throw new IllegalArgumentException("Missing access token");
        }

        Claims claims;
        try {
            claims = jwtTokenService.parseClaims(token);
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid or expired access token");
        }

        String userId = claims.getSubject();
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll()
                .stream()
                .map(this::toUserResponse)
                .collect(Collectors.toList());
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public User updateUser(String id, String name, String profileUrl, String bio, String website, SocialLinks socialLinks) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (name != null)
                user.setName(name.trim());
            if (profileUrl != null)
                user.setProfileUrl(profileUrl.trim());
            if (bio != null)
                user.setBio(bio.trim());
            if (website != null)
                user.setWebsite(normalizeOptionalField(website));
            if (socialLinks != null)
                user.setSocialLinks(normalizeSocialLinks(socialLinks));
            return userRepository.save(user);
        }
        return null;
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getName(),
                user.getProfileUrl(),
                user.getPhoneNumber(),
                user.getRole(),
                user.getBio(),
                user.getWebsite(),
                normalizeSocialLinks(user.getSocialLinks())
        );
    }

    private boolean matchesPasswordOrLegacy(String rawPassword, String storedPassword) {
        if (storedPassword == null || rawPassword == null) {
            return false;
        }
        try {
            if (passwordEncoder.matches(rawPassword, storedPassword)) {
                return true;
            }
        } catch (IllegalArgumentException ignored) {
            // Legacy plain text password path below.
        }
        return rawPassword.equals(storedPassword);
    }

    private boolean isLegacyPlainTextPassword(String storedPassword, String rawPassword) {
        if (storedPassword == null || rawPassword == null) {
            return false;
        }
        if (!storedPassword.equals(rawPassword)) {
            return false;
        }
        return !storedPassword.startsWith("$2a$")
                && !storedPassword.startsWith("$2b$")
                && !storedPassword.startsWith("$2y$");
    }

    private SocialLinks normalizeSocialLinks(SocialLinks socialLinks) {
        SocialLinks normalized = socialLinks == null ? new SocialLinks() : socialLinks;
        normalized.setTwitter(normalizeOptionalField(normalized.getTwitter()));
        normalized.setLinkedIn(normalizeOptionalField(normalized.getLinkedIn()));
        normalized.setGitHub(normalizeOptionalField(normalized.getGitHub()));
        return normalized;
    }

    private String normalizeOptionalField(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
