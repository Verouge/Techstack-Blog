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

router.post("/posts", loggedIn, async (req, res) => {
  try {
    // Add user_id to the post object before creating it
    const postData = {
      ...req.body,
      user_id: req.session.user_id,
    };

    const newPost = await Post.create(postData);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Edit post
router.put("/posts/edit/:id", loggedIn, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (post) {
      await post.update({
        title: req.body.title,
        content: req.body.content,
      });

      // After updating the post, redirect to the dashboard
      res.redirect("/dashboard");
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// Delete post
router.delete("/posts/:id", loggedIn, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id);

    if (!postData) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    // Check if the post's user_id matches the logged-in user's id
    if (postData.user_id !== req.session.user_id) {
      res
        .status(403)
        .json({ message: "You are not authorized to delete this post." });
      return;
    }

    await postData.destroy();

    res.redirect("/dashboard"); // redirect to dashboard after deletion
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

    // Redirect user to the dashboard after successful signup
    res.redirect("/dashboard");
  } catch (err) {
    res.status(500).json(err);
  }
});

// Login
router.post("/login", async (req, res) => {
  console.log("Login route hit");
  try {
    const userData = await User.findOne({
      where: { username: req.body.username },
    });

    if (!userData || !userData.checkPassword(req.body.password)) {
      res.status(401).json({ message: "Incorrect username or password" });
      return;
    }

    req.session.loggedIn = true;
    req.session.user_id = userData.id;

    console.log("Logged In User ID:", req.session.user_id); // Logging the user ID

    // Save the session and then redirect
    req.session.save(() => {
      res.redirect("/dashboard");
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: err.message || "Server error" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  console.log("Logout route accessed");
  console.log("Session data:", req.session);

  if (req.session.loggedIn) {
    req.session.destroy(() => {
      console.log("Session destroyed, redirecting to homepage");
      res.redirect("/");
    });
  } else {
    console.log("Not recognized as logged in.");
    res.status(404).end();
  }
});
module.exports = router;
