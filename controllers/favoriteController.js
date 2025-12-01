const utilities = require("../utilities")
const favoriteModel = require("../models/favorite-model")

/* Show all favorites for logged-in user */
async function buildFavorite(req, res) {
    const accountData = res.locals.accountData
    let nav = await utilities.getNav()
    const favorite = await favoriteModel.getFavoriteByAccountId(accountData.account_id)

    res.render("account/favorite", {
        title: "My Favorites",
        nav,
        favorite,
    })
}

/* Add a vehicle to favorites */
async function addFavorite(req, res, next) {
    try {
        const inv_id = req.body.inv_id
        const account_id = res.locals.accountData.account_id

        const result = await favoriteModel.addFavorite(account_id, inv_id)

        if (result) {
            req.flash("notice", "Added to favorites!")
        } else {
            req.flash("notice", "Could not add favorites.")
        }

        res.redirect(`/inv/detail/${inv_id}`)
    } catch (error) {
        next(error)
    }
}

/* Remove a vehicle from favorites */
async function removeFavorite(req, res) {
    const accountData = res.locals.accountData
    const inv_id = parseInt(req.body.inv_id)

    const result = await favoritesModel.removeFavorite(accountData.account_id, inv_id)
    if (result) {
        req.flash("notice", "Vehicle removed from favorites.")
    } else {
        req.flash("notice", "Could not remove vehicle from favorites.")
    }

    res.redirect("/account/favorite")
}

module.exports = {
    buildFavorite,
    addFavorite,
    removeFavorite
}