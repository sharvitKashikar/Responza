import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';
import L from 'leaflet';
import { Resource, ResourceStatus } from '../../types/resource.types';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Maharashtra boundaries (approximately)
const MAHARASHTRA_BOUNDS = {
  minLat: 15.6,
  maxLat: 22.1,
  minLng: 72.6,
  maxLng: 80.9,
};

const MAHARASHTRA_CENTER: [number, number] = [19.7515, 75.7139];
const DEFAULT_ZOOM = 7;
const MIN_ZOOM = 7;
const MAX_ZOOM = 18;

interface MapProps {
  resources: Resource[];
  center?: [number, number];
  zoom?: number;
  focusAvailable?: boolean;
}

// Component to handle map updates
const MapUpdater: React.FC<{ center: [number, number]; resources: Resource[]; focusAvailable?: boolean }> = ({ center, resources, focusAvailable }) => {
  const map = useMap();
  
  useEffect(() => {
    if (focusAvailable) {
      const availableResources = resources.filter(r => r.status === 'available');
      if (availableResources.length > 0) {
        const bounds = L.latLngBounds(
          availableResources.map(r => [r.location.latitude, r.location.longitude])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    } else {
      map.setView(center, DEFAULT_ZOOM);
    }
  }, [center, map, resources, focusAvailable]);

  return null;
};

const getStatusColor = (status: ResourceStatus): string => {
  switch (status) {
    case 'available':
      return '#10B981'; // emerald-500
    case 'in_use':
      return '#EF4444'; // red-500
    case 'maintenance':
      return '#F59E0B'; // amber-500
    case 'offline':
      return '#6B7280'; // gray-500
    default:
      return '#6B7280';
  }
};

const getStatusText = (status: ResourceStatus): string => {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const createCustomIcon = (status: ResourceStatus, isHovered: boolean) => {
  const size = isHovered ? 32 : 24;
  const color = getStatusColor(status);
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        ${isHovered ? 'transform: scale(1.1);' : ''}
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

export const MapComponent: React.FC<MapProps> = ({ 
  resources, 
  center = MAHARASHTRA_CENTER,
  zoom = DEFAULT_ZOOM,
  focusAvailable = false
}) => {
  const [hoveredResource, setHoveredResource] = useState<Resource | null>(null);

  return (
    <div className="w-full h-[calc(100vh-12rem)] rounded-xl overflow-hidden relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
      >
        <MapUpdater center={center} resources={resources} focusAvailable={focusAvailable} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {resources.map((resource) => (
          <Marker
            key={resource.id}
            position={[resource.location.latitude, resource.location.longitude]}
            icon={createCustomIcon(resource.status, hoveredResource?.id === resource.id)}
            eventHandlers={{
              mouseover: () => setHoveredResource(resource),
              mouseout: () => setHoveredResource(null),
            }}
          >
            <Popup>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{resource.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    resource.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                    resource.status === 'in_use' ? 'bg-red-100 text-red-800' :
                    resource.status === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(resource.status)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700">
                    <span className="font-medium">Type:</span> {' '}
                    {resource.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Location:</span> {' '}
                    {resource.location.address || 'No address provided'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Last Updated:</span> {' '}
                    {new Date(resource.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent; 