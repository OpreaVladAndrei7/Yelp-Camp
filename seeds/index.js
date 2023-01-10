const mongoose = require('mongoose');
const cities= require("./cities");
const Campground=require("../models/campground");
const { places, descriptors} = require("./seedHelpers");
main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/yelp-camp');
  
  // use `await mongoose.connect('mongodb://user:password@localhost:27017/test');` if your database has auth enabled
}

const sample = array => array[Math.floor(Math.random()*array.length)];

const seedDB= async() =>{
    await Campground.deleteMany({});
    for( let i=0; i<300;i++){
        const random1000=Math.floor(Math.random() * 1000);
        const price= Math.floor(Math.random()*20)+10;
        const camp= new Campground({
          //YOUR USER ID
            author: "63b6c8e8f166180a51374987",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description:"Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto, consequatur culpa. Molestias dolorum laudantium nesciunt modi porro atque quasi optio beatae. Atque voluptatem fugiat accusamus ad sit. Dicta, vel iure.Lorem ipsum dolor sit amet consectetur adipisicing elit. Iusto, consequatur culpa. Molestias dolorum laudantium nesciunt modi porro atque quasi optio beatae. Atque voluptatem fugiat accusamus ad sit. Dicta, vel iure.",  
            price,
            geometry:{
               type: 'Point',
               coordinates: [ 
                  cities[random1000].longitude,
                  cities[random1000].latitude,
                ] 
              },
            images: [
                {
                  url: 'https://res.cloudinary.com/debvq0eym/image/upload/v1673111385/YelpCamp/lab7r9zdwksewelf9ps4.png',
                  filename: 'YelpCamp/lab7r9zdwksewelf9ps4',
                },
                {
                  url: 'https://res.cloudinary.com/debvq0eym/image/upload/v1673111385/YelpCamp/ju4sjiewtthufzea8anp.png',
                  filename: 'YelpCamp/ju4sjiewtthufzea8anp',
                },
                {
                  url: 'https://res.cloudinary.com/debvq0eym/image/upload/v1673111385/YelpCamp/mfdsvmunr0mooabbrlt0.png',
                  filename: 'YelpCamp/mfdsvmunr0mooabbrlt0',
                }
              ]
            
            
            
        })
        await camp.save()
    }
}

seedDB().then(() =>{
    mongoose.connection.close();
}
);