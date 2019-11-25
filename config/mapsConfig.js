'use strict';

const googleMaps = require('@google/maps');

const mapsClient = googleMaps.createClient({
  key: process.env.GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY,
  promise:Promise
});

mapsClient.distanceMatrix({
  origins: 'melbourne',
  destinations: 'sydney',
  mode: 'driving',
},(err,response) =>{
    if (err){
      console.log(err);
    }else{
      console.log(JSON.stringify(response,0,2));
    }
});


module.exports = {mapsClient:mapsClient};
