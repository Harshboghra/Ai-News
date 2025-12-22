const express = require("express");
const router = express.Router();
const {
    searchNews,
    getLatestNews
} = require("../controllers/news.controller");

router.get("/search", searchNews);
router.get("/latest", getLatestNews);

module.exports = router;
