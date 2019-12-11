import {geoCodeHereMaps} from './HereMapsController';
import { googleGeocode } from './GoogleGeocodeController';

export async function geoCode(address) {
    switch(process.env.Geocode) {
        case 'HereMap':
            console.log("Using here map api");
            return await geoCodeHereMaps(address);
            break;
        case 'Google':
            console.log("Using google map api");
            return await googleGeocode(address);
            break;
        default:
            console.log("Using default api (heremap)");
            return await geoCodeHereMaps(address);
            break;
    }
}