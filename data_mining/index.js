import {Client} from "@googlemaps/google-maps-services-js";

const client = new Client({key: 'AIzaSyA2CXzg9NRsFQMaQXz7qqH7NLoXo-pCPyo'});

import fs from 'fs';

const arrondissements = ['1er', '2eme', '3eme', '4eme', '5eme', '6eme', '7eme', '8eme', '9eme', '10eme', '11eme', '12eme', '13eme', '14eme', '15eme', '16eme', '17eme', '18eme', '19eme', '20eme'];

// retrieve longitude   and latitue of paris arrondissement from 1 to 20
function getLatLng(arrondissement) {
    return new Promise((resolve, reject) => {
        client.geocode({
            params: {
                address: arrondissement,
                key: 'AIzaSyA2CXzg9NRsFQMaQXz7qqH7NLoXo-pCPyo'
            }
        }).then(function (response) {
            resolve(response.data.results[0].geometry.location);
        }).catch(function (err) {
            reject(err);
        });
    });
}

import Axios from 'axios';
async function getPlaces(type, lat, lng) {
    const key = 'AIzaSyA2CXzg9NRsFQMaQXz7qqH7NLoXo-pCPyo';
    var config = {
        method: 'get',
        url: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
        params: {
            input: '',
            inputtype: 'textquery',
            fields: 'formatted_address,geometry,icon,id,name,permanently_closed,photos,place_id,plus_code,types',
            key: key,
            // use lat and long to get the restaurant in paris
            location: lat + ',' + lng,
            radius: '800',
            type: type
        }
    };

    return await Axios(config).then(function (response) {
        return response.data.results;
    }
    ).catch(function (error) {
        console.log(error);
    }
    );

}

// loop on all arrondissement of Paris from arrondissement and update longitude and latitude
async function getPlacesByArrondissement(type='restaurant') {
    let all_restaurants = [];
    for (let i in arrondissements) {
        console.log(`getting ${type} in ${arrondissements[i]} arrondissement`);
        const latLng = await getLatLng(`${arrondissements[i]} arrondissement de Paris`);
        const restaurants = await getPlaces(type, latLng.lat, latLng.lng);
        all_restaurants = all_restaurants.concat(restaurants);
    }
    return all_restaurants;
}

const types = ['restaurant', 'cafe', 'bar', 'bakery']
async function getPlacesByType(types=['restaurant']) {
    let full_restaurants = [];
    for (let i in types) {
        const latLng = await getLatLng(`${arrondissements[i]} arrondissement de Paris`);
        const restaurants = await getPlacesByArrondissement(types[i], latLng.lat, latLng.lng);
        full_restaurants = full_restaurants.concat(restaurants);
    }
    return full_restaurants;
}

const full_restaurants = await getPlacesByType(types)


fs.writeFile('restaurants.json', JSON.stringify(full_restaurants, '', 2) , function (err) {
    if (err) throw err;
    console.log(`saved ${full_restaurants.length} restaurants in restaurants.json`);
}
);

