package in.bablu.blooms.services;

import in.bablu.blooms.models.OtpPurpose;
import in.bablu.blooms.models.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OtpNotificationService {

    @org.springframework.beans.factory.annotation.Autowired
    private EmailService emailService;

    @Value("${app.auth.otp.delivery:LOG}")
    private String deliveryMode;

    @Value("${app.auth.otp.sender:no-reply@blooms.local}")
    private String senderEmail;

    public void sendOtp(User user, String otp, OtpPurpose purpose, long expirySeconds) {
        if ("EMAIL".equalsIgnoreCase(deliveryMode) && user.getEmail() != null && !user.getEmail().isBlank()) {
            sendEmailOtp(user, otp, purpose, expirySeconds);
            return;
        }

        System.out.println("--------------------------------------------------");
        System.out.println("OTP Delivery Mode: LOG");
        System.out.println("Purpose: " + purpose);
        System.out.println("User Phone: " + user.getPhoneNumber());
        System.out.println("User Email: " + user.getEmail());
        System.out.println("OTP: " + otp);
        System.out.println("Expires In (seconds): " + expirySeconds);
        System.out.println("--------------------------------------------------");
    }

    private void sendEmailOtp(User user, String otp, OtpPurpose purpose, long expirySeconds) {
        emailService.sendOtpEmail(user, otp, purpose, expirySeconds);
    }
}
