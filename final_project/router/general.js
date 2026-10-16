const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const BASE_URL = "http://localhost:5000";

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
    const book = books[isbn];

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    return res.status(200).json(book.reviews);

});

// Task 10: get all books with an async callback
function getAllBooks(callback) {
    axios.get(`${BASE_URL}/`)
        .then((response) => callback(null, response.data))
        .catch((error) => callback(error, null));
}

// Task 11: search by ISBN with a Promise
function getBookByISBN(isbn) {
    return axios.get(`${BASE_URL}/isbn/${isbn}`)
        .then((response) => response.data);
}

// Task 12: search by author with async/await
async function getBooksByAuthor(author) {
    const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
    return response.data;
}

// Task 13: search by title with async/await
async function getBooksByTitle(title) {
    const response = await axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`);
    return response.data;
}

function runAsyncBookTasks() {
    getAllBooks((error, allBooks) => {
        if (error) {
            console.error("Task 10 failed:", error.message);
            return;
        }
        console.log("Task 10: retrieved all books");
        console.log(allBooks);
    });

    getBookByISBN(1)
        .then((book) => {
            console.log("Task 11: book with ISBN 1");
            console.log(book);
        })
        .catch((error) => console.error("Task 11 failed:", error.message));

    getBooksByAuthor("Jane Austen")
        .then((authorBooks) => {
            console.log("Task 12: books by Jane Austen");
            console.log(authorBooks);
        })
        .catch((error) => console.error("Task 12 failed:", error.message));

    getBooksByTitle("The Divine Comedy")
        .then((titleBooks) => {
            console.log("Task 13: books titled The Divine Comedy");
            console.log(titleBooks);
        })
        .catch((error) => console.error("Task 13 failed:", error.message));
}

module.exports.general = public_users;
module.exports.runAsyncBookTasks = runAsyncBookTasks;
