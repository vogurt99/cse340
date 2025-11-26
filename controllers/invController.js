const { validationResult } = require("express-validator")
const utilities = require("../utilities/")
const invModel = require("../models/inventory-model")

const invController = {}

/* ****************************************
 * Build inventory by classification view
 **************************************** */
invController.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (!data || data.length === 0) {
            const nav = await utilities.getNav()
            return res.render("inventory/classification", {
                title: "No Vehicles Found",
                nav,
                grid: "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
            })
        }
        const grid = buildClassificationGrid(data)
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
        const grid = buildDetailView(data)
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

/* ****************************************
 * Build inventory management view
 **************************************** */
invController.buildManagement = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classificationList = await buildClassificationList()
        const message = req.flash()
        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            classificationList,
            message
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Return inventory items as JSON
 **************************************** */
invController.getInventoryJSON = async function (req, res, next) {
    const classification_id = parseInt(req.params.classification_id)
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (data.length && data[0].inv_id) {
            res.json(data)
        } else {
            next(new Error("No data returned"))
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Build add-classification view
 **************************************** */
invController.buildAddClassification = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const message = req.flash()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            message,
            errors: null
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Process add-classification
 **************************************** */
invController.addClassification = async function (req, res, next) {
    const { classification_name } = req.body
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        res.render("inventory/add-classification", {
            title: "Add Classification",
            nav,
            message: null,
            errors
        })
        return
    }

    try {
        const regResult = await invModel.addClassification(classification_name)
        const nav = await utilities.getNav()
        if (regResult) {
            req.flash("notice", `Classification ${classification_name} added successfully.`)
            res.render("inventory/management", {
                title: "Inventory Management",
                nav,
                message: req.flash()
            })
        } else {
            req.flash("notice", "Sorry, adding classification failed.")
            res.render("inventory/add-classification", {
                title: "Add Classification",
                nav,
                message: req.flash(),
                errors: null
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Build add-inventory view
 **************************************** */
invController.buildAddInventory = async function (req, res, next) {
    try {
        const nav = await utilities.getNav()
        const classificationList = await buildClassificationList()
        const message = req.flash() || {}

        res.render("inventory/add-inventory", {
            title: "Add Inventory Item",
            nav,
            classificationList,
            message,
            errors: null,
            inv_make: "",
            inv_model: "",
            inv_description: "",
            inv_image: "",
            inv_thumbnail: "",
            inv_price: "",
            inv_year: "",
            inv_miles: "",
            inv_color: "",
            classification_id: ""
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Process add-inventory
 **************************************** */
invController.addInventory = async function (req, res, next) {
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
        classification_id
    } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        const classificationList = await buildClassificationList(classification_id)
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
            classification_id
        })
        return
    }

    try {
        const regResult = await invModel.addInventory(
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        )

        if (regResult) {
            req.flash("notice", `Inventory item ${inv_make} ${inv_model} added successfully.`)
            res.redirect("/inv") // <-- redirect straight to inventory management
        } else {
            const nav = await utilities.getNav()
            const classificationList = await buildClassificationList(classification_id)
            req.flash("notice", "Sorry, adding inventory item failed.")
            res.render("inventory/add-inventory", {
                title: "Add Inventory Item",
                nav,
                classificationList,
                message: req.flash(),
                errors: null,
                inv_make,
                inv_model,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_year,
                inv_miles,
                inv_color,
                classification_id
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Build edit inventory view
 **************************************** */
invController.buildEditInventory = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    try {
        const nav = await utilities.getNav()
        const itemData = await invModel.getInventoryByInvId(inv_id)
        if (!itemData) {
            req.flash("notice", "Inventory item not found")
            return res.redirect("/inv")
        }

        const classificationSelect = await buildClassificationList(itemData.classification_id, true)
        const itemName = `${itemData.inv_make} ${itemData.inv_model}`

        res.render("inventory/edit-inventory", {
            title: "Edit " + itemName,
            nav,
            classificationSelect,
            errors: null,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_description: itemData.inv_description,
            inv_image: itemData.inv_image,
            inv_thumbnail: itemData.inv_thumbnail,
            inv_price: itemData.inv_price,
            inv_miles: itemData.inv_miles,
            inv_color: itemData.inv_color,
            classification_id: itemData.classification_id,
            message: req.flash()
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Process inventory update
 **************************************** */
invController.updateInventory = async function (req, res, next) {
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_description,
        inv_image,
        inv_thumbnail,
        inv_price,
        inv_year,
        inv_miles,
        inv_color,
        classification_id
    } = req.body

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav()
        const classificationList = await buildClassificationList(classification_id)
        res.render("inventory/edit-inventory", {
            title: `Edit ${inv_make} ${inv_model}`,
            nav,
            classificationSelect: classificationList,
            errors,
            inv_id,
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        })
        return
    }

    try {
        const result = await invModel.updateInventory(
            parseInt(inv_id),
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            classification_id
        )

        const nav = await utilities.getNav()
        if (result) {
            req.flash("notice", `Inventory item ${inv_make} ${inv_model} updated successfully.`)
            res.redirect("/inv")
        } else {
            req.flash("notice", "Sorry, updating inventory item failed.")
            const classificationSelect = await buildClassificationList(classification_id)
            res.render("inventory/edit-inventory", {
                title: `Edit ${inv_make} ${inv_model}`,
                nav,
                classificationSelect,
                errors: null,
                inv_id,
                inv_make,
                inv_model,
                inv_description,
                inv_image,
                inv_thumbnail,
                inv_price,
                inv_year,
                inv_miles,
                inv_color,
                classification_id
            })
        }
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Helper functions
 **************************************** */
async function buildClassificationList(selectedId = null, isEdit = false) {
    const data = await invModel.getClassifications()
    const classifications = Array.isArray(data) ? data : data.rows || []

    let list = `<select name='classification_id' ${isEdit ? "" : 'id="classificationList"'} required>`
    list += "<option value=''>Choose a Classification</option>"
    classifications.forEach((row) => {
        list += `<option value='${row.classification_id}'`
        if (selectedId && row.classification_id == selectedId) list += " selected"
        list += `>${row.classification_name}</option>`
    })
    list += "</select>"
    return list
}

function buildClassificationGrid(data) {
    let grid = "<ul id='inv-display'>"
    data.forEach((inv) => {
        grid += `<li>
            <img src='${inv.inv_image}' alt='${inv.inv_make} ${inv.inv_model}'>
            <h2>${inv.inv_make} ${inv.inv_model}</h2>
            <p>$${inv.inv_price}</p>
            <a href='/inv/detail/${inv.inv_id}'>View Details</a>
        </li>`
    })
    grid += "</ul>"
    return grid
}

function buildDetailView(inv) {
    return `<div class='vehicle-detail'>
        <div class='vehicle-left'>
            <img class='vehicle-image' src='${inv.inv_image}' alt='${inv.inv_make} ${inv.inv_model}'>
            <div class='vehicle-description'>${inv.inv_description}</div>
        </div>
        <div class='vehicle-right'>
            <h2>${inv.inv_make} ${inv.inv_model}</h2>
            <p>Year: ${inv.inv_year}</p>
            <p>Miles: ${inv.inv_miles}</p>
            <p>Price: $${inv.inv_price}</p>
            <p>Color: ${inv.inv_color}</p>
        </div>
    </div>`
}

/* ****************************************
 * Build delete confirmation view
 **************************************** */
invController.buildDeleteConfirm = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    try {
        const nav = await utilities.getNav()
        const itemData = await invModel.getInventoryByInvId(inv_id)
        if (!itemData) {
            req.flash("notice", "Inventory item not found")
            return res.redirect("/inv")
        }

        res.render("inventory/delete-confirmation", {
            title: `Delete ${itemData.inv_make} ${itemData.inv_model}`,
            nav,
            inv_id: itemData.inv_id,
            inv_make: itemData.inv_make,
            inv_model: itemData.inv_model,
            inv_year: itemData.inv_year,
            inv_price: itemData.inv_price,
            message: req.flash(),
            errors: null
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Process inventory delete
 **************************************** */
invController.deleteInventory = async function (req, res, next) {
    const inv_id = parseInt(req.body.inv_id)
    try {
        const result = await invModel.deleteInventoryItem(inv_id)
        const nav = await utilities.getNav()
        if (result) {
            req.flash("notice", "Inventory item deleted successfully.")
            res.redirect("/inv")
        } else {
            req.flash("notice", "Delete failed.")
            res.redirect(`/inv/delete/${inv_id}`)
        }
    } catch (error) {
        next(error)
    }
}

module.exports = invController