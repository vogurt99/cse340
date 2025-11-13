// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")

/* ****************************************
 * Route to build inventory by classification view
 **************************************** */
router.get("/type/:classificationId", invController.buildByClassificationId)

/* ****************************************
 * Route to build a single vehicle detail view
 **************************************** */
router.get("/detail/:invId", invController.buildByInvId)

/* ****************************************
 * Friendly URLs for classifications
 **************************************** */
router.get("/custom", (req, res) => res.redirect("/inv/type/1"))
router.get("/sport", (req, res) => res.redirect("/inv/type/2"))
router.get("/suv", (req, res) => res.redirect("/inv/type/3"))
router.get("/truck", (req, res) => res.redirect("/inv/type/4"))
router.get("/sedan", (req, res) => res.redirect("/inv/type/5"))

module.exports = router