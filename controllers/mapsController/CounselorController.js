import { CounselorService } from '../../services';
import { geoCode } from './GeocodeFactory';

export function getNearestCounselors(location, limit) {

    const response = new Promise((resolve, reject) => {
        CounselorService.nearestCouselor(location, limit, (error, data) => {
            if (error)
                reject(error);
            else {
                resolve(data);
            }
        });
    });
    
    return response;
}

export async function getLocationData(location)
{
    let response;
    if (typeof location === 'undefined'){// get data from db and then location
        response = new Promise((resolve, reject) => {
            CounselorService.findAll(null, null, {}, (err, data) => {
                if (err)
                    console.error(err);
                else {
                    data.forEach(async (counselor) => {
                        let coordinates = await geoCode(counselor.address);
    
                        let location = {type: 'Point', coordinates : [coordinates.Longitude, coordinates.Latitude]};
                        CounselorService.update({_id : counselor._id}, {location: location}, {}, (error, data) => {
                            if (error)
                                reject(error);
                            else
                                resolve(data);
                        });
                    });
                }
            });
        });
    } else {
        let coordinates = await geoCode(location);
    
        response = [coordinates.Longitude, coordinates.Latitude];
    }

    return response;
}

export async function calculateDistances(origin) {     
    console.log("Using location " + JSON.stringify(origin));
    
    let nearestCouselor = await getNearestCounselors(origin, 3);
    let formated = [];

    nearestCouselor.forEach((element) => {
        formated.push(
            {
                label: element.name,
                value: element.address,
                phone: element.phone,
                service_area: element.service_area,
                distance: (parseFloat(element.dist.distance) / 1000).toFixed(2)
            }
        );
    });

    return formated;
}