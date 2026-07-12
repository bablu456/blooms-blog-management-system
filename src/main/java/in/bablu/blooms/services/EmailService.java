package in.bablu.blooms.services;

import in.bablu.blooms.models.OtpPurpose;
import in.bablu.blooms.models.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.auth.otp.sender:no-reply@blooms.local}")
    private String senderEmail;

    public void sendHtmlEmail(String toEmail, String subject, String htmlBody) {
        if (mailSender == null) {
            throw new IllegalStateException("JavaMailSender is not configured. Set the SMTP properties before sending email OTPs.");
        }
        if (toEmail == null || toEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Recipient email is required");
        }

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, false, "UTF-8");
            helper.setFrom(senderEmail);
            helper.setTo(toEmail.trim());
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(mimeMessage);
        } catch (MessagingException | MailException e) {
            throw new IllegalStateException("Failed to send email OTP: " + e.getMessage(), e);
        }
    }

    public void sendOtpEmail(User user, String otp, OtpPurpose purpose, long expirySeconds) {
        if (user == null) {
            throw new IllegalArgumentException("User is required for OTP email delivery");
        }

        String recipientName = user.getName() != null && !user.getName().trim().isEmpty()
                ? user.getName().trim()
                : user.getUsername() != null && !user.getUsername().trim().isEmpty()
                ? user.getUsername().trim()
                : "there";

        String subject = purpose == OtpPurpose.PASSWORD_RESET
                ? "Reset your Blooms password"
                : "Your Blooms verification code";

        long expiryMinutes = Math.max(1L, (long) Math.ceil(expirySeconds / 60.0));

        String html = "<div style=\"font-family:Arial,sans-serif;background:#f8fafc;padding:32px;color:#0f172a;\">"
                + "<div style=\"max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;"
                + "border-radius:24px;overflow:hidden;box-shadow:0 24px 60px rgba(15,23,42,0.08);\">"
                + "<div style=\"padding:28px 32px;background:linear-gradient(135deg,#0ea5e9,#14b8a6);color:#ffffff;\">"
                + "<div style=\"font-size:12px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;opacity:0.9;\">Blooms</div>"
                + "<h1 style=\"margin:12px 0 0;font-size:28px;line-height:1.2;\">One-time verification code</h1>"
                + "</div>"
                + "<div style=\"padding:32px;\">"
                + "<p style=\"margin:0 0 12px;font-size:16px;line-height:1.7;\">Hi " + escapeHtml(recipientName) + ",</p>"
                + "<p style=\"margin:0 0 24px;font-size:15px;line-height:1.7;color:#475569;\">Use the code below to "
                + (purpose == OtpPurpose.PASSWORD_RESET ? "reset your password" : "continue signing in")
                + " to your Blooms account.</p>"
                + "<div style=\"margin:0 auto 24px;max-width:260px;border-radius:20px;background:#eff6ff;border:1px solid #bfdbfe;"
                + "padding:18px 24px;text-align:center;\">"
                + "<div style=\"font-size:13px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;color:#0369a1;\">Your OTP</div>"
                + "<div style=\"margin-top:10px;font-size:34px;letter-spacing:0.3em;font-weight:800;color:#0f172a;\">" + escapeHtml(otp) + "</div>"
                + "</div>"
                + "<p style=\"margin:0 0 12px;font-size:14px;line-height:1.7;color:#475569;\">This code expires in "
                + expiryMinutes + " minute" + (expiryMinutes == 1 ? "" : "s") + ".</p>"
                + "<p style=\"margin:0;font-size:14px;line-height:1.7;color:#64748b;\">If you did not request this code, you can safely ignore this email.</p>"
                + "</div>"
                + "</div>"
                + "</div>";

        sendHtmlEmail(user.getEmail(), subject, html);
    }

    private String escapeHtml(String value) {
        if (value == null) {
            return "";
        }
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}
