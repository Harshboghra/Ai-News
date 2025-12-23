const express = require("express");
const router = express.Router();
const {
    searchNews,
    getLatestNews,
    suggestNews
} = require("../controllers/news.controller");

router.get("/search", searchNews);
router.get("/latest", getLatestNews);
router.get("/suggest", suggestNews);

module.exports = router;
