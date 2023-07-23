
// boilerplate
const mongoose = require('mongoose')
const Campground = require('../models/campground') // import the campground model
const cities = require('./cities');

const skiResorts = require('./skiResorts')
const images = require('./imageUrls')
const users = require('./users')

const {places, descriptors} = require('./seedHelpers')
const campground = require('../models/campground');

// connect mongoose. the link says which port and database to use. lets create and use a movies database
const url = 'mongodb+srv://ldcurdi:ONK5YWUzaF3Nq79o@cluster1.egd6bay.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(url/* 'mongodb://127.0.0.1:27017/yelpCamp' *//* , {useNewUrlParser: true} */) // passing in options is no longer required

// mongoose connection logic
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// randomly generate an index in an array
const sample = (array) => array[Math.floor(Math.random() * array.length)]

// get an amount of random numbers in a range with no repeats
const randomUnique = (range, count) => {
    let nums = new Set();
    while (nums.size < count) {
        nums.add(Math.floor(Math.random() * range));
    }
    return [...nums];
}

const seedDB = async () => {
    // start by removing everything from the database
    await Campground.deleteMany({}) // delete all

    // randomly generate a bunch of campgrounds
    for (let i = 0; i < 117; i++) {
        //const random1000 = Math.floor(Math.random() * 1000)
        //const price = Math.floor(Math.random() * 30)

        // get random numbers
        const rand0to9 = Math.floor(Math.random() * 10) // determine which userid to use
        const rand2to6 = Math.floor(Math.random() * 5) + 2 // determine how many images to use
        const imageIndexes = randomUnique(53, rand2to6) // get n images randomly without duplicates

        // create images array
        const imagesArray = []
        for (var j = 0; j < rand2to6; j++) {
            const img = {
                url: images[imageIndexes[j]].url,
                filename: images[imageIndexes[j]].filename
            }
            imagesArray.push(img)
        }

        // fill campground with all seed data
        const camp = new Campground({
            //author: '64bb9b9b808789e740b6b914'/* '64bbacc4f5136f9d55c4a5d1' */, // first id is mongo atlas default user (un: leo, pw: 1), second is local default user (un: Leo, pw: Leo)
            author: users[rand0to9].id,
            //location: `${cities[random1000].city}, ${cities[random1000].state}`,
            location: skiResorts[i].location,
            //title: `${sample(descriptors)} ${sample(places)}`,
            title: skiResorts[i].name,
            geometry: {
                type: "Point",
                coordinates: [
                    //cities[random1000].longitude,
                    //cities[random1000].latitude
                    skiResorts[i].longitude,
                    skiResorts[i].latitude
                ]
            },
/*             images: [
                {
                    url: 'https://res.cloudinary.com/dzq7xz428/image/upload/v1689977214/YelpCamp/xvzwm6ze1h1punfd6xox.jpg',
                    filename: 'YelpCamp/xvzwm6ze1h1punfd6xox'
                },
                {
                    url: 'https://res.cloudinary.com/dzq7xz428/image/upload/v1689977205/YelpCamp/xlowmtkywcme2qcdrojo.jpg',
                    filename: 'YelpCamp/xlowmtkywcme2qcdrojo'
                },              
                {
                    url: 'https://res.cloudinary.com/dzq7xz428/image/upload/v1689977225/YelpCamp/vi2ynjosp7ur1jkc905u.jpg',
                    filename: 'YelpCamp/vi2ynjosp7ur1jkc905u'
                }              
            ], */
            images: imagesArray,
            //description: 'lorem',
            description: skiResorts[i].description,
            price: skiResorts[i].price
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close() // close the database
    })