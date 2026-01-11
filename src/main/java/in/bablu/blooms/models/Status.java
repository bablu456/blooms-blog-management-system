package in.bablu.blooms.models;

// Enum ka matlab: "Fixed Options"
// Hum pehle hi fix kar dete hain ki Status bas ye 3 hi ho sakte hain.
public enum Status {

    // 1. Defined Constants (Computer ke liye) -> ("User ke liye display name")
    PUBLISHED("Published"),   // Jab blog live ho jaye
    INREVIEW("In Review"),    // Jab admin check kar raha ho
    REJECTED("Rejected");     // Jab blog reject ho jaye

    // 2. Field to store the display name
    private final String displayName;
    // 3. Constructor
    // Ye tab call hota hai jab hum upar wale constants (PUBLISHED, etc.) use karte hain
    private Status(String displayName) {
        this.displayName = displayName;
    }
    // 4. Getter
    // UI pe dikhane ke liye hum ye method call karenge
    public String getDisplayName() {
        return displayName;
    }
}