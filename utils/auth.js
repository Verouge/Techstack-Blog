// Middleware to restrict routes to logged-in users
const loggedIn = (req, res, next) => {
  if (!req.session.loggedIn) {
    res.redirect("/login"); // redirect to login page if not logged in
  } else {
    next(); // continue to the next middleware/route handler
  }
};

module.exports = loggedIn;
