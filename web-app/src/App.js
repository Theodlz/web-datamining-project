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
import places from './data/places.json'
// -------------------------------------------------------------------------------------------------
//  ALL THIS TO BE REPLACED WITH SPARQL QUERIES
places = places.filter((place, index, self) => index === self.findIndex((t) => (t.place_id === place.place_id)))
places = places.filter(place => place.name && place.formatted_address && place.geometry.location);
// sort places alphabetically by name
places = places.sort((a, b) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
});
// -------------------------------------------------------------------------------------------------
// places = places.splice(0, 20);
// get list of types from places => TO BE REPLACED WITH SPARQL QUERY
const types = new Set();
places.forEach(place => {
  place.types.forEach(type => types.add(type));
});
types.add('All');

function App() {
  const [viewport, setViewport] = useState({
    width: '100vw',
    height: '100vh',
    latitude: 48.8566,
    longitude: 2.3522,
    zoom: 15
  });

  const [placesList, setPlacesList] = useState([...places].splice(0,10));
  const [selectedplace, setSelectedplace] = useState({});
  const [page, setPage] = useState(0);
  const [nbPages, setNbPages] = useState(Math.ceil(places.length / 10));
  const [arrondissement, setArrondissement] = useState('');
  const [type, setType] = useState('All');
  const [searched, setSearched] = useState("");
  const [filteredPlaces, setFilteredPlaces] = useState(places);

  const requestSearch = (query) => {
  // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    if (type === 'All') {
      setPage(0);
      setNbPages(Math.ceil(places.length / 10));
      setFilteredPlaces([...places].filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }));
      setPlacesList([...places].filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }).splice(page*10, 10));
    } else {
      setFilteredPlaces([...places].filter(place => place.types.includes(type)).filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }));
      setNbPages(Math.ceil(filteredPlaces.length / 10));
      setPlacesList([...places].filter(place => place.types.includes(type)).filter((place) => {
        return place.name.toLowerCase().includes(query.toLowerCase());
      }).splice(page*10,10));
    }
  }

  const cancelSearch = () => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setSearched("");
    requestSearch(searched);
  };

  const handleChangePage = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setPage(event.target.value);
    setNbPages(Math.ceil(places.length / 10));
    setPlacesList([...filteredPlaces].splice(event.target.value*10, 10));
  };

  const handleChangeArrondissement = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setArrondissement(event.target.value);
    if (type === 'All') {
      setNbPages(Math.ceil(places.length / 10));
      setPage(0);
      setPlacesList([...places].splice(page*10, 10));
    } else {
      setNbPages(Math.ceil([...places].filter(place => place.types.includes(type)).length / 10));
      setPage(0);
      setPlacesList([...places].filter(place => place.types.includes(type)).splice(page*10, 10));
    }
  };

  const handleChangeType = (event) => {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    setType(event.target.value);
    if (event.target.value === 'All') {
      setNbPages(Math.ceil(places.length / 10));
      setPage(0);
      setFilteredPlaces([...places]);
      setPlacesList([...filteredPlaces].splice(page*10, 10));
    } else {
      setNbPages(Math.ceil([...places].filter(place => place.types.includes(event.target.value)).length / 10));
      setPage(0);
      setFilteredPlaces([...places].filter(place => place.types.includes(event.target.value)));
      setPlacesList([...filteredPlaces].splice(page*10, 10));
    }
  };

  function handleClick(place) {
      setSelectedplace(place);
  }

  function handleClickClose() {
      setSelectedplace({});
  }

  function placeInfo(place) {
    // ALL THIS TO BE REPLACED WITH SPARQL QUERIES
    return place.formatted_address
  }
  return (
    <div className="App">
      <div style={{width:'25vw', height:'90vh'}}>
        <Paper>
          <div className='list-header'>
            <h1>Restaurants</h1>
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
      <div style={{width:'75vw', height:'100vh'}}>
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
                    latitude={place.geometry.location.lat}
                    longitude={place.geometry.location.lng}
                  >
                  <p
                  role='img'
                  onClick={() => handleClick(place)}
                  className="cursor-pointer text-2xl animate-bounce"
                  aria-label='push-pin'
                  >📍</p>
                  </Marker>
                  { selectedplace.place_id === place.place_id ? (
                    console.log(selectedplace.place_id === place.place_id),
                    <Popup
                      latitude={place.geometry.location.lat}
                      longitude={place.geometry.location.lng}
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
      </div>
    </div>
  );
}

export default App;
