package in.bablu.blooms.dto;

public class ChatReplyResponse {
    private String reply;

    public ChatReplyResponse() {
    }

    public ChatReplyResponse(String reply) {
        this.reply = reply;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }
}
