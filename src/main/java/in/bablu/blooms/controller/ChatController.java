package in.bablu.blooms.controller;

import in.bablu.blooms.dto.ApiMessageResponse;
import in.bablu.blooms.dto.ChatMessageRequest;
import in.bablu.blooms.dto.ChatReplyResponse;
import in.bablu.blooms.services.RagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    @Autowired
    private RagService ragService;

    @PostMapping
    public ResponseEntity<?> chat(@Valid @RequestBody ChatMessageRequest request) {
        try {
            String reply = ragService.generateReply(request.getMessage());
            return new ResponseEntity<>(new ChatReplyResponse(reply), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.BAD_REQUEST);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(new ApiMessageResponse(e.getMessage()), HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
