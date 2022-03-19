import React, { useState } from 'react';
import './App.css';
import ReactMapGL, {Marker, Popup} from 'react-map-gl';
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

import placeLogo from './data/restaurant.svg';
import {getPlaces} from './Sparql.js';
//let places = [];



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

  if (!isLoaded && placesList.length === 0) {
    getPlaces().then(data => {
      setPlacesList([...data].splice(0,10));
      setNbPages(Math.ceil(data.length / 10));
      setFilteredPlaces(data);
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
      // focus map on place
      // setViewport({
      //   width: '100vw',
      //   height: '100vh',
      //   latitude: place.latitude,  
      //   longitude: place.longitude,
      //   zoom: 17
      // });
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
    return (`Adresse: ${place.adresse}, \n Note: ${place.rating}`);
  }
  return (
    {isLoaded} ? (
    <div className="App">
      <div style={{width:'30vw', height:'90vh'}}>
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
              <ListItemText key={place.place_id + 'name'} primary={place.name} />
            { selectedplace === place && (
              <ListItemText key={place.place_id + 'description'} secondary={placeInfo(place)} />
            )}
            </ListItemButton>
          ))}
        </List>
      </Paper>
      
      </div>
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
                          <p>{placeInfo(place)}</p>
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
