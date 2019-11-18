'use strict';

const googleMaps = require('@google/maps');

const mapsClient = googleMaps.createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  promise:Promise
});
module.exports = {mapsClient:mapsClient};
