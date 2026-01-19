package in.bablu.blooms.services;


import in.bablu.blooms.models.User;
import in.bablu.blooms.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public String registerUser(User user){
        if(userRepository.findByUsername(user.getUsername()).isPresent()){
            return " Error: UserName "+ user.getUsername() + " Alredy exists! ";
        }
        if(userRepository.findByEmail(user.getEmail()).isPresent()){
            return " Error: Email "+user.getEmail() + " is already Registered ";
        }

        User savedUser = userRepository.save(user);

        return " Success : User Register with ID: " + savedUser.getId();
    }

    public User loginUser (String username, String password){
        User user = userRepository.findByUsername(username).orElse(null);

        if(user!=null && user.getPassword().equals(password)) {
            return user;
        }
        return null;
    }

    public List<User> getAll(){
        return userRepository.findAll();
    }
}
