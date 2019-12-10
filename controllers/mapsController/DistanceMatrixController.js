let Config = require('../../config');
let mapsClient = Config.MAPS_CONFIG.mapsClient;

function sortCounselors (json_data, counselors) {
    
    let counselors_distances = [];
    
    json_data.rows[0].elements.forEach( (element, index) => {
        if (element.status !== 'ZERO_RESULTS') {
            counselors_distances.push(
                {
                    'label' : counselors[index],
                    'distance' : parseInt(element.distance.value),
                    'value' : json_data.destination_addresses[index]
                }
            );
        }
    });
    
    counselors_distances.sort( (a, b ) => a.distance - b.distance );

    return counselors_distances;
}

export async function calculateDistances(origin, counselors) { 
    if (typeof origin.latitude !== 'undefined') {
        origin = Object.values(origin).join(',');
    }

    let counselors_ = [];
    let destinations = [];
    {
        counselors.forEach((counselor) => {
            counselors_.push(counselor.label);
            destinations.push(counselor.value.input.text);
        });
    }

    const response = await new Promise( (resolve, reject) => {
        mapsClient.distanceMatrix({
            origins: origin,
            destinations: destinations,
            mode: 'driving',
          }, async (err,response) =>{
              if (err){
                reject(err);
              }else{      
                  if(response.status === 200 && typeof response.json.error_message === 'undefined') {
                      let counselors = sortCounselors(response.json, counselors_);
                      
                      resolve(counselors)
                  } else {
                      let error = 'Some error occured, please try again later';

                      resolve(counselors);
                  }
              }
          });
    });

    return response;
}