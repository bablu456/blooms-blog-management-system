package in.bablu.blooms.services;

import in.bablu.blooms.models.OtpPurpose;
import in.bablu.blooms.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class OtpNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

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
        if (mailSender == null) {
            throw new IllegalStateException("Email delivery requested but JavaMailSender is not configured");
        }

        String subject = purpose == OtpPurpose.LOGIN
                ? "Your Blooms login OTP"
                : "Your Blooms password reset OTP";

        String body = "Hi " + (user.getName() != null ? user.getName() : "there") + ",\n\n"
                + "Your OTP is: " + otp + "\n"
                + "This OTP expires in " + expirySeconds + " seconds.\n\n"
                + "If you did not request this, please ignore this message.";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(user.getEmail());
        message.setSubject(subject);
        message.setText(body);

        mailSender.send(message);
    }
}
