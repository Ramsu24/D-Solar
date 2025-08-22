// Interface for monthly radiation data from PVGIS
export interface PVGISMonthlyRadiationData {
  month: string;
  radiation: number; // Monthly radiation in kWh/m²
}

// Interface for the complete PVGIS response
export interface PVGISResponse {
  inputs: any;
  outputs: {
    monthly: any[];
    totals?: {
      fixed?: {
        E_y?: number; // Annual energy production in kWh
        I_y?: number; // Annual in-plane irradiation in kWh/m²
        H_y?: number; // Annual horizontal irradiation in kWh/m²
      };
    };
  };
  meta: any;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

// List of CORS proxies - we'll try them in order until one works
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/',
  'https://api.allorigins.win/raw?url=',
  'https://proxy.cors.sh/',
  'https://cors-proxy.htmldriven.com/?url='
];

/**
 * Fetches monthly radiation data from PVGIS API
 * @param lat Latitude
 * @param lng Longitude
 * @returns Monthly radiation data and annual totals
 */
export const fetchPVGISMonthlyRadiation = async (lat: number, lng: number) => {
  try {
    console.log('Fetching PVGIS data for location:', { lat, lng });
    
    // Build the PVGIS API URL - use MRcalc for monthly radiation data
    // Fixed parameters for horizontal plane (slope=0)
    const apiUrl = `https://re.jrc.ec.europa.eu/api/v5_3/MRcalc?lat=${lat}&lon=${lng}&horirrad=1&outputformat=json&angle=0&aspect=0`;
    
    // Try each CORS proxy in order until one works
    let response = null;
    let proxyUsed = '';
    let error = null;
    
    for (const proxy of CORS_PROXIES) {
      try {
        const proxyUrl = `${proxy}${encodeURIComponent(apiUrl)}`;
        console.log(`Trying CORS proxy: ${proxy}`);
        
        // Some proxies require specific headers
        const headers: Record<string, string> = {};
        if (proxy.includes('cors-anywhere')) {
          headers['X-Requested-With'] = 'XMLHttpRequest';
        } else if (proxy.includes('cors.sh')) {
          headers['x-cors-api-key'] = 'temp_me_testing_cors_123'; // Use your own API key for production
        }
        
        response = await fetch(proxyUrl, { headers });
        
        if (response.ok) {
          proxyUsed = proxy;
          console.log(`Successfully used proxy: ${proxy}`);
          break;
        }
      } catch (e) {
        console.warn(`Proxy ${proxy} failed:`, e);
        error = e;
      }
    }
    
    if (!response || !response.ok) {
      throw new Error(`All CORS proxies failed. Last error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Try to get the data based on the proxy response format
    let data: PVGISResponse;
    
    try {
      // First try to parse as JSON directly
      const responseData = await response.json();
      
      // Different proxies return data in different formats
      if (responseData.contents) {
        // allorigins returns { contents: "..." }
        data = JSON.parse(responseData.contents);
      } else if (responseData.body) {
        // Some proxies return { body: {...} }
        data = typeof responseData.body === 'string' 
          ? JSON.parse(responseData.body) 
          : responseData.body;
      } else if (responseData.data) {
        // Some proxies return { data: {...} }
        data = responseData.data;
      } else {
        // Assume the data is directly in the response
        data = responseData;
      }
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      // Try to get the response as text as a fallback
      const textResponse = await response.text();
      console.log('Response as text:', textResponse);
      
      // Try to extract JSON from the text response - using a simple regex without the 's' flag
      const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        data = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse response from PVGIS API');
      }
    }
    
    console.log('Raw PVGIS API response:', data);
    
    // Process the monthly data
    // First we need to aggregate the raw monthly data which is divided by years
    let monthlyTotals = new Array(12).fill(0);
    let monthCounts = new Array(12).fill(0);
    
    // Check if we have monthly data in the expected format
    if (data.outputs && data.outputs.monthly && Array.isArray(data.outputs.monthly)) {
      data.outputs.monthly.forEach(monthData => {
        if (monthData.month && typeof monthData.month === 'number') {
          const monthIndex = monthData.month - 1; // Convert 1-based to 0-based index
          
          // Get radiation value from the right property in API response
          // API returns H(h)_m for horizontal radiation
          let radiationValue = 0;
          
          // Try different possible field names the API might return
          if ('H(h)_m' in monthData) {
            radiationValue = monthData['H(h)_m'];
          } else if ('H_m' in monthData) {
            radiationValue = monthData.H_m;
          } else if (typeof monthData.H === 'function') {
            // This was the original approach, but it's not correct - keeping it as fallback
            radiationValue = monthData.H(0);
          } else if ('H' in monthData && typeof monthData.H === 'object') {
            // In some cases H might be an object with angle as keys
            radiationValue = monthData.H['0'] || 0;
          }
          
          if (radiationValue && monthIndex >= 0 && monthIndex < 12) {
            monthlyTotals[monthIndex] += radiationValue;
            monthCounts[monthIndex]++;
          }
        }
      });
    }
    
    // Calculate averages for each month
    const monthlyRadiation: PVGISMonthlyRadiationData[] = monthlyTotals.map((total, index) => {
      const count = monthCounts[index] || 1; // Avoid division by zero
      const avgRadiation = Math.round((total / count) * 10) / 10; // Round to 1 decimal
      
      return {
        month: MONTHS[index],
        radiation: avgRadiation || 0
      };
    });
    
    // If we didn't get any valid monthly data, we might need to adjust our expectations
    if (monthlyRadiation.every(m => m.radiation === 0)) {
      console.warn('No valid radiation data found in PVGIS response, checking for alternative format');
      
      // Try to extract data using a different approach based on what's available
      if (data.outputs && data.outputs.monthly && data.outputs.monthly.length >= 12) {
        const firstYearMonths = data.outputs.monthly.slice(0, 12);
        
        monthlyRadiation.forEach((item, index) => {
          const monthData = firstYearMonths[index];
          if (monthData) {
            // Look for any field that might contain radiation data
            for (const key in monthData) {
              if (typeof monthData[key] === 'number' && key !== 'year' && key !== 'month') {
                item.radiation = monthData[key];
                break;
              }
            }
          }
        });
      }
    }
    
    // Get annual radiation from totals if available, otherwise calculate
    let annualRadiation = 0;
    if (data.outputs?.totals?.fixed?.I_y) {
      annualRadiation = data.outputs.totals.fixed.I_y;
    } else if (data.outputs?.totals?.fixed?.H_y) {
      // Some versions of the API might use H_y instead of I_y
      annualRadiation = data.outputs.totals.fixed.H_y;
    } else {
      // Sum monthly values
      annualRadiation = monthlyRadiation.reduce((sum, month) => sum + month.radiation, 0);
    }
    
    const peakSunHours = Math.round((annualRadiation / 365) * 10) / 10; // Daily average rounded to 1 decimal
    
    return {
      monthlyRadiation,
      annualRadiation,
      peakSunHours
    };
    
  } catch (error) {
    console.error('Error fetching PVGIS data:', error);
    throw error;
  }
}; 