
// environment variables boilerplate
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// packages boilerplate
const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const session = require('express-session')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require('helmet')
const MongoStore = require('connect-mongo');

// project files boilerplate
const ExpressError = require('./utilities/ExpressError')
const User = require('./models/user')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')


// connect mongoose. the link says which port and database to use. lets create and use a movies database
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelpCamp'
mongoose.connect(dbUrl/* 'mongodb://127.0.0.1:27017/yelpCamp' */) // passing in options is no longer required
// mongoose connection logic
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});


// middleware
const app = express()
app.engine('ejs', ejsMate)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(mongoSanitize({
    replaceWith: '_' // replaces all '$' chars in query strings with '_' such that people cant use mongo keywords to mess with our stuff 
}))

// this is all helmet stuff
app.use(helmet(/* {
    contentSecurityPolicy: false
} */))
// what we're doing here is declaring which locations we can get files from. the other option is to delete all this and uncomment the contentSecurityPolicy: false in inside of use helmet, but then we'd be less protected
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dzq7xz428/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// session stuff
const secret = process.env.SECRET || 'thisisasecret'
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60, // in seconds
    crypto: {
        secret,
    }
})
store.on('error', function (e) {
    console.log('session error', e)
})
const sessionConfig = {
    store,
    name: 'session', // can name this whatever - it will show as the cookie name
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        //secure: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), // thats in milliseconds so this says expire a week from now
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig)) // this line has to come before the next 2

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use(flash())

// flash middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user // always track whose logged in
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})



// routes

app.get('/', (req, res) => {
    //res.send('hello from yelpcamp!')
    res.render('home')
})

// user routes
app.use('/', userRoutes)

// all campground routes come from this router
app.use('/campgrounds', campgroundRoutes)

// all reviews routes come from this router
app.use('/campgrounds/:id/reviews', reviewRoutes)



// error handler (this will catch every error that comes from a wrapAsync function)
app.all('*', (req, res, next) => { // * will respond to all requests
    //res.send('404!!!')
    next(new ExpressError('Page Not Found', 404)) // this will pass the error down to the app.use below
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err // when destructuring, its a good idea to give everything a default value
    if (!err.message) err.message = 'Something went wrong'
    res.status(statusCode).render('error', {err})
})



// set up localhost port
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`listening on port ${port}!`)
})
