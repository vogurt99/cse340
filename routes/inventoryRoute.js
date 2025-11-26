const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities/")

/* ****************************************
 * Route to build inventory by classification view
 **************************************** */
router.get(
    "/type/:classificationId",
    utilities.handleErrors(invController.buildByClassificationId)
)

/* ****************************************
 * Route to build a single vehicle detail view
 **************************************** */
router.get(
    "/detail/:invId",
    utilities.handleErrors(invController.buildByInvId)
)

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
router.get(
    "/",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.buildManagement)
)

router.get(
    "/getInventory/:classification_id",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.getInventoryJSON)
)

/* ****************************************
 * Add Classification Routes
 **************************************** */
router.get(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.buildAddClassification)
)

router.post(
    "/add-classification",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    invValidate.classificationRules(),
    invValidate.checkClassificationData,
    utilities.handleErrors(invController.addClassification)
)

/* ****************************************
 * Add Inventory Routes
 **************************************** */
router.get(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.buildAddInventory)
)

router.post(
    "/add-inventory",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    invValidate.inventoryRules(),
    invValidate.checkInventoryData,
    utilities.handleErrors(invController.addInventory)
)

/* ****************************************
 * Build edit inventory view
 **************************************** */
router.get(
    "/edit/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.buildEditInventory)
)

/* ****************************************
 * Process inventory update
 **************************************** */
router.post(
    "/update",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    invValidate.inventoryRules(),
    invValidate.checkUpdateData,
    utilities.handleErrors(invController.updateInventory)
)

/* ****************************************
 * Build delete confirmation view
 **************************************** */
router.get(
    "/delete/:inv_id",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.buildDeleteConfirm)
)

/* ****************************************
 * Process inventory delete
 **************************************** */
router.post(
    "/delete",
    utilities.checkJWTToken,
    utilities.checkAdminAccess,
    utilities.handleErrors(invController.deleteInventory)
)

module.exports = router