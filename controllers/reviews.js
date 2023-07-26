
const Campground = require('../models/campground') // import the campground model
const Review = require('../models/review')

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    const review = new Review(req.body.review)
    review.author = req.user._id // save the author of the review
    campground.reviews.push(review)
    await review.save()
    await campground.save()
    
    // flash a confirmation message
    req.flash('success', 'Created new review!')

    res.redirect(`/resorts/${campground._id}`)
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    
    // flash a confirmation message
    req.flash('success', 'Successfully deleted review!')

    res.redirect(`/resorts/${id}`);
}