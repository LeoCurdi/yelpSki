
const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema // shorten mongoose.Schema to just Schema



// create the campground model
const ImageSchema = new Schema({
    url: String,
    filename: String
})
// this is for requesting thumbnail versions of our images from cloudinary
ImageSchema.virtual('thumbnail').get(function() { // this creates a new link with the width 200 property and you can access it by saying image.thumbnail
    return this.url.replace('/upload', '/upload/w_150')
})

const options = { toJSON: {virtuals: true}}

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // define an array that contains references to reviews for a specific campground
    reviews: [ 
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
/*     properties: { // this is what the virtual below is adding to the campground model
        popUpMarkup
    } */
}, options)
// a virtual schema for adding a 'properties' member to the campground mdoel so after the fact so we can use it on our cluster map
CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `
        <strong><a href="/resorts/${this._id}">${this.title}<a></strong>
        <p>${this.description.substring(0, 20)} . . .</p>
    `
})


// DELETE ALL ASSOCIATED REVIEWS AFTER A CAMP IS DELETED
// this is the mongoose middleware that is called when a camp is deleted
CampgroundSchema.post('findOneAndDelete', async function (campground) {
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }
        })
    }
})


// export the model
module.exports = mongoose.model('Campground', CampgroundSchema)
