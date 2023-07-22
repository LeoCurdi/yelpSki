
// boilerplate
const mongoose = require('mongoose')
const Campground = require('../models/campground') // import the campground model
const cities = require('./cities');
const skiResorts = require('./skiResorts')
const {places, descriptors} = require('./seedHelpers')
const campground = require('../models/campground');

// connect mongoose. the link says which port and database to use. lets create and use a movies database
mongoose.connect('mongodb://127.0.0.1:27017/yelpCamp'/* , {useNewUrlParser: true} */) // passing in options is no longer required

// mongoose connection logic
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// randomly generate an index in an array
const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
    // start by removing everything from the database
    await Campground.deleteMany({}) // delete all

    // randomly generate a bunch of campgrounds
    for (let i = 0; i < 67; i++) {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random() * 30)
        const camp = new Campground({
            author: '64bab6c77636a71f8a21bbba',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            //location: `${skiResorts[i].name}, ${skiResorts[i].location}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                    //skiResorts[i].longitude,
                    //skiResorts[i].latitude
                ]
            },
            images: [
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
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await camp.save()
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close() // close the database
    })