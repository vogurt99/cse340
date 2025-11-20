const { body, validationResult } = require("express-validator")
const utilities = require(".")

const validate = {}

/* **********************************
 * Classification Data Validation Rules
 * ********************************* */
validate.classificationRules = () => {
    return [
        body("classification_name")
            .trim()
            .notEmpty()
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage(
                "Classification name is required and cannot contain spaces or special characters."
            ),
    ]
}

/* ******************************
 * Check classification data and return errors
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            message: null,
            errors,
        })
        return
    }

    next()
}

/* **********************************
 * Inventory Data Validation Rules
 * ********************************* */
validate.inventoryRules = () => {
    return [
        body("inv_make")
            .trim()
            .notEmpty()
            .withMessage("Vehicle make is required."),
        body("inv_model")
            .trim()
            .notEmpty()
            .withMessage("Vehicle model is required."),
        body("inv_description")
            .trim()
            .notEmpty()
            .withMessage("Vehicle description is required."),
        body("inv_image")
            .trim()
            .notEmpty()
            .withMessage("Vehicle image path is required."),
        body("inv_thumbnail")
            .trim()
            .notEmpty()
            .withMessage("Vehicle thumbnail path is required."),
        body("inv_price")
            .trim()
            .notEmpty()
            .isDecimal()
            .withMessage("Vehicle price is required and must be a decimal."),
        body("inv_year")
            .trim()
            .notEmpty()
            .isInt({ min: 1886 })
            .withMessage("Vehicle year is required and must be a valid year."),
        body("inv_miles")
            .trim()
            .notEmpty()
            .isInt({ min: 0 })
            .withMessage("Vehicle mileage is required and must be a number."),
        body("inv_color")
            .trim()
            .notEmpty()
            .withMessage("Vehicle color is required."),
        body("classification_id")
            .trim()
            .notEmpty()
            .isInt()
            .withMessage("Classification is required."),
    ]
}

/* ******************************
 * Check inventory data and return errors
 * ***************************** */
validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req)
    const {
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id,
    } = req.body

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        const classificationList = await utilities.buildClassificationList(classification_id)
        res.render("inventory/add-inventory", {
            title: "Add Inventory Item",
            nav,
            classificationList,
            message: null,
            errors,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id,
        })
        return
    }

    next()
}

module.exports = validate