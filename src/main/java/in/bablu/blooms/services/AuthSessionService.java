package in.bablu.blooms.services;

import in.bablu.blooms.dto.AuthTokenResponse;
import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.models.RefreshToken;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.RefreshTokenRepository;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class AuthSessionService {

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private RefreshTokenRepository refreshTokenRepository;

    @Autowired
    private UserRepository userRepository;

    public AuthTokenResponse issueTokens(User user) {
        String accessToken = jwtTokenService.generateAccessToken(user);
        long accessExpiry = jwtTokenService.getAccessTokenExpirySeconds();

        RefreshTokenCreationResult refreshTokenResult = createRefreshToken(user.getId());

        return new AuthTokenResponse(
                toUserResponse(user),
                accessToken,
                accessExpiry,
                refreshTokenResult.rawToken,
                refreshTokenResult.expiresInSeconds
        );
    }

    public AuthTokenResponse refreshSession(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Refresh token is required");
        }

        String hashedToken = jwtTokenService.hashToken(rawRefreshToken.trim());
        RefreshToken token = refreshTokenRepository.findByTokenHash(hashedToken)
                .orElseThrow(() -> new IllegalArgumentException("Invalid refresh token"));

        if (token.getRevokedAt() != null) {
            throw new IllegalArgumentException("Refresh token has been revoked");
        }

        Date now = new Date();
        if (token.getExpiresAt() == null || !token.getExpiresAt().after(now)) {
            token.setRevokedAt(now);
            refreshTokenRepository.save(token);
            throw new IllegalArgumentException("Refresh token has expired. Please login again.");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found for this token"));

        token.setRevokedAt(now);
        refreshTokenRepository.save(token);

        return issueTokens(user);
    }

    public void revokeRefreshToken(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.trim().isEmpty()) {
            return;
        }
        String hashedToken = jwtTokenService.hashToken(rawRefreshToken.trim());
        refreshTokenRepository.findByTokenHash(hashedToken).ifPresent(token -> {
            if (token.getRevokedAt() == null) {
                token.setRevokedAt(new Date());
                refreshTokenRepository.save(token);
            }
        });
    }

    public void revokeAllUserSessions(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return;
        }

        List<RefreshToken> activeTokens = refreshTokenRepository.findByUserIdAndRevokedAtIsNull(userId);
        if (activeTokens.isEmpty()) {
            return;
        }

        Date now = new Date();
        for (RefreshToken token : activeTokens) {
            token.setRevokedAt(now);
        }
        refreshTokenRepository.saveAll(activeTokens);
    }

    private RefreshTokenCreationResult createRefreshToken(String userId) {
        Date now = new Date();
        long expiresInSeconds = jwtTokenService.getRefreshTokenExpirySeconds();
        Date expiresAt = new Date(now.getTime() + expiresInSeconds * 1000L);

        String rawToken = jwtTokenService.generateRefreshToken();
        String tokenHash = jwtTokenService.hashToken(rawToken);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setCreatedAt(now);
        refreshToken.setExpiresAt(expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new RefreshTokenCreationResult(rawToken, expiresInSeconds);
    }

    private UserResponse toUserResponse(User user) {
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
                user.getSocialLinks()
        );
    }

    private static class RefreshTokenCreationResult {
        private final String rawToken;
        private final long expiresInSeconds;

        private RefreshTokenCreationResult(String rawToken, long expiresInSeconds) {
            this.rawToken = rawToken;
            this.expiresInSeconds = expiresInSeconds;
        }
    }
}
