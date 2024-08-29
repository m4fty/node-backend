const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();

const booksFilePath = path.join(__dirname, "../../data/books.json");
async function loadBooks() {
  try {
    const data = await fs.readFile(booksFilePath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
    return [];
  }
}

router.get("/", async (req, res) => {
  const { isbn, author, title } = req.query;

  try {
    const books = await loadBooks();
    let filteredBooks = books;
    if (isbn) {
      filteredBooks = filteredBooks.filter((book) => book.isbn.includes(isbn));
    }
    if (author) {
      filteredBooks = filteredBooks.filter((book) =>
        book.author.toLowerCase().includes(author.toLowerCase())
      );
    }
    if (title) {
      filteredBooks = filteredBooks.filter((book) =>
        book.title.toLowerCase().includes(title.toLowerCase())
      );
    }

    res.render("index", {
      loggedIn: req.session.loggedIn || false,
      username: req.session.username || null,
      books: filteredBooks,
      isbnQuery: isbn || "",
      authorQuery: author || "",
      titleQuery: title || "",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error in the server when loading books.");
  }
});

router.post("/api/reviews/:isbn", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to add a review.");
  }
  const { isbn } = req.params;
  const { review } = req.body;

  try {
    const books = await loadBooks();
    const book = books.find((b) => b.isbn === isbn);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
      book.reviews = [];
    }

    book.reviews.push({ user: req.session.username, text: review });

    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), "utf8");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error in the server when handling the review." });
  }
});

router.post("/api/reviews/:isbn/edit", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to modify a review.");
  }

  const { isbn } = req.params;
  const { reviewIndex, newText } = req.body;

  try {
    const books = await loadBooks();
    const book = books.find((b) => b.isbn === isbn);

    if (!book || !book.reviews || !book.reviews[reviewIndex]) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = book.reviews[reviewIndex];

    if (review.user !== req.session.username) {
      return res
        .status(403)
        .send("You cannot modify a review that is not yours.");
    }

    review.text = newText;

    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), "utf8");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error in the server when modifying the review." });
  }
});

router.post("/api/reviews/:isbn/delete", async (req, res) => {
  if (!req.session.loggedIn) {
    return res.status(403).send("You must be logged in to delete a review.");
  }

  const { isbn } = req.params;
  const { reviewIndex } = req.body;

  try {
    const books = await loadBooks();
    const book = books.find((b) => b.isbn === isbn);

    if (!book || !book.reviews || !book.reviews[reviewIndex]) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = book.reviews[reviewIndex];

    if (review.user !== req.session.username) {
      return res
        .status(403)
        .send("You cannot delete a review that is not yours.");
    }

    book.reviews.splice(reviewIndex, 1);

    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), "utf8");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while deleting review." });
  }
});

module.exports = router;
