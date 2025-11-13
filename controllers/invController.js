const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

/* ****************************************
 * Build inventory by classification view
 **************************************** */
invController.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (!data || data.length === 0) {
            // No vehicles found, still render page
            const nav = await utilities.getNav()
            return res.render("inventory/classification", {
                title: "No Vehicles Found",
                nav,
                grid: "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
            })
        }
        const grid = await utilities.buildClassificationGrid(data)
        const nav = await utilities.getNav()
        const className = data[0].classification_name
        res.render("inventory/classification", {
            title: className + " vehicles",
            nav,
            grid
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Build single vehicle detail view
 **************************************** */
invController.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId
    try {
        const data = await invModel.getInventoryByInvId(invId)
        if (!data) {
            const nav = await utilities.getNav()
            return res.render("inventory/detail", {
                title: "Vehicle Not Found",
                nav,
                grid: "<p class='notice'>Sorry, vehicle not found.</p>"
            })
        }
        const name = `${data.inv_make} ${data.inv_model}`
        const grid = await utilities.buildDetailView(data)
        const nav = await utilities.getNav()
        res.render("inventory/detail", {
            title: name,
            nav,
            grid
        })
    } catch (error) {
        next(error)
    }
}

module.exports = invController