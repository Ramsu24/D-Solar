import { NextRequest, NextResponse } from 'next/server';

// Windy API key
const WINDY_API_KEY = 'TrHsIqNSJPwr8sIYjkii7AVOQbqwjCAl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { lat, lon } = body;

    // Validate coordinates
    if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
      return NextResponse.json(
        { error: 'Invalid coordinates. Latitude and longitude must be valid numbers.' },
        { status: 400 }
      );
    }

    console.log(`Fetching weather data for coordinates: lat=${lat}, lon=${lon}`);

    // Call the Windy Point Forecast API
    const response = await fetch('https://api.windy.com/api/point-forecast/v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        lat: Number(lat),
        lon: Number(lon),
        model: 'gfs',
        parameters: [
          'temp',     // Temperature
          'rh',       // Relative humidity
          'wind',     // Wind (this is the correct parameter name according to docs)
          'lclouds',  // Low clouds
          'mclouds',  // Mid clouds
          'hclouds',  // High clouds
          'pressure', // Air pressure
          'precip',   // Precipitation
          'dewpoint', // Dew point
          'windGust', // Wind gusts
          'ptype'     // Precipitation type
        ],
        levels: ['surface'],
        key: WINDY_API_KEY,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Windy API Error:', errorData);
      
      // Return more detailed error information
      return NextResponse.json(
        { 
          error: 'Failed to fetch weather data from Windy API',
          status: response.status,
          statusText: response.statusText,
          details: errorData
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred while fetching weather data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 