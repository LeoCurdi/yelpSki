
const mongoose = require('mongoose')
const Schema = mongoose.Schema // shorten mongoose.Schema to just Schema

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})


module.exports = mongoose.model("Review", reviewSchema)
