const express = require("express");
const router = express.Router();
const { Post, User, Comment } = require("../models");
const loggedIn = require("../utils/auth");

// Render homepage with all posts
router.get("/", async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    res.render("home", {
      posts,
      loggedIn: req.session.loggedIn, // Added loggedIn state
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Render a single dashboard post by its ID for detailed view
router.get("/dashboard/post/:id", loggedIn, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      where: {
        user_id: req.session.user_id,
      },
      include: [User],
    });

    if (!postData) {
      res.status(404).json({
        message: "No post found with that id or it doesn't belong to the user!",
      });
      return;
    }

    const post = postData.get({ plain: true });

    res.render("postdetails", { post });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Render the new post page
router.get("/posts/new", loggedIn, (req, res) => {
  res.render("newpost", {
    loggedIn: req.session.loggedIn,
  });
});

// Render the edit page for a specific post
router.get("/posts/edit/:id", loggedIn, async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [User],
    });

    if (!postData) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    const post = postData.get({ plain: true });

    // Check if the post's user_id matches the logged-in user's id
    if (post.user_id !== req.session.user_id) {
      res
        .status(403)
        .json({ message: "You are not authorized to edit this post." });
      return;
    }

    res.render("editpost", {
      post,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Render the dashboard with user's posts
router.get("/dashboard", loggedIn, async (req, res) => {
  try {
    console.log("User ID from session:", req.session.user_id); // Logging the user ID from session

    // If the user_id is undefined, throw an error to catch it in the catch block
    if (!req.session.user_id) {
      throw new Error("Session user_id is undefined!");
    }

    // Retrieve all the posts for the logged-in user
    const userPosts = await Post.findAll({
      where: {
        user_id: req.session.user_id,
      },
      attributes: ["id", "title", "content", "createdAt"],
      include: [
        {
          model: Comment,
          attributes: ["id", "comment_text", "post_id", "user_id", "createdAt"],
          include: {
            model: User,
            attributes: ["username"],
          },
        },
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    // Serialize data before passing to template
    const posts = userPosts.map((post) => post.get({ plain: true }));

    res.render("dashboard", {
      posts,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err); // Logging the error to the console
    res.status(500).json(err);
  }
});

// Login page
router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/dashboard");
    return;
  }
  res.render("login");
});

// Signup page
router.get("/signup", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/dashboard");
    return;
  }
  res.render("signup");
});

module.exports = router;
