import {Client} from "@googlemaps/google-maps-services-js";
import 'dotenv/config'

console.log(process.env.MAPS_API_KEY);
const client = new Client({key: process.env.MAPS_API_KEY});
    
import fs from 'fs';
import Axios from 'axios';

async function getPlaceDetails(id){
    const key = process.env.MAPS_API_KEY;
    console.log(key);
    var config = {
        method: 'get',
        url: 'https://maps.googleapis.com/maps/api/place/details/json',
        params: {
            place_id: id,
            fields: 'opening_hours',
            key: key,
        }
    };

    return await Axios(config).then(function (response) {
        console.log(response.data);
        return response.data.result;
    }
    ).catch(function (error) {
        console.log(error);
    }
    );
}

async function main() {
    let data = JSON.parse(fs.readFileSync('full_places.json', 'utf8'));
    data = data.filter(place => place.business_status === 'OPERATIONAL');
    for(let i = 0; i < data.length; i++){
        if(data[i].business_status === 'OPERATIONAL'){
            const place_id = data[i].place_id;
            const details = await getPlaceDetails(place_id);
            data[i].opening_hours = details.opening_hours;
        }
    }
    data = data.filter(place => place.opening_hours !== undefined);
    fs.writeFileSync('full_places_with_opening_hours.json', JSON.stringify(data, '', 2));
}

// load data from json file
main();