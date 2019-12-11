const HereMapsAPI = require('here-maps-node').default;

const config = {
    app_id: process.env.HERE_MAPS_JS_APP_ID,
    app_code: process.env.HERE_MAPS_JS_APP_CODE
};

const hereMapsAPI = new HereMapsAPI(config);

export async function geoCodeHereMaps(address) {
    const response = new Promise(
        (resolve, reject) => {
            hereMapsAPI.geocode(
                {
                    'searchtext' : address
                },
                (error, result) => {
                    if (error)
                        reject(error);
                    else{
                        let coordinates = result.Response.View[0].Result[0].Location.DisplayPosition;
                        resolve(coordinates);
                    }
                }
            );
        }
    );

    return response;
}