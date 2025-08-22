# PVGIS API Integration

This documentation explains how we've integrated the European Commission's PVGIS (Photovoltaic Geographical Information System) API into our Solar Calculator to provide accurate monthly solar radiation data.

## Overview

The integration fetches monthly solar radiation data from the PVGIS API and visualizes it in a chart to help users understand the solar potential of their location throughout the year. We use real data from the official API, providing location-specific solar radiation information.

## Components

1. **PVGIS API Service** (`src/utils/pvgisService.ts`):
   - Handles API calls to the PVGIS service through multiple CORS proxies with a fallback mechanism
   - Fetches and processes actual solar radiation data from the European Commission's database
   - Handles various data formats that might be returned by the API

2. **Radiation Chart Component** (`src/components/RadiationChart.tsx`):
   - Visualizes monthly radiation data using an enhanced bar chart with gradient colors
   - Shows detailed statistics like highest/lowest months and annual average
   - Includes a reference line for average values and detailed custom tooltips
   - Highlights seasonal variations with color intensity

3. **Integration in Solar Calculator** (`src/components/SolarCalculator.tsx`):
   - Fetches PVGIS data when the user selects a location
   - Updates the UI with the retrieved data
   - Displays the radiation chart alongside other solar potential metrics
   - Includes fallback to simulated data for development and testing

## CORS Handling

The PVGIS API doesn't include CORS headers in its responses, which prevents direct browser access. To solve this, we implement a multiple CORS proxy strategy:

```typescript
// List of CORS proxies - we try them in order until one works
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://proxy.cors.sh/',
  'https://cors-proxy.htmldriven.com/?url='
];
```

Our implementation:
1. Attempts each proxy in sequence until one succeeds
2. Handles different proxy response formats
3. Adds specific headers required by certain proxies
4. Provides detailed error messages if all proxies fail
5. Includes robust error handling and parsing for different response formats

This approach ensures our application can reliably access PVGIS data even if some proxy services are unavailable.

## PVGIS API Endpoints Used

We're using the MRcalc (Monthly Radiation Calculator) endpoint from PVGIS API v5.3:
```
https://re.jrc.ec.europa.eu/api/v5_3/MRcalc?lat={latitude}&lon={longitude}&horirrad=1&outputformat=json&angle=0&aspect=0
```

Parameters:
- `lat` & `lon`: User's selected location coordinates
- `horirrad=1`: Request horizontal radiation data
- `outputformat=json`: Return data in JSON format
- `angle=0`: Set panel inclination to horizontal (0 degrees)
- `aspect=0`: Set panel orientation to south (0 degrees)

## Data Processing

The API returns a complex data structure with radiation values spanning multiple years. Our service:

1. Extracts monthly radiation data from the monthly array in the response
2. Handles different field naming conventions in the API response:
   ```typescript
   // The API can return different field names for radiation values:
   // - H(h)_m: Horizontal radiation for month (most common)
   // - H_m: Alternative field name in some API versions
   // - H object: Some versions might return an object with angle as keys
   ```
3. Calculates averages for each month across all available years
4. Processes the annual radiation total (from totals.fixed.I_y, totals.fixed.H_y, or by summing monthly values)
5. Calculates daily peak sun hours
6. Provides fallback to simulated data in development environments

## Data Visualization

The monthly radiation data is visualized in an enhanced bar chart that shows:
- Solar radiation value for each month of the year with gradient colors based on intensity
- A reference line indicating the annual average
- Clear visual distinction between high and low radiation months
- Visual highlighting of the highest and lowest months
- Detailed statistics showing highest and lowest months and averages
- Custom tooltips with contextual information

## Error Handling

The implementation includes robust error handling:
1. Provides user feedback during data loading
2. Shows error messages if data retrieval fails
3. Validates response data and adapts to different API response formats
4. Logs detailed information for debugging purposes
5. Implements a fallback mechanism if one proxy fails
6. Falls back to simulated data in development environments when API requests fail

## Reference

For more information about the PVGIS API, refer to the official documentation:
[PVGIS API Documentation](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en) 