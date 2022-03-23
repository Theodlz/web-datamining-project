const Axios = require('axios');

function getDirections(origin={}, destination={}, mode="walking") {
    // get data from api at localhost:3000/api/directions
    var config = {
        method: 'get',
        url: 'http://localhost:3000/api/directions/json',
        params: {
            origin: `place_id:${origin.place_id}`,
            destination: `place_id:${destination.place_id}`,
            mode: mode,
            key: process.env.REACT_APP_MAPS_API_KEY
        },
        // add key
    }
    return Axios(config).then(function (response) {
        return response.data;
    }
    ).catch(function (error) {
        return error;
    }
    );

}

module.exports = {
    getDirections
}