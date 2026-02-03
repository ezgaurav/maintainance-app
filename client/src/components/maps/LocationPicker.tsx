import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  initialPosition?: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  height?: string;
}

const MapClickHandler: React.FC<{
  onLocationSelect: (lat: number, lng: number) => void;
  setPosition: (pos: LatLng) => void;
}> = ({ onLocationSelect, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  initialPosition = [20.5937, 78.9629], // India center
  onLocationSelect,
  height = '400px',
}) => {
  const [position, setPosition] = useState<LatLng>(
    new LatLng(initialPosition[0], initialPosition[1])
  );

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={initialPosition}
        zoom={13}
        style={{ height, width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position} />
        <MapClickHandler
          onLocationSelect={onLocationSelect}
          setPosition={setPosition}
        />
      </MapContainer>
    </div>
  );
};
