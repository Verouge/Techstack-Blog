const router = require("express").Router();

// Import all the routes
const apiRoutes = require("./api");
const viewRoutes = require("./viewRoutes");

// Set up the routes' paths
router.use("/api", apiRoutes);
router.use("/", viewRoutes);

// Catch any undefined routes and respond with a 404 error
router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;
