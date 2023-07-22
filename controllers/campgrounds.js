
const Campground = require('../models/campground') // import the campground model
const {cloudinary} = require('../cloudinary')
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}) // grab all campgrounds
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new')
}

module.exports.createCampground = async (req, res) => { // were passing in the validate campground function as an argument to the route
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    // we no longer need a try catch in here since we have the wrap async function

    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
 
    const campground = new Campground(req.body.campground)
    
    // get the coordinates of the entered location
    campground.geometry = geoData.body.features[0].geometry
        
    // get the link and filename for each image
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename}))
    
    campground.author = req.user._id
    await campground.save()    
    console.log(campground)
    // flash a confirmation message
    req.flash('success', 'Successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.displayCampground = async (req, res) => {
    // find campground and populate it with the data for reviews and author (we have to do this because campground only stores a reference (id) to reviews and author)
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            populate: { // nested populate: populate all reviews with their author
                path: 'author'
            }
        })
        .populate('author')

    res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async (req, res) => {
    // find campground
    const {id} = req.params
    const campground = await Campground.findById(id)

    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampground = async (req, res) => {
    // find campground
    const {id} = req.params
    // update
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground}) // using the spread operator
    // get the link and filename for each image
    const images = req.files.map(f => ({url: f.path, filename: f.filename}))
    campground.images.push(...images) // spread the array of new images into the current array of images (dont pass in an array, pass in the contents of the array)
    // save the changes
    await campground.save()
    // delete images
    if (req.body.deleteImages) { // check if there are images to delete
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename) // delete the images off of my cloudinary account
        }
        await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}}) // pull items out of the images array
    }
    // flash a confirmation message
    req.flash('success', 'Campground updated!')
    // redirect user to the campground page
    res.redirect(`/campgrounds/${campground._id}`)
}

module.exports.deleteCampground = async (req, res) => { // could use any route here besides a get but were going with delete
    // we're using method override in the html form to send a post request as a delete
    
    // find campground
    const {id} = req.params

    // when we delete a campground, we must delete all reviews for the campground as well
    await Campground.findByIdAndDelete(id) // the middleware that is called by findByIdAndDelete is FindOneAndDelete, so we use that middleware inside campground.js to delete all reviews
        
    // flash a confirmation message
    req.flash('success', 'Successfully deleted campground!')
    res.redirect('/campgrounds')
}

