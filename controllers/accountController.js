const jwt = require("jsonwebtoken")
require("dotenv").config()

const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const favoriteModel = require("../models/favorite-model")

/* ****************************************
 *  Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        account_email: "",
        errors: null,
    })
}

/* ****************************************
 *  Deliver registration view
 * *************************************** */
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/register", {
        title: "Register",
        nav,
        errors: null,
        account_firstname: "",
        account_lastname: "",
        account_email: "",
    })
}

/* ****************************************
 *  Process registration
 * *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body

    // Hash the password before storing
    let hashedPassword
    try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch (error) {
        req.flash("notice", "Sorry, there was an error processing the registration.")
        res.status(500).render("account/register", {
            title: "Register",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
        })
        return
    }

    const regResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword // use hashed password
    )

    if (regResult) {
        req.flash(
            "notice",
            `Congratulations, you're registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            account_email: "",
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, the registration failed.")
        res.status(501).render("account/register", {
            title: "Register",
            nav,
            errors: null,
            account_firstname,
            account_lastname,
            account_email,
        })
    }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email,
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
            if (process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
            } else {
                res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
            }
            return res.redirect("/account/")
        }
        else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email,
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

/* ****************************************
 *  Deliver Account Management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
    try {
        let nav = await utilities.getNav()
        const accountData = res.locals.accountData

        res.render("account/account", {
            title: "Account Management",
            nav,
            errors: null,
            accountData,
        })
    } catch (error) {
        next(error)
    }
}

async function accountLogout(req, res) {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    return res.redirect("/")
}

/* ****************************************
 *  Display Update Form
 * *************************************** */
async function buildAccountUpdate(req, res) {
    let nav = await utilities.getNav()
    const account_id = req.params.account_id
    const account = await accountModel.getAccountById(account_id)

    res.render("account/update", {
        title: "Update Account",
        nav,
        account,
        errors: null
    })
}

/* ****************************************
 *  Update Account Information
 * *************************************** */
async function updateAccount(req, res) {
    const { account_id, account_firstname, account_lastname, account_email } = req.body
    const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email)

    if (result) {
        req.flash("notice", "Account information updated successfully.")
        return res.redirect("/account/")
    } else {
        req.flash("notice", "Update failed.")
        return res.redirect(`/account/update/${account_id}`)
    }
}

/* ****************************************
 *  Update Password
 * *************************************** */
async function updatePassword(req, res) {
    const { account_id, account_password } = req.body
    const result = await accountModel.updatePassword(account_id, account_password)

    if (result) {
        req.flash("notice", "Password updated successfully.")
        return res.redirect("/account/")
    } else {
        req.flash("notice", "Password update failed.")
        return res.redirect(`/account/update/${account_id}`)
    }
}

/* ****************************************
 *  Display Favorite
 * *************************************** */
async function buildFavorite(req, res, next) {
    try {
        const accountData = res.locals.accountData
        const nav = await utilities.getNav()
        const favorite = await favoriteModel.getFavoriteByAccountId(accountData.account_id)
        res.render("account/favorite", {
            title: "My Favorites",
            nav,
            favorite,
        })
    } catch (error) {
        next(error)
    }
}

/* ****************************************
 *  Add Favorite
 * *************************************** */
async function addFavorite(req, res) {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    await favoriteModel.addFavorite(account_id, inv_id)
    res.redirect("/account/favorite")
}

/* ****************************************
 *  Remove Favorite
 * *************************************** */
async function removeFavorite(req, res) {
    const account_id = res.locals.accountData.account_id
    const { inv_id } = req.body

    await favoriteModel.removeFavorite(account_id, inv_id)
    res.redirect("/account/favorite")
}

module.exports = {
    buildLogin,
    buildRegister,
    registerAccount,
    accountLogin,
    buildAccountManagement,
    buildAccountUpdate,
    updateAccount,
    updatePassword,
    buildFavorite,
    addFavorite,
    removeFavorite
}