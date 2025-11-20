// Needed Resources
const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")

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
router.get("/sedan", (req, res) => res.redirect("/inv/type/5"))
router.get("/sport", (req, res) => res.redirect("/inv/type/2"))
router.get("/suv", (req, res) => res.redirect("/inv/type/3"))
router.get("/truck", (req, res) => res.redirect("/inv/type/4"))

/* ****************************************
 * Inventory Management View
 **************************************** */
router.get("/", invController.buildManagement)

/* ****************************************
 * Add Classification Routes
 **************************************** */
// Display form
router.get(
    "/add-classification",
    utilities.handleErrors(invController.buildAddClassification)
)
// Process form
router.post(
    "/add-classification",
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

/* ****************************************
 * Add Inventory Routes
 **************************************** */
// Display form
router.get(
    "/add-inventory",
    utilities.handleErrors(invController.buildAddInventory)
)
// Process form
router.post(
    "/add-inventory",
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

module.exports = router