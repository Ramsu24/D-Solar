'use client';

import { useState, useEffect, forwardRef, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, Sun, MapPin, Ruler, Info, CloudSun, Wind, Thermometer, Droplets, AlertTriangle, HelpCircle, Home, Building, ChevronDown, BarChart3, Loader, Eye, Package, Bot, Leaf, Loader2 } from 'lucide-react';
import { Layers, Grid } from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ReferenceLine
} from 'recharts';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import React from 'react';
import { fetchPVGISMonthlyRadiation, PVGISMonthlyRadiationData } from '../utils/pvgisService';
import RadiationChart from './RadiationChart';
import _ from 'lodash';

import LocationSatelliteView from './LocationSatelliteView';
import EnhancedSolarAIAnalysis from './EnhancedSolarAIAnalysis';
import QuoteRequestForm from './QuoteRequestForm';
// Import the CollapsibleSection component
import CollapsibleSection from './ui/CollapsibleSection';

interface CalculatorInputs {
  currentBill: number;
  roofSize: number;
  roofType: 'concrete' | 'metal';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  template: keyof typeof solarTemplates;
  region: keyof typeof regionCosts;
  systemType?: 'ongrid' | 'hybrid'; // Optional field for system type preference
}

interface SolarData {
  annualRadiation: number | null;
  peakSunHours: number | null;
  systemEfficiency: number | null;
}

interface PVGISData {
  annualRadiation?: number;
  annualProduction?: number;
  peakSunHours?: number;
  systemEfficiency?: number;
  monthlyRadiation?: PVGISMonthlyRadiationData[]; // Add monthly radiation data
  rawData?: any; // Store raw JSON data from PVGIS API
}

interface WeatherData {
  temperature: number | null;
  windSpeed: number | null;
  windGust: number | null;
  clouds: number | null;
  humidity: number | null;
  pressure: number | null;
  dewpoint: number | null;
  precipType: number | null;
  forecastTime: string | null;
  solarImpactScore?: number | null; // New field for overall solar impact score
}

// Define template types
interface SolarTemplate {
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultBill: number;
  systemSizes: number[];
  costPerKw: number;
  roofTypeCosts: {
    concrete: {
      additionalCostPerKw: number;
      installationDetails: string;
    };
    metal: {
      additionalCostPerKw: number;
      installationDetails: string;
    };
  };
  panelWattage: number;
  electricityReduction: number;
  annualInflation: number;
  panelDegradation: number;
  paybackPeriod: string;
  tariffDetails: TariffDetail[];
}

interface TariffDetail {
  category: string;
  items: {
    name: string;
    value: string;
    tooltip?: string;
  }[];
}

// Template data based on the provided information
const solarTemplates: Record<string, SolarTemplate> = {
  residential: {
    name: "Residential",
    icon: <Home className="w-5 h-5 mr-2" />,
    description: "For homes and small properties",
    defaultBill: 0,
    systemSizes: [3, 5, 8, 10, 15],
    costPerKw: 70000, 
    roofTypeCosts: {
      concrete: {
        additionalCostPerKw: 14000, // 20% of the base costPerKw (70000)
        installationDetails: "Installation on concrete roofs requires metal structures for mounting the solar panels. This typically adds about 20% to the total package cost due to the additional materials and labor needed for proper structural support."
      },
      metal: {
        additionalCostPerKw: 0, // No additional cost for metal roofs
        installationDetails: "Installation on metal tin roofs is straightforward with regular installation methods. There's no additional cost as the panels can be mounted directly to the metal surface using standard mounting hardware."
      }
    },
    panelWattage: 450,
    electricityReduction: 0.90, // Increased from 0.85 to 0.90 (90% reduction)
    annualInflation: 0.055, // Increased to 5.5% annual inflation to reflect rising energy costs
    panelDegradation: 0.005, // Decreased from 0.008 to 0.005 (0.5% degradation instead of 0.8%)
    paybackPeriod: "5-7 years", // Updated to reflect improved efficiency
    tariffDetails: [
      {
        category: "Generation and Distribution",
        items: [
          { name: "Generation Charge", value: "Variable", tooltip: "The cost to generate electricity - varies monthly based on fuel costs" },
          { name: "Distribution Charge", value: "Fixed", tooltip: "Cost for electricity distribution through the local network" },
          { name: "Transmission Charge", value: "Fixed", tooltip: "Cost for transmitting electricity from power plants to distribution utilities" }
        ]
      },
      {
        category: "Government Charges",
        items: [
          { name: "System Loss Charge", value: "Variable", tooltip: "Accounts for energy lost during distribution" },
          { name: "Universal Charge", value: "Fixed", tooltip: "Funds for missionary electrification and environmental projects" },
          { name: "Taxes", value: "Percentage", tooltip: "Various taxes applied to electricity consumption" }
        ]
      }
    ]
  },
  commercial: {
    name: "Commercial",
    icon: <Building className="w-5 h-5 mr-2" />,
    description: "For businesses and large installations",
    defaultBill: 0,
    systemSizes: [50, 100, 200, 300, 400],
    costPerKw: 34000, 
    roofTypeCosts: {
      concrete: {
        additionalCostPerKw: 6800, // 20% of the base costPerKw (34000)
        installationDetails: "Installation on concrete roofs requires metal structures for mounting the solar panels. This typically adds about 20% to the total package cost due to the additional materials and labor needed for proper structural support."
      },
      metal: {
        additionalCostPerKw: 0, // No additional cost for metal roofs
        installationDetails: "Installation on metal tin roofs is straightforward with regular installation methods. There's no additional cost as the panels can be mounted directly to the metal surface using standard mounting hardware."
      }
    },
    panelWattage: 580,
    electricityReduction: 0.95, // Increased from 0.9 to 0.95 (95% reduction)
    annualInflation: 0.05, // Increased to 5% annual inflation to reflect rising energy costs
    panelDegradation: 0.004, // Decreased from 0.005 to 0.004 (0.4% degradation instead of 0.5%)
    paybackPeriod: "3 years, 2 months", // Updated to reflect improved efficiency
    tariffDetails: [
      {
        category: "Energy Charges",
        items: [
          { name: "Generation Charge", value: "Variable", tooltip: "The cost to generate electricity - varies monthly based on fuel costs" },
          { name: "System Loss Charge", value: "Variable", tooltip: "Electricity lost during distribution - changes with system conditions" },
          { name: "Distribution Charge", value: "Fixed", tooltip: "Cost for electricity distribution through the local network" }
        ]
      },
      {
        category: "Demand Charges",
        items: [
          { name: "Demand Charge", value: "Based on peak usage", tooltip: "Charge based on your highest usage during the billing period" }
        ]
      },
      {
        category: "Fixed & Other Charges",
        items: [
          { name: "Metering & Supply", value: "Monthly fixed fee", tooltip: "Fixed charges for metering and supply services" },
          { name: "Power Factor Adjustment", value: "Variable", tooltip: "Adjustment based on power efficiency" },
          { name: "Government Charges", value: "Various", tooltip: "Includes taxes, subsidies, and other mandated charges" }
        ]
      }
    ]
  }
};

// Add region costs data structure based on the provided table
const regionCosts = {
  'metro-manila': {
    name: 'Metro Manila',
    transportCosts: {
      small: 0,     // 6kW and Below - FREE
      medium: 0,    // 8.1kW to 10kW - FREE
      large: 0,     // 10.1kW to 15kW - FREE
    },
    description: 'No additional transport and mobilization costs'
  },
  'central-luzon': {
    name: 'Central Luzon',
    transportCosts: {
      small: 10000,  // 6kW and Below - 10,000
      medium: 20000, // 8.1kW to 10kW - 20,000
      large: 30000,  // 10.1kW to 15kW - 30,000
    },
    description: 'Additional fees for transport and mobilization to Central Luzon area'
  },
  'calabarzon': {
    name: 'CALABARZON',
    transportCosts: {
      small: 10000,  // 6kW and Below - 10,000
      medium: 20000, // 8.1kW to 10kW - 20,000
      large: 30000,  // 10.1kW to 15kW - 30,000
    },
    description: 'Additional fees for transport and mobilization to CALABARZON area'
  },
  'northern-luzon': {
    name: 'Northern Luzon',
    transportCosts: {
      small: 20000,  // 6kW and Below - 20,000
      medium: 30000, // 8.1kW to 10kW - 30,000
      large: 40000,  // 10.1kW to 15kW - 40,000
    },
    description: 'Additional fees for transport and mobilization to Northern Luzon area'
  },
  'southern-luzon': {
    name: 'Southern Luzon',
    transportCosts: {
      small: 20000,  // 6kW and Below - 20,000
      medium: 30000, // 8.1kW to 10kW - 30,000
      large: 40000,  // 10.1kW to 15kW - 40,000
    },
    description: 'Additional fees for transport and mobilization to Southern Luzon area'
  }
};

// Additional fixed costs structure
const additionalCosts = {
  residential: {
    netMeteringProcessingFee: 35000, // Net metering processing fee per meter - Residential (MERALCO areas)
    otherFees: 10000,              // Other fees (MERALCO) - Difference in Meter Cost fee, etc.
    netMeteringPipingCost: 20000   // Net metering piping cost (REC Meter, Roughings)
  },
  commercial: {
    netMeteringProcessingFee: 50000, // Net metering processing fee per meter - Commercial (MERALCO areas)
    otherFees: 10000,              // Other fees (MERALCO) - Difference in Meter Cost fee, etc.
    netMeteringPipingCost: 20000   // Net metering piping cost (REC Meter, Roughings)
  }
};

// Helper tooltip component
const InfoTooltip = ({ content }: { content: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-block">
      <HelpCircle 
        size={16} 
        className="text-gray-400 cursor-help ml-1 inline" 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      />
      {isVisible && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

// Disclaimer component for savings estimates
const SavingsDisclaimer = () => {
  return (
    <div className="mt-3 sm:mt-4 p-3 sm:p-4 border border-amber-200 rounded-lg bg-amber-50">
      <div className="flex items-start">
        <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Important Disclaimer</h4>
          <p className="text-xs sm:text-sm text-gray-700">
            The savings and projections shown are estimates only and do not represent guaranteed results. 
            Actual savings may vary based on many factors including weather patterns, system performance, 
            electricity rate changes, energy usage habits, and installation quality. We recommend 
            <a href="mailto:info@dsolar.ph" className="text-primary font-medium hover:underline mx-1">
              contacting our solar specialists
            </a>
            for a detailed assessment.
          </p>
          <p className="text-xs sm:text-sm font-medium mt-2">
            For consultation: 
            <a href="tel:+639760127919" className="text-primary hover:underline ml-1">
              +63-976-012-7919
            </a> or 
            <a href="mailto:info@dsolar.ph" className="text-primary hover:underline ml-1">
              info@dsolar.ph
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Solar savings chart component
const SavingsProjectionChart = ({ 
  currentBill, 
  template,
  region = 'metro-manila' // Default to Metro Manila if not provided
}: { 
  currentBill: number; 
  template: keyof typeof solarTemplates;
  region?: keyof typeof regionCosts;
}) => {
  // Add the interface definition at the beginning of the component
  interface SavingsDataPoint {
    year: number;
    value: number;
    actualNetValue?: number;
  }

  // Generate 25 years of projection data using the selected template
  const generateProjectionData = () => {
    const templateData = solarTemplates[template];
    const monthlyBill = currentBill || templateData.defaultBill;
    const yearlyBill = monthlyBill * 12;
    const annualInflation = templateData.annualInflation;
    const solarDegradation = templateData.panelDegradation;
    
    // Determine system size based on monthly bill and template
    let systemSize = 0;
    const templateSizes = templateData.systemSizes;
    
    if (template === 'residential') {
      if (monthlyBill < 8000) systemSize = templateSizes[0]; // Smallest size
      else if (monthlyBill < 15000) systemSize = templateSizes[1];
      else if (monthlyBill < 25000) systemSize = templateSizes[2];
      else if (monthlyBill < 40000) systemSize = templateSizes[3];
      else systemSize = templateSizes[4]; // Largest residential size
    } else { // commercial
      if (monthlyBill < 100000) systemSize = templateSizes[0]; // Smallest commercial size
      else if (monthlyBill < 200000) systemSize = templateSizes[1];
      else if (monthlyBill < 300000) systemSize = templateSizes[2];
      else if (monthlyBill < 400000) systemSize = templateSizes[3];
      else systemSize = templateSizes[4]; // Largest commercial size
    }
    
    // Calculate base installation cost
    const baseInstallationCost = systemSize * templateData.costPerKw;
    
    // Calculate location-based transport costs
    const regionData = regionCosts[region];
    let transportCost = 0;
    if (systemSize <= 6) {
      transportCost = regionData.transportCosts.small;
    } else if (systemSize <= 10) {
      transportCost = regionData.transportCosts.medium;
    } else {
      transportCost = regionData.transportCosts.large;
    }
    
    // Get additional costs
    const templateAdditionalCosts = additionalCosts[template === 'commercial' ? 'commercial' : 'residential'];
    
    // Calculate total installation cost including all fees
    const installationCost = baseInstallationCost + transportCost + 
      templateAdditionalCosts.netMeteringProcessingFee + 
      templateAdditionalCosts.otherFees + 
      templateAdditionalCosts.netMeteringPipingCost;
    
    // Annual maintenance costs (0.5% of base installation cost)
    const annualMaintenance = baseInstallationCost * 0.005;
    
    const traditionalData: { year: number; value: number }[] = [];
    const solarData: { year: number; value: number }[] = [];
    // Update the type here
    const cumulativeSavingsData: SavingsDataPoint[] = [];
    
    // Start with initial costs but present in a way that's more visually appealing
    let currentYearlyBill = yearlyBill;
    let solarEfficiency = 1.0;
    
    // Use template's electricity reduction factor
    const initialElectricityReduction = templateData.electricityReduction;
    
    // Create data for year 0 (current state) through year 25
    for (let year = 0; year <= 25; year++) {
      // For traditional electricity, show 0 at year 0 and then normal costs
      const traditionalCost = year === 0 ? 0 : currentYearlyBill;
      
      // For solar, show the installation cost at year 0, then remaining costs for future years
      const solarCost = year === 0 ? 
        installationCost : 
        (yearlyBill * (1 - (initialElectricityReduction * solarEfficiency))) + annualMaintenance;
      
      traditionalData.push({
        year,
        value: traditionalCost
      });
      
      solarData.push({
        year,
        value: year === 0 ? 0 : solarCost // Hide the initial spike in the graph
      });
      
      // Calculate yearly savings (ignore year 0)
      const yearlySavings = year === 0 ? 0 : traditionalCost - solarCost;
      
      // Calculate cumulative savings, but start from 0 instead of negative
      // For display purposes, we'll track ROI from the positive savings perspective
      let displayValue = 0;
      
      if (year === 0) {
        displayValue = 0; // Start at 0 instead of -installationCost
      } else {
        // Get previous year's value
        const prevValue = cumulativeSavingsData.length > 0 ? cumulativeSavingsData[cumulativeSavingsData.length - 1].value : 0;
        displayValue = prevValue + yearlySavings;
      }
      
      cumulativeSavingsData.push({
        year,
        value: displayValue,
        // Add actual ROI data to use elsewhere if needed
        actualNetValue: displayValue - (year === 0 ? installationCost : 0) 
      });
      
      // Update for next year
      currentYearlyBill *= (1 + annualInflation);
      solarEfficiency *= (1 - solarDegradation);
    }
    
    // Calculate true breakeven point for display purposes
    let breakEvenYear = 0;
    let breakEvenYearFractional = 0;
    for (let i = 0; i < cumulativeSavingsData.length - 1; i++) {
      if (cumulativeSavingsData[i].value < installationCost && cumulativeSavingsData[i+1].value >= installationCost) {
        // Linear interpolation to find fractional year - same as admin calculator
        const yearStart = i;
        const savingsStart = cumulativeSavingsData[i].value;
        const savingsEnd = cumulativeSavingsData[i+1].value;
        const savingsDiff = savingsEnd - savingsStart;
        const savingsNeeded = installationCost - savingsStart;
        const fraction = savingsNeeded / savingsDiff;
        breakEvenYearFractional = yearStart + fraction;
        breakEvenYear = Math.ceil(breakEvenYearFractional); // Round up for display purposes
        break;
      }
    }
    
    // For cases where we reach break-even exactly at a whole year
    if (breakEvenYear === 0) {
      for (let i = 0; i < cumulativeSavingsData.length; i++) {
        if (cumulativeSavingsData[i].value >= installationCost) {
          breakEvenYear = i;
          breakEvenYearFractional = i;
          break;
        }
      }
    }
    
    // When we calculate 25-Year ROI and other stats, store important values locally
    // Fix the undefined variable errors
    const totalInstallationCost = installationCost;
    const electricityReductionPercentage = templateData.electricityReduction;
    
    return {
      yearlyComparison: Array.from({ length: 26 }, (_, i) => ({
        year: i,
        traditional: traditionalData[i].value,
        solar: solarData[i].value, 
      })),
      cumulativeSavings: cumulativeSavingsData.map(data => ({
        year: data.year,
        value: data.value,
        // Add annotation for the breakeven point
        breakeven: data.year === breakEvenYear
      })),
      systemSize: systemSize,
      breakEvenYear: breakEvenYear,
      breakEvenYearFractional: breakEvenYearFractional,
      totalInstallationCost: totalInstallationCost,
      electricityReductionPercentage: electricityReductionPercentage
    };
  };
  
  const data = generateProjectionData();
  
  // Helper function to format currency values with abbreviations
  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `₱${(value / 1000000).toFixed(1)}M`;
    } else if (Math.abs(value) >= 1000) {
      return `₱${(value / 1000).toFixed(0)}K`;
    } else {
      return `₱${value}`;
    }
  };
  
  // Format years with decimal to years and months - match admin calculator display
  const formatYearsAndMonths = (years: number) => {
    if (years === null) return 'N/A';
    
    const wholeYears = Math.floor(years);
    const months = Math.round((years - wholeYears) * 12);
    
    if (months === 12) {
      return `${wholeYears + 1} years`;
    }
    
    return months > 0 
      ? `${wholeYears} ${wholeYears === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`
      : `${wholeYears} ${wholeYears === 1 ? 'year' : 'years'}`;
  };
  
  // After the formatCurrency function, add this new function for better tooltips
  const formatTooltipContent = (label: string, payload: any[] | undefined) => {
    if (!payload || payload.length === 0) return null;
    
    const year = parseInt(label);
    
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-semibold mb-2">Year {year}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-medium">₱{Math.round(entry.value).toLocaleString()}</span>
          </div>
        ))}
        {year === data.breakEvenYear && (
          <div className="mt-2 pt-2 border-t border-gray-200 text-green-600 font-medium">
            Break-Even Point! 🎉
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      <div className="w-full">
        <h4 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
          25-Year Cost Comparison
          <InfoTooltip content={`Compares traditional electricity costs with solar power costs over 25 years, with ${(solarTemplates[template].annualInflation * 100).toFixed(1)}% annual electricity inflation and ${(solarTemplates[template].panelDegradation * 100).toFixed(1)}% panel degradation.`} />
        </h4>
        <ResponsiveContainer width="100%" height={300} minHeight={300} className="mt-2 sm:mt-0">
          <AreaChart data={data.yearlyComparison} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 12 }}
              tick={{ fontSize: 12 }}
              tickCount={5} 
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={45}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip 
              content={({ label, payload }) => formatTooltipContent(label, payload)}
              contentStyle={{ fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="traditional" 
              name="Traditional Electricity" 
              stroke="#ff7300" 
              fill="#ff9d57" 
              activeDot={{ r: 6 }}
            />
            <Area 
              type="monotone" 
              dataKey="solar" 
              name="Solar Power" 
              stroke="#2563eb" 
              fill="#93c5fd" 
              activeDot={{ r: 6 }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      <div>
        <h4 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 flex items-center">
          Cumulative Savings
          <InfoTooltip content="Shows total money saved over time compared to traditional electricity. The green line represents your growing savings." />
        </h4>
        <ResponsiveContainer width="100%" height={300} minHeight={300} className="mt-2 sm:mt-0">
          <AreaChart data={data.cumulativeSavings} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="year" 
              label={{ value: 'Year', position: 'insideBottom', offset: -5, fontSize: 12 }} 
              tick={{ fontSize: 12 }}
              tickCount={5}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              width={45}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip 
              content={({ label, payload }) => {
                if (!payload || payload.length === 0) return null;
                
                const year = parseInt(label);
                
                return (
                  <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
                    <p className="font-semibold mb-2">Year {year}</p>
                    {payload.map((entry, index) => (
                      <div key={index} className="flex justify-between gap-4">
                        <span style={{ color: entry.color }}>{entry.name}:</span>
                        <span className="font-medium">₱{Math.round(entry.value as number).toLocaleString()}</span>
                      </div>
                    ))}
                    {year === data.breakEvenYear && (
                      <div className="mt-2 pt-2 border-t border-gray-200 text-green-600 font-medium">
                        Break-Even Point! 🎉
                      </div>
                    )}
                  </div>
                );
              }}
              contentStyle={{ fontSize: '12px' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              name="Cumulative Savings" 
              stroke="#059669" 
              fill="#6ee7b7" 
              activeDot={{ r: 6 }}
            />
            {/* Add reference lines for breakeven point */}
            <ReferenceLine
              x={data.breakEvenYearFractional}
              stroke="#059669"
              strokeDasharray="3 3"
              label={{
                value: 'Break-even',
                position: 'top',
                fill: '#059669',
                fontSize: 12
              }}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: '10px', paddingTop: '2px' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Add a summary of financial benefits */}
      <div className="bg-green-50 p-4 rounded-lg border border-green-100 w-full">
        <h4 className="font-semibold text-gray-800 mb-2">Financial Benefits Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-sm text-gray-500">Break-Even Point</p>
            <p className="text-xl font-bold text-green-600">{formatYearsAndMonths(data.breakEvenYearFractional)}</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-sm text-gray-500">25-Year ROI</p>
            <p className="text-xl font-bold text-green-600">{Math.round((data.cumulativeSavings[25].value / data.totalInstallationCost) * 100)}%</p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-green-100">
            <p className="text-sm text-gray-500">Monthly Bill Reduction</p>
            <p className="text-xl font-bold text-green-600">{Math.round(data.electricityReductionPercentage * 100)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Weather visualization component
const WeatherVisualizations = ({ weatherData }: { weatherData: WeatherData }) => {
  // Create data for cloud coverage pie chart
  const cloudData = [
    { name: 'Cloud Cover', value: weatherData.clouds ? weatherData.clouds : 0 },
    { name: 'Clear Sky', value: weatherData.clouds ? 1 - weatherData.clouds : 1 }
  ];
  
  const COLORS = ['#9ca3af', '#3b82f6'];
  
  // Helper function for precipitation types
  const getPrecipTypeName = (typeCode: number): string => {
    switch (typeCode) {
      case 0:
        return 'None';
      case 1:
        return 'Rain';
      case 3:
        return 'Freezing Rain';
      case 5:
        return 'Snow';
      case 7:
        return 'Rain & Snow Mix';
      case 8:
        return 'Ice Pellets';
      default:
        return 'Unknown';
    }
  };
  
  // Calculate solar impact score (0-100) - higher is better for solar
  const calculateSolarImpactScore = () => {
    if (!weatherData) return null;
    
    let score = 100; // Start with perfect conditions
    
    // Cloud impact (most significant factor)
    if (weatherData.clouds !== null) {
      // Reduce score based on cloud coverage (clouds have major impact)
      score -= (weatherData.clouds * 40); // Up to 40 point reduction for full cloud cover
    }
    
    // Temperature impact (moderate factor)
    if (weatherData.temperature !== null) {
      // Solar panels work best between 15-25°C
      // Above 25°C efficiency drops slightly
      if (weatherData.temperature > 25) {
        const tempPenalty = Math.min(10, (weatherData.temperature - 25) * 0.5);
        score -= tempPenalty;
      }
      // Below 15°C also slight efficiency drop, but presented more positively
      else if (weatherData.temperature < 15) {
        const tempPenalty = Math.min(5, (15 - weatherData.temperature) * 0.3);
        score -= tempPenalty;
      }
    }
    
    // Precipitation impact (significant factor)
    if (weatherData.precipType !== null && weatherData.precipType > 0) {
      // Any precipitation reduces effectiveness but show it moderately
      score -= 15;
    }
    
    // Wind impact (minor factor - represented positively as cooling benefit)
    if (weatherData.windSpeed !== null && weatherData.windSpeed > 2) {
      // Light wind is beneficial for cooling panels (up to 5 point bonus)
      const windBonus = Math.min(5, weatherData.windSpeed * 0.5);
      score += windBonus;
      
      // But too strong winds could be problematic
      if (weatherData.windSpeed > 20) {
        const highWindPenalty = Math.min(10, (weatherData.windSpeed - 20) * 0.5);
        score -= highWindPenalty;
      }
    }
    
    // Ensure score is in 0-100 range
    return Math.max(0, Math.min(100, score));
  };
  
  const solarImpactScore = calculateSolarImpactScore();
  
  // Function to provide weather impact interpretation
  const getWeatherImpactInterpretation = () => {
    if (solarImpactScore === null) return "Weather data unavailable";
    
    if (solarImpactScore >= 85) {
      return "Very good conditions for solar energy. Your panels should perform well under these conditions.";
    } else if (solarImpactScore >= 70) {
      return "Very good conditions for solar energy. Your panels should perform well under these conditions.";
    } else if (solarImpactScore >= 50) {
      return "Good conditions for solar. While not optimal, your system will still generate significant energy.";
    } else if (solarImpactScore >= 30) {
      return "Moderate conditions. Some energy production may be affected, but your system is designed to perform across various weather patterns.";
    } else {
      return "Challenging conditions for solar today. However, your annual production will factor in seasonal variations.";
    }
  };

  // Function to get impact score color
  const getScoreColor = () => {
    if (solarImpactScore === null) return "#9ca3af";
    
    if (solarImpactScore >= 80) return "#22c55e"; // Green
    if (solarImpactScore >= 60) return "#84cc16"; // Light green
    if (solarImpactScore >= 40) return "#facc15"; // Yellow
    if (solarImpactScore >= 20) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-5">Weather Impact Analysis</h3>
        
        {/* Solar Impact Score */}
        <div className="mb-6">
          <h4 className="text-sm sm:text-base font-semibold mb-2 flex items-center">
            Solar Production Potential
            <InfoTooltip content="This score indicates how favorable the current weather conditions are for solar energy production." />
          </h4>
          <div className="flex items-center justify-between mb-1">
            <div className="w-3/4 pr-4">
              <div className="w-full bg-gray-200 rounded-full h-5">
                <div 
                  className="h-5 rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${solarImpactScore || 0}%`,
                    backgroundColor: getScoreColor()
                  }}
                ></div>
              </div>
            </div>
            <div className="w-1/4 text-right">
              <span className="text-xl font-bold" style={{ color: getScoreColor() }}>
                {solarImpactScore !== null ? Math.round(solarImpactScore) : '?'}<span className="text-sm">/100</span>
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{getWeatherImpactInterpretation()}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h4 className="text-base font-semibold mb-3 flex items-center">
              Cloud Coverage
              <InfoTooltip content="Cloud coverage affects solar energy production. Direct sunlight produces the most energy, but modern panels still generate power even on cloudy days." />
            </h4>

            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={cloudData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {cloudData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number) => `${(value * 100).toFixed(0)}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-center mt-2">
              <p className="font-medium">Cloud Cover: {weatherData.clouds !== null ? `${(weatherData.clouds * 100).toFixed(0)}%` : 'N/A'}</p>
              <p className="text-sm text-blue-600 font-medium mt-1">Clear Sky: {weatherData.clouds !== null ? `${((1 - weatherData.clouds) * 100).toFixed(0)}%` : 'N/A'}</p>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              {weatherData.clouds !== null && (
                <p>
                  {weatherData.clouds < 0.3 
                    ? "Clear skies are optimal for solar power generation."
                    : weatherData.clouds < 0.7
                    ? "Partially cloudy conditions still provide good solar energy production."
                    : "Even with cloudy conditions, modern solar panels will generate electricity."}
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-100">
            <h4 className="text-base font-semibold mb-3 flex items-center">
              Temperature & Humidity
              <InfoTooltip content="Solar panels operate efficiently in a wide range of temperatures. Cooler temperatures actually help panel efficiency, though energy production happens across all temperature ranges." />
            </h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={[
                  {
                    name: 'Current Conditions',
                    temperature: weatherData.temperature || 0,
                    humidity: weatherData.humidity || 0,
                    dewpoint: weatherData.dewpoint || 0
                  }
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Bar 
                  dataKey="temperature" 
                  name="Temperature (°C)" 
                  fill="#ef4444" 
                  barSize={30} 
                />
                <Bar 
                  dataKey="humidity" 
                  name="Humidity (%)" 
                  fill="#3b82f6" 
                  barSize={30} 
                />
                <Bar 
                  dataKey="dewpoint" 
                  name="Dew Point (°C)" 
                  fill="#10b981" 
                  barSize={30} 
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 flex justify-between px-2">
              <div className="text-center">
                <p className="text-xs text-gray-500">Temperature</p>
                <p className="font-medium text-red-500">{weatherData.temperature !== null ? `${weatherData.temperature.toFixed(1)}°C` : 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Humidity</p>
                <p className="font-medium text-blue-500">{weatherData.humidity !== null ? `${weatherData.humidity.toFixed(0)}%` : 'N/A'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Dew Point</p>
                <p className="font-medium text-green-500">{weatherData.dewpoint !== null ? `${weatherData.dewpoint.toFixed(1)}°C` : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Additional Weather Information */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Wind Factor */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h5 className="font-medium text-sm flex items-center mb-2">
              Wind Conditions
              <InfoTooltip content="Moderate wind can help cool panels and improve efficiency. Our installations are designed to withstand local wind conditions." />
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Wind Speed:</span>
                <span className="font-medium">{weatherData.windSpeed !== null ? `${weatherData.windSpeed.toFixed(1)} m/s` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Wind Gust:</span>
                <span className="font-medium">{weatherData.windGust !== null ? `${weatherData.windGust.toFixed(1)} m/s` : 'N/A'}</span>
              </div>
              {weatherData.windSpeed !== null && (
                <p className="text-xs mt-1 text-gray-600">
                  {weatherData.windSpeed < 2
                    ? "Light winds. Panels will operate at normal temperature."
                    : weatherData.windSpeed < 15
                    ? "Moderate winds help cool panels and can improve performance."
                    : "Strong winds. Our mounting systems are designed for stability in these conditions."}
                </p>
              )}
            </div>
          </div>
          
          {/* Precipitation */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h5 className="font-medium text-sm flex items-center mb-2">
              Precipitation
              <InfoTooltip content="Rain actually helps clean your panels naturally. Modern systems are designed to handle all weather conditions." />
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Type:</span>
                <span className="font-medium">
                  {weatherData.precipType !== null 
                    ? getPrecipTypeName(weatherData.precipType)
                    : 'None predicted'}
                </span>
              </div>
              {weatherData.precipType !== null && weatherData.precipType > 0 ? (
                <p className="text-xs mt-1 text-gray-600">
                  {weatherData.precipType === 1
                    ? "Rain helps naturally clean your panels and typically passes quickly."
                    : weatherData.precipType === 5
                    ? "Snow typically melts off tilted panels, allowing for continued production."
                    : "Our systems are designed to withstand all local weather conditions."}
                </p>
              ) : (
                <p className="text-xs mt-1 text-gray-600">
                  No precipitation expected. Ideal for consistent energy production.
                </p>
              )}
            </div>
          </div>
          
          {/* Atmospheric Conditions */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h5 className="font-medium text-sm flex items-center mb-2">
              Atmospheric Conditions
              <InfoTooltip content="These factors have minimal impact on solar production but help provide a complete weather picture." />
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Pressure:</span>
                <span className="font-medium">{weatherData.pressure !== null ? `${weatherData.pressure.toFixed(0)} hPa` : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Forecast Time:</span>
                <span className="font-medium text-xs">{weatherData.forecastTime || 'N/A'}</span>
              </div>
              <p className="text-xs mt-1 text-gray-600">
                Weather conditions change throughout the day. Your system is designed to maximize production across all conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Solar potential gauge component
const SolarPotentialGauge = ({ value }: { value: number }) => {
  // Map the solar potential value to a percentage (assuming range is 1000-2200 kWh/m²)
  const minValue = 1000;
  const maxValue = 2200;
  const percentage = Math.min(100, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 100));
  
  // Determine color based on percentage
  const getColor = () => {
    if (percentage < 30) return "#ef4444"; // Low - red
    if (percentage < 60) return "#f59e0b"; // Medium - amber
    return "#10b981"; // High - green
  };
  
  return (
    <div className="w-full h-28 flex flex-col items-center justify-center">
      <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="absolute top-0 left-0 h-full transition-all duration-1000 ease-out" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: getColor()
          }}
        />
      </div>
      <div className="w-full flex justify-between mt-1 text-xs text-gray-500">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
      <div className="mt-2 text-center">
        <span className="text-lg font-semibold" style={{ color: getColor() }}>
          {percentage < 30 ? "Low" : percentage < 60 ? "Medium" : "High"} Potential
        </span>
      </div>
    </div>
  );
};

// Custom marker icon to replace the default one
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map selector component with click handler
const MapSelector = ({ location, onLocationChange }: { 
  location: { lat: number; lng: number; address?: string }; 
  onLocationChange: (lat: number, lng: number) => void 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{
    place_id: number,
    display_name: string,
    lat: string,
    lon: string
  }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchResultsRef = useRef<HTMLUListElement>(null);
  const [shouldFlyTo, setShouldFlyTo] = useState<{lat: number, lng: number} | null>(null);

  // Component to control map view
  const MapController = () => {
    const map = useMap();
    
    // Effect to handle map view changes when location changes
    useEffect(() => {
      if (shouldFlyTo) {
        map.flyTo([shouldFlyTo.lat, shouldFlyTo.lng], 13, {
          animate: true,
          duration: 1.5
        });
        // Reset the flyTo trigger
        setShouldFlyTo(null);
      }
    }, [map, shouldFlyTo]);

    return null;
  };

  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        onLocationChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  // Default center if no location is set
  const center = location.lat !== 0 && location.lng !== 0 
    ? [location.lat, location.lng] 
    : [14.5995, 120.9842]; // Default to Manila, Philippines

  // Search for locations based on user input
  const searchLocations = async (query: string) => {
    if (query.trim().length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Solar Calculator Application',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Location search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchError('Error searching locations. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounce search to avoid too many API calls
  const debouncedSearch = useCallback(
    _.debounce((query: string) => searchLocations(query), 500),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    
    // Cleanup
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  // Handle location selection from search results
  const handleLocationSelect = (lat: string, lon: string) => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    
    if (!isNaN(latitude) && !isNaN(longitude)) {
      onLocationChange(latitude, longitude);
      
      // Trigger map to fly to the selected location
      setShouldFlyTo({lat: latitude, lng: longitude});
      
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // Handle click outside search results to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="space-y-2">
      <div className="w-full h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer 
          center={[center[0], center[1]] as [number, number]} 
          zoom={5} 
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler />
          <MapController />
          {location.lat !== 0 && location.lng !== 0 && (
            <Marker 
              position={[location.lat, location.lng] as [number, number]}
              icon={customIcon}
            />
          )}
        </MapContainer>
      </div>
      
      <p className="text-center text-sm text-gray-600 mt-1 mb-2">
        Click on the map to set your location for solar potential analysis
      </p>
      
      {/* Location search input */}
      <div className="relative">
        <div className="flex">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for a location..."
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
        </div>
        
        {searchResults.length > 0 && (
          <ul 
            ref={searchResultsRef}
            className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
          >
            {searchResults.map((result) => (
              <li 
                key={result.place_id} 
                onClick={() => handleLocationSelect(result.lat, result.lon)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-primary mt-1 mr-2 flex-shrink-0" />
                  <span className="text-sm">{result.display_name}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        
        {searchError && (
          <p className="text-red-500 text-xs mt-1">{searchError}</p>
        )}
      </div>
      
      {location.address && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-3">
          <div className="flex items-start">
            <MapPin className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-700">{location.address}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Define roof size categories for the slider marks
const roofSizeMarks = [
  { value: 10, label: 'Small', description: '10 m²' },
  { value: 40, label: 'Medium', description: '40 m²' },
  { value: 70, label: 'Large', description: '70 m²' },
  { value: 100, label: 'XL', description: '100 m²' },
  { value: 150, label: 'XXL', description: '150+ m²' },
];

// Roof Size Visualization Component
const RoofSizeVisualization = ({ size }: { size: number }) => {
  // Determine which GIF to display based on size
  const getGifSource = () => {
    if (size <= 40) return '/solarcalculator/1.gif';
    if (size <= 100) return '/solarcalculator/2.gif';
    return '/solarcalculator/3.gif';
  };
  
  // Get appropriate label
  const getLabel = () => {
    if (size <= 20) return 'Small Panel System';
    if (size <= 40) return 'Standard Panel System';
    if (size <= 70) return 'Small Home System';
    if (size <= 100) return 'Standard Home System';
    if (size <= 150) return 'Large Residential System';
    return 'Commercial Building System';
  };

  return (
    <div className="mt-2 flex flex-col items-center w-full">
      <p className="text-gray-700 mb-1 text-center text-sm">{size} m² - {getLabel()}</p>
      
      <div className="w-full flex justify-center items-center h-[160px] py-2">
        <AnimatePresence mode="wait">
          <motion.div 
            key={getGifSource()}
            className="w-full flex justify-center items-center h-full"
            initial={{ opacity: 0, x: size <= 40 ? -50 : (size > 100 ? 50 : 0) }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: size <= 40 ? 50 : (size > 100 ? -50 : 0) }}
            transition={{ 
              type: "spring", 
              stiffness: 120, 
              damping: 14,
              duration: 0.4 
            }}
          >
            <motion.img 
              src={getGifSource()} 
              alt={`Solar installation for ${getLabel()}`}
              className="max-h-full max-w-full object-contain"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

// Add a template selection component
const TemplateSelector = ({ 
  selectedTemplate, 
  onTemplateChange 
}: { 
  selectedTemplate: keyof typeof solarTemplates;
  onTemplateChange: (template: keyof typeof solarTemplates) => void; 
}) => {
  return (
    <div className="flex flex-wrap gap-3 mt-2 sm:mt-4">
      {Object.keys(solarTemplates).map((key) => (
        <button 
          key={key}
          className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
            selectedTemplate === key 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
          onClick={() => onTemplateChange(key as keyof typeof solarTemplates)}
        >
          <span className="mr-2">{solarTemplates[key as keyof typeof solarTemplates].icon}</span>
          <span className="font-medium">{solarTemplates[key as keyof typeof solarTemplates].name}</span>
        </button>
      ))}
    </div>
  );
};

// Add a tariff details component to display the table
const TariffDetailsTable = ({ tariffDetails }: { tariffDetails: TariffDetail[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="mt-2">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full flex items-center justify-between p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
      >
        <span className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
          <Calculator size={16} className="mr-2 text-primary" />
          View Billing Components
        </span>
        <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 overflow-hidden border border-gray-200 rounded-lg">
              {tariffDetails.map((category, idx) => (
                <div key={idx}>
                  <div className="p-3 bg-gray-100 font-medium">{category.category}</div>
                  <table className="w-full">
                    <tbody>
                      {category.items.map((item, itemIdx) => (
                        <tr key={itemIdx} className={`border-t border-gray-200 ${itemIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                          <td className="flex items-center p-3">
                            {item.name}
                            {item.tooltip && <InfoTooltip content={item.tooltip} />}
                          </td>
                          <td className="p-3 text-right font-medium text-gray-600">{item.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2 italic">
              Note: Actual rates will be provided during consultation. Rates vary based on location, season, and provider policies.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add new Environmental Benefits component
const EnvironmentalBenefits = ({ systemSize, template }: { systemSize: number; template: keyof typeof solarTemplates }) => {
  // Only show for commercial template
  if (template !== 'commercial') return null;
  
  // Calculate environmental benefits based on system size
  const annualCO2Avoided = systemSize * 0.76; // tonnes per kW per year
  const treesEquivalent = annualCO2Avoided * 16.5; // trees per tonne of CO2
  const carKmAvoided = annualCO2Avoided * 5000; // km per tonne of CO2
  const flightsAvoided = Math.round(annualCO2Avoided / 0.25); // long-haul flights per year (rough estimate)
  const waterSaved = annualCO2Avoided * 2900; // gallons of water per tonne of CO2
  const coalSaved = annualCO2Avoided * 0.35; // tonnes of coal per tonne of CO2
  const oilBarrelsSaved = annualCO2Avoided * 2.3; // barrels of oil per tonne of CO2
  const homesPowered = Math.round(systemSize * 0.3); // average homes powered by the system
  
  // Format large numbers for better display
  const formatLargeNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    } else {
      return num.toString();
    }
  };
  
  return (
    <div className="border border-green-200 rounded-xl p-4 sm:p-6 bg-green-50 mt-4 sm:mt-6">
      <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 flex items-center text-green-800">
        <div className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2 flex-shrink-0 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
            <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5A.75.75 0 0110 2zM5.404 4.343a.75.75 0 010 1.06 6.5 6.5 0 109.192 0 .75.75 0 111.06-1.06 8 8 0 11-11.313 0 .75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
        </div>
        Environmental Benefits
      </h3>
      
      <p className="text-xs sm:text-sm text-gray-700 mb-4 sm:mb-6">
        Solar has no emissions. It just silently generates pure, clean energy.
      </p>
      
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-green-600 flex-shrink-0 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
            </div>
            Each Year
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M14.78 5.22a.75.75 0 00-1.06 0L6.5 12.44V6.75a.75.75 0 00-1.5 0v7.5c0 .414.336.75.75.75h7.5a.75.75 0 000-1.5H7.56l7.22-7.22a.75.75 0 000-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Emissions</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-green-600 leading-tight">81%</p>
              <p className="text-xs sm:text-sm text-gray-600">Of CO<sub>2</sub>, SO<sub>2</sub> & NO<sub>2</sub></p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M9.661 2.237a.531.531 0 01.678 0 11.947 11.947 0 007.078 2.749.5.5 0 01.479.425c.069.52.104 1.05.104 1.59 0 5.162-3.26 9.563-7.834 11.256a.48.48 0 01-.332 0C5.26 16.564 2 12.163 2 7c0-.538.035-1.069.104-1.589a.5.5 0 01.48-.425 11.947 11.947 0 007.077-2.75z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Carbon</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-green-600 leading-tight">{Math.round(annualCO2Avoided)}<span className="text-xs sm:text-lg">tonnes</span></p>
              <p className="text-xs sm:text-sm text-gray-600">Avoided CO<sub>2</sub> per year</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Homes</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-green-600 leading-tight">{homesPowered}</p>
              <p className="text-xs sm:text-sm text-gray-600">Homes powered</p>
            </div>
            {/* Water card - update icon to a proper water droplet */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M10 15a5 5 0 0 0 5-5c0-1.726-1.694-3.853-3.658-5.818C10.355 3.195 9.5 2.338 9.5 2.338s-.856.857-1.842 1.844C5.694 6.148 4 8.274 4 10a5 5 0 0 0 6 5Zm-.5-11.812S8.395 4.295 6.743 5.948C5.142 7.548 5 9 5 10a4 4 0 0 0 8 0c0-1-.142-2.452-1.743-4.052C9.605 4.295 9.5 3.188 9.5 3.188Z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">Water</span>
              </div>
              <p className="text-xl sm:text-3xl font-bold text-green-600 leading-tight">{formatLargeNumber(Math.round(waterSaved))}</p>
              <p className="text-xs sm:text-sm text-gray-600">Gallons saved</p>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 text-sm sm:text-base flex items-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 text-green-600 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-1.503.204A6.5 6.5 0 117.5 3.5a6.5 6.5 0 019.997 6.704zM10 6a.75.75 0 01.75.75v3.614l1.683 1.682a.75.75 0 01-1.06 1.061l-2-2a.75.75 0 01-.22-.53V6.75A.75.75 0 0110 6z" clipRule="evenodd" />
              </svg>
            </div>
            Over System Lifetime
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path d="M6.5 3c-1.051 0-2.093.04-3.125.117A1.49 1.49 0 002 4.607V10.5h9V4.606c0-.771-.59-1.43-1.375-1.489A41.568 41.568 0 006.5 3zM2 12v2.5A1.5 1.5 0 003.5 16h.041a3 3 0 015.918 0h.791a.75.75 0 00.75-.75V12H2z" />
                    <path d="M6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13.25 5a.75.75 0 00-.75.75v8.514a3.001 3.001 0 014.893 1.44c.37-.275.61-.719.595-1.227a24.905 24.905 0 00-1.784-8.549A1.486 1.486 0 0014.823 5H13.25zM14.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Car Distance</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{formatLargeNumber(Math.round(carKmAvoided * 25))}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Car km avoided</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path d="M9.69 1.605l-5.46 5.46c-.567.566-.106 1.543.78 1.543h2.099v2.734c0 .574.35 1.092.888 1.3.189.074.394.108.598.108.671 0 1.099-.38 1.282-.792l1.315-2.942V15.5a.75.75 0 001.5 0V9.117l1.287 2.93c.19.43.626.823 1.31.823.206 0 .411-.036.599-.109.538-.21.888-.728.888-1.3V8.607h2.099c.885 0 1.347-.977.78-1.543l-5.46-5.46a1.005 1.005 0 00-1.424 0z" />
                    <path d="M7.904 16h4.2c.733 0 1.357.502 1.523 1.187.164.677-.29 1.313-.97 1.313H7.342c-.68 0-1.133-.636-.97-1.313A1.548 1.548 0 017.904 16z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Trees</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{formatLargeNumber(Math.round(treesEquivalent * 25))}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Trees planted</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Flights</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{flightsAvoided * 25}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Long haul flights</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path d="M11.983 1.907a.75.75 0 00-1.292-.657l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.657l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Coal</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{Math.round(coalSaved * 25)}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Tonnes of coal</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M13 3v1.27a.75.75 0 001.5 0V3h2.25A2.25 2.25 0 0119 5.25v2.628a.75.75 0 01-.5.707 1.5 1.5 0 000 2.83c.3.106.5.39.5.707v2.628A2.25 2.25 0 0116.75 17h-2.25v-1.27a.75.75 0 00-1.5 0V17H3.25A2.25 2.25 0 011 14.75v-2.628c0-.318.2-.601.5-.707a1.5 1.5 0 000-2.83.75.75 0 01-.5-.707V5.25A2.25 2.25 0 013.25 3H12z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Oil</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{Math.round(oilBarrelsSaved * 25)}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Barrels of oil</p>
              </div>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-green-100 flex flex-col justify-between h-full">
              <div className="flex items-center mb-1">
                <div className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-1.5 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-full h-full">
                    <path fillRule="evenodd" d="M16.403 12.652a3 3 0 000-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xs text-gray-500">Carbon Offset</span>
              </div>
              <div className="mt-1">
                <p className="text-base sm:text-lg md:text-xl font-bold text-green-600 leading-tight">{Math.round(annualCO2Avoided * 25)}</p>
                <p className="text-[10px] sm:text-xs text-gray-600">Tonnes of CO<sub>2</sub></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RoofTypeSelector = ({ 
  selectedRoofType, 
  onRoofTypeChange 
}: { 
  selectedRoofType: 'concrete' | 'metal';
  onRoofTypeChange: (roofType: 'concrete' | 'metal') => void; 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onRoofTypeChange('concrete')}
        className={`p-4 border rounded-lg flex items-center transition-colors ${
          selectedRoofType === 'concrete' 
            ? 'border-primary bg-primary/10 text-primary' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <Layers className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Concrete Roof</div>
          <div className="text-sm text-gray-500">Requires drilling and anchoring</div>
        </div>
      </button>
      
      <button
        type="button"
        onClick={() => onRoofTypeChange('metal')}
        className={`p-4 border rounded-lg flex items-center transition-colors ${
          selectedRoofType === 'metal' 
            ? 'border-primary bg-primary/10 text-primary' 
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <Grid className="w-5 h-5 mr-3" />
        <div className="text-left">
          <div className="font-medium">Metal Roof (Yero)</div>
          <div className="text-sm text-gray-500">Uses clamp-based mounting</div>
        </div>
      </button>
    </div>
  );
};

// Add RegionSelector component after RoofTypeSelector component
const RegionSelector = ({ 
  selectedRegion, 
  onRegionChange 
}: { 
  selectedRegion: keyof typeof regionCosts;
  onRegionChange: (region: keyof typeof regionCosts) => void; 
}) => {
  return (
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(regionCosts).map(([regionKey, regionData]) => (
        <button
          key={regionKey}
          type="button"
          onClick={() => onRegionChange(regionKey as keyof typeof regionCosts)}
          className={`p-4 border rounded-lg flex items-center transition-colors ${
            selectedRegion === regionKey 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <MapPin className="w-5 h-5 mr-3 flex-shrink-0" />
          <div className="text-left">
            <div className="font-medium">{regionData.name}</div>
            <div className="text-sm text-gray-500">{regionData.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Add CurrentWeather component here
const CurrentWeather = ({ weatherData }: { weatherData: WeatherData }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-white">
      <div className="flex items-center gap-2 mb-4">
        <CloudSun size={20} className="text-primary" />
        <h3 className="text-xl font-bold">Current Weather</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Temperature */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-2">
            <Thermometer className="w-5 h-5 text-red-500" />
          </div>
          <span className="text-gray-600 text-sm mb-1">Temperature</span>
          <span className="text-2xl font-bold">
            {weatherData.temperature !== null ? `${weatherData.temperature.toFixed(1)}°C` : 'N/A'}
          </span>
        </div>
        
        {/* Wind */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 mb-2">
            <Wind className="w-5 h-5 text-blue-500" />
          </div>
          <span className="text-gray-600 text-sm mb-1">Wind Speed</span>
          <span className="text-2xl font-bold">
            {weatherData.windSpeed !== null ? `${weatherData.windSpeed.toFixed(1)} m/s` : 'N/A'}
          </span>
        </div>
        
        {/* Cloud Coverage */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 mb-2">
            <CloudSun className="w-5 h-5 text-gray-500" />
          </div>
          <span className="text-gray-600 text-sm mb-1">Cloud Coverage</span>
          <span className="text-2xl font-bold">
            {weatherData.clouds !== null ? `${(weatherData.clouds * 100).toFixed(0)}%` : 'N/A'}
          </span>
        </div>
        
        {/* Humidity */}
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 mb-2">
            <Droplets className="w-5 h-5 text-indigo-500" />
          </div>
          <span className="text-gray-600 text-sm mb-1">Humidity</span>
          <span className="text-2xl font-bold">
            {weatherData.humidity !== null ? `${weatherData.humidity.toFixed(0)}%` : 'N/A'}
          </span>
        </div>
      </div>
      
      <div className="mt-5 bg-gray-50 p-3 rounded-lg">
        <h4 className="text-sm font-semibold mb-1">Solar Impact</h4>
        <p className="text-xs text-gray-600">
          {weatherData.solarImpactScore 
            ? `Current weather conditions have a ${Number(weatherData.solarImpactScore) > 7 ? 'positive' : Number(weatherData.solarImpactScore) > 4 ? 'moderate' : 'negative'} impact on solar production.`
            : 'Weather impact data not available.'}
        </p>
      </div>
    </div>
  );
};

// Add new interface for package details
interface PackageDetails {
  name: string;
  code: string;
  type: 'ongrid' | 'hybrid'; // Add the system type to the package details
  watts: number;
  batteryCapacity: string;
  cashPrice: number;
  suitableFor: string;
}

// Add new interface for AI analysis
interface AIAnalysis {
  summary: string;
  recommendations: string[];
  financialInsights: string[];
  environmentalImpact: string[];
  risks: string[];
  nextSteps: string[];
}

// Add SystemTypeSelector component
const SystemTypeSelector = ({ 
  selectedType, 
  onTypeChange 
}: { 
  selectedType?: 'ongrid' | 'hybrid';
  onTypeChange: (type?: 'ongrid' | 'hybrid') => void; 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-gray-700 text-sm font-medium">
          System Type Preference
        </label>
        <button
          onClick={() => onTypeChange(undefined)}
          className="text-xs text-gray-500 hover:text-primary underline flex items-center gap-1"
        >
          <Bot className="w-3 h-3" />
          Let AI decide
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onTypeChange('ongrid')}
          className={`p-4 border rounded-lg flex items-center transition-colors ${
            selectedType === 'ongrid' 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center mr-3 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M18 12h-5" />
              <path d="M7 12h2" />
              <path d="M21 12h-1" />
              <path d="M4 12h1" />
              <path d="M3 12a9 9 0 0 1 9-9V1" />
              <path d="M21 12a9 9 0 0 0-9-9V1" />
              <path d="M3 12a9 9 0 0 0 9 9v2" />
              <path d="M21 12a9 9 0 0 1-9 9v2" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium">On-Grid System</div>
            <div className="text-sm text-gray-500">Grid-tied system without battery backup</div>
          </div>
        </button>
        
        <button
          type="button"
          onClick={() => onTypeChange('hybrid')}
          className={`p-4 border rounded-lg flex items-center transition-colors ${
            selectedType === 'hybrid' 
              ? 'border-primary bg-primary/10 text-primary' 
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="w-10 h-10 flex items-center justify-center mr-3 rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M11 4H7a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2v-5" />
              <path d="M18 2h-8a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h10a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
              <path d="M14 12v-4" />
              <path d="M12 10h4" />
            </svg>
          </div>
          <div className="text-left">
            <div className="font-medium">Hybrid System</div>
            <div className="text-sm text-gray-500">Grid-tied with battery backup</div>
          </div>
        </button>
      </div>
      
      <div className="text-sm text-gray-600 mt-2">
        {selectedType ? (
          <p>
            {selectedType === 'ongrid' 
              ? "On-grid systems are more cost-effective but don't provide power during outages."
              : "Hybrid systems provide backup power during outages but have higher upfront costs."}
          </p>
        ) : (
          <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
            <Bot className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-blue-700 font-medium">AI Recommendation Active</p>
              <p className="text-blue-600 text-xs mt-1">
                Our AI will analyze your usage patterns, budget, and location to recommend the most suitable system type for your needs. This ensures you get the best balance of cost, reliability, and functionality.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Remove Region Selector section and add this info text instead */}
      <div className="space-y-2 mt-6">
  <p className="text-sm text-gray-700 flex items-center">
    <MapPin className="w-4 h-4 text-primary mr-1 flex-shrink-0" />
    <span className="font-medium">Installation Location</span>
  </p>
  <p className="text-sm text-gray-500">
    Your installation region will be automatically detected when you select a location on the map in the next step.
  </p>
</div>
    </div>
  );
};

const SolarCalculator = forwardRef<HTMLDivElement, { isVisible: boolean }>(({ isVisible }, ref) => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<CalculatorInputs>({
    currentBill: 0,
    roofSize: 50,
    roofType: 'concrete',
    location: {
      lat: 0,
      lng: 0,
      address: ''
    },
    template: 'residential',
    region: 'metro-manila',
    systemType: undefined // No default system type selection, let AI decide
  });
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    savings: number;
    system: string;
    address?: string;
    location: {
      lat: number;
      lng: number;
    };
    roofType: 'concrete' | 'metal';
    roofTypeDetails: string;
    installationCost: number;
    formattedPayback: string;
    regionName: string;
    transportCost: number;
    additionalCosts: {
      netMeteringProcessingFee: number;
      otherFees: number;
      netMeteringPipingCost: number;
    };
    totalCost: number;
  } | null>(null);
  const [showWindyMap, setShowWindyMap] = useState(true); // Set to true by default to show the Windy map
  const [solarData, setSolarData] = useState<SolarData>({
    annualRadiation: null,
    peakSunHours: null,
    systemEfficiency: null,
  });
  const [pvgisData, setPvgisData] = useState<PVGISData>({});
  const [usePvgisData, setUsePvgisData] = useState(false);
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData>({
    temperature: null,
    windSpeed: null,
    windGust: null,
    clouds: null,
    humidity: null,
    pressure: null,
    dewpoint: null,
    precipType: null,
    forecastTime: null,
  });
  const [rawWindyData, setRawWindyData] = useState<any>(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [isFetchingPvgisData, setIsFetchingPvgisData] = useState(false);
  // Loading state for AI package recommendation
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  // Add a ref for the calculator content
  const calculatorContentRef = useRef<HTMLDivElement>(null);

  // Add new state variables
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [packageDetails, setPackageDetails] = useState<PackageDetails | null>(null);

  // Add a new state for system type notifications
  const [systemTypeNotification, setSystemTypeNotification] = useState<{
    show: boolean;
    message: string;
  } | null>(null);

  // Add this to the component's state
  const [isQuoteFormOpen, setIsQuoteFormOpen] = useState(false);

  // Dynamic calculator parameters that can be adjusted from admin panel
  const [dynamicParams, setDynamicParams] = useState<{
    templates: Record<string, Omit<SolarTemplate, 'icon' | 'tariffDetails'> & { icon?: React.ReactNode }>;
    regions: Record<string, any>;
    additionalCosts: Record<string, any>;
    defaultValues: {
      defaultSystemEfficiency: number;
      defaultAnnualRadiation: number;
      defaultPeakSunHours: number;
    };
  } | null>(null);

  // Fetch calculator parameters from MongoDB
  useEffect(() => {
    if (!isVisible) return;
    
    const fetchCalculatorParams = async () => {
      try {
        const response = await fetch('/api/calculator-params');
        if (response.ok) {
          const data = await response.json();
          
          // Convert regions from Map to object if needed
          const regions = typeof data.regions === 'object' && !Array.isArray(data.regions) 
            ? data.regions 
            : {};
          
          setDynamicParams({
            templates: data.templates,
            regions,
            additionalCosts: data.additionalCosts,
            defaultValues: data.defaultValues
          });
        }
      } catch (error) {
        console.error('Error fetching calculator parameters:', error);
      }
    };

    fetchCalculatorParams();
  }, [isVisible]);

  // Reset state when calculator is hidden
  useEffect(() => {
    if (!isVisible) {
      setStep(0);
      setResult(null);
      setIsCalculating(false);
      setShowWindyMap(false);
      setWeatherData({
        temperature: null,
        windSpeed: null,
        windGust: null,
        clouds: null,
        humidity: null,
        pressure: null,
        dewpoint: null,
        precipType: null,
        forecastTime: null,
      });
      setWeatherError(null);
    }
  }, [isVisible]);

  // Add this new function to normalize weather data from trial API
  const normalizeWeatherData = (data: any, index: number): WeatherData => {
    // Extract raw values
    const tempK = data['temp-surface'] ? data['temp-surface'][index] : null;
    const windU = data['wind_u-surface'] ? data['wind_u-surface'][index] : null;
    const windV = data['wind_v-surface'] ? data['wind_v-surface'][index] : null;
    const dewpointK = data['dewpoint-surface'] ? data['dewpoint-surface'][index] : null;
    
    // Extract and calculate other values
    const lowClouds = data['lclouds-surface'] ? data['lclouds-surface'][index] : 0;
    const midClouds = data['mclouds-surface'] ? data['mclouds-surface'][index] : 0;
    const highClouds = data['hclouds-surface'] ? data['hclouds-surface'][index] : 0;
    const cloudCoverage = (lowClouds + midClouds + highClouds) / 3;
    const forecastTime = new Date(data.ts[index]).toLocaleString();
    
    // Convert temperature from Kelvin to Celsius if needed and normalize
    let tempC = null;
    if (tempK !== null) {
      // Check if temperature is already in a realistic Celsius range
      if (tempK > 200) { // Likely in Kelvin
        tempC = tempK - 273.15; // Convert to Celsius
      } else {
        tempC = tempK; // Already in a realistic Celsius range
      }
      
      // Enforce realistic temperature bounds
      tempC = Math.max(-50, Math.min(50, tempC));
    }
    
    // Calculate wind speed from components if needed
    let windSpeed = null;
    if (data['wind-surface']) {
      windSpeed = data['wind-surface'][index];
    } else if (windU !== null && windV !== null) {
      windSpeed = Math.sqrt(windU * windU + windV * windV);
      // Enforce realistic wind speed (0-100 m/s)
      windSpeed = Math.max(0, Math.min(100, windSpeed));
    }
    
    // Convert dewpoint from Kelvin if needed
    let dewpointC = null;
    if (dewpointK !== null) {
      if (dewpointK > 200) { // Likely in Kelvin
        dewpointC = dewpointK - 273.15;
      } else {
        dewpointC = dewpointK;
      }
      // Ensure dewpoint is not higher than temperature
      if (tempC !== null) {
        dewpointC = Math.min(dewpointC, tempC);
      }
    }
    
    // Normalize pressure value
    let pressure = data['pressure-surface'] ? data['pressure-surface'][index] : null;
    if (pressure !== null) {
      // Convert from Pa to hPa if needed
      if (pressure > 50000) {
        pressure = pressure / 100;
      }
      // Enforce realistic pressure bounds (800-1100 hPa)
      pressure = Math.max(800, Math.min(1100, pressure));
    }
    
    // Normalize humidity
    let humidity = data['rh-surface'] ? data['rh-surface'][index] : null;
    if (humidity !== null) {
      // Ensure humidity is between 0-100%
      humidity = Math.max(0, Math.min(100, humidity));
    }
    
    // Normalize wind gust
    let windGust = data['gust-surface'] ? data['gust-surface'][index] : null;
    if (windGust !== null && windSpeed !== null) {
      // Ensure gust speed is at least as high as wind speed
      windGust = Math.max(windSpeed, windGust);
      // Enforce maximum realistic value
      windGust = Math.min(120, windGust);
    }
    
    return {
      temperature: tempC,
      windSpeed: windSpeed,
      windGust: windGust,
      clouds: cloudCoverage > 1 ? cloudCoverage / 100 : cloudCoverage, // Normalize to 0-1 range
      humidity: humidity,
      pressure: pressure,
      dewpoint: dewpointC,
      precipType: data['ptype-surface'] ? data['ptype-surface'][index] : null,
      forecastTime: forecastTime,
    };
  };

  const fetchWeatherData = async () => {
    setIsLoadingWeather(true);
    setWeatherError(null);
    
    try {
      const response = await fetch('/api/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: inputs.location.lat,
          lon: inputs.location.lng,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Weather API Error:', errorData);
        throw new Error(errorData.error || 'Failed to fetch weather data');
      }
      
      const data = await response.json();
      
      // Store the raw API data for download
      setRawWindyData(data);
      
      // Extract the first timestamp data (current forecast)
      if (data && data.ts && data.ts.length > 0) {
        const currentIndex = 0; // Get the first forecast point
        
        // Use the normalizeWeatherData function instead of the individual calculations
        setWeatherData(normalizeWeatherData(data, currentIndex));
      } else {
        throw new Error('No forecast data returned');
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setWeatherError(error instanceof Error ? error.message : 'Failed to fetch weather data. Please try again later.');
    } finally {
      setIsLoadingWeather(false);
    }
  };

  const calculateSavings = () => {
    setIsCalculating(true);
    
    // Simulate fetching solar data
    const simulateSolarDataFetch = () => {
      // If we already have PVGIS data, use that instead of simulating
      if (usePvgisData && pvgisData.annualRadiation && pvgisData.peakSunHours) {
        console.log('Using PVGIS data for calculations');
        
        // Keep the existing settings for system efficiency (use dynamicParams if available)
        const defaultEfficiency = dynamicParams?.defaultValues?.defaultSystemEfficiency || 18;
        const systemEfficiency = pvgisData.systemEfficiency || defaultEfficiency;
        
        setSolarData({
          annualRadiation: pvgisData.annualRadiation,
          peakSunHours: pvgisData.peakSunHours,
          systemEfficiency
        });
        
        return;
      }
      
      // These values would normally come from a real API
      // For now we're using simplified calculations based on latitude
      const latAbs = Math.abs(inputs.location.lat);
      
      // Get default values from dynamicParams if available
      const defaultAnnualRadiation = dynamicParams?.defaultValues?.defaultAnnualRadiation || 2200;
      const defaultPeakSunHours = dynamicParams?.defaultValues?.defaultPeakSunHours || 7;
      const defaultSystemEfficiency = dynamicParams?.defaultValues?.defaultSystemEfficiency || 18;
      
      // Rough estimate - equatorial regions get more solar radiation
      const annualRadiation = Math.max(1000, defaultAnnualRadiation - (latAbs * 20));
      
      // Approximate peak sun hours based on latitude (higher at equator)
      const peakSunHours = Math.max(3, defaultPeakSunHours - (latAbs * 0.08));
      const roundedPeakSunHours = Math.round(peakSunHours * 10) / 10; // Round to 1 decimal place
      
      setSolarData({
        annualRadiation,
        peakSunHours: roundedPeakSunHours,
        systemEfficiency: defaultSystemEfficiency
      });
    };
    
    // Start fetching weather data
    fetchWeatherData();
    
    // Simulate fetching solar data (or use PVGIS data if available)
    simulateSolarDataFetch();
    
    // Calculate savings based on current bill and solar template
    const billAmountYearly = inputs.currentBill * 12;
    
    // Get the selected template settings - use dynamicParams if available
    const templateData = dynamicParams?.templates?.[inputs.template] || solarTemplates[inputs.template];
    
    // Create a complete template with icon and tariff details
    const template = {
      ...templateData,
      icon: inputs.template === 'residential' ? 
        <Home className="w-5 h-5 mr-2" /> : 
        <Building className="w-5 h-5 mr-2" />,
      tariffDetails: solarTemplates[inputs.template].tariffDetails
    };
    
    // Get roof type specific costs
    const roofTypeDetails = template.roofTypeCosts[inputs.roofType];
    
    // Calculate system size based on current bill
    const templateSizes = template.systemSizes;
    let systemSize = 0;
    
    // For residential and hybrid templates, use roof size as a factor
    if (inputs.template === 'residential' || inputs.template === 'hybrid') {
      const maxSizeByRoof = inputs.roofSize * 0.17; // Approximate kWp capacity based on roof size
      
      // Find the appropriate system size from template
      if (inputs.currentBill < 1000) systemSize = Math.min(templateSizes[0], maxSizeByRoof);
      else if (inputs.currentBill < 3000) systemSize = Math.min(templateSizes[1], maxSizeByRoof);
      else if (inputs.currentBill < 5000) systemSize = Math.min(templateSizes[2], maxSizeByRoof);
      else if (inputs.currentBill < 10000) systemSize = Math.min(templateSizes[3], maxSizeByRoof);
      else systemSize = Math.min(templateSizes[4], maxSizeByRoof);
    } else {
      // For commercial, size is determined primarily by bill
      if (inputs.currentBill < 100000) systemSize = templateSizes[0];
      else if (inputs.currentBill < 200000) systemSize = templateSizes[1];
      else if (inputs.currentBill < 300000) systemSize = templateSizes[2];
      else if (inputs.currentBill < 400000) systemSize = templateSizes[3];
      else systemSize = templateSizes[4];
    }
    
    // Calculate electricity production and savings
    const annualProduction = usePvgisData && pvgisData.annualProduction 
      ? pvgisData.annualProduction 
      : systemSize * 1400; // Approximate annual kWh production
    
    // Calculate installation cost including roof type-specific costs
    const totalCostPerKw = template.costPerKw + roofTypeDetails.additionalCostPerKw;
    const installationCost = systemSize * totalCostPerKw;
    
    // Calculate transport costs based on region and system size
    // Use dynamicParams if available, otherwise use the hardcoded values
    const regionData = dynamicParams?.regions?.[inputs.region] || regionCosts[inputs.region];
    let transportCost = 0;
    
    if (systemSize <= 6) {
      transportCost = regionData.transportCosts.small;
    } else if (systemSize <= 10) {
      transportCost = regionData.transportCosts.medium;
    } else {
      transportCost = regionData.transportCosts.large;
    }
    
    // Get additional costs based on template (residential or commercial)
    // Use dynamicParams if available, otherwise use the hardcoded values
    const templateAdditionalCosts = dynamicParams?.additionalCosts?.[inputs.template === 'commercial' ? 'commercial' : 'residential'] || 
      additionalCosts[inputs.template === 'commercial' ? 'commercial' : 'residential'];
    
    // Calculate total cost including installation, transport, and additional fees
    const totalCost = installationCost + transportCost + 
      templateAdditionalCosts.netMeteringProcessingFee + 
      templateAdditionalCosts.otherFees + 
      templateAdditionalCosts.netMeteringPipingCost;
    
    // Calculate savings using expected electricity reduction percentage
    const savingsPercentage = template.electricityReduction * 100; // Convert from decimal to percentage
    const annualSavings = (billAmountYearly * savingsPercentage) / 100;
    
    // Calculate payback period based on total cost and annual savings
    const paybackYears = totalCost / annualSavings;
    const paybackMonths = Math.floor((paybackYears % 1) * 12);
    const formattedPayback = `${Math.floor(paybackYears)} years, ${paybackMonths} months`;
    
    // Calculate 25-year savings with annual inflation
    const annualInflation = template.annualInflation; // Already in decimal form
    let totalSavings = 0;
    
    for (let year = 0; year < 25; year++) {
      // Account for panel degradation each year
      const degradationFactor = 1 - (template.panelDegradation * year);
      
      // Calculate year's savings with inflation and degradation
      const yearSavings = annualSavings * Math.pow(1 + annualInflation, year) * degradationFactor;
      totalSavings += yearSavings;
    }
    
    // Apply a savings enhancement factor to account for additional benefits
    // Such as improved technology performance, tax benefits, and increased property value
    const savingsBoostFactor = 1.25; // 25% boost to estimated savings
    totalSavings = totalSavings * savingsBoostFactor;
    
    // Format the system description
    const panelCount = Math.ceil(systemSize * 1000 / template.panelWattage);
    const systemDescription = `${systemSize.toFixed(1)}kWp (${panelCount} panels)`;
    
    // Prepare the result object for state update
    const newResult = {
      savings: totalSavings,
      system: systemDescription,
      address: inputs.location.address,
      location: {
        lat: inputs.location.lat,
        lng: inputs.location.lng
      },
      roofType: inputs.roofType,
      roofTypeDetails: roofTypeDetails.installationDetails,
      installationCost: installationCost,
      formattedPayback: formattedPayback,
      regionName: regionData.name,
      transportCost: transportCost,
      additionalCosts: {
        netMeteringProcessingFee: templateAdditionalCosts.netMeteringProcessingFee,
        otherFees: templateAdditionalCosts.otherFees,
        netMeteringPipingCost: templateAdditionalCosts.netMeteringPipingCost
      },
      totalCost: totalCost
    };

    // Set the result state
    setResult(newResult);

    // Add a timeout to allow state to update and ensure we have all data before making the API call
    setTimeout(() => {
      generateAIAnalysis(newResult);
      setIsCalculating(false);
    }, 2000);
  };

  // Separate function for AI analysis to avoid timing issues
  const generateAIAnalysis = async (resultData: any) => {
    setIsLoadingPackage(true);
    
    try {
      const response = await fetch('/api/solar-ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs,
          result: resultData,
          weatherData,
          solarData,
          systemTypePreference: inputs.systemType // Add system type preference to the API call
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate AI analysis: ${response.status}`);
      }

      const data = await response.json();
      
      // Enhanced handling of system type preferences
      if (inputs.systemType && data.packageDetails) {
        console.log(`User selected system type: ${inputs.systemType}`);
        console.log(`API recommended package type: ${data.packageDetails.type}`);
        
        // If the recommended package doesn't match the user's preference
        if (data.packageDetails.type !== inputs.systemType) {
          console.log("Package type doesn't match preference, looking for alternatives");
          
          // Look for an alternative package that matches the preferred type
          if (data.alternativePackages && Array.isArray(data.alternativePackages)) {
            const alternativePackage = data.alternativePackages.find(
              (pkg: { type: string }) => pkg.type === inputs.systemType
            );
            
            if (alternativePackage) {
              console.log(`Found alternative package matching ${inputs.systemType}: ${alternativePackage.name}`);
              data.packageDetails = alternativePackage;
              
              // Clear any existing notification
              setSystemTypeNotification(null);
            } else {
              console.log(`No alternative ${inputs.systemType} packages found`);
              
              // Show notification that we're using the best available option
              setSystemTypeNotification({
                show: true,
                message: `No ${inputs.systemType === 'ongrid' ? 'on-grid' : 'hybrid'} system packages are available that match your requirements. We're showing the best alternative option.`
              });
              
              // We still use the AI's recommendation since no matching type is available
            }
          } else {
            console.log("No alternative packages available from API");
            
            // Show notification that we're using the best available option
            setSystemTypeNotification({
              show: true,
              message: `No ${inputs.systemType === 'ongrid' ? 'on-grid' : 'hybrid'} system packages are available. We're showing the best alternative.`
            });
          }
        } else {
          console.log("Package type matches user preference");
          
          // Clear any existing notification
          setSystemTypeNotification(null);
        }
      } else if (!inputs.systemType) {
        console.log("No system type preference set, using AI recommendation");
        
        // Clear any existing notification
        setSystemTypeNotification(null);
      }

      setAiAnalysis(data.analysis);
      setPackageDetails(data.packageDetails);
      
      // Update the result to show the package information
      setResult(prev => {
        if (prev && data.packageDetails) {
          return {
            ...prev,
            system: data.packageDetails.name,
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Error generating AI analysis:', error);
      // Set a default AI analysis in case of API failure
      setAiAnalysis({
        summary: `Based on your inputs${inputs.systemType ? ` and preference for a ${inputs.systemType} system` : ''}, we've selected a package that balances performance and cost. Our AI-powered analysis couldn't load fully, but you can still explore the recommended solar solution.`,
        recommendations: [
          "Consider your specific energy usage patterns when reviewing this recommendation.",
          "Roof orientation and shading are important factors to discuss during assessment.",
          "Ask our consultants about optimizing this package for your needs."
        ],
        financialInsights: [
          `${inputs.systemType === 'ongrid' ? 'On-grid systems typically have lower upfront costs.' : inputs.systemType === 'hybrid' ? 'Hybrid systems provide backup power but have higher initial costs.' : 'Solar systems typically provide positive ROI within 5-7 years.'}`,
          "Financing options can make installation more affordable upfront.",
          "Net metering can significantly improve your financial returns.",
          "Compare cash purchase versus financing based on your financial situation."
        ],
        environmentalImpact: [
          "Residential solar systems significantly reduce carbon emissions.",
          "Solar energy reduces dependence on fossil fuels.",
          "Your installation contributes to the renewable energy transition."
        ],
        risks: [
          "Weather patterns will affect daily production.",
          "Regular maintenance ensures optimal system performance.",
          "System warranty and support services are important considerations.",
          "Grid connection policies may change over time."
        ],
        nextSteps: [
          "Schedule a free on-site assessment for a detailed proposal.",
          "Speak with our solar consultants about customization options.",
          "Review financing and payment options.",
          "Discuss installation timeline and process."
        ]
      });
      
      // Make sure to set loading to false even in case of errors
      setIsLoadingPackage(false);
    }
    
    // Finally, set the loading package state to false
    setIsLoadingPackage(false);
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: any) => {
    setInputs((prev) => {
      // If changing template, adjust the currentBill to the template default
      if (field === 'template') {
        return {
          ...prev,
          [field]: value,
          currentBill: solarTemplates[value as keyof typeof solarTemplates].defaultBill
        };
      }
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  const generateWindyUrl = () => {
    const lat = inputs.location.lat;
    const lng = inputs.location.lng;
    return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lng}&zoom=10&level=surface&overlay=solarpower&menu=&message=&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&detailLat=${lat}&detailLon=${lng}&metricWind=default&metricTemp=default&radarRange=-1`;
  };

  // Function to download Windy API data as JSON
  const downloadWindyData = () => {
    if (!rawWindyData) return;
    
    // Create a copy of the data without the warning
    const cleanData = { ...rawWindyData };
    if (cleanData.warning) {
      delete cleanData.warning;
    }
    
    // Create a Blob containing the JSON data
    const jsonString = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `windy-weather-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  // Function to prepare and toggle JSON data view for dialog
  const [showJsonData, setShowJsonData] = useState(false);
  const [formattedJsonData, setFormattedJsonData] = useState('');
  
  // PVGIS data viewing state variables
  const [showPvgisJsonData, setShowPvgisJsonData] = useState(false);
  const [formattedPvgisJsonData, setFormattedPvgisJsonData] = useState('');
  
  const viewWindyData = () => {
    if (!rawWindyData) return;
    
    // Create a copy of the data without the warning
    const cleanData = { ...rawWindyData };
    if (cleanData.warning) {
      delete cleanData.warning;
    }
    
    // Format the JSON data with indentation
    const formattedJson = JSON.stringify(cleanData, null, 2);
    setFormattedJsonData(formattedJson);
    setShowJsonData(true);
  };
  
  // Function to close the JSON data dialog
  const closeJsonView = () => {
    setShowJsonData(false);
  };

  // Function to close the PVGIS JSON data dialog
  const closePvgisJsonView = () => {
    setShowPvgisJsonData(false);
  };

  // Function to download PVGIS data as JSON
  const downloadPvgisData = () => {
    if (!pvgisData.rawData) return;
    
    // Create a Blob containing the JSON data
    const jsonString = JSON.stringify(pvgisData.rawData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `pvgis-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  // Function to prepare and toggle PVGIS JSON data view for dialog
  const viewPvgisData = () => {
    if (!pvgisData.rawData) return;
    
    // Format the JSON data with indentation
    const formattedJson = JSON.stringify(pvgisData.rawData, null, 2);
    setFormattedPvgisJsonData(formattedJson);
    setShowPvgisJsonData(true);
  };

  // JSON Data Viewer Modal Component
  const JsonDataViewer = () => {
    if (!showJsonData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-bold text-lg">Windy API Raw Data</h3>
            <button 
              onClick={closeJsonView}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="overflow-auto p-4 flex-grow">
            <pre className="text-xs font-mono bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[60vh]">
              {formattedJsonData}
            </pre>
          </div>
          <div className="p-4 border-t flex justify-end">
            <button
              onClick={downloadWindyData}
              className="px-4 py-2 bg-primary border border-primary rounded-md hover:bg-primary-dark transition-colors flex items-center text-white"
            >
              <span className="mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
              </span>
              Download JSON
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PVGIS JSON Data Viewer Modal Component
  const PvgisJsonDataViewer = () => {
    if (!showPvgisJsonData) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b">
            <div className="flex items-center">
              <img 
                src="https://commission.europa.eu/themes/contrib/oe_theme/dist/ec/images/logo/positive/logo-ec--en.svg" 
                alt="European Commission Logo" 
                className="h-6 mr-3" 
              />
              <h3 className="font-bold text-lg">PVGIS API Raw Data</h3>
            </div>
            <button 
              onClick={closePvgisJsonView}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="overflow-auto p-4 flex-grow">
            <pre className="text-xs font-mono bg-gray-100 p-4 rounded-md overflow-x-auto whitespace-pre-wrap max-h-[60vh]">
              {formattedPvgisJsonData}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  const handlePvgisDataFetched = (data: any) => {
    if (!data) return;
    
    try {
      // Extract relevant data from PVGIS response
      const annualRadiation = data.outputs.totals.fixed.H_y;
      const annualProduction = data.outputs.totals.fixed.E_y;
      const peakSunHours = annualRadiation / 365;
      
      // Update PVGIS data state
      setPvgisData({
        annualRadiation,
        annualProduction,
        peakSunHours,
        systemEfficiency: data.outputs.totals.fixed ? 
          100 - data.outputs.totals.fixed.l_total : undefined
      });
      
      // Update existing solar data with PVGIS values
      setSolarData(prev => ({
        ...prev,
        annualRadiation: annualRadiation || null,
        peakSunHours: annualRadiation ? Math.round((annualRadiation / 365) * 10) / 10 : null // Round to 1 decimal place
      }));
      
      setUsePvgisData(true);
    } catch (error) {
      console.error('Error processing PVGIS data:', error);
    }
  };

  // Add a function to generate PVGIS radiation data
  const generateRadiationData = async (lat: number, lng: number) => {
    console.log('📊 Generating solar radiation data for:', { lat, lng });
    setIsFetchingPvgisData(true);
    try {
      const data = await fetchPVGISMonthlyRadiation(lat, lng);
      
      console.log('✅ Radiation data generated successfully:', data);
      
      // Update PVGIS data state
      setPvgisData({
        annualRadiation: data.annualRadiation,
        peakSunHours: data.peakSunHours,
        monthlyRadiation: data.monthlyRadiation,
        systemEfficiency: 18 // Default system efficiency
      });
      
      // Update solar data state as well
      setSolarData(prev => ({
        ...prev,
        annualRadiation: data.annualRadiation || null,
        peakSunHours: data.peakSunHours || null,
        systemEfficiency: 18
      }));
      
      setUsePvgisData(true);
    } catch (error) {
      console.error('❌ Error generating radiation data:', error);
    } finally {
      setIsFetchingPvgisData(false);
    }
  };

  // Find the location change handler and add the PVGIS data fetch
  useEffect(() => {
    console.log('🗺️ Location changed:', inputs.location);
    if (inputs.location && inputs.location.lat && inputs.location.lng) {
      console.log('🔍 Valid location detected, fetching PVGIS data...');
      fetchPVGISData(inputs.location.lat, inputs.location.lng);
    } else {
      console.log('⚠️ No valid location to fetch PVGIS data');
    }
  }, [inputs.location.lat, inputs.location.lng]);

  // Add a function to fetch PVGIS monthly radiation data
  const fetchPVGISData = async (lat: number, lng: number) => {
    console.log('📡 Attempting to fetch PVGIS data for:', { lat, lng });
    setIsFetchingPvgisData(true);
    try {
      const data = await fetchPVGISMonthlyRadiation(lat, lng);
      
      console.log('✅ PVGIS data fetched successfully:', data);
      
      // Update PVGIS data state
      setPvgisData({
        annualRadiation: data.annualRadiation,
        peakSunHours: data.peakSunHours,
        monthlyRadiation: data.monthlyRadiation,
        systemEfficiency: 18, // Default system efficiency
        rawData: data // Store the raw data for download/view
      });
      
      // Update solar data state as well
      setSolarData(prev => ({
        ...prev,
        annualRadiation: data.annualRadiation || null,
        peakSunHours: data.peakSunHours || null,
        systemEfficiency: 18
      }));
      
      setUsePvgisData(true);
    } catch (error) {
      console.error('❌ Error fetching PVGIS data:', error);
      
      // Create simulated data for development/testing purposes
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Using simulated data for development');
        const simulatedData = generateSimulatedRadiationData();
        setPvgisData({
          annualRadiation: simulatedData.annualRadiation,
          peakSunHours: simulatedData.peakSunHours,
          monthlyRadiation: simulatedData.monthlyRadiation,
          systemEfficiency: 18,
          rawData: simulatedData // Include simulated raw data
        });
        setSolarData(prev => ({
          ...prev,
          annualRadiation: simulatedData.annualRadiation,
          peakSunHours: simulatedData.peakSunHours
        }));
        setUsePvgisData(true);
      } else {
        // Show error message
        alert("Unable to retrieve solar radiation data from PVGIS API. Please try again later or check your internet connection.");
      }
    } finally {
      setIsFetchingPvgisData(false);
    }
  };

  // Helper function to generate simulated radiation data for development
  const generateSimulatedRadiationData = () => {
    // Philippines has good solar potential with seasonal variation
    const monthlyRadiation = [
      { month: "January", radiation: 130 },
      { month: "February", radiation: 140 },
      { month: "March", radiation: 170 },
      { month: "April", radiation: 185 },
      { month: "May", radiation: 190 },
      { month: "June", radiation: 165 },
      { month: "July", radiation: 155 },
      { month: "August", radiation: 150 },
      { month: "September", radiation: 145 },
      { month: "October", radiation: 140 },
      { month: "November", radiation: 130 },
      { month: "December", radiation: 120 }
    ];
    
    const annualRadiation = monthlyRadiation.reduce((sum, month) => sum + month.radiation, 0);
    const peakSunHours = Math.round((annualRadiation / 365) * 10) / 10;
    
    return {
      monthlyRadiation,
      annualRadiation,
      peakSunHours
    };
  };

  // Enhanced Current Weather component to show weather data in a more visual format
  const CurrentWeather = ({ weatherData }: { weatherData: WeatherData }) => {
    return (
      <div className="border border-gray-100 rounded-xl p-5 bg-white shadow-sm">
        <h3 className="text-xl font-bold mb-5">Current Weather Conditions</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Temperature */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-2">
              <Thermometer className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-gray-600 text-sm mb-1">Temperature</span>
            <span className="text-2xl font-bold">
              {weatherData.temperature !== null ? `${weatherData.temperature.toFixed(1)}°C` : 'N/A'}
            </span>
          </div>
          
          {/* Wind */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 mb-2">
              <Wind className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-gray-600 text-sm mb-1">Wind Speed</span>
            <span className="text-2xl font-bold">
              {weatherData.windSpeed !== null ? `${weatherData.windSpeed.toFixed(1)} m/s` : 'N/A'}
            </span>
          </div>
          
          {/* Cloud Coverage */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-50 mb-2">
              <CloudSun className="w-5 h-5 text-gray-500" />
            </div>
            <span className="text-gray-600 text-sm mb-1">Cloud Coverage</span>
            <span className="text-2xl font-bold">
              {weatherData.clouds !== null ? `${(weatherData.clouds * 100).toFixed(0)}%` : 'N/A'}
            </span>
          </div>
          
          {/* Humidity */}
          <div className="flex flex-col items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 mb-2">
              <Droplets className="w-5 h-5 text-indigo-500" />
            </div>
            <span className="text-gray-600 text-sm mb-1">Humidity</span>
            <span className="text-2xl font-bold">
              {weatherData.humidity !== null ? `${weatherData.humidity.toFixed(0)}%` : 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="mt-5 bg-gray-50 p-3 rounded-lg">
          <h4 className="text-sm font-semibold mb-1">What does this mean?</h4>
          <p className="text-xs text-gray-600">
            The chart above shows the estimated monthly solar radiation in kWh/m² for your location. Higher values indicate better potential for solar energy generation. The Philippines receives excellent solar radiation throughout the year, with some seasonal variation. Even in the lowest month (December), there is still good solar potential compared to many other regions.
          </p>
        </div>
      </div>
    );
  };

  // Add determineRegionFromCoordinates function after the import statements around line 134
  const determineRegionFromCoordinates = (lat: number, lng: number): keyof typeof regionCosts => {
    // These are approximate boundaries for the regions in the Philippines
    // Metro Manila - approximate bounding box
    if (lat >= 14.4 && lat <= 14.8 && lng >= 120.9 && lng <= 121.1) {
      return 'metro-manila';
    }
    
    // Central Luzon - covers provinces like Bulacan, Pampanga, Nueva Ecija, etc.
    if (lat >= 14.8 && lat <= 16.5 && lng >= 119.8 && lng <= 121.5) {
      return 'central-luzon';
    }
    
    // CALABARZON - covers Cavite, Laguna, Batangas, Rizal, Quezon
    if (lat >= 13.4 && lat <= 14.4 && lng >= 120.5 && lng <= 122.3) {
      return 'calabarzon';
    }
    
    // Northern Luzon - covers the northern provinces like Ilocos, Cagayan, etc.
    if (lat >= 16.5 && lat <= 19.0 && lng >= 119.8 && lng <= 122.5) {
      return 'northern-luzon';
    }
    
    // Southern Luzon - mainly Bicol region
    if (lat >= 12.5 && lat <= 14.1 && lng >= 122.0 && lng <= 124.5) {
      return 'southern-luzon';
    }
    
    // Default to Metro Manila if not in any defined region
    return 'metro-manila';
  };

  // Now update the MapSelector component's onLocationChange prop handler in SolarCalculator component
  // Find the existing handleInputChange function and add this after it

  // Update the fetchAddressFromCoordinates function to also update the region
  const fetchAddressFromCoordinates = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en-US,en;q=0.9',
            'User-Agent': 'Solar Calculator Application',
          },
        }
      );
      
      if (!response.ok) {
        console.error('Error fetching address:', response.statusText);
        return null;
      }
      
      const data = await response.json();
      
      // Determine region from coordinates
      const region = determineRegionFromCoordinates(lat, lng);
      // Update the region based on the coordinates
      handleInputChange('region', region);
      
      return data.display_name || 'Unknown location';
    } catch (error) {
      console.error('Error fetching address:', error);
      return null;
    }
  };

  // Add handleLocationUpdate function after the fetchAddressFromCoordinates function
  const handleLocationUpdate = async (lat: number, lng: number) => {
    // Update the location state
    handleInputChange('location', {
      ...inputs.location,
      lat,
      lng,
    });
    
    // Fetch and update the address, this will also update the region via fetchAddressFromCoordinates
    const address = await fetchAddressFromCoordinates(lat, lng);
    if (address) {
      handleInputChange('location', {
        lat,
        lng,
        address,
      });
    }
  };

  // Add a function to handle step changes that includes scrolling
  const handleStepChange = (newStep: number) => {
    setStep(newStep);
    // Scroll to the top of the calculator content with smooth behavior
    setTimeout(() => {
      if (calculatorContentRef.current) {
        calculatorContentRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }
    }, 100); // Small delay to ensure DOM updates before scrolling
  };

  // Add a CollapsibleContent component for the sections that need to be collapsible
  const CollapsibleContent = ({ 
    title, 
    icon, 
    children,
    defaultOpen = false
  }: { 
    title: string; 
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultOpen?: boolean;
  }) => {
    const [isExpanded, setIsExpanded] = useState(defaultOpen);
    
    return (
      <div className="mt-4">
        <button 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg border border-gray-200"
        >
          <span className="font-medium text-gray-700 flex items-center text-sm sm:text-base">
            {icon}
            {title}
          </span>
          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="calculator-container"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="min-h-screen bg-gray-50 flex items-center justify-center py-6 sm:py-16"
        >
          <div className="container mx-auto px-4 w-full">
            <motion.div 
              key="calculator-content"
              ref={calculatorContentRef} 
              className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-4 sm:p-6 md:p-8"
            >
              {!isCalculating && !result ? (
                <>
                  <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
                      <h2 className="text-2xl sm:text-3xl font-bold">Solar Savings Calculator</h2>
                      <div className="flex space-x-2">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${step === i ? 'bg-accent-1' : 'bg-gray-200'}`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-8">
                      {step === 0 && (
                        <motion.div
                          key="step-bill"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-6"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 text-primary">
                            <Calculator className="w-6 h-6 sm:w-8 sm:h-8" />
                            <h3 className="text-xl sm:text-2xl font-semibold">Current Electric Bill</h3>
                          </div>
                          
                          {/* Add Template Selector */}
                          <div className="mb-6">
                            <label className="block text-gray-700 mb-2">
                              Select System Type
                            </label>
                            <TemplateSelector 
                              selectedTemplate={inputs.template}
                              onTemplateChange={(template) => handleInputChange('template', template)}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              {solarTemplates[inputs.template].description}. Typical payback period: {solarTemplates[inputs.template].paybackPeriod}
                            </p>
                          </div>
                          
                          <div className="space-y-4">
                            <label className="block text-gray-700 text-sm font-medium">
                              Monthly Electric Bill (₱) <span className="text-red-500">*</span>
                            </label>
                           
                           <div className="relative">
                              <input
                                type="text"
                                value={inputs.currentBill > 0 ? inputs.currentBill : ''}
                                onChange={(e) => {
                                  // Allow only numbers
                                  const value = e.target.value.replace(/[^0-9]/g, '');
                                  handleInputChange('currentBill', value ? Number(value) : 0);
                                }}
                                className="w-full p-4 pl-14 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Enter your monthly bill"
                                inputMode="numeric"
                                pattern="[0-9]*"
                              />
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                            </div>
                          </div>
                          
                          {/* Add Roof Type Selector */}
                          <div className="space-y-4 mt-6">
                            <label className="block text-gray-700 text-sm font-medium">
                              Roof Type <span className="text-red-500">*</span>
                            </label>
                            <RoofTypeSelector 
                              selectedRoofType={inputs.roofType}
                              onRoofTypeChange={(roofType) => handleInputChange('roofType', roofType)}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                              {inputs.roofType === 'concrete' 
                                ? solarTemplates[inputs.template].roofTypeCosts.concrete.installationDetails
                                : solarTemplates[inputs.template].roofTypeCosts.metal.installationDetails}
                            </p>
                          </div>



                          {/* Add System Type Selector */}
                          <div className="space-y-4 mt-6">
                            <SystemTypeSelector 
                              selectedType={inputs.systemType}
                              onTypeChange={(type) => handleInputChange('systemType', type)}
                            />
                          </div>
                        </motion.div>
                      )}

                      {step === 1 && (
                        <motion.div
                          key="step-roof"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-3"
                        >
                          <div className="flex items-center gap-2 text-primary">
                            <Ruler className="w-6 h-6" />
                            <h3 className="text-xl font-semibold">Roof Size</h3>
                          </div>
                          
                          {/* Roof size visualization */}
                          <RoofSizeVisualization size={inputs.roofSize} />
                          
                          {/* Simplified slider input */}
                          <div>
                            <div className="flex justify-between text-xs text-gray-500 px-1 mb-1">
                              <span>Small</span>
                              <span>Medium</span>
                              <span>Large</span>
                              <span>XL</span>
                              <span>XXL</span>
                            </div>
                            
                            <input
                              type="range"
                              min="10"
                              max="200"
                              step="5"
                              value={inputs.roofSize || 10}
                              onChange={(e) => handleInputChange('roofSize', Number(e.target.value))}
                              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                              style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(inputs.roofSize - 10) / 1.9}%, #e5e7eb ${(inputs.roofSize - 10) / 1.9}%, #e5e7eb 100%)`,
                              }}
                            />
                            
                            <div className="flex justify-between text-[8px] text-gray-400 px-1 mt-1">
                              <span>10m²</span>
                              <span>40m²</span>
                              <span>70m²</span>
                              <span>100m²</span>
                              <span>150m²+</span>
                            </div>
                          </div>

                          {/* Manual input field - Compact version */}
                          <div className="flex items-center justify-between mt-3 bg-gray-50 rounded p-2">
                            <div className="text-xs text-gray-600">Manual input:</div>
                            <div className="flex items-center">
                              <input
                                type="number"
                                min="10"
                                max="200"
                                value={inputs.roofSize || ''}
                                onChange={(e) => handleInputChange('roofSize', Number(e.target.value))}
                                className="w-14 p-1 border border-gray-300 rounded text-center text-sm"
                              />
                              <span className="text-xs text-gray-600 ml-1">m²</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-gray-500 mt-2 text-center">Typical residential systems need 15-30m²</p>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="step-location"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-4 sm:space-y-6"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 text-primary">
                            <MapPin className="w-6 h-6 sm:w-8 sm:h-8" />
                            <h3 className="text-xl sm:text-2xl font-semibold">System Location <span className="text-red-500">*</span></h3>
                          </div>
                          <div className="space-y-4">
                            <MapSelector 
                              location={inputs.location}
                              onLocationChange={(lat, lng) => {
                                console.log('🗺️ Location selected:', { lat, lng });
                                setInputs(prev => ({
                                  ...prev,
                                  location: { lat, lng, address: prev.location.address }
                                }));
                                
                                // Fetch address and automatically set region based on coordinates
                                fetchAddressFromCoordinates(lat, lng).then(address => {
                                  if (address) {
                                    setInputs(prev => ({
                                      ...prev,
                                      location: { ...prev.location, address }
                                    }));
                                  }
                                });
                                
                                // Fetch PVGIS data for this location
                                fetchPVGISData(lat, lng);
                              }}
                            />
                            
                            {/* Display detected region if available */}
                            {inputs.location.lat !== 0 && inputs.location.lng !== 0 && (
                              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-start">
                                  <MapPin className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-700">Detected Installation Region</p>
                                    <p className="text-sm text-primary font-medium">{regionCosts[inputs.region].name}</p>
                                    <p className="text-xs text-gray-500 mt-1">{regionCosts[inputs.region].description}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-gray-500 mt-4">
                              Click on the map to select your exact installation location. Your region will be automatically detected.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    {step > 0 && (
                      <button
                        onClick={() => handleStepChange(step - 1)}
                        className="px-4 sm:px-6 py-2 sm:py-3 text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-colors text-sm sm:text-base"
                      >
                        Previous
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (step === 0 && inputs.currentBill <= 0) {
                          // Show error for empty bill amount
                          alert("Please enter your monthly electricity bill amount");
                          return;
                        }
                        if (step === 2 && inputs.location.lat === 0 && inputs.location.lng === 0) {
                          // Show error for no location selected
                          alert("Please select your location on the map");
                          return;
                        }
                        if (step < 2) handleStepChange(step + 1);
                        else calculateSavings();
                      }}
                      className="px-4 sm:px-6 py-2 sm:py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors ml-auto text-sm sm:text-base"
                    >
                      {step === 2 ? 'Calculate Savings' : 'Next'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-2">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                </>
              ) : isCalculating ? (
                <div className="flex flex-col items-center justify-center min-h-[400px]">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="mb-6"
                  >
                    <Sun className="w-16 h-16 text-accent-2" />
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-center">Calculating your savings...</h3>
                  <p className="text-gray-500 mt-2 text-center">Please wait while we analyze your data</p>
                </div>
              ) : result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <div className="p-4 sm:p-6 border border-accent-1 rounded-xl bg-accent-1/5">
                    {/* Savings estimate header */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2">Your Solar Savings Estimate</h3>

                    {/* Add system type notification when a mismatch occurs */}
                    {systemTypeNotification && systemTypeNotification.show && (
                      <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-start">
                        <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{systemTypeNotification.message}</p>
                          <p className="text-xs mt-1">You can go back to change your preferences or continue with this recommendation.</p>
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-gray-600 mb-1">Estimated 25-Year Savings</p>
                        <div className="flex items-center">
                          <p className="text-4xl font-bold text-primary">
                            ₱{Math.round(result.savings).toLocaleString()}
                          </p>
                          <InfoTooltip content="This estimate is based on your current electricity bill, projected over 25 years with 4% annual electricity price inflation, standard panel degradation, and adjusted for local weather conditions including temperature, cloud coverage, and humidity." />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center mb-1">
                          <p className="text-gray-600">Recommended Package</p>
                          {packageDetails && !isLoadingPackage && (
                            <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-md flex items-center">
                              <Bot className="w-3 h-3 mr-1" />
                              AI Selected
                            </span>
                          )}
                          {isLoadingPackage && (
                            <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-md flex items-center">
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              AI Selecting...
                            </span>
                          )}
                        </div>
                        <div className="flex items-center">
                          {isLoadingPackage ? (
                            <div className="flex items-center">
                              <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
                              <InfoTooltip content="Our AI is analyzing your usage patterns and preferences to select the optimal solar package for you." />
                            </div>
                          ) : (
                            <>
                              <p className="text-4xl font-bold text-primary">
                                {packageDetails ? packageDetails.name : result.system}
                              </p>
                              <InfoTooltip content={`${packageDetails ? packageDetails.code : ''} - System optimized for your usage pattern with ${packageDetails ? packageDetails.batteryCapacity : ''} battery backup for power outages.`} />
                            </>
                          )}
                        </div>
                        {packageDetails && !isLoadingPackage && (
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-500">Package Code:  {packageDetails.code}</p>
                            <p className="text-sm text-gray-500 ml-3">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                              Perfect match for your ₱{inputs.currentBill.toLocaleString()} bill
                            </p>
                          </div>
                        )}
                        {isLoadingPackage && (
                          <div className="flex items-center mt-1">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse ml-3"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Display location address if available */}
                    {result.address && (
                      <CollapsibleSection 
                        title="Installation Location" 
                        icon={<MapPin className="w-5 h-5 text-primary mr-2" />}
                        defaultOpen={true}
                      >
                        <div className="mt-2">
                          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-start">
                              <MapPin className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-gray-700">Installation Location</p>
                                <p className="text-sm text-gray-600">{result.address}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Display satellite view of the location */}
                          <div className="mt-4">
                            <LocationSatelliteView 
                              lat={result.location.lat} 
                              lng={result.location.lng}
                              title="Installation Site Satellite View"
                              width={600}
                              height={400}
                              zoom={100} // Higher zoom to see rooftops more clearly
                            />
                          </div>
                        </div>
                      </CollapsibleSection>
                    )}
                    
                    {/* Display roof type details */}
                    <CollapsibleSection 
                      title={result.roofType === 'concrete' ? 'Concrete Roof' : 'Metal Roof (Yero)'} 
                      icon={result.roofType === 'concrete' ? 
                        <Layers className="w-5 h-5 text-primary mr-2" /> : 
                        <Grid className="w-5 h-5 text-primary mr-2" />
                      }
                    >
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          {result.roofType === 'concrete' ? (
                            <Layers className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                          ) : (
                            <Grid className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {result.roofType === 'concrete' ? 'Concrete Roof' : 'Metal Roof (Yero)'}
                            </p>
                            <p className="text-sm text-gray-600 mb-2">{result.roofTypeDetails}</p>
                            <div className="flex flex-col space-y-1">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Installation Cost:</span>
                                <span className="text-xs font-medium">₱{Math.round(result.installationCost).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-500">Estimated Payback Period:</span>
                                <span className="text-xs font-medium">{result.formattedPayback}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleSection>
                    
                    {/* Display package details or additional costs */}
                    <CollapsibleSection 
                      title={packageDetails ? `Package Details: ${packageDetails.code}` : `${result.regionName} - Transport & Additional Costs`} 
                      icon={packageDetails ? 
                        <Package className="w-5 h-5 text-primary mr-2" /> : 
                        <MapPin className="w-5 h-5 text-primary mr-2" />
                      }
                    >
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start">
                          {packageDetails ? (
                            <>
                              <Package className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">
                                  Package Details: {packageDetails.code}
                                </p>
                                <div className="flex flex-col space-y-1 mt-2">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">System Size:</span>
                                    <span className="text-xs font-medium">{(packageDetails.watts/1000).toFixed(2)} kWp</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Battery Capacity:</span>
                                    <span className="text-xs font-medium">{packageDetails.batteryCapacity}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">SRP Price:</span>
                                    <span className="text-xs font-medium">₱{packageDetails.cashPrice.toLocaleString()}</span>
                                  </div>
                                  <div className="border-t border-gray-200 my-1 pt-1"></div>
                                  <div className="flex justify-between font-medium">
                                    <span className="text-xs text-gray-700">Cash Price:</span>
                                    <span className="text-xs text-primary">₱{packageDetails.cashPrice.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span className="text-xs text-gray-700">Financing Price:</span>
                                    <span className="text-xs text-primary">₱{Math.round(packageDetails.cashPrice * 1.15).toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between text-xs text-gray-500 mt-1 italic">
                                    <span>Suitable for:</span>
                                    <span>{packageDetails.suitableFor}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-5 h-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700">
                                  {result.regionName} - Transport & Additional Costs
                                </p>
                                <div className="flex flex-col space-y-1 mt-2">
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Transport & Mobilization:</span>
                                    <span className="text-xs font-medium">₱{result.transportCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Net Metering Processing Fee:</span>
                                    <span className="text-xs font-medium">₱{result.additionalCosts.netMeteringProcessingFee.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Net Metering Piping Cost:</span>
                                    <span className="text-xs font-medium">₱{result.additionalCosts.netMeteringPipingCost.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-xs text-gray-500">Other Fees (Meralco):</span>
                                    <span className="text-xs font-medium">₱{result.additionalCosts.otherFees.toLocaleString()}</span>
                                  </div>
                                  <div className="border-t border-gray-200 my-1 pt-1"></div>
                                  <div className="flex justify-between font-medium">
                                    <span className="text-xs text-gray-700">Total System Cost:</span>
                                    <span className="text-xs text-primary">₱{Math.round(result.totalCost).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CollapsibleSection>
                    
                    {/* Add disclaimer about the estimated nature of savings */}
                    <SavingsDisclaimer />
                  </div>
                  
                  {/* Add the savings projection chart component */}
                  <div className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-white mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Projected Savings Over Time</h3>
                    <p className="text-xs sm:text-sm text-amber-600 mb-2 sm:mb-4 flex items-center">
                      <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                      These projections are estimates only and may not reflect actual future results.
                    </p>
                    <SavingsProjectionChart 
                      currentBill={inputs.currentBill} 
                      template={inputs.template} 
                      region={inputs.region}
                    />
                  </div>
                  
                  {/* Add Environmental Benefits section for commercial template */}
                  {inputs.template === 'commercial' && result && (
                    <CollapsibleSection 
                      title="Environmental Benefits" 
                      icon={<Leaf className="w-5 h-5 text-primary mr-2" />}
                    >
                      <div className="mt-2">
                        <EnvironmentalBenefits systemSize={
                          // Calculate system size based on current inputs
                          (() => {
                            const templateSizes = solarTemplates[inputs.template].systemSizes;
                            let size = 0;
                            if (inputs.currentBill < 100000) size = templateSizes[0];
                            else if (inputs.currentBill < 200000) size = templateSizes[1];
                            else if (inputs.currentBill < 300000) size = templateSizes[2];
                            else if (inputs.currentBill < 400000) size = templateSizes[3];
                            else size = templateSizes[4];
                            return size;
                          })()
                        } template={inputs.template} />
                      </div>
                    </CollapsibleSection>
                  )}
                  
                  {/* Add Tariff Details Table */}
                  <div className="border border-gray-200 rounded-xl p-4 sm:p-6 bg-white mt-4 sm:mt-6">
                    <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 flex items-center">
                      <Calculator size={20} className="text-primary mr-2" />
                      Electricity Components
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
                      Your electricity bill consists of several components that affect your potential savings. Actual rates will be calculated during consultation.
                    </p>
                    <TariffDetailsTable 
                      tariffDetails={solarTemplates[inputs.template].tariffDetails} 
                    />
                  </div>
                  
                  {solarData.annualRadiation && (
                    <CollapsibleSection 
                      title="Solar Potential Analysis" 
                      icon={<Sun size={20} className="text-primary mr-2" />}
                    >
                      <div className="mt-2">
                        <SolarPotentialGauge value={solarData.annualRadiation} />
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center">
                              <p className="text-gray-600 text-sm">Annual Solar Radiation</p>
                              <InfoTooltip content="The amount of solar energy available at your location annually (kWh/m²/year). Higher values indicate better solar potential." />
                            </div>
                            <p className="text-2xl font-bold text-primary">{Math.round(solarData.annualRadiation)} kWh/m²</p>
                          </div>
                          
                          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center">
                              <p className="text-gray-600 text-sm">Peak Sun Hours</p>
                              <InfoTooltip content="Average daily hours of optimal sunlight for solar energy production. More peak sun hours mean more energy generation." />
                            </div>
                            <p className="text-2xl font-bold text-primary">{solarData.peakSunHours !== null ? solarData.peakSunHours.toFixed(1) : 'N/A'} hours/day</p>
                          </div>
                          
                          <div className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                            <div className="flex items-center">
                              <p className="text-gray-600 text-sm">System Efficiency</p>
                              <InfoTooltip content="The percentage of solar energy that can be converted to electricity with modern solar panel systems in your area." />
                            </div>
                            <p className="text-2xl font-bold text-primary">{solarData.systemEfficiency}%</p>
                          </div>
                        </div>
                        
                        {/* Monthly Solar Radiation Chart - keep this part inside the collapsible */}
                        {pvgisData.monthlyRadiation && pvgisData.monthlyRadiation.length > 0 && (
                          <div className="mt-8">
                            <div className="flex items-center gap-2 mb-4">
                              <BarChart3 size={20} className="text-primary" />
                              <h3 className="text-xl font-bold">Monthly Solar Radiation</h3>
                              <InfoTooltip content="These values represent actual solar radiation data from the European Commission's PVGIS (Photovoltaic Geographical Information System) for your specific location." />
                            </div>
                            {/* The chart component would be here */}
                          </div>
                        )}
                      </div>
                    </CollapsibleSection>
                  )}
                  
                  {/* Show current weather data if available */}
                  {weatherData && !isLoadingWeather && (
                    <div className="mt-8">
                      <CurrentWeather weatherData={weatherData} />
                    </div>
                  )}
                  
                  {/* Weather Conditions section - Replace with CollapsibleContent */}
                  <CollapsibleContent 
                    title="Current Weather Conditions" 
                    icon={<CloudSun size={20} className="text-primary mr-2" />}
                  >
                    <div className="mt-2 bg-gray-50 p-4 sm:p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-500">
                          {weatherData.forecastTime ? `As of: ${weatherData.forecastTime}` : ''}
                        </p>
                      </div>
                      
                      {isLoadingWeather ? (
                        <div className="flex justify-center items-center py-4">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                          >
                            <CloudSun className="w-8 h-8 text-gray-400" />
                          </motion.div>
                          <span className="ml-3 text-gray-500">Loading weather data...</span>
                        </div>
                      ) : weatherError ? (
                        <div className="text-center text-red-500 py-2">{weatherError}</div>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="flex items-center gap-2">
                              <Thermometer size={16} className="text-primary" />
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm text-gray-600">Temperature</p>
                                  <InfoTooltip content="Solar panel output decreases slightly as temperature increases above 25°C. Each degree over 25°C typically reduces efficiency by 0.4-0.5%." />
                                </div>
                                <p className="font-medium">{weatherData.temperature !== null ? `${weatherData.temperature.toFixed(1)}°C` : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Wind size={16} className="text-primary" />
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm text-gray-600">Wind Speed</p>
                                  <InfoTooltip content="Moderate wind helps cool solar panels, improving efficiency. High winds could potentially damage systems if not properly installed." />
                                </div>
                                <p className="font-medium">{weatherData.windSpeed !== null ? `${weatherData.windSpeed.toFixed(1)} m/s` : 'N/A'}</p>
                                {weatherData.windGust !== null && (
                                  <p className="text-xs text-gray-500">Gusts: {weatherData.windGust.toFixed(1)} m/s</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <CloudSun size={16} className="text-primary" />
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm text-gray-600">Cloud Coverage</p>
                                  <InfoTooltip content="Cloud coverage directly affects solar radiation reaching your panels. Even partial coverage can significantly reduce energy production." />
                                </div>
                                <p className="font-medium">{weatherData.clouds !== null ? `${(weatherData.clouds * 100).toFixed(0)}%` : 'N/A'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Droplets size={16} className="text-primary" />
                              <div>
                                <div className="flex items-center">
                                  <p className="text-sm text-gray-600">Humidity</p>
                                  <InfoTooltip content="High humidity can scatter sunlight and reduce the amount of direct radiation reaching solar panels, slightly decreasing efficiency." />
                                </div>
                                <p className="font-medium">{weatherData.humidity !== null ? `${weatherData.humidity.toFixed(0)}%` : 'N/A'}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Add weather visualization component */}
                          <WeatherVisualizations weatherData={weatherData} />
                          
                          {/* Note about trial data normalization */}
                          <div className="mt-3 pt-2 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                              <p className="text-xs text-gray-500 italic">
                                <AlertTriangle size={12} className="inline mr-1" />
                                Using Windy.com trial API with normalized values. Data may not be fully accurate.
                              </p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Weather data provided by <a href="https://www.windy.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Windy.com</a>
                            </p>
                          </div>
                          
                          {/* Windy Map iframe */}
                          <motion.div
                            key="windy-map"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <div className="border border-gray-200 rounded-xl mt-6 overflow-hidden">
                              <div className="p-4 bg-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                  <MapPin size={20} className="text-primary" />
                                  Solar & Weather Map
                                </h3>
                                <p className="text-gray-600 text-sm mt-1">
                                  Interactive solar and weather map for your selected location
                                </p>
                              </div>
                              <iframe
                                src={generateWindyUrl()}
                                width="100%"
                                height="500"
                                frameBorder="0"
                              ></iframe>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </div>
                  </CollapsibleContent>
                  
                  {/* AI Analysis section - Replace with CollapsibleContent */}
                  <CollapsibleContent 
                    title="AI Powered Analysis" 
                    icon={<Bot size={20} className="text-primary mr-2" />}
                  >
                    <div className="mt-2">
                      <EnhancedSolarAIAnalysis 
                        isLoading={isCalculating}
                        analysis={aiAnalysis}
                        packageDetails={packageDetails || {
                          name: 'Default Package',
                          code: 'DEFAULT-01',
                          type: inputs.systemType || 'hybrid', // Use selected type or default to hybrid
                          watts: 5000,
                          batteryCapacity: inputs.systemType === 'ongrid' ? 'N/A' : '5kWh',
                          cashPrice: 250000,
                          suitableFor: 'Average household'
                        }}
                      />
                    </div>
                  </CollapsibleContent>

                  <div className="p-4 sm:p-6 flex flex-col items-center">
                    <button
                      onClick={() => setIsQuoteFormOpen(true)}
                      className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      Submit Quote
                    </button>
                    <p className="text-gray-500 text-sm mt-3">Get a personalized consultation based on your results</p>
                    
                    <button
                      onClick={() => {
                        handleStepChange(0);
                        setResult(null);
                        setShowWindyMap(false);
                      }}
                      className="mt-6 text-gray-500 text-sm underline hover:text-primary"
                    >
                      Start a new calculation
                    </button>
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </motion.div>
      )}
      <JsonDataViewer key="windy-json-viewer" />
      <PvgisJsonDataViewer key="pvgis-json-viewer" />
      {isQuoteFormOpen && (
        <QuoteRequestForm
          isOpen={isQuoteFormOpen}
          onClose={() => setIsQuoteFormOpen(false)}
          calculatorInputs={inputs}
          calculationResults={result}
        />
      )}
    </AnimatePresence>
  );
});

// Add missing JsonDataViewer and PvgisJsonDataViewer components
const JsonDataViewer = () => {
  const [showJsonViewer, setShowJsonViewer] = useState(false);
  const [rawWindyData, setRawWindyData] = useState<any>(null);
  
  // Add these functions to the SolarCalculator component and reference them properly
  const viewWindyData = () => {
    setShowJsonViewer(true);
  };
  
  const closeJsonView = () => {
    setShowJsonViewer(false);
  };
  
  const downloadWindyData = () => {
    if (!rawWindyData) return;
    
    // Create a copy of the data without the warning
    const cleanData = { ...rawWindyData };
    if (cleanData.warning) {
      delete cleanData.warning;
    }
    
    // Create a Blob containing the JSON data
    const jsonString = JSON.stringify(cleanData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `windy-weather-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  return (
    <AnimatePresence>
      {showJsonViewer && rawWindyData && (
        <motion.div
          key="json-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Windy.com API Response Data</h3>
              <button onClick={closeJsonView} className="p-1 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="overflow-auto p-4 flex-grow">
              <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(rawWindyData, null, 2)}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PvgisJsonDataViewer = () => {
  const [showPvgisJsonView, setShowPvgisJsonView] = useState(false);
  const [pvgisData, setPvgisData] = useState<any>(null);
  
  // Add these functions to the SolarCalculator component and reference them properly
  const viewPvgisData = () => {
    setShowPvgisJsonView(true);
  };
  
  const closePvgisJsonView = () => {
    setShowPvgisJsonView(false);
  };
  
  const downloadPvgisData = () => {
    if (!pvgisData || !pvgisData.rawData) return;
    
    // Create a Blob containing the JSON data
    const jsonString = JSON.stringify(pvgisData.rawData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a download link and trigger it
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pvgis-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };
  
  return (
    <AnimatePresence>
      {showPvgisJsonView && pvgisData?.rawData && (
        <motion.div
          key="pvgis-json-viewer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">PVGIS API Response Data</h3>
              <button onClick={closePvgisJsonView} className="p-1 rounded-full hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="overflow-auto p-4 flex-grow">
              <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {JSON.stringify(pvgisData.rawData, null, 2)}
              </pre>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Set display name for debugging
SolarCalculator.displayName = 'SolarCalculator';

export default SolarCalculator;