package in.bablu.blooms.controller;

import in.bablu.blooms.Database;
import in.bablu.blooms.dto.UserRequest;
import in.bablu.blooms.dto.UserResponse;
import in.bablu.blooms.models.User;
import org.springframework.web.bind.annotation.*;

import javax.xml.crypto.Data;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @PostMapping
    public String registerUser(UserRequest request){
        List<User> userList = Database.getInstance().getUserList();

        for(User user : userList){
            if(user.getUsername().equals(request.getUsername())){
                return "❌ Error: Username '" + request.getUsername() + "' already exists!";
            }
            if(user.getEmail().equals(request.getEmail())){
                return "❌ Error: Email '" + request.getEmail() + "' is already registered!";
            }
        }
        User newUser = new User();
        newUser.setId(String.valueOf(System.currentTimeMillis()));
        newUser.setUsername(request.getUsername());
        newUser.setEmail(request.getEmail());
        newUser.setName(request.getName());
        newUser.setProfileUrl(request.getProfileUrl());

        newUser.setPassword(request.getPassword());

        userList.add(newUser);
        return "✅ Success: User registered with ID: " + newUser.getId();
    }

    @GetMapping("/login")
    public UserResponse loginUser(String username, String password){
        List<User> userList = Database.getInstance().getUserList();

        for(User user : userList){
            if(user.getUsername().equals(username) && user.getPassword().equals(password)){
                System.out.println("✅ Success: User '" + username + "' logged in.");
                return new UserResponse(user.getId(),user.getUsername(),user.getEmail(),user.getName(),user.getProfileUrl());
            }
        }
        System.out.println("❌ Login Failed: Invalid Credentials");
        return null;
    }

    // --- 3. GET USER (Profile View) ---
    @GetMapping("/userid")
    public UserResponse getUser(String userId){
        for(User user : Database.getInstance().getUserList()){
            if(user.getId().equals(userId)){
                return new UserResponse(user.getId(),user.getUsername(),user.getEmail(),user.getName(),user.getProfileUrl());
            }
        }
        return null;
    }

    @GetMapping
    public List<UserResponse> viewAll(){
        List<User> userList = Database.getInstance().getUserList();
        List<UserResponse> users = new ArrayList<>();
        for(User user : userList){
            UserResponse userResponse = new UserResponse();
            userResponse.setEmail(user.getEmail());
            userResponse.setName(user.getName());
            userResponse.setUsername(user.getUsername());
            userResponse.setProfileUrl(user.getProfileUrl());
            users.add(userResponse);
        }
        return users;
    }

}
