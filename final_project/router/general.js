const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    let username = req.body.username;
    let password = req.body.password;

    // Check if both username and password are provided
    if(username && password){
        // Check if the username is valid (doesnt exist already)
        if(isValid(username)){
            //add new user to users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: `The user ${username} has been successfully registered! You can now login.`});
        }
        else{
            //return error if username is invalid
            return res.status(400).json({message: "Username already exists"});
        }
    }
    else{
        //return error if username or password is not provided
        return res.status(400).json("Error registering user")
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    // Send JSON response with formatted books data
    res.send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    // Retrieve the isbn parameter from the request URL and send the corresponding book's details
    let isbn = req.params.isbn;
    res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    // Retrieve the author parameter from the request URL and initialize an empty list to store books by the author
    let author = req.params.author;
    let booksByAuthor = [];

    //loop through the books to check if the author matches
    for(book in books){
        if(books[book].author.toLowerCase() === author.toLowerCase()){
            booksByAuthor.push(books[book]);
        }
    }

    //Return books with matching author, otherwise there were no books
    if(booksByAuthor.length > 0){
        res.send(booksByAuthor);
    }
    else{
        res.send(`No books by ${author}`);
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    // Retrieve the title parameter from the request URL and initialize an empty list to store books with same title
    let title = req.params.title;
    let booksByTitle = [];

    //loop through the books to check if the author matches
    for(book in books){
        if(books[book].title.toLowerCase() === title.toLowerCase()){
            booksByTitle.push(books[book]);
        }
    }

    //Return books with matching author, otherwise there were no books
    if(booksByTitle.length > 0){
        res.send(booksByTitle);
    }
    else{
        res.send(`No books with the title ${title}`);
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // Retrieve the isbn parameter from the request URL and find the reviews based off the isbn number
    isbn = req.params.isbn;
    reviews = books[isbn].reviews;

    // Send JSON response with formatted reviews data
    res.send(JSON.stringify(reviews, null, 4))
});

module.exports.general = public_users;
