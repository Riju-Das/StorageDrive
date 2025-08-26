const express = require("express")
const session = require("express-session")
const passport = require('./config/passport')
const { PrismaClient } = require('@prisma/client')
const { PrismaSessionStore} = require('@quixo3/prisma-session-store')
const route = require("./routes/route")
const path = require("path")


const app = express()
const prisma = new PrismaClient()

app.use(express.urlencoded({extended:true}))
app.set("views" , path.join(__dirname, "views"))
app.set("view engine" , "ejs")

const assetpath = path.join(__dirname, "public")
app.use(express.static(assetpath))



app.use(session({
  secret:"cats",
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: 1000 * 60 * 60 * 24
  },
  store: new PrismaSessionStore (prisma, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
  }) 
}))

app.use(passport.session())
app.use("/", route)

app.listen(3000, ()=>{
  console.log("Listening to port number 3000")
})