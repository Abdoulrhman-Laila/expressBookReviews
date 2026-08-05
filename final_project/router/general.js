const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
  
    // التأكد من إدخال اسم المستخدم وكلمة المرور
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }
  
    // التحقق إذا كان المستخدم موجوداً مسبقاً
    if (isValid(username)) {
      return res.status(409).json({
        message: "User already exists!"
      });
    }
  
    // إضافة المستخدم الجديد
    users.push({
      username: username,
      password: password
    });
  
    return res.status(200).json({
      message: "User successfully registered. Now you can login."
    });
  });

public_users.get('/', function (req, res) {
    return res.send(JSON.stringify(books, null, 4));
});

public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    return res.status(200).json(books[isbn]);
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {

    const author = req.params.author;
    const bookKeys = Object.keys(books);

    const authorBooks = [];

    bookKeys.forEach((key) => {
        if (books[key].author === author) {
            authorBooks.push({
                isbn: key,
                ...books[key]
            });
        }
    });

    return res.status(200).json(authorBooks);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {

    const title = req.params.title;
    const bookKeys = Object.keys(books);

    const titleBooks = [];

    bookKeys.forEach((key) => {
        if (books[key].title === title) {
            titleBooks.push({
                isbn: key,
                ...books[key]
            });
        }
    });

    return res.status(200).json(titleBooks);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;
    return res.status(200).json(books[isbn].reviews);

});

module.exports.general = public_users;
