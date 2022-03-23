const Axios = require('axios');

async function getLocationKey(place){
    var config = {
        method: 'get',
        url: 'http://dataservice.accuweather.com/locations/v1/cities/geoposition/search',
        params: {
            q: `${place.lat},${place.lng}`,
            apikey: "P2bDAAzpWklJSfGxoDRXBAVCcWC64IGN"
        }
    }
    return Axios(config).then(function (response) {
        return response.data;
    }
    ).catch(function (error) {
        return error;
    }
    );
}

async function getWeather(place) {
    // get data from opean weather api
    return getLocationKey(place).then(function (response) {
        var config = {
            method: 'get',
            url: `http://dataservice.accuweather.com/currentconditions/v1/${response.Key}`,
            params: {
                apikey: "P2bDAAzpWklJSfGxoDRXBAVCcWC64IGN",
                details: false,
                metric: true
            }
        }
        return Axios(config).then(function (response) {
            return response.data[0];
        }
        ).catch(function (error) {
            return error;
        }
        );
    }).catch(function (error) {
        return error;
    });

}

module.exports = {
    getWeather
}