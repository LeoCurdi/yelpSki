
const BaseJoi = require('joi')
const sanitizeHtml = require('sanitize-html')

// html sanitize stuff
// we're creating a new function to remove html and script tags from strings, then adding our function to joi
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});
// add our custom stuff to joi so we can use it below
const Joi = BaseJoi.extend(extension)


// validate user input on the campground edit and new forms
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        //image: Joi.string().required(), // dont require images
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages: Joi.array() // dont require users to delete images on edit
})

// validate user input on create review form
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()
    }).required() // this required is very important. if we dont say required here it wont validate that the form is not empty
})

