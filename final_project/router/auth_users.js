const express = require('express');
const jwt = require('jsonwebtoken');
const e = require('express');
const regd_users = express.Router();
const axios = require('axios');

let users = [];

const isValid = (username)=>{
    // Filter the users array for any user with the same username
    let userWithSameName = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if(userWithSameName.length > 0){
        return false;
    }
    else{
        return true;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validUsers = users.filter(user=>{
        return(user.username === username && user.password === password);
    });
    if(validUsers.length > 0){
        return true;
    }
    else{
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    //return error if username or password is missing
    if(!username || !password){
        return res.status(400).json({message: "Error logging in"});
    }
    
    //authenticate user
    if(authenticatedUser(username, password)){
        // Generate JWT access token
        let accessToken = jwt.sign({data: username}, 'access', {expiresIn: 60 * 60});
        
        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).json({message: "User successfully logged in"});
    }
    else{
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    try{
        let response = await axios.get('http://localhost:8080/books');
        let books = response.data;
        
        let isbn = req.params.isbn; 
        let review = req.body.review; 
        let username = req.user.data; //get username from jwt payload

        if(books[isbn]){
            books[isbn].reviews[username] = review;
            return res.status(200).json({message: `${username} has added the review: "${review}" to the book ${books[isbn].title}`})
        }
        else{
            return res.status(404).json({message: `Book with isbn: ${isbn} not found.`})
        }
    }
    catch(error){
        res.status(500).send("Error fetching books");
    }
});

//delete a book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
    try{
        let response = await axios.get('http://localhost:8080/books');
        let books = response.data;

        let isbn = req.params.isbn;
        let username = req.user.data;
    
        if(books[isbn]){
            if(books[isbn].reviews[username]){
                delete books[isbn].reviews[username];
                    return res.status(200).json({message: `Successfully deleted your review on ${books[isbn].title}.`})
            }
            else{
                return res.status(400).json({message: `Review for ${books[isbn].title} not found.`})
            }
        }
        else{
            return res.status(400).json({message: `Book with isbn: ${isbn} not found.`})
        }
    }
    catch(error){
        res.status(500).send("Error fetching books");
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
