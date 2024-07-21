import React, { useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const Map = ({ center, locations }) => {
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Ensure center coordinates are valid numbers
  const validCenter =
    center.latitude &&
    center.longitude &&
    !isNaN(center.latitude) &&
    !isNaN(center.longitude)
      ? { lat: parseFloat(center.latitude), lng: parseFloat(center.longitude) }
      : { lat: 0, lng: 0 };

  const handleMarkerClick = (location) => {
    setSelectedMarker(location);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyDKccCQu_eTjIyezr1sDfhbQyele72XOUk">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={validCenter}
        zoom={12}
        options={{
          zoomControl: true,
          draggable: true,
          disableDefaultUI: true,
          clickableIcons: false,
        }}
      >
        {locations.map((location, index) => {
          // Ensure location coordinates are valid numbers
          const validLocation =
            location.latitude &&
            location.longitude &&
            !isNaN(location.latitude) &&
            !isNaN(location.longitude)
              ? {
                  lat: parseFloat(location.latitude),
                  lng: parseFloat(location.longitude),
                }
              : null;

          return validLocation ? (
            <Marker
              key={index}
              position={validLocation}
              onClick={() => handleMarkerClick(location)}
            />
          ) : null;
        })}

        {selectedMarker && (
          <InfoWindow
            position={{
              lat: parseFloat(selectedMarker.latitude),
              lng: parseFloat(selectedMarker.longitude),
            }}
            onCloseClick={() => setSelectedMarker(null)}
          >
            <div style={{ padding: "10px", fontSize: "14px" }}>
              <strong>{selectedMarker.name}</strong>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
