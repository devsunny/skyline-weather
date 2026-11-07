# Skyline Weather

A polished, native iOS and Android weather app built with **Expo / React Native** and the **National Weather Service (NWS) API**.

Skyline turns the NWS forecast into a focused daily briefing: current conditions, the next 24 hours, a seven-day outlook, active alerts, sun times, and the details that actually change how the day feels.

> Skyline covers the United States and its territories. The NWS does not issue forecasts outside U.S. coverage.

---

## What's in the app

- **Current conditions** from the nearest NWS observation station, with a graceful fallback to the hourly forecast when the station report is stale.
- **24-hour forecast** strip with condition glyphs and precipitation chance.
- **7-day outlook** with high/low temperature range bars.
- **Active NWS alerts** with severity, affected area, expiry, description, and instructions.
- **Sunrise / sunset arc** with live daylight progress.
- **Conditions grid**: wind and gusts, humidity, dew point, pressure, visibility, and last-hour precipitation.
- **Place search** by city/state or 5-digit ZIP, plus saved places and GPS location.
- **Pull to refresh**, automatic 10-minute refresh, and a persistent local cache for offline viewing.
- **°F / mph** or **°C / km/h** units.
- A weather-aware gradient theme that shifts with conditions and day/night.

## Stack

| Layer | Choice |
| --- | --- |
| Runtime | Expo SDK 58, React Native 0.88, React 19 |
| Language | TypeScript |
| Weather | `api.weather.gov` (NOAA / NWS) |
| Geocoding | Zippopotam.us for ZIPs, OpenStreetMap Nominatim for places |
| Location | `expo-location` |
| Storage | `@react-native-async-storage/async-storage` |
| Visuals | `expo-linear-gradient`, `react-native-svg`, custom SVG weather glyphs |
| Type | Sora + Inter |

No API key is required.

## Run it

Requirements: Node 20+, npm, and the Expo Go app on an iOS or Android device (or a simulator).

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `a` / `i` for an emulator.

The NWS API is reachable over HTTPS from phones. Location search and GPS are requested only when you use those features.

### Configure the NWS contact (important)

The NWS asks every API client to identify itself with a real contact in the `User-Agent` header. The app ships with a default:

```bash
# .env.local
EXPO_PUBLIC_NWS_USER_AGENT=SkylineWeather/1.0 (you@example.com)
```

Restart Expo after changing it. In production, use a monitored email address or project URL.

### Build installable binaries

```bash
npx eas build --platform android --profile preview
npx eas build --platform ios --profile preview
```

`eas.json` includes `preview` and `production` profiles. Store identifiers are in `app.json`; change `app.skylineweather.mobile` to your own before submitting.

## How the data flows

```
place (lat/lon)
   │
   ├── GET /points/{lat},{lon}        → forecast URLs, station list, timezone, sun times
   │
   ├── GET /gridpoints/.../forecast    → 7-day periods
   ├── GET /gridpoints/.../forecast/hourly → 24 hours
   ├── GET /stations/{id}/observations/latest → current conditions
   └── GET /alerts/active?point=...    → active watches/warnings/advisories
```

The client keeps canonical units in **°F, mph, inHg, miles, inches** and converts at render time. That keeps the storage/cache model simple and avoids unit drift.

Observation freshness matters: if the nearest station's latest report is more than **90 minutes old**, Skyline uses the first hourly forecast period for current conditions and labels it as a forecast instead of an observation. The footer tells you which source was used.

## Project map

```
App.tsx                       App shell, persisted places/settings, sheet wiring
src/api/nws.ts                NWS client, retries, normalization, freshness logic
src/api/geocode.ts            ZIP + Nominatim place search
src/hooks/useWeather.ts       loading / cache / refresh / auto-refresh state
src/lib/sky.ts                condition classification, palettes, daylight math
src/lib/format.ts             unit + time formatting
src/lib/cache.ts              versioned forecast cache
src/lib/storage.ts            settings, places, active place
src/screens/                  Weather, Search, Settings, Alert sheets
src/weather/                  Hero, hourly, daily, sun arc, details, SVG glyphs
src/ui/                       theme, buttons, sheet headers, boot/loading/error
```

## Scripts

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo dev server |
| `npm run android` | Start with an Android target |
| `npm run ios` | Start with an iOS target |
| `npm run web` | Run the React Native Web build |
| `npm run typecheck` | TypeScript check |
| `npm run export:web` | Build a static web bundle into `dist/` |
| `npm run serve:web` | Serve `dist/` at `http://127.0.0.1:8088` |
| `npm run assets` | Regenerate icon, adaptive icon, splash, and favicon from the SVG source |

## Design notes

- The gradient palette is selected from **condition × day/night**, then crossfaded when the weather changes.
- Weather glyphs are drawn in SVG rather than pulled from the NWS icon set, so they stay crisp and share the app's color language.
- Glass cards use thin white borders and low-opacity fills over the gradient; no bitmap textures or heavy blur, which keeps scrolling smooth on mid-range Android phones.
- Temperature is the visual anchor: oversized Sora, tight letter spacing, and a small unit mark. Details stay quiet until you look for them.
- The layout is capped at 560 points on tablet/web and remains a one-column phone experience.

## Production checklist

- [ ] Replace the default NWS User-Agent with a real contact.
- [ ] Change the iOS bundle identifier and Android package name.
- [ ] Add a privacy policy (coordinates are sent to the NWS and the geocoder; no account or analytics are included).
- [ ] Review Nominatim's usage policy or switch to a self-hosted/paid geocoder before high-volume release.
- [ ] Add push notifications if you want alert delivery while the app is closed; the current build surfaces alerts only when opened/refreshed.
- [ ] Test on a physical iPhone and a low-RAM Android device.

## Attribution

- Weather data: [NOAA / National Weather Service](https://www.weather.gov)
- Place search: [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) via [Nominatim](https://nominatim.org)
- ZIP lookup: [Zippopotam.us](https://api.zippopotam.us)
- Icons: [Lucide](https://lucide.dev)
- Type: [Sora](https://fonts.google.com/specimen/Sora) and [Inter](https://fonts.google.com/specimen/Inter)

Skyline is an independent project and is not endorsed by NOAA or the National Weather Service.
