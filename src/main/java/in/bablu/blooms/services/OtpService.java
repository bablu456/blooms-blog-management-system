package in.bablu.blooms.services;

import in.bablu.blooms.dto.OtpDispatchResponse;
import in.bablu.blooms.models.OtpCode;
import in.bablu.blooms.models.OtpPurpose;
import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.OtpCodeRepository;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Date;
import java.util.Optional;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private OtpCodeRepository otpCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private OtpNotificationService otpNotificationService;

    @Value("${app.auth.otp.expiry-seconds:300}")
    private long otpExpirySeconds;

    @Value("${app.auth.otp.resend-cooldown-seconds:45}")
    private long resendCooldownSeconds;

    @Value("${app.auth.otp.max-attempts:5}")
    private int maxAttempts;

    @Value("${app.auth.otp.debug-return-in-response:false}")
    private boolean debugReturnOtpInResponse;

    public OtpDispatchResponse sendOtp(String phoneNumber, OtpPurpose purpose) {
        String normalizedPhone = normalizePhone(phoneNumber);

        User user = userRepository.findByPhoneNumber(normalizedPhone)
                .orElseThrow(() -> new IllegalArgumentException("No account found for this phone number"));

        Date now = new Date();
        Optional<OtpCode> existingOtpOptional =
                otpCodeRepository.findTopByPhoneNumberAndPurposeAndUsedFalseOrderByCreatedAtDesc(normalizedPhone, purpose);

        if (existingOtpOptional.isPresent()) {
            OtpCode existingOtp = existingOtpOptional.get();
            if (existingOtp.getExpiresAt() != null && existingOtp.getExpiresAt().after(now)) {
                long secondsSinceIssued = (now.getTime() - existingOtp.getCreatedAt().getTime()) / 1000L;
                if (secondsSinceIssued < resendCooldownSeconds) {
                    long waitSeconds = resendCooldownSeconds - secondsSinceIssued;
                    throw new IllegalStateException("Please wait " + waitSeconds + " seconds before requesting a new OTP");
                }
            }
            existingOtp.setUsed(true);
            otpCodeRepository.save(existingOtp);
        }

        String otp = generateSixDigitOtp();
        Date expiresAt = new Date(now.getTime() + otpExpirySeconds * 1000L);

        OtpCode otpCode = new OtpCode();
        otpCode.setPhoneNumber(normalizedPhone);
        otpCode.setUserId(user.getId());
        otpCode.setPurpose(purpose);
        otpCode.setOtpHash(passwordEncoder.encode(otp));
        otpCode.setUsed(false);
        otpCode.setAttemptCount(0);
        otpCode.setMaxAttempts(maxAttempts);
        otpCode.setCreatedAt(now);
        otpCode.setExpiresAt(expiresAt);
        otpCodeRepository.save(otpCode);

        otpNotificationService.sendOtp(user, otp, purpose, otpExpirySeconds);

        return new OtpDispatchResponse(
                "OTP sent successfully",
                otpExpirySeconds,
                debugReturnOtpInResponse ? otp : null
        );
    }

    public User verifyOtp(String phoneNumber, String otp, OtpPurpose purpose) {
        String normalizedPhone = normalizePhone(phoneNumber);
        String normalizedOtp = otp == null ? "" : otp.trim();
        if (normalizedOtp.isEmpty()) {
            throw new IllegalArgumentException("OTP is required");
        }

        OtpCode otpCode = otpCodeRepository
                .findTopByPhoneNumberAndPurposeAndUsedFalseOrderByCreatedAtDesc(normalizedPhone, purpose)
                .orElseThrow(() -> new IllegalArgumentException("No active OTP found. Please request a new OTP."));

        Date now = new Date();
        if (otpCode.getExpiresAt() == null || !otpCode.getExpiresAt().after(now)) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("OTP has expired. Please request a new OTP.");
        }

        if (otpCode.getAttemptCount() >= otpCode.getMaxAttempts()) {
            otpCode.setUsed(true);
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("Maximum OTP attempts reached. Please request a new OTP.");
        }

        if (!passwordEncoder.matches(normalizedOtp, otpCode.getOtpHash())) {
            otpCode.setAttemptCount(otpCode.getAttemptCount() + 1);
            if (otpCode.getAttemptCount() >= otpCode.getMaxAttempts()) {
                otpCode.setUsed(true);
            }
            otpCodeRepository.save(otpCode);
            throw new IllegalArgumentException("Invalid OTP");
        }

        otpCode.setUsed(true);
        otpCodeRepository.save(otpCode);

        return userRepository.findById(otpCode.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found for this OTP"));
    }

    private String generateSixDigitOtp() {
        int value = 100000 + RANDOM.nextInt(900000);
        return String.valueOf(value);
    }

    private String normalizePhone(String phoneNumber) {
        if (phoneNumber == null) {
            throw new IllegalArgumentException("Phone number is required");
        }
        String normalized = phoneNumber.trim();
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }
        return normalized;
    }
}
