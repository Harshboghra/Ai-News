const express = require("express");
const router = express.Router();
const {
    searchNews,
    getLatestNews,
    suggestNews,
    getTrending
} = require("../controllers/news.controller");

router.get("/search", searchNews);
router.get("/latest", getLatestNews);
router.get("/suggest", suggestNews);
router.get("/trending", getTrending);

module.exports = router;
