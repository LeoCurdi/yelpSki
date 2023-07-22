
const {campgroundSchema, reviewSchema} = require('./schemas.js')
const ExpressError = require('./utilities/ExpressError')
const Campground = require('./models/campground')
const Review = require('./models/review')


// check if the user is logged in and if not, dont allow for certain actions
module.exports.isLoggedIn = (req, res, next) => {
    //console.log(req.user)
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you are not signed in!')
        return res.redirect('/login')
    }
    next()
}

// return the user to their desired page after they log in
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // add this line
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}


// campgrounds middleware

// this is campground form validation
// here we use joi to set up some validation / error handling that will work if soemone sends a post request through something like postman
module.exports.validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body)
    //console.log(result)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next() // we have to call next on success in order to make it past the middleware
    }
}

// check if the campground exists
module.exports.isCampground = async(req, res, next) => {
    // find campground
    const {id} = req.params
    const campground = await Campground.findById(id)
    // check if campground exists
    if (!campground) {
        req.flash('error', 'Cannot find campground')
        return res.redirect('/campgrounds')
    }
    // campground exists
    next()
}

// check if user is trying to modify someone elses campground
module.exports.isAuthor = async(req, res, next) => {
    // find campground
    const {id} = req.params
    const campground = await Campground.findById(id)
    // check if campground belongs to user
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    // else user has permission to modify
    next()
}


// reviews middleware
module.exports.validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    }
    else {
        next() // we have to call next on success in order to make it past the middleware
    }
}
// check if user is the author of the review
module.exports.isReviewAuthor = async(req, res, next) => {
    // find review
    // the route to delete a review is /campgrounds/id/reviews/reviewId so we get id and reviewId from params
    const {id, reviewId} = req.params
    const review = await Review.findById(reviewId)
    // check if review belongs to user
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    // else user has permission to modify
    next()
}

