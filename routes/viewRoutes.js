const express = require("express");
const router = express.Router();
const { Post, User, Comment } = require("../models");
const loggedIn = require("../utils/auth");

// Render homepage with all posts
router.get("/", async (req, res) => {
  try {
    const postData = await Post.findAll({
      include: [User],
    });

    const posts = postData.map((post) => post.get({ plain: true }));

    res.render("home", { posts });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Render a single post by its ID
router.get("/post/:id", async (req, res) => {
  try {
    const postData = await Post.findByPk(req.params.id, {
      include: [
        User,
        {
          model: Comment,
          include: [User],
        },
      ],
    });

    if (!postData) {
      res.status(404).json({ message: "No post found with that id!" });
      return;
    }

    const post = postData.get({ plain: true });

    res.render("post", { post });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Render the dashboard with user's posts
router.get("/dashboard", loggedIn, async (req, res) => {
  try {
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
    console.log(err);
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
