const express = require("express")
const router = express.Router()
const path = require("path")

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static(path.join(__dirname, "../public")))
router.use("/css", express.static(path.join(__dirname, "../public/css")))
router.use("/js", express.static(path.join(__dirname, "../public/js")))
router.use("/images", express.static(path.join(__dirname, "../public/images")))

// 500 Error Test Route
router.get("/error-test", (req, res, next) => {
    const err = new Error("Intentional 500 error")
    err.status = 500
    next(err) // pass the error to server.js error handler
})

module.exports = router