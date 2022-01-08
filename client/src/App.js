import { useEffect, useState, useRef, useCallback } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import { Room, Star } from '@mui/icons-material';
import "./app.css";
import { Card, CardContent, Grid, FormControl, TextField } from '@mui/material';
import axios from 'axios';
import Geocoder from 'react-map-gl-geocoder';
import {format} from 'timeago.js';
import Register from "./components/Register";
import Login from "./components/Login";
import ReactPaginate from 'react-paginate'
import 'mapbox-gl/dist/mapbox-gl.css';
import 'react-map-gl-geocoder/dist/mapbox-gl-geocoder.css';

// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

function App() {
  const myStorage = window.localStorage;
  const [currentUser, setCurrentUser]= useState(null);
  const [pins, setPins] = useState([]);
  const [currentPlaceId, setCurrentPlaceId] = useState(null);
  const [newPlace, setNewPlace] = useState(null);
  const [title, setTitle] = useState(0);
  const [type, setType]= useState(null);
  const [desc, setDesc] = useState(null);
  const [rating, setRating] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRegister, setShowRegister] = useState(0);
  const [showLogin, setShowLogin] = useState(0);

  // Start pagination code here
  const [offset, setOffset] = useState(0)
  const [perPage] = useState(6)
  const [pageCount, setPageCount] = useState(0)

  const [viewport, setViewport] = useState({
    width: "100vw",
    height: "100vh",
    latitude: 38.7577,
    longitude: -100.4376,
    zoom: 4
  });

  const getPins = async () => {
    try{
      const res = await axios.get("/pins");
      const pinData = res.data;
      const slice = pinData.slice(offset, offset + perPage)    
      const slicedData = slice.map(p => p)
      setPins(slicedData)  
      setPageCount(Math.ceil(pinData.length / perPage))
    } catch(err){
      console.log(err)
    }
  }

  const handlePageClick = (e) => {
    const selectedPage = e.selected;
    setOffset(selectedPage + 1)
  }

  useEffect(() => {
    getPins()
  }, [offset]);
  

  const handleMarkerClick = (id, lat, long) => {
    setCurrentPlaceId(id);
    setViewport({...viewport, latitude:lat, longitude:long })
  };

  const handleAddClick = (e) => {
    const [long, lat] = e.lngLat;
    setNewPlace({ 
      lat,
      long,
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPin = {
      username: currentUser,
      title,
      type,
      desc,
      rating,
      lat:newPlace.lat,
      long:newPlace.long,
    }
      console.log(newPin);
    try {

      const res = await axios.post("/pins", newPin);
      setPins([...pins, res.data]);
      setNewPlace(null);

    } catch(error) {
      console.log(error.response.data)
    }
  };



  const handleLogout = () => {
    myStorage.removeItem("user");
    setCurrentUser(null);
  }

  
  const mapRef = useRef();

  const handleViewportChange = useCallback(
    (newViewport) => setViewport(newViewport),
    []
  );


  const handleGeocoderViewportChange = useCallback(
    (newViewport) => {
      const geocoderDefaultOverrides = { transitionDuration: 1000 };

      return handleViewportChange({
        ...newViewport,
        ...geocoderDefaultOverrides
      });
    },
    [handleViewportChange]
  );

  


  return (
    <div className="App"> 
     <ReactMapGL
     ref={mapRef}
      {...viewport}
      mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
      onViewportChange={handleViewportChange}
      mapStyle="mapbox://styles/mkelly88/ckurusax60ulq17pegezb8srk"
      onDblClick = {handleAddClick}
      transitionDuration= "100"
      >
        
        <Geocoder className="mapboxgl-ctrl-geocoder"
        mapRef={mapRef}
        onViewportChange={handleGeocoderViewportChange}
        mapboxApiAccessToken={process.env.REACT_APP_MAPBOX}
        position="top-left"
      />

        {pins.map((p) => (
        <>
        <Marker 
          latitude={p.lat} 
          longitude={p.long}
          offsetLeft={-viewport.zoom * 3.5} 
          offsetTop={-viewport.zoom * 7}>

        <Room 
          style={{fontSize:viewport.zoom * 7, color: p.username === currentUser ?"dodgerblue" : "tomato", cursor: "pointer" }} 
          onClick={() => handleMarkerClick(p._id, p.lat, p.long)}
        />

        </Marker>

          {p._id === currentPlaceId && (

        <Popup
          latitude={p.lat}
          longitude={p.long}
          closeButton={true}
          closeOnClick={false}
          offsetleft={-20}
          onClose={()=>setCurrentPlaceId(null)} 
          >
          <div className="card">
            <label>Place</label>
            <h4 className="place">{p.title}</h4>
            <label>Type</label>
            <p classname="type">{p.type}</p>
            <label>Review</label>
            <p className="desc">{p.desc}</p>
            <label>Rating</label>
            <div className="stars">
              {Array(p.rating).fill(<Star className="star" />)}
            </div>
            <label>Information</label>
            <span className="username">Created by <b>{p.username}</b></span>
            <span className="date">{format(p.createdAt)}</span>
          </div>
      </Popup> 
          )}
       </>
    ))}
    {newPlace && (
    <Popup
          latitude={newPlace.lat}
          longitude={newPlace.long}
          closeButton={true}
          closeOnClick={false}
          offsetleft={-20}
          onClose={()=> setNewPlace(null)} 
          >
            <div>
              <form onSubmit= {handleSubmit} method="POST" action="/upload" enctype="multipart/form-data">
                <label>Title</label>
                <input placeholder="Enter a title" 
                      onChange={(e) => setTitle(e.target.value)}/>
                <label>Type</label>
                <select placeholder="Choose Type" onChange={(e) => setType(e.target.value)}>
                  <option value="place">Place</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="museum">Museum</option>
                </select>
                <label>Review</label>
                <textarea 
                      placeholder="Say something about this place"
                      onChange={(e) => setDesc(e.target.value)} />
                <label>Rating</label>
                <select onChange={(e) => setRating(e.target.value)}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
                <button className="submitButton" type="submit">Add Pin</button>
              </form>
            </div>
          </Popup>
    )}

  {currentUser ? (
          <button className="button logout" onClick={handleLogout}>
            Log out
          </button>
        ) : (
          <div className="buttons">
            <button className="button login" onClick={() => setShowLogin(true)}>
              Log in
            </button>
            <button
              className="button register" onClick={() => setShowRegister(true)}
            >
              Register
            </button>
          </div>
        )}
        {showRegister && <Register setShowRegister={setShowRegister} />}
        {showLogin && <Login setShowLogin={setShowLogin} setCurrentUsername={setCurrentUser} myStorage={myStorage} />}
    </ReactMapGL>

    <div className="logoMain">
        <Room className="logoIcon" />
        <span>Travel Log</span>
      </div>
    <div className="description">
      <h1>Welcome to travel log! Were happy you're here.</h1>
      <p>Travel log is an interactive map where you can search locations and pin destinations you have been to share with your friends. From Disneyland to Spain we want you to share all you memories and be able to look back and remember all your fun times. All you have to do is register an account, sign in and you are ready to share your travel experiences with others. Happy travels!</p>
    </div>

    <FormControl fullWidth>
      <TextField id="outlined-basic" label="Search here" variant="outlined" onChange={event => {setSearchTerm(event.target.value)}} />
    </FormControl>
      
  
      {pins.filter((val) => {
        if (searchTerm === "") {
          return val
        } else if (val.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          return val
        }
      }).map((p) => (
        <Grid className="cardsGrid">
          <Card className="travelCards">
            <CardContent>
              <Grid className="cardGrid">
              <div className="cardLow">
                <h4 className="placeLow">{p.title}</h4>
                <div className="starsLow">
                  {Array(p.rating).fill(<Star className="star" />)}
                </div>
                <p className="descLow">{p.desc}</p>
               </div>
               <div><span className="usernameLow">Created by <b>{p.username}</b></span></div>
                  <span className="dateLow">{format(p.createdAt)}</span>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      ))}
      <div style={{ display: 'flex', justifyContent: 'center '}}>
      <ReactPaginate
        breakLabel="..."
        nextLabel="Next"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="Previous"
        containerClassName="pagination"
        renderOnZeroPageCount={null}
      />
      </div>
      </div>

  
  );
}

export default App;
