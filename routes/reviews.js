
const express = require('express')
const router = express.Router({mergeParams: true})

const wrapAsync = require('../utilities/wrapAsync')
const Campground = require('../models/campground') // import the campground model
const Review = require('../models/review')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')


// all review routes

// post review
router.post('/', isLoggedIn, validateReview, wrapAsync(reviews.createReview))

// delete review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, wrapAsync(reviews.deleteReview))


// export our router
module.exports = router