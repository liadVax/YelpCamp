const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const mongoose = require('mongoose');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 10; i++) {
    const randCityState = sample(cities);
    const randPrice = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: '63557ce365de0c580fb46e71',
      location: `${randCityState.city}, ${randCityState.state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: 'https://source.unsplash.com/collection/483251',
          filename: `${sample(descriptors)}_${sample(places)}_Img`,
        },
        {
          url: 'https://source.unsplash.com/collection/4466406',
          filename: `${sample(descriptors)}_${sample(places)}_Img`,
        },
      ],
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cupiditate quidem, nostrum, necessitatibus excepturi, at ullam architecto ratione enim ipsam exercitationem cum? Perspiciatis voluptatibus saepe quam, velit tempore error ipsa necessitatibus?',
      price: randPrice,
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
