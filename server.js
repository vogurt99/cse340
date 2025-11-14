/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const expressLayouts = require("express-ejs-layouts")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")
const inventoryRoutes = require("./routes/inventoryRoute")
const session = require("express-session")
const pool = require('./database/')
const accountRoute = require("./routes/accountRoute")
const bodyParser = require("body-parser")


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res)
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

// Serve static files (CSS, JS, images)
app.use("/images", express.static(__dirname + "/images"))

/* ***********************
 * Routes
 *************************/
app.use(static)                  // static routes (CSS, JS, etc.)
app.use("/inv", inventoryRoutes) // inventory routes
app.use("/account", accountRoute)

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const message = err.status == 404
    ? err.message
    : 'Oh no! There was a crash. Maybe try a different route?'

  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "0.0.0.0"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, host, function () {
  console.log(`App listening on ${host}:${port}`)
})