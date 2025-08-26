const passport = require("passport")
const LocalStrategy= require("passport-local").Strategy
const bcrypt =require("bcryptjs")
const db = require("../db/queries")

passport.use(
  new LocalStrategy(async(username,password,done)=>{
    try{
      const user = await db.findUsername(username)
      if(!user){
        return done(null,false, {message:"Incorrect username"})
      }
      const isMatch = await bcrypt.compare(password, user.password)
      if(!isMatch){
        return done(null, false , {message:"Incorrect password"})
      }
      return done(null,user)

    }
    catch(err){
      console.log(err)
    }
  })
)

passport.serializeUser((user,done)=>{
  done(null,user.id)
})

passport.deserializeUser(async(id,done)=>{
  try{
    const user= await db.fetchUser(id)
    done(null,user)
  }
  catch(err){
    done(err,null)
  }
})

module.exports= passport