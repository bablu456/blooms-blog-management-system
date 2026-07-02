package in.bablu.blooms.services;

import in.bablu.blooms.dto.CloudinarySignResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.TreeMap;

@Service
public class CloudinaryService {

    @Value("${app.cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${app.cloudinary.api-key:}")
    private String apiKey;

    @Value("${app.cloudinary.api-secret:}")
    private String apiSecret;

    @Value("${app.cloudinary.folder:blooms}")
    private String defaultFolder;

    public CloudinarySignResponse createUploadSignature() {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            throw new IllegalStateException("Cloudinary is not configured. Set app.cloudinary.cloud-name, api-key, and api-secret.");
        }

        long timestamp = System.currentTimeMillis() / 1000L;
        String folder = defaultFolder == null ? "" : defaultFolder.trim();

        Map<String, String> signableParams = new TreeMap<>();
        signableParams.put("timestamp", String.valueOf(timestamp));
        if (!folder.isEmpty()) {
            signableParams.put("folder", folder);
        }

        String stringToSign = buildStringToSign(signableParams);
        String signature = sha1Hex(stringToSign + apiSecret);

        return new CloudinarySignResponse(cloudName, apiKey, folder, timestamp, signature);
    }

    private String buildStringToSign(Map<String, String> params) {
        StringBuilder builder = new StringBuilder();
        boolean first = true;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (!first) {
                builder.append("&");
            }
            builder.append(entry.getKey()).append("=").append(entry.getValue());
            first = false;
        }
        return builder.toString();
    }

    private String sha1Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-1");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return toHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to generate Cloudinary signature", e);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            builder.append(String.format("%02x", b));
        }
        return builder.toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
