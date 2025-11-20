const invModel = require("../models/inventory-model")
const { validationResult } = require("express-validator")

const invController = {}

/* ****************************************
 * Build inventory by classification view
 **************************************** */
invController.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId
    try {
        const data = await invModel.getInventoryByClassificationId(classification_id)
        if (!data || data.length === 0) {
            const nav = await getNav()
            return res.render("inventory/classification", {
                title: "No Vehicles Found",
                nav,
                grid: "<p class='notice'>Sorry, no matching vehicles could be found.</p>"
            })
        }
        const grid = buildClassificationGrid(data)
        const nav = await getNav()
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
            const nav = await getNav()
            return res.render("inventory/detail", {
                title: "Vehicle Not Found",
                nav,
                grid: "<p class='notice'>Sorry, vehicle not found.</p>"
            })
        }
        const name = `${data.inv_make} ${data.inv_model}`
        const grid = buildDetailView(data)
        const nav = await getNav()
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
        const nav = await getNav()
        const message = req.flash()
        res.render("inventory/management", {
            title: "Inventory Management",
            nav,
            message
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 * Build add-classification view
 **************************************** */
invController.buildAddClassification = async function (req, res, next) {
    try {
        const nav = await getNav()
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
        const nav = await getNav()
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
        const nav = await getNav()
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
        const nav = await getNav()
        let classificationList
        try {
            classificationList = await buildClassificationList() || '<select name="classification_id"></select>'
        } catch {
            classificationList = '<select name="classification_id"></select>'
        }
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
        const nav = await getNav()
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

        const nav = await getNav()
        const classificationList = await buildClassificationList(classification_id)
        if (regResult) {
            req.flash("notice", `Inventory item ${inv_make} ${inv_model} added successfully.`)
            res.render("inventory/management", {
                title: "Inventory Management",
                nav,
                message: req.flash()
            })
        } else {
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
 * Helper functions replacing utilities.js
 **************************************** */
async function getNav() {
    const data = await invModel.getClassifications()
    const classifications = Array.isArray(data) ? data : data.rows || []
    let nav = "<ul>"
    classifications.forEach((row) => {
        nav += `<li><a href='/inv/type/${row.classification_id}'>${row.classification_name}</a></li>`
    })
    nav += "</ul>"
    return nav
}

async function buildClassificationList(selectedId = null) {
    const data = await invModel.getClassifications()
    const classifications = Array.isArray(data) ? data : data.rows || []
    let list = "<select name='classification_id' id='classificationList' required>"
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

module.exports = invController
