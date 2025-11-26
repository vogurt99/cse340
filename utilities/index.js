const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list += `<a href="/inv/type/${row.classification_id}" title="See our inventory of ${row.classification_name} vehicles">${row.classification_name}</a>`
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* **************************************
* Build the classification view HTML
************************************** */
Util.buildClassificationGrid = async function (data) {
    if (!data || data.length === 0) return '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    let grid = '<ul id="inv-display">'
    data.forEach(vehicle => {
        grid += '<li>'
        grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                    <img src="${vehicle.inv_thumbnail}" 
                         alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}" />
                 </a>`
        grid += '<div class="namePrice">'
        grid += `<h2><a href="/inv/detail/${vehicle.inv_id}">${vehicle.inv_make} ${vehicle.inv_model}</a></h2>`
        grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`
        grid += '</div>'
        grid += '</li>'
    })
    grid += '</ul>'
    return grid
}

/* ****************************************
* Build the detail view HTML for a single vehicle
**************************************** */
Util.buildDetailView = function (vehicle) {
    const price = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(vehicle.inv_price)
    const miles = new Intl.NumberFormat('en-US').format(vehicle.inv_miles)

    return `
    <section class="vehicle-detail">
        <img class="vehicle-image" src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}">
        <div class="vehicle-info">
            <h2 class="vehicle-title">${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
            <p class="vehicle-price"><strong>Price:</strong> ${price}</p>
            <p class="vehicle-miles"><strong>Mileage:</strong> ${miles} miles</p>
            <p class="vehicle-color"><strong>Color:</strong> ${vehicle.inv_color}</p>
            <p class="vehicle-description"><strong>Description:</strong> ${vehicle.inv_description}</p>
        </div>
    </section>
    `
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
    if (req.cookies.jwt) {
        jwt.verify(
            req.cookies.jwt,
            process.env.ACCESS_TOKEN_SECRET,
            function (err, accountData) {
                if (err) {
                    res.clearCookie("jwt")
                    res.locals.loggedin = 0
                    return res.redirect("/account/login")
                }
                res.locals.accountData = accountData
                res.locals.loggedin = 1
                next()
            })
    } else {
        res.locals.loggedin = 0
        next()
    }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
    if (res.locals.loggedin) {
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

/* ****************************************
* Build the classification view
**************************************** */
Util.buildClassificationList = async function (selectedId = null, isEdit = false) {
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

Util.checkAdminAccess = (req, res, next) => {
    if (!res.locals.loggedin) {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }

    const accountType = res.locals.accountData.account_type
    if (accountType === "Employee" || accountType === "Admin") {
        return next()
    }

    req.flash("notice", "Access denied.")
    return res.redirect("/account/login")
}

module.exports = Util