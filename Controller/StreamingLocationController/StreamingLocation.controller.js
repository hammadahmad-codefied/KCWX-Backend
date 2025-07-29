const StreamingLocation = require("../../Model/StreamingLocationModel.js");
const GlobalGeofencing = require("../../Model/GlobalGeofencingModel.js");
const { default: axios } = require("axios");
const Connect = require("../../database/connection.js");

// Call the Google Maps API to get the county for the received coordinates
const googleMapsApiKey =
  process.env.GOOGLE_MAPS_API_KEY || "AIzaSyBoW0cxiNulBiXnBTbgYiBqrKHoKbVL02g";

// Create a new StreamingLocation
const addStreamingLocation = async (req, res) => {
  try {
    await Connect();
    const streamingLocation = new StreamingLocation(req.body);
    await streamingLocation.save();
    res.status(201).json(streamingLocation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all StreamingLocations
const getAllStreamingLocations = async (req, res) => {
  try {
    await Connect();
    const streamingLocation = await StreamingLocation.find().sort({ updatedAt: -1 });
    res.json({ data: streamingLocation, total: streamingLocation.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get a specific StreamingLocation
const getStreamingLocation = async (req, res) => {
  try {
    await Connect();
    const streamingLocation = await StreamingLocation.findById(req.params.id);
    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }
    res.json(streamingLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a StreamingLocation
const updateStreamingLocation = async (req, res) => {
  try {
    await Connect();
    const streamingLocation = await StreamingLocation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );
    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }
    res.json(streamingLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove a StreamingLocation
const removeStreamingLocation = async (req, res) => {
  try {
    await Connect();
    const streamingLocation = await StreamingLocation.findByIdAndDelete(
      req.params.id
    );
    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update isAllowed value for a specific StreamingLocation
const updateStreamingLocationStatus = async (req, res) => {
  try {
    await Connect();
    const streamingLocationId = req.params.id;
    const isAllowed = req.body.isAllowed;

    const streamingLocation = await StreamingLocation.findByIdAndUpdate(
      streamingLocationId,
      { isAllowed },
      { new: true }
    );

    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }

    res.json(streamingLocation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkStreamingAccess = async (req, res) => {
  try {
    await Connect();
    const { lat, lng } = req.params;

    const globalGeofencing = await GlobalGeofencing.findOne({
      _id: "648cc66de5953f48377d637a",
    });
    const streamingLocation = await StreamingLocation.findOne({ lat, lng });

    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }

    if (globalGeofencing) {
      res.json({
        _id: streamingLocation?._id,
        lat: streamingLocation?.lat,
        lng: streamingLocation?.lng,
        isAllowed: streamingLocation?.isAllowed,
        createdAt: streamingLocation?.createdAt,
        updatedAt: streamingLocation?.updatedAt,
        isGeofenceEnabled: globalGeofencing?.isGeofenceEnabled,
      });
    } else {
      res.json(streamingLocation);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update isAllowed value by lat and lng
const updateStreamAccess = async (req, res) => {
  try {
    await Connect();
    const { lat, lng } = req.params;
    const { isAllowed } = req.body;

    const streamingLocation = await StreamingLocation.findOneAndUpdate(
      { lat, lng },
      { isAllowed: isAllowed },
      { new: true }
    );

    if (!streamingLocation) {
      return res.status(404).json({ error: "Streaming location not found" });
    }

    res.json({ streamingLocation, success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const checkStreamingAccessInRadius = async (req, res, next) => {
  const { lat, lng } = req.params; // using lat and lng to receive county name

  try {
    await Connect();

    const globalGeofencing = await GlobalGeofencing.findOne({
      _id: "648cc66de5953f48377d637a",
    });

    const countyName = lat || lng; // assuming lat and lng contain the same county name

    const streamingLocation = await StreamingLocation.findOne({
      county: new RegExp(`^${countyName}$`, 'i'),
    });

    // Prepare the response object
    const response = {
      lat: countyName,
      lng: countyName,
      isAllowed: false,
      isGeofenceEnabled: globalGeofencing?.isGeofenceEnabled || false,
    };

    if (streamingLocation && streamingLocation.isAllowed) {
      response.isAllowed = true;
    }

    if (globalGeofencing.isGeofenceEnabled == false) {
      response.isAllowed = true;
      response.isGeofenceEnabled = true;
    }

    res.status(200).json(response);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      error: "An error occurred while processing the request",
    });
  }
};

// const axios = require('axios');

const checkStreamingAccessInRadiusLatLng = async (req, res, next) => {
  const { lat, lng } = req.params; // Latitude and longitude received from the app
  const apiKey = "AIzaSyBoW0cxiNulBiXnBTbgYiBqrKHoKbVL02g"; // Add your Google Maps API key here

  try {
    await Connect();

    // Use the Google Maps API to get the county name
    const googleMapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
    const googleMapsResponse = await axios.get(googleMapsUrl);

    let countyName = null;
    const results = googleMapsResponse.data.results;

    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      for (const component of addressComponents) {
        if (component.types.includes('administrative_area_level_2')) {
          countyName = component.long_name;
          break;
        }
      }
    }

    if (!countyName) {
      return res.status(400).json({
        error: "Could not retrieve county name from the given latitude and longitude",
      });
    }

    // Clean the county name by removing " county"
    const cleanedCountyName = countyName.replace(/ county/i, '');

    const globalGeofencing = await GlobalGeofencing.findOne({
      _id: "648cc66de5953f48377d637a",
    });

    const streamingLocation = await StreamingLocation.findOne({
      county: new RegExp(`^${cleanedCountyName}$`, 'i'),
    });

    // Prepare the response object
    const response = {
      lat,
      lng,
      county: cleanedCountyName,
      isAllowed: false,
      isGeofenceEnabled: globalGeofencing?.isGeofenceEnabled || false,
    };

    if (streamingLocation && streamingLocation.isAllowed) {
      response.isAllowed = true;
    }

    if (globalGeofencing.isGeofenceEnabled == false) {
      response.isAllowed = true;
      response.isGeofenceEnabled = true;
    }

    

    res.status(200).json(response);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      error: "An error occurred while processing the request",
    });
  }
};

const checkInRegion = async (req, res, next) => {
  const { lat, lng, device } = req.query; // Get lat, lng, and device from query parameters
  const apiKey = "AIzaSyBoW0cxiNulBiXnBTbgYiBqrKHoKbVL02g"; // Google Maps API key
  

  if (device === "TizenTV" || device === "tizenTv") {
    //deviceName	String	"iOS"	
    // response.isAllowed = true;
    // response.isGeofenceEnabled = true;
    return res.status(200).json({
      isAllowed: true,
      isGeofenceEnabled: true,
    });
  }

  //add roku device
  if (device === "RokuTV") {
    return res.status(200).json({
      isAllowed: true,
      isGeofenceEnabled: true,
      isProgramEnabled: true,
      message: "This program is not available at this time",
      
    });
  }

  await Connect();

  
  const globalGeofencing = await GlobalGeofencing.findOne({
    _id: "648cc66de5953f48377d637a",
  });

  if (!globalGeofencing) {
    return res.status(404).json({ error: "Global geofencing not found" });
  }

  // globalGeofencing.isGeofenceEnabled = false;
  // globalGeofencing.isProgramEnabled = false;

  // if (globalGeofencing.isProgramEnabled == true) {
  //   return res.status(200).json({
  //     isAllowed: true,
  //     isProgramEnabled: true,
  //   });
  // }

  if (globalGeofencing.isGeofenceEnabled == false) {

    

    var isProgramEnabled = globalGeofencing?.isProgramEnabled || false;

    var textMessage = globalGeofencing?.message || "";

    return res.status(200).json({
      isAllowed: true,
      isGeofenceEnabled: true,
      isProgramEnabled : isProgramEnabled,
      message : textMessage

    });
  }

  //if is Run on local machine


  // const clientIp = "36.50.12.236";
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  console.log(clientIp)
  try {
   
    // If lat and lng are not provided or lat/lng is null, get the location from the IP
    
    let latitude = lat, longitude = lng;
    if (!latitude || !longitude || latitude === "null" || longitude === "null") {
      const ipInfoUrl = `https://ipinfo.io/${clientIp}/json`;
      const ipInfoResponse = await axios.get(ipInfoUrl);
      const loc = ipInfoResponse.data.loc;
    
      if (loc) {
        [latitude, longitude] = loc.split(',');
      } else {
        return res.status(400).json({ error: "Could not retrieve location from IP" });
      }
    }

    if (device === "iOS") {
      const ipInfoUrl = `https://ipinfo.io/${clientIp}/json`;
      const ipInfoResponse = await axios.get(ipInfoUrl);
      const loc = ipInfoResponse.data.loc;
    
      if (loc) {
        [latitude, longitude] = loc.split(',');
      } else {
        return res.status(400).json({ error: "Could not retrieve location from IP" });
      }
    }

    // Process the latitude and longitude as needed
    const googleMapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`;
    const googleMapsResponse = await axios.get(googleMapsUrl,{
      //timeout will be 30 seconds
      timeout: 30000
    });

    let countyName = null;
    const results = googleMapsResponse.data.results;

    if (results.length > 0) {
      const addressComponents = results[0].address_components;
      for (const component of addressComponents) {
        if (component.types.includes('administrative_area_level_2')) {
          countyName = component.long_name;
          break;
        } else if (component.types.includes('administrative_area_level_1')) {
          countyName = component.long_name;
          break;
        } else if (component.types.includes('administrative_area_level_3')) {
          countyName = component.long_name;
          break;
        }

        
      }
    }

  

    if (!countyName) {
      return res.status(200).json({
        isAllowed: false,
        isGeofenceEnabled: false,
      });
      // return res.status(400).json({
      //   error: "Could not retrieve county name from the given latitude and longitude",
      // });
    }

    // Clean the county name by removing " county"
    const cleanedCountyName = countyName.replace(/ county/i, '');

    

    const streamingLocation = await StreamingLocation.findOne({
      county: new RegExp(`^${cleanedCountyName}$`, 'i'),
    });

    var isProgramEnabled = globalGeofencing?.isProgramEnabled || false;
    var isGeofenceEnabled =  globalGeofencing?.isGeofenceEnabled || false;

    var isProgramEnabledTest = globalGeofencing?.isProgramEnabledTest || false;
    var isGeofenceEnabledTest = globalGeofencing?.isGeofenceEnabledTest || false;

    var message = globalGeofencing?.message || "";

    // Prepare the response object
    const response = {
      lat : latitude,
      lng : longitude,
      county: cleanedCountyName,
      ip: clientIp,  // Include the IP in the response
      isAllowed: false,
      isProgramEnabled : isProgramEnabled,
      isGeofenceEnabled: isGeofenceEnabled,
      isProgramEnabledTest : isProgramEnabledTest,
      isGeofenceEnabledTest : isGeofenceEnabledTest,
      message: message,
      //if Program is disabled then the message would be "Program is not available in your area." 
      //if Geofence is disabled then the message would be "Streaming not available in your area"

      
    };

    if (streamingLocation && streamingLocation.isAllowed) {
      response.isAllowed = true;
    }

    if (isGeofenceEnabled == false) {
      response.isAllowed = true;
      response.isGeofenceEnabled = true;
    }

    

    // response.message = ""

    if (response.isAllowed == false || isProgramEnabled == false) {
      if (isProgramEnabled == false) {
        // response.message = "This program is not available at this time";
      } else if (response.isAllowed == false) {
        response.message = "Streaming not available in your area";
      }
    }

    //if device is iOSTest then condition is based on isGeofenceEnabledTest
    if (device === "iOSTest") {
      if (isGeofenceEnabledTest == false) {
        response.isAllowed = true;
        // response.isGeofenceEnabled = true;
      }
    }


    res.status(200).json(response);
  } catch (error) {
    console.log('error', error);
    res.status(500).json({
      error: "An error occurred while processing the request",
    });
  }
};

// Helper function to calculate the distance between two points using the Haversine formula
function getDistance(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
    Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c * 1000; // Convert to meters

  return distance;
}

// Helper function to convert degrees to radians
function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

const truncateLocations = async (req, res) => {
  try {
    await Connect();
    await StreamingLocation.deleteMany({});
    res.json({ message: "All data deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while truncating the model" });
  }
};

const insertAllLocations = async (req, res) => {
  try {
    await Connect();
    const data = req.body; // Assuming the data is sent in the request body as an array
    const insertedData = await StreamingLocation.insertMany(data);
    res.json({ insertedData });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "An error occurred while inserting data" });
  }
};

module.exports = {
  addStreamingLocation,
  getAllStreamingLocations,
  getStreamingLocation,
  updateStreamingLocation,
  removeStreamingLocation,
  updateStreamingLocationStatus,
  checkStreamingAccess,
  updateStreamAccess,
  checkStreamingAccessInRadius,
  checkStreamingAccessInRadiusLatLng,
  checkInRegion,
  truncateLocations,
  insertAllLocations,
};
