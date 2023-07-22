
const express = require('express')
const router = express.Router()

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const wrapAsync = require('../utilities/wrapAsync')
const Campground = require('../models/campground') // import the campground model
const {isLoggedIn, isAuthor, isCampground, validateCampground} = require('../middleware')
const campgrounds = require('../controllers/campgrounds')



// all campground routes

router.route('/')
    // display all campgrounds
    .get(wrapAsync(campgrounds.index))
    // create a campground
    .post(isLoggedIn, upload.array('image'), validateCampground, wrapAsync(campgrounds.createCampground))

// create campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

router.route('/:id')
    // read/show campground
    .get(isCampground, wrapAsync(campgrounds.displayCampground))
    // update campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, wrapAsync(campgrounds.updateCampground))
    // delete campground
    .delete(isLoggedIn, isAuthor, wrapAsync(campgrounds.deleteCampground))
    
// update campground
router.get('/:id/edit', isLoggedIn, isCampground, isAuthor, wrapAsync(campgrounds.renderEditForm))



// export the campground routes
module.exports = router
