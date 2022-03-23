import React, { useState } from 'react';
import './App.css';
import ReactMapGL, {Marker, Popup, Layer} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


import Paper from "@material-ui/core/Paper";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';

import SearchBar from "material-ui-search-bar";

import Button from '@mui/material/Button';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import formatStringToHtml from 'format-string-to-html'
import placeLogo from './data/restaurant.svg';
import {getPlaces} from './Sparql.js';
//let places = [];

import {getDirections} from './Directions.js';
import {getWeather} from './Weather.js';

// -------------------------------------------------------------------------------------------------
//  ALL THIS TO BE REPLACED WITH SPARQL QUERIES

// -------------------------------------------------------------------------------------------------
// places = places.splice(0, 20);
// get list of types from places => TO BE REPLACED WITH SPARQL QUERY
const types = new Set();
types.add('All');
types.add('Restaurant');
types.add('Bar');
types.add('Bakery');
types.add('Cafe');
const sortings = new Set();
sortings.add('None');
sortings.add('rating desc');
sortings.add('rating asc');
sortings.add('name desc');
sortings.add('name asc');

function App() {

  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 15
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [placesList, setPlacesList] = useState([]);
  const [selectedplace, setSelectedplace] = useState({});
  const [page, setPage] = useState(0);
  const [nbPages, setNbPages] = useState(0);
  const [arrondissement, setArrondissement] = useState('');
  const [type, setType] = useState('All');
  const [sorting, setSorting] = useState('None');
  const [searched, setSearched] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [route, setRoute] = useState(null);

  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);

  const [weather, setWeather] = useState(null);


  if (!isLoaded && placesList.length === 0) {
    getPlaces().then(data => {
      setPlacesList([...data].splice(0,10));
      setNbPages(Math.ceil(data.length / 10));
      setFilteredPlaces(data);
      getWeather({lat: 48.8566, lng: 2.3522}).then(data => {
        setWeather(data);
      });
      setIsLoaded(true);
    });
  }

  const requestSearch = (query) => {
  // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    getPlaces(type).then(data => {
      setPage(0);
      setNbPages(Math.ceil(data.length / 10));
      setFilteredPlaces([...data].filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }));
      setPlacesList([...data].filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }).splice(page*10, 10));

    });  }

  const cancelSearch = () => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setSearched("");
    requestSearch(searched);
    // re request sparql and set placesList and filteredPlaces
  };

  const handleChangePage = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setPage(event.target.value);
    setNbPages(Math.ceil(filteredPlaces.length / 10));
    setPlacesList([...filteredPlaces].splice(event.target.value*10, 10));
  };

  const handleChangeType = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setType(event.target.value);
    getPlaces(event.target.value, sorting).then(data => {
      setNbPages(Math.ceil(data.length / 10));
      setFilteredPlaces([...data]);
      setPage(0);
      setPlacesList([...data].splice(0, 10));
    });
  };

  const handleChangeSort = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setSorting(event.target.value);
    getPlaces(type, event.target.value).then(data => {
      setNbPages(Math.ceil(data.length / 10));
      setFilteredPlaces([...data]);
      setPage(0);
      setPlacesList([...data].splice(0, 10));
    });
  };

  function handleClick(place) {
      setSelectedplace(place);
      getWeather(place).then(data => {
        setWeather(data);
      }
    );
  }

  function handleClickClose() {
      setSelectedplace({});
      // reset map to default
      // setViewport({
      //   width: '100vw',
      //   height: '100vh',
      //   latitude: 48.8566,
      //   longitude: 2.3522,
      //   zoom: 15
      // });
  }

  function placeInfo(place) {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    return (
    <div style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
    <p>Adresse: {place.adresse}, Note: {place.rating}`</p>
    {displayWeather(place)}
    </div>
    );
  }
  function handleClickOrigin(place) {
    setOrigin(place);
  }
  function handleClickDestination(place) {
    setDestination(place);
    handleStartRoute(origin, place);
  }

  function handleStartRoute(origin, destination) {
    getDirections(origin, destination, "walking").then(data => {
      setRoute(data.routes[0].legs[0]);
    });
  }

  function handleStopRoute() {
    setRoute(null);
    setDestination(null);
    setOrigin(null);
  }

  function getWeatherIconURL() {
    if (weather.WeatherIcon>9) {
      return `https://apidev.accuweather.com/developers/Media/Default/WeatherIcons/${weather.WeatherIcon}-s.png`;
    } else {
      return `https://apidev.accuweather.com/developers/Media/Default/WeatherIcons/0${weather.WeatherIcon}-s.png`;
    }
  }

  function displayWeather() {
    if (weather) {
      const weatherIconURL = getWeatherIconURL();
      return (
        <div className="weather-container" style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center"}}>
          <img src={weatherIconURL} alt="weather icon" />
          <p>{weather.Temperature.Metric.Value}°C</p>
        </div>
      );
    } else {
      return (
        <div className="weather-container">
          <div className="weather-info-temp">
            Loading...
          </div>
        </div>
      );
    }
  }

  function routeInfo(origin, destination) {
    return (
      <div>
        <div style= {{marginLeft:'20px'}}>
        <h2>Route</h2>
        <p>From: {origin.name}</p>
        <p>To: {destination.name}</p>
        <p>Distance: {route.distance.text}</p>
        <p>Duration: {route.duration.text}</p>
        </div>
        <div>
        <h2 style= {{marginLeft:'20px'}}>Steps</h2>
        <List style={{maxHeight: '90%', overflow: 'auto'}}>
        {route.steps.map((step, index) => {
          console.log(new formatStringToHtml(step.html_instructions).format())
            return (
            <ListItem key={index} style={{display: 'flex', flexDirection: 'row'}}>
              <div style={{marginRight: '5px'}}>
                {index+1}.
                </div>
              <div style={{margin: '5px'}} dangerouslySetInnerHTML={{__html: new formatStringToHtml(step.html_instructions).format()}}/>

              <p style={{margin: '5px'}}> {step.distance.text}, {step.duration.text}</p>
            </ListItem>
            );
          }
        )}
        </List>
        </div>
      </div>
    );
  }
  return (
    {isLoaded} ? (
    <div className="App">
      { !route ? (
      <div style={{width:'30vw', height:'100vh', overflow:'auto'}}>
        <Paper>
          <div className='list-header'>
            <h1>Food Places</h1>
            <div className='page-control'>
              <InputLabel id="page-label">Page</InputLabel>
              <Select
                labelId="page-label"
                id="page-select"
                value={page}
                label="Page"
                onChange={handleChangePage}
                >
                {
                  Array.from(Array(nbPages).keys()).map(page => (
                    <MenuItem key={page} value={page}>{page+1}</MenuItem>
                  ))
                }
              </Select>
            </div>
            <div className='type-control'>
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type-select"
                value={type}
                label="Type"
                onChange={handleChangeType}
                >
                {
                  Array.from(types).map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                }
              </Select>
            </div>
            <div className='sorting-control'>
              <InputLabel id="sorting-label">Sort</InputLabel>
              <Select
                labelId="sorting-label"
                id="sorting-select"
                value={sorting}
                label="Sort"
                onChange={handleChangeSort}
                >
                {
                  Array.from(sortings).map(type => (
                    <MenuItem key={type} value={type}>{type}</MenuItem>
                  ))
                }
              </Select>
            </div>
          </div>
          <SearchBar
          value={searched}
          onChange={(searchVal) => requestSearch(searchVal)}
          onCancelSearch={() => cancelSearch()}
          />
          <List className='place-list'>
          {placesList.map(place => (
            <ListItemButton key={place.place_id} className='info' onClick={() => handleClick(place)}>
              <ListItemText key={place.place_id + 'name'} primary={`${place.name}`}/>
            { (selectedplace.place_id === place.place_id && !origin) && (
              <ListItemText key={place.place_id + 'description'} primary={'Set as Origin'} onClick={() => handleClickOrigin(place)}/>
            )}
            { (selectedplace.place_id === place.place_id && !destination && origin) && (
              <ListItemText key={place.place_id + 'description'} primary={'Set as Destination'} onClick={() => handleClickDestination(place)}/>
            )}
            </ListItemButton>
          ))}
        </List>
      </Paper>
      
      </div>
      ) : (
        <div style={{width:'30vw', height:'100vh', overflow:'auto'}}>
          <Paper>
            <div className='route-header'>
              <Button>
                <ArrowBackIcon onClick={() => handleStopRoute()}/>
              </Button>
              </div>
            <div className='route-info'>
              {routeInfo(origin, destination)}
              </div>
          </Paper>
          </div>
      )}
      <div style={{width:'70vw', height:'100vh'}}>
        {(viewport) ? (
        <ReactMapGL
          initialViewState={viewport}
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          onViewportChange={(viewport) => {
            setViewport(viewport);
          }}
          >
          <div style={{width:'100vw', height:'100vh'}}>
            {filteredPlaces.map(place => (
              <div key={place.place_id}>
                  <Marker
                    latitude={place.lat}
                    longitude={place.lng}
                  >
                  <p
                  role='img'
                  onClick={() => handleClick(place)}
                  className="cursor-pointer text-2xl animate-bounce"
                  aria-label='push-pin'
                  >📍</p>
                  </Marker>
                  { selectedplace.place_id === place.place_id ? (
                    <Popup
                      latitude={place.lat}
                      longitude={place.lng}
                      closeOnClick={false}
                      onClose={() => handleClickClose()}
                      onOpen={() => handleClick(place)}
                      >
                        <div className='popup'>
                          <h2>{place.name}</h2>
                          {placeInfo(place)}
                        </div>

                      </Popup>
                  ) : null}
                      
                </div>
                

            ))}
              
          </div>
        </ReactMapGL>
        ) : null}
      </div>
    </div>
    ) : (
      <div>Loading...</div>
    )
  );
}

export default App;
