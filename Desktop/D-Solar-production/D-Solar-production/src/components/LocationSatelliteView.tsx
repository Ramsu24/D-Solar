import React, { useState, useEffect } from 'react';

interface LocationSatelliteViewProps {
  lat: number;
  lng: number;
  zoom?: number;
  width?: number;
  height?: number;
  title?: string;
  isEmail?: boolean;
}

const LocationSatelliteView: React.FC<LocationSatelliteViewProps> = ({
  lat,
  lng,
  zoom = 100,
  width = 600,
  height = 400,
  title = 'Satellite View of Selected Location',
  isEmail = false
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState(false);
  
  // Generate ESRI World Imagery URL (high-resolution satellite)
  const getEsriSatelliteUrl = () => {
    // Using wider offset for better visibility
    const offset =  0.0006; 
    return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=${lng - offset},${lat - offset},${lng + offset},${lat + offset}&bboxSR=4326&size=${width},${height}&imageSR=4326&format=png32&transparent=false&f=image`;
  };
  
  // Generate OpenStreetMap URL using Geoapify
  const getOpenStreetMapUrl = () => {
    return `https://maps.geoapify.com/v1/staticmap?style=satellite_streets&width=${width}&height=${height}&center=lonlat:${lng},${lat}&zoom=19&apiKey=0daf39d4600c41d99b4506aab0742bc9`;
  };

  // Use Mapbox as a third fallback option
  const getMapboxUrl = () => {
    // Note: In production, use environment variables for the API key
    return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},15,0/${width}x${height}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
  };

  // Handle image load error
  const handleImageError = () => {
    console.log("Error loading satellite image, switching to fallback");
    setErrorLoading(true);
  };
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  useEffect(() => {
    // Reset loading state when coordinates change
    setIsLoading(true);
    setErrorLoading(false);
  }, [lat, lng]);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 bg-white shadow-md">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-lg text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}</p>
      </div>
      
      <div className="relative flex items-center justify-center" style={{ height: `${height}px`, width: '100%', maxWidth: '100%' }}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <p className="text-gray-600">Loading map imagery...</p>
          </div>
        )}
        
        {isEmail ? (
          // Use Geoapify for email version - with satellite_streets style for better visibility
          <img 
            src={getOpenStreetMapUrl()}
            alt={`Map view of ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            onLoad={handleImageLoad}
            onError={() => {
              console.log("Error loading Geoapify image, switching to Mapbox");
              setErrorLoading(true);
            }}
          />
        ) : errorLoading ? (
          // If ESRI fails, try Geoapify satellite view as fallback
          <img 
            src={getOpenStreetMapUrl()}
            alt={`Satellite view of ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            onLoad={handleImageLoad}
            onError={() => {
              console.log("Error loading Geoapify fallback, trying Mapbox");
              // We could add another state and fallback to Mapbox here if needed
            }}
          />
        ) : (
          // Use ESRI satellite imagery for solar calculator by default
          <img 
            src={getEsriSatelliteUrl()}
            alt={`Satellite view of ${lat.toFixed(6)}, ${lng.toFixed(6)}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center center' }}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
    </div>
  );
};

export default LocationSatelliteView; 