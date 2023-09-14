const express = require("express");
const router = express.Router();
const { Post, User, Comment } = require("../models");
const loggedIn = require("../utils/auth");

// Get all posts
router.get("/posts", async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [{ model: Comment, include: { model: User } }],
    });
    res.json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get a single post by ID
router.get("/posts/:id", async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [{ model: Comment, include: { model: User } }],
    });

    if (!postData) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    res.json(postData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Create a new post
router.post("/posts", async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Update a post by ID
router.put("/posts/:id", async (req, res) => {
  try {
    const updatedPost = await Post.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!updatedPost) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete a post by ID
router.delete("/posts/:id", async (req, res) => {
  try {
    const deletedPost = await Post.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!deletedPost) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Comments API routes
router.post("/comments", loggedIn, async (req, res) => {
  try {
    req.body.user_id = req.session.user_id;
    const newComment = await Comment.create(req.body);
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// User authentication API routes

// Sign Up
router.post("/signup", async (req, res) => {
  try {
    const userData = await User.create(req.body);
    req.session.loggedIn = true;
    req.session.user_id = userData.id;
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });
    if (!userData || !userData.validatePassword(req.body.password)) {
      res.status(401).json({ message: "Incorrect username or password" });
      return;
    }
    req.session.loggedIn = true;
    req.session.user_id = userData.id;
    res.json({ user: userData, message: "You are now logged in!" });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Logout
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;
