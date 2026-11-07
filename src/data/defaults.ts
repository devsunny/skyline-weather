import type { Place, Settings } from '../types';

export const DEFAULT_SETTINGS: Settings = {
  units: 'imperial',
};

export const DEFAULT_PLACES: Place[] = [
  {
    id: 'default:new-york',
    name: 'New York',
    region: 'NY',
    latitude: 40.7128,
    longitude: -74.006,
    source: 'default',
  },
];

export const EXPLORE_PLACES: Place[] = [
  { id: 'explore:new-york', name: 'New York', region: 'NY', latitude: 40.7128, longitude: -74.006, source: 'default' },
  { id: 'explore:los-angeles', name: 'Los Angeles', region: 'CA', latitude: 34.0522, longitude: -118.2437, source: 'default' },
  { id: 'explore:chicago', name: 'Chicago', region: 'IL', latitude: 41.8781, longitude: -87.6298, source: 'default' },
  { id: 'explore:austin', name: 'Austin', region: 'TX', latitude: 30.2672, longitude: -97.7431, source: 'default' },
  { id: 'explore:seattle', name: 'Seattle', region: 'WA', latitude: 47.6062, longitude: -122.3321, source: 'default' },
  { id: 'explore:denver', name: 'Denver', region: 'CO', latitude: 39.7392, longitude: -104.9903, source: 'default' },
  { id: 'explore:miami', name: 'Miami', region: 'FL', latitude: 25.7617, longitude: -80.1918, source: 'default' },
  { id: 'explore:san-francisco', name: 'San Francisco', region: 'CA', latitude: 37.7749, longitude: -122.4194, source: 'default' },
];

export const CURRENT_LOCATION_PLACE: Place = {
  id: 'current-location',
  name: 'Current location',
  region: '',
  latitude: 40.7128,
  longitude: -74.006,
  source: 'gps',
};
