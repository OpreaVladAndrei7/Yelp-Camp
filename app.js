if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}



const express=require("express");
const path=require("path");
const mongoose = require('mongoose');
const ejsMate =  require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError=require("./utils/ExpressError");
const methodOverride=require("method-override");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User=require("./models/user");
const helmet= require("helmet");

const MongoDBStore = require("connect-mongo")(session);

const mongoSanitize = require("express-mongo-sanitize");

const app= express();

const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");

const dbUrl = "mongodb://localhost:27017/yelp-camp";
main().catch(err => console.log(err));

async function main() {
  //await mongoose.connect(process.env.DB_URL);
  await mongoose.connect(dbUrl);
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

app.engine("ejs", ejsMate);
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"/public")));
app.use(mongoSanitize());




const store= new MongoDBStore({
        url: dbUrl,
        secret:"thisshouldbeabettersecret!",
        touchAfter: 24 * 60 * 60,
    });

store.on("error", function(e){
        console.log("SESSION STORE ERROR!",e);
    })
const sessionConfig = {
    store,
    name: "session",
    secret:"thisshouldbeabettersecret!",
    resave: false,
    saveUnitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24* 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    }
}


app.use(session(sessionConfig));
app.use(flash());
app.use(helmet({contentSecurityPolicy:false}));

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser= req.user;  
    next();
})

app.set("view engine", "ejs");
app.set('views', path.join(__dirname,"views"));

app.get("/fakeUser", async(req,res) => {
    const user= new User ({ email: "coltttt@gmail.com", username: "colttt"});
    const newUser= await User.register(user, "chicken")
})

app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes);

app.get("/", async(req,res) =>{
    res.render("home");
});

app.all("*",(req,res,next) =>{
    next(new ExpressError("Page Not Found", 404))
})

app.use((err,req,res,next) => {
    const {statusCode= 500, message="Something went wrong!"}=err;
    if(!err.message) err.message ="Oh no, something went wrong!";
    res.status(statusCode).render("error", {err});
})

app.listen(3000, () => {
    console.log("Serving on port 3000")
})
