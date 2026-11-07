export type Units = 'imperial' | 'metric';

export type Settings = {
  units: Units;
};

export type Place = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
  source?: 'default' | 'search' | 'zip' | 'gps';
};

export type SkyCondition =
  | 'clear'
  | 'partly'
  | 'cloudy'
  | 'rain'
  | 'storms'
  | 'snow'
  | 'sleet'
  | 'fog'
  | 'wind';

export type WeatherAlert = {
  id: string;
  event: string;
  headline: string;
  description: string;
  instruction: string;
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown';
  urgency: string;
  certainty: string;
  onset: string | null;
  ends: string | null;
  expires: string | null;
  areaDesc: string;
  senderName: string;
};

export type CurrentConditions = {
  temperatureF: number;
  feelsLikeF: number;
  humidity: number | null;
  dewPointF: number | null;
  windMph: number | null;
  windGustMph: number | null;
  windDirectionDeg: number | null;
  windDirection: string | null;
  pressureInHg: number | null;
  visibilityMi: number | null;
  precipIn: number | null;
  description: string;
  stationName: string;
  observedAt: string;
  isObservation: boolean;
};

export type HourlyPeriod = {
  startTime: string;
  endTime: string;
  temperatureF: number;
  precipProbability: number | null;
  humidity: number | null;
  dewPointF: number | null;
  windMph: number | null;
  windDirection: string;
  shortForecast: string;
  isDaytime: boolean;
  condition: SkyCondition;
};

export type DailyPeriod = {
  startTime: string;
  endTime: string;
  name: string;
  temperatureF: number;
  lowF: number;
  precipProbability: number | null;
  windMph: number | null;
  windDirection: string;
  shortForecast: string;
  isDaytime: boolean;
  condition: SkyCondition;
  detailedForecast: string;
};

export type WeatherBundle = {
  place: Place;
  timeZone: string;
  sunrise: string | null;
  sunset: string | null;
  current: CurrentConditions;
  hourly: HourlyPeriod[];
  daily: DailyPeriod[];
  alerts: WeatherAlert[];
  fetchedAt: string;
  stationName: string;
  radarStation: string | null;
};
