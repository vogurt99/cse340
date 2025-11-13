const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id)
        const grid = await utilities.buildClassificationGrid(data)
        const nav = await utilities.getNav()
        const className = data[0].classification_name
        res.render("inventory/classification", {
            title: className + " Vehicles",
            nav,
            grid,
        })
    } catch (error) {
        next(error)
    }
}

/* ***************************
 *  Build single vehicle detail view
 * ************************** */
invCont.buildByInvId = async function (req, res, next) {
    const invId = req.params.invId
    try {
        const data = await invModel.getInventoryByInvId(invId)
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

module.exports = invCont