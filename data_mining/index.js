import {Client} from "@googlemaps/google-maps-services-js";

const client = new Client({key: 'AIzaSyA2CXzg9NRsFQMaQXz7qqH7NLoXo-pCPyo'});

import fs from 'fs';

const arrondissements = ['1er', '2eme', '3eme', '4eme', '5eme', '6eme', '7eme', '8eme', '9eme', '10eme', '11eme', '12eme', '13eme', '14eme', '15eme', '16eme', '17eme', '18eme', '19eme', '20eme'];

// retrieve longitude   and latitude of paris arrondissement from 1 to 20
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
async function getPlacesByArrondissement(type='restaurant', verbose=true) {
    let all_places = [];
    if(verbose) {
        process.stdout.cursorTo(65);
        process.stdout.write('['+ ' '.repeat(arrondissements.length) + ']');
        process.stdout.cursorTo(66);
    }
    for (let i in arrondissements) {
        if(verbose) {
            process.stdout.write('\u258B');
        }
        const latLng = await getLatLng(`${arrondissements[i]} arrondissement de Paris`);
        const places = await getPlaces(type, latLng.lat, latLng.lng);
        all_places = all_places.concat(places);
    }
    process.stdout.write('\n');
    return all_places;
}

const types = ['restaurant', 'cafe', 'bar', 'bakery']
async function getPlacesByType(types=['restaurant']) {
    let full_places = [];
    for (let i in types) {
        
        process.stdout.write(`${parseInt(i)+1}. Retrieving ${types[i]}s in all 20 arrondissements of Paris`);
        const places = await getPlacesByArrondissement(types[i], true);
        full_places = full_places.concat(places);
    }
    return full_places;
}

// function to save the data in a json file
function saveData(data, fileName) {
    fs.writeFile(fileName, JSON.stringify(data, '', 2), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Saved ${data.length} places in ${fileName}`);
        }
    });
}

const full_places = await getPlacesByType(types)
saveData(full_places, 'full_places.json');
