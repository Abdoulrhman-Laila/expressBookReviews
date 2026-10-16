const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username &&
        user.password === password
    );
}

regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid Login. Check username and password."
        });
    }

    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: "1h" }
    );

    // تم إضافة username هنا للوصول إليه عند إضافة التقييم
    req.session.authorization = {
        accessToken,
        username
    };

    return res.status(200).json({
        message: "User successfully logged in"
    });
});

// Add or modify a book review (السؤال التاسع)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization['username'];

    if (typeof review !== "string" || !review.trim()) {
        return res.status(400).json({ message: "Review is required" });
    }

    if (books[isbn]) {
        books[isbn].reviews[username] = review.trim();
        return res.status(200).json({
            message: `The review for the book with ISBN ${isbn} has been added/updated.`
        });
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Delete a book review (السؤال العاشر)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization['username'];

    if (books[isbn]) {
        if (books[isbn].reviews[username]) {
            delete books[isbn].reviews[username];
            return res.status(200).json({
                message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`
            });
        } else {
            return res.status(404).json({ message: "No review found for this user to delete" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;