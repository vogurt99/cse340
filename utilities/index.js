const invModel = require("../models/inventory-model")
const Util = {}

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

module.exports = Util