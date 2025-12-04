import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Tooltip, Circle, useMapEvents, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import POIModal from './POIModal';
import type { POI } from '../types/POI';
import { useGeolocation, calculateDistance, formatDistance } from '../hooks/useGeolocation';

// Component to handle map clicks
function MapClickHandler({ onMapClick, clickMode }: { onMapClick?: (lat: number, lng: number) => void, clickMode: 'normal' | 'select-location' }) {
  useMapEvents({
    click: (e) => {
      if (clickMode === 'select-location' && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface MapViewProps {
  pois: POI[];
  onMapClick?: (lat: number, lng: number) => void;
  clickMode?: 'normal' | 'select-location';
  selectedLocation?: { lat: number; lng: number };
  focusedPOIId?: string;
}

// Custom marker icons for each category
const createCustomIcon = (category: string, isActive: boolean = false) => {
  const baseColor = isActive ? '#d4a574' : '#8b7355';
  const size = 36;
  
  // Choose emoji based on category
  let emoji = '⛺'; // Default for Bivouac
  if (category === 'Cabane') {
    emoji = '🛖'; // Hut/Cabin
  } else if (category === 'Refuge') {
    emoji = '🏠'; // House for refuge
  } else if (category === 'Bivouac') {
    emoji = '⛺'; // Tent for bivouac
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${baseColor};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 18px;
          line-height: 1;
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
        ">${emoji}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
};

// Layer definitions
const mapLayers = {
  classic: {
    name: 'Carte classique',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  relief: {
    name: 'Relief',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};

type LayerType = keyof typeof mapLayers;

// Component to handle map focus
function MapFocusHandler({ poi }: { poi: POI | null }) {
  const map = useMapEvents({});
  
  useEffect(() => {
    if (poi) {
      map.setView([poi.coordinates.lat, poi.coordinates.lng], 14, {
        animate: true,
        duration: 1
      });
    }
  }, [poi, map]);
  
  return null;
}

// Component to fly to user location
function FlyToUserLocation({ lat, lng, trigger }: { lat: number; lng: number; trigger: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (trigger > 0) {
      map.flyTo([lat, lng], 12, {
        animate: true,
        duration: 1.5
      });
    }
  }, [trigger, lat, lng, map]);
  
  return null;
}

// User location marker icon - More visible with label
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    ">
      <div style="
        background: #4285f4;
        color: white;
        font-size: 11px;
        font-weight: 600;
        padding: 4px 8px;
        border-radius: 12px;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        margin-bottom: 4px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">📍 Vous</div>
      <div style="
        position: relative;
        width: 18px;
        height: 18px;
      ">
        <div style="
          position: absolute;
          width: 18px;
          height: 18px;
          background: #4285f4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.5);
        "></div>
        <div style="
          position: absolute;
          width: 50px;
          height: 50px;
          background: rgba(66, 133, 244, 0.25);
          border: 2px solid rgba(66, 133, 244, 0.4);
          border-radius: 50%;
          top: -16px;
          left: -16px;
          animation: pulse 2s infinite;
        "></div>
      </div>
    </div>
  `,
  iconSize: [60, 50],
  iconAnchor: [30, 50],
});

function MapView({ pois, onMapClick, clickMode = 'normal', selectedLocation, focusedPOIId }: MapViewProps) {
  const [searchParams] = useSearchParams();
  const [activeLayer, setActiveLayer] = useState<LayerType>('classic');
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [activePOIId, setActivePOIId] = useState<string | null>(null);
  const [layerMenuExpanded, setLayerMenuExpanded] = useState(false);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const layerSelectorRef = useRef<HTMLDivElement>(null);
  const currentLayer = mapLayers[activeLayer];

  // Geolocation
  const { latitude, longitude, loading: geoLoading, error: geoError, requestLocation, isSupported } = useGeolocation();
  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  // Handle locate me button
  const handleLocateMe = () => {
    if (userLocation) {
      setFlyTrigger(prev => prev + 1);
    } else {
      requestLocation();
    }
  };

  // Auto fly when location is obtained for the first time
  useEffect(() => {
    if (userLocation && flyTrigger === 0) {
      setFlyTrigger(1);
    }
  }, [userLocation]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (layerSelectorRef.current && !layerSelectorRef.current.contains(event.target as Node)) {
        setLayerMenuExpanded(false);
      }
    };

    if (layerMenuExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [layerMenuExpanded]);
  
  // Find focused POI
  const focusedPOI = focusedPOIId ? pois.find(p => p.id === focusedPOIId) || null : null;

  // Check for POI parameter in URL
  useEffect(() => {
    const poiId = searchParams.get('poi');
    if (poiId) {
      setActivePOIId(poiId);
      // Don't open modal, just highlight the marker
    }
  }, [searchParams]);

  const handleMarkerClick = (poi: POI) => {
    setSelectedPOI(poi);
    setActivePOIId(poi.id);
  };

  const handleLayerChange = (layerKey: LayerType) => {
    setActiveLayer(layerKey);
    setLayerMenuExpanded(false);
  };

  return (
    <div className="map-wrapper">
      <div className="layer-selector" ref={layerSelectorRef}>
        <button 
          className="layer-toggle-btn"
          onClick={() => setLayerMenuExpanded(!layerMenuExpanded)}
        >
          <span className="layer-icon">
            {activeLayer === 'classic' && '🗺️'}
            {activeLayer === 'relief' && '⛰️'}
            {activeLayer === 'satellite' && '🛰️'}
          </span>
          <span className="layer-name">{currentLayer.name}</span>
          <span className={`layer-arrow ${layerMenuExpanded ? 'open' : ''}`}>▼</span>
        </button>
        {layerMenuExpanded && (
          <div className="layer-dropdown">
            {(Object.keys(mapLayers) as LayerType[]).map((layerKey) => (
              <button
                key={layerKey}
                className={`layer-option ${activeLayer === layerKey ? 'active' : ''}`}
                onClick={() => handleLayerChange(layerKey)}
              >
                <span className="layer-option-icon">
                  {layerKey === 'classic' && '🗺️'}
                  {layerKey === 'relief' && '⛰️'}
                  {layerKey === 'satellite' && '🛰️'}
                </span>
                {mapLayers[layerKey].name}
                {activeLayer === layerKey && <span className="layer-check">✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Geolocation Button */}
      {isSupported && (
        <button
          className={`locate-me-btn ${geoLoading ? 'loading' : ''} ${userLocation ? 'active' : ''}`}
          onClick={handleLocateMe}
          title={userLocation ? 'Centrer sur ma position' : 'Me localiser'}
          disabled={geoLoading}
        >
          {geoLoading ? (
            <span className="locate-spinner"></span>
          ) : (
            <span style={{ fontSize: '24px' }}>🎯</span>
          )}
        </button>
      )}
      {geoError && (
        <div className="geo-error-toast">{geoError}</div>
      )}

      <MapContainer
        center={[45.5, 6.5]}
        zoom={8}
        style={{ height: '100%', width: '100%', cursor: clickMode === 'select-location' ? 'crosshair' : 'grab' }}
      >
        <TileLayer
          key={activeLayer}
          url={currentLayer.url}
          attribution={currentLayer.attribution}
        />

        {/* Map Click Handler */}
        <MapClickHandler onMapClick={onMapClick} clickMode={clickMode} />

        {/* Map Focus Handler */}
        <MapFocusHandler poi={focusedPOI} />

        {/* Fly to user location */}
        {userLocation && (
          <FlyToUserLocation lat={userLocation.lat} lng={userLocation.lng} trigger={flyTrigger} />
        )}

        {/* User Location Marker */}
        {userLocation && (
          <>
            <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                <span>📍 Vous êtes ici</span>
              </Tooltip>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={200}
              pathOptions={{ color: '#4285f4', fillColor: '#4285f4', fillOpacity: 0.08, weight: 2, dashArray: '5, 5' }}
            />
          </>
        )}

        {/* Temporary marker for selected location */}
        {selectedLocation && clickMode === 'select-location' && (
          <Marker
            position={[selectedLocation.lat, selectedLocation.lng]}
            icon={L.divIcon({
              className: 'temp-marker',
              html: `<div style="
                font-size: 32px;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
              ">📍</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 32],
            })}
          />
        )}

        {/* POI Markers with Clustering */}
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {pois.map((poi) => (
            <Marker
              key={poi.id}
              position={[poi.coordinates.lat, poi.coordinates.lng]}
              icon={createCustomIcon(poi.category, activePOIId === poi.id)}
              eventHandlers={{
                click: () => handleMarkerClick(poi),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -20]}
                opacity={1}
                className="custom-tooltip"
              >
                <div className="tooltip-content">
                  <strong>{poi.name}</strong>
                  <span className="tooltip-category">{poi.category}</span>
                  {userLocation && (
                    <span className="tooltip-distance">
                      📍 {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, poi.coordinates.lat, poi.coordinates.lng))}
                    </span>
                  )}
                </div>
              </Tooltip>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>

      {/* POI Modal */}
      {selectedPOI && (
        <POIModal
          poi={selectedPOI}
          onClose={() => {
            setSelectedPOI(null);
            setActivePOIId(null);
          }}
        />
      )}
    </div>
  );
}

export default MapView;
