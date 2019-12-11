const axios = require('axios').default;        

export async function googleGeocode(location) {
    let url = 'https://maps.googleapis.com/maps/api/geocode/json?key='+process.env.GOOGLE_MAPS_DISTANCE_MATRIX_API_KEY+'&address=';

    if (typeof location !== 'undefined' && location !== '') {
        location = location.split(' ').join('+');
        url = url+location;

        let response = await axios.get(url);
        
        if (response.status === 200) {
            return {Latitude: response.data.results[0].geometry.location.lat, Longitude: response.data.results[0].geometry.location.lng};
        } else {
            console.error("Could not get location for address "+ location);
        }
    } else {
        throw ('Please provide an address to geocode');
    }
}