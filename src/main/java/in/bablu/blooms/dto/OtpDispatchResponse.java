package in.bablu.blooms.dto;

public class OtpDispatchResponse {
    private String message;
    private long expiresInSeconds;
    private String debugOtp;

    public OtpDispatchResponse() {
    }

    public OtpDispatchResponse(String message, long expiresInSeconds, String debugOtp) {
        this.message = message;
        this.expiresInSeconds = expiresInSeconds;
        this.debugOtp = debugOtp;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public String getDebugOtp() {
        return debugOtp;
    }

    public void setDebugOtp(String debugOtp) {
        this.debugOtp = debugOtp;
    }
}
