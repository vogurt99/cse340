const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))

router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

router.get(
    "/",
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.buildAccountManagement)
)

router.get("/logout", (req, res) => {
    res.clearCookie("jwt")
    res.locals.loggedin = 0
    res.redirect("/")
})

router.get(
    "/update/:account_id",
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.buildAccountUpdate)
);

router.post(
    "/update",
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.updateAccount)
);

router.post(
    "/updatePassword",
    utilities.checkJWTToken,
    utilities.handleErrors(accountController.updatePassword)
);

module.exports = router