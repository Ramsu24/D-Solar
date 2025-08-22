import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { PVGISMonthlyRadiationData } from '../utils/pvgisService';

interface RadiationChartProps {
  monthlyData: PVGISMonthlyRadiationData[] | null;
  isLoading: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium">{label}</p>
        <p className="text-amber-600 font-semibold">
          {`${payload[0].value} kWh/m²`}
        </p>
      </div>
    );
  }
  return null;
};

const RadiationChart: React.FC<RadiationChartProps> = ({ monthlyData, isLoading }) => {
  const [chartData, setChartData] = useState<PVGISMonthlyRadiationData[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [stats, setStats] = useState<{
    highest: { month: string; value: number };
    lowest: { month: string; value: number };
  }>({ highest: { month: '', value: 0 }, lowest: { month: '', value: 0 } });

  useEffect(() => {
    if (monthlyData && monthlyData.length > 0) {
      setChartData(monthlyData);
      
      // Calculate average
      const sum = monthlyData.reduce((acc, item) => acc + item.radiation, 0);
      const avg = Math.round((sum / monthlyData.length) * 10) / 10;
      setAverage(avg);
      
      // Find highest and lowest months
      const highest = monthlyData.reduce((prev, current) => 
        prev.radiation > current.radiation ? prev : current
      );
      
      const lowest = monthlyData.reduce((prev, current) => 
        prev.radiation < current.radiation ? prev : current
      );
      
      setStats({
        highest: { month: highest.month, value: highest.radiation },
        lowest: { month: lowest.month, value: lowest.radiation }
      });
    }
  }, [monthlyData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-amber-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading radiation data...</p>
        </div>
      </div>
    );
  }

  if (!monthlyData || monthlyData.length === 0) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100">
        <p className="text-center text-gray-600">No radiation data available. Please ensure your location is set correctly.</p>
      </div>
    );
  }

  // Function to determine bar color based on value
  const getBarColor = (value: number) => {
    // Define thresholds for color transitions
    if (value >= 170) return '#E65100'; // Dark orange
    if (value >= 150) return '#F57C00'; // Medium orange
    if (value >= 130) return '#FB8C00'; // Light orange
    if (value >= 110) return '#FFB300'; // Gold
    return '#FFD54F'; // Light yellow
  };

  // Get month abbreviation for more compact display
  const getMonthAbbreviation = (monthName: string) => {
    return monthName.substring(0, 3);
  };

  // Prepare chart data with abbreviated month names
  const chartDataWithAbbreviatedMonths = chartData.map(data => ({
    ...data,
    shortMonth: getMonthAbbreviation(data.month)
  }));

  return (
    <div className="w-full">
      {/* Chart */}
      <div className="relative h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartDataWithAbbreviatedMonths}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="shortMonth" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              domain={[0, 'auto']}
              label={{ 
                value: 'Radiation (kWh/m²)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: '#6B7280', fontSize: 12 }
              }} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ bottom: -5 }} />
            <ReferenceLine y={average} stroke="#FF4500" strokeDasharray="3 3" label={{
              value: `Avg:`,
              position: 'right',
              fill: '#FF4500',
              fontSize: 12
            }} />
            <Bar 
              dataKey="radiation" 
              name="Solar Radiation"
              radius={[4, 4, 0, 0]}
            >
              {chartDataWithAbbreviatedMonths.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.radiation)} 
                  stroke={entry.month === stats.highest.month || entry.month === stats.lowest.month ? "#D97706" : "none"}
                  strokeWidth={entry.month === stats.highest.month || entry.month === stats.lowest.month ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <h4 className="text-sm text-gray-700 font-medium mb-1">Highest Month</h4>
          <div className="flex items-center">
            <p className="text-lg font-bold text-amber-600">{stats.highest.month}</p>
            <span className="ml-2 text-amber-500">☀️</span>
          </div>
          <p className="text-sm font-medium">{stats.highest.value} kWh/m²</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <h4 className="text-sm text-gray-700 font-medium mb-1">Annual Average</h4>
          <p className="text-lg font-bold text-blue-600">{average} kWh/m²</p>
          <p className="text-sm font-medium">{(average / 30).toFixed(1)} kWh/m²/day</p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-sm text-gray-700 font-medium mb-1">Lowest Month</h4>
          <div className="flex items-center">
            <p className="text-lg font-bold text-gray-600">{stats.lowest.month}</p>
            <span className="ml-2 text-gray-500">❄️</span>
          </div>
          <p className="text-sm font-medium">{stats.lowest.value} kWh/m²</p>
        </div>
      </div>
      
      <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
        <h4 className="text-sm font-semibold mb-1">What does this mean?</h4>
        <p className="text-xs text-gray-600 leading-relaxed">
          This chart shows the estimated monthly solar radiation in kWh/m² for your location. Higher values indicate better potential for solar energy generation. The Philippines receives excellent solar radiation throughout the year, with some seasonal variation. Even in the lowest month ({stats.lowest.month}), there is still good solar potential compared to many other regions.
        </p>
      </div>
      
      {/* Data source citation */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex items-center">
        <div className="text-blue-600 mr-2 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p className="text-xs text-blue-800">
            <span className="font-semibold">Data Source:</span> European Commission Joint Research Centre (JRC) Photovoltaic Geographical Information System (PVGIS)
          </p>
        </div>
      </div>
    </div>
  );
};

export default RadiationChart; 