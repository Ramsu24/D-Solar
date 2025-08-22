'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Check, Save, Info, Settings2, RotateCcw, RefreshCw, History, TrendingUp, CalendarClock, ArrowUpRight } from "lucide-react";
import { ICalculatorParams } from '@/models/SolarCalculatorParams';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { Switch } from "../../../components/ui/switch";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

export default function CalculatorParamsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [params, setParams] = useState<ICalculatorParams | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [currentBill, setCurrentBill] = useState(10000);
  const [roofSize, setRoofSize] = useState(100);
  const [template, setTemplate] = useState<'residential' | 'commercial'>('residential');
  const [region, setRegion] = useState('metro-manila');
  const [calculationResult, setCalculationResult] = useState<any>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [earningsProjection, setEarningsProjection] = useState<Array<{ year: number; value: number; savings: number; }>>([]);
  const [breakEvenPoint, setBreakEvenPoint] = useState<number | null>(null);
  const [cumulativeSavings, setCumulativeSavings] = useState<number>(0);
  const [selectedPackage, setSelectedPackage] = useState<string>('');
  const [packages, setPackages] = useState<{
    hybrid: Array<{
      id: string;
      name: string;
      code: string;
      type: string;
      watts: number;
      batteryCapacity: string;
      cashPrice: number;
      financingPrice: number;
      srpPrice: number;
      suitableFor: string;
      description: string;
    }>;
    ongrid: Array<{
      id: string;
      name: string;
      code: string;
      type: string;
      watts: number;
      batteryCapacity: string;
      cashPrice: number;
      financingPrice: number;
      srpPrice: number;
      suitableFor: string;
      description: string;
    }>;
  } | null>(null);
  const [isLoadingPackages, setIsLoadingPackages] = useState(false);
  
  // For undo functionality
  const originalParamsRef = useRef<ICalculatorParams | null>(null);
  const lastSavedParamsRef = useRef<ICalculatorParams | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Fetch calculator parameters
  useEffect(() => {
    const fetchParams = async () => {
      try {
        const response = await fetch('/api/admin/calculator-params');
        if (!response.ok) {
          throw new Error('Failed to fetch calculator parameters');
        }
        const data = await response.json();
        setParams(data);
        // Store the original parameters for reset functionality
        originalParamsRef.current = JSON.parse(JSON.stringify(data));
        lastSavedParamsRef.current = JSON.parse(JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching calculator parameters:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load calculator parameters'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchParams();
  }, []);

  // Fetch packages from MongoDB
  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoadingPackages(true);
      try {
        const response = await fetch('/api/admin/calculator-packages');
        if (!response.ok) {
          throw new Error('Failed to fetch packages');
        }
        const data = await response.json();
        setPackages(data);
      } catch (error) {
        console.error('Error fetching packages:', error);
        setNotification({
          type: 'error',
          message: 'Failed to load packages. Using fallback data.'
        });
        
        // Set fallback packages
        setPackages({
          hybrid: [
            {
              id: 'hyb-3k-p3',
              name: "3.48kW Hybrid Solar PV System with 5.12kWh Battery",
              code: "HYB-3KS-P3",
              type: "hybrid",
              watts: 3480,
              batteryCapacity: "5.12kWh",
              cashPrice: 260800,
              financingPrice: 275000,
              srpPrice: 280000,
              suitableFor: "₱2500-4000 monthly bill",
              description: "Small hybrid system for residential use"
            },
            {
              id: 'hyb-6k-p5',
              name: "5.8kW Hybrid Solar PV System with 10.24kWh Battery",
              code: "HYB-6K10-P5",
              type: "hybrid",
              watts: 5800,
              batteryCapacity: "10.24kWh",
              cashPrice: 395800,
              financingPrice: 410000,
              srpPrice: 420000,
              suitableFor: "₱3000-6000 monthly bill",
              description: "Medium hybrid system for residential use"
            },
            {
              id: 'hyb-8k-p7',
              name: "8.12kW Hybrid Solar PV System",
              code: "HYB-8K-P7",
              type: "hybrid",
              watts: 8120,
              batteryCapacity: "10.24kWh",
              cashPrice: 450000,
              financingPrice: 465000,
              srpPrice: 475000,
              suitableFor: "₱5000-8000 monthly bill",
              description: "Large hybrid system for residential use"
            }
          ],
          ongrid: [
            {
              id: 'ong-6k-p5',
              name: "5.8kW On Grid Solar PV System",
              code: "ONG-6K-P5",
              type: "ongrid",
              watts: 5800,
              batteryCapacity: "N/A",
              cashPrice: 195800,
              financingPrice: 210000,
              srpPrice: 220000,
              suitableFor: "₱3000-6000 monthly bill",
              description: "Medium on-grid system for residential use"
            },
            {
              id: 'ong-8k-p7',
              name: "8.12kW On Grid Solar PV System",
              code: "ONG-8K-P7",
              type: "ongrid",
              watts: 8120,
              batteryCapacity: "N/A",
              cashPrice: 272800,
              financingPrice: 290000,
              srpPrice: 300000,
              suitableFor: "₱5000-8000 monthly bill",
              description: "Large on-grid system for residential use"
            },
            {
              id: 'ong-12k-p13',
              name: "11.6kW On Grid Solar PV System",
              code: "ONG-12K-P13",
              type: "ongrid",
              watts: 11600,
              batteryCapacity: "N/A",
              cashPrice: 390800,
              financingPrice: 410000,
              srpPrice: 420000,
              suitableFor: "₱10000-13000 monthly bill",
              description: "Extra large on-grid system for residential use"
            }
          ]
        });
      } finally {
        setIsLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Track changes to detect unsaved modifications
  useEffect(() => {
    if (params && lastSavedParamsRef.current) {
      const currentParamsString = JSON.stringify(params);
      const lastSavedParamsString = JSON.stringify(lastSavedParamsRef.current);
      setHasUnsavedChanges(currentParamsString !== lastSavedParamsString);
    }
  }, [params]);

  // Calculate results whenever inputs or parameters change
  useEffect(() => {
    if (params) {
      calculateResults();
    }
  }, [params, currentBill, roofSize, template, region, selectedPackage]);

  // Save calculator parameters
  const saveParams = async () => {
    if (!params) return;

    setIsSaving(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/calculator-params', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error('Failed to update calculator parameters');
      }

      // Update the last saved state
      lastSavedParamsRef.current = JSON.parse(JSON.stringify(params));
      setHasUnsavedChanges(false);

      setNotification({
        type: 'success',
        message: 'Calculator parameters updated successfully'
      });
    } catch (error) {
      console.error('Error updating calculator parameters:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update calculator parameters'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Revert to original parameters (factory reset)
  const resetToOriginal = () => {
    if (originalParamsRef.current) {
      if (window.confirm('Are you sure you want to reset all parameters to their original values? This cannot be undone.')) {
        setParams(JSON.parse(JSON.stringify(originalParamsRef.current)));
        setNotification({
          type: 'success',
          message: 'Parameters reset to original values'
        });
      }
    }
  };

  // Revert to last saved state
  const revertToLastSaved = () => {
    if (lastSavedParamsRef.current) {
      if (window.confirm('Are you sure you want to discard all unsaved changes?')) {
        setParams(JSON.parse(JSON.stringify(lastSavedParamsRef.current)));
        setNotification({
          type: 'success',
          message: 'Changes reverted to last saved state'
        });
      }
    }
  };

  // Handle parameter changes
  const handleParamChange = (path: string[], value: any) => {
    setParams((prevParams) => {
      if (!prevParams) return null;
      
      // Create a deep copy of the params object
      const newParams = JSON.parse(JSON.stringify(prevParams));
      
      // Navigate to the nested property and update its value
      let current = newParams;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      
      return newParams;
    });
  };

  // Calculate results based on current parameters and inputs
  const calculateResults = () => {
    if (!params || !packages) return;

    // This is a simplified version of the calculation that would normally be in SolarCalculator.tsx
    const templateData = params.templates[template];
    const regionData = params.regions[region];
    const yearlyBill = currentBill * 12;
    
    // Check if a specific package is selected
    let usedPackage = null;
    if (selectedPackage) {
      // Find the selected package from all packages
      const allPackages = [...packages.hybrid, ...packages.ongrid];
      usedPackage = allPackages.find(pkg => pkg.id === selectedPackage);
    }
    
    // If no package is explicitly selected, determine based on monthly bill
    if (!usedPackage) {
      // Determine system size based on monthly bill and template
      let systemSize = 0;
      const templateSizes = templateData.systemSizes;
      
      if (template === 'residential') {
        // Calculate max size by roof (similar to SolarCalculator.tsx)
        const maxSizeByRoof = roofSize * 0.17; // Approximate kWp capacity based on roof size
        
        // Use the same thresholds as the actual calculator
        if (currentBill < 1000) systemSize = Math.min(templateSizes[0], maxSizeByRoof);
        else if (currentBill < 3000) systemSize = Math.min(templateSizes[1], maxSizeByRoof);
        else if (currentBill < 5000) systemSize = Math.min(templateSizes[2], maxSizeByRoof);
        else if (currentBill < 10000) systemSize = Math.min(templateSizes[3], maxSizeByRoof);
        else systemSize = Math.min(templateSizes[4], maxSizeByRoof);
      } else {
        // Commercial calculations
        if (currentBill < 100000) systemSize = templateSizes[0];
        else if (currentBill < 200000) systemSize = templateSizes[1];
        else if (currentBill < 300000) systemSize = templateSizes[2];
        else if (currentBill < 400000) systemSize = templateSizes[3];
        else systemSize = templateSizes[4];
      }
      
      // Auto-select package based on bill if in residential mode
      if (template === 'residential' && packages) {
        // Find package that matches bill amount based on the suitableFor field
        const hybridPackages = packages.hybrid;
        
        // Create a regex pattern that matches the thousands part of the bill amount
        // This matches how the main calculator in solar-ai-analysis/route.ts selects packages
        const billThousands = Math.floor(currentBill/1000);
        const regex = new RegExp(`₱${billThousands}`);
        
        // Try to find a package that matches the bill amount
        usedPackage = hybridPackages.find(pkg => regex.test(pkg.suitableFor));
        
        // If no exact match, use fallback logic
        if (!usedPackage) {
          if (currentBill <= 4000 && hybridPackages.length > 0) {
            // Find the first package suitable for low bills
            usedPackage = hybridPackages.find(pkg => 
              pkg.suitableFor.includes('4000') || 
              /₱\d+-4000/.test(pkg.suitableFor)
            ) || hybridPackages[0];
          } else if (currentBill <= 6000 && hybridPackages.length > 0) {
            // Find a package suitable for medium bills
            usedPackage = hybridPackages.find(pkg => 
              pkg.suitableFor.includes('6000') || 
              /₱\d+-6000/.test(pkg.suitableFor)
            ) || hybridPackages[Math.min(1, hybridPackages.length - 1)];
          } else if (hybridPackages.length > 0) {
            // Find the largest package
            usedPackage = hybridPackages[hybridPackages.length - 1];
          }
        }
      }
      
      // If still no package and not using standard calculation
      if (!usedPackage) {
        // Get roof type specific costs (default to metal if not specified)
        const roofType = 'metal'; // Default to metal roof as we don't have roof type selection in admin preview
        const roofTypeDetails = templateData.roofTypeCosts[roofType as 'concrete' | 'metal'];
        
        // Calculate base installation cost including roof type costs
        const totalCostPerKw = templateData.costPerKw + roofTypeDetails.additionalCostPerKw;
        const baseInstallationCost = systemSize * totalCostPerKw;
        
        // Calculate transport costs
        let transportCost = 0;
        if (regionData) {
          if (systemSize <= 6) {
            transportCost = regionData.transportCosts.small;
          } else if (systemSize <= 10) {
            transportCost = regionData.transportCosts.medium;
          } else {
            transportCost = regionData.transportCosts.large;
          }
        }
        
        // Get additional costs
        const additionalCostsData = params.additionalCosts[template];
        
        // Calculate total installation cost
        const totalCost = baseInstallationCost + 
          transportCost + 
          additionalCostsData.netMeteringProcessingFee + 
          additionalCostsData.otherFees + 
          additionalCostsData.netMeteringPipingCost;
        
        // Calculate yearly savings (simplified)
        const yearlySavings = yearlyBill * templateData.electricityReduction;
        
        // Apply the same savings boost factor used in the actual solar calculator (25%)
        const savingsBoostFactor = 1.25;
        const boostedYearlySavings = yearlySavings * savingsBoostFactor;
        
        // Calculate simple payback period (years)
        const paybackPeriod = totalCost / boostedYearlySavings;
        
        setCalculationResult({
          systemSize,
          baseInstallationCost,
          transportCost,
          totalCost,
          yearlySavings: boostedYearlySavings,
          paybackPeriod,
          roiPercentage: (boostedYearlySavings / totalCost) * 100
        });
        
        return;
      }
    }
    
    // If we're using a package, set the results accordingly
    if (usedPackage) {
      const systemSize = usedPackage.watts / 1000; // Convert watts to kW
      const baseInstallationCost = usedPackage.cashPrice;
      const totalCost = usedPackage.cashPrice;
      
      // Calculate yearly savings using EXACTLY the same approach as in main calculator
      // First calculate bill amount yearly
      const billAmountYearly = currentBill * 12;
      
      // Then calculate savings percentage from electricity reduction percentage (already in decimal form)
      const savingsPercentage = templateData.electricityReduction; 
      const annualSavings = billAmountYearly * savingsPercentage;
      
      // Apply the standard 25% boost to estimated savings - SAME as main calculator
      const savingsBoostFactor = 1.25; 
      const boostedYearlySavings = annualSavings * savingsBoostFactor;
      
      // Calculate simple payback period (years)
      const paybackYears = totalCost / boostedYearlySavings;
      
      // Format the payback period
      const paybackPeriod = paybackYears;
      
      setCalculationResult({
        systemSize,
        baseInstallationCost,
        transportCost: 0, // We're using package pricing which includes transport
        totalCost,
        yearlySavings: boostedYearlySavings,
        paybackPeriod,
        roiPercentage: (boostedYearlySavings / totalCost) * 100,
        usedPackage: usedPackage.name,
        packageDetails: usedPackage
      });
    }
  };

  // Calculate earnings projection data
  const calculateEarningsProjection = () => {
    if (!params || !calculationResult) return;
    
    const templateData = params.templates[template];
    const yearlyBill = currentBill * 12;
    const annualSavings = calculationResult.yearlySavings;
    const totalCost = calculationResult.totalCost;
    const annualInflation = templateData.annualInflation;
    const panelDegradation = templateData.panelDegradation;
    
    // This is where we'll store our projected data and cumulative savings
    const projectionData = [];
    
    // Calculate 25-year savings with annual inflation - using EXACT same approach as main calculator
    let totalSavings = 0;
    
    // Loop through years 0-25
    for (let year = 0; year <= 25; year++) {
      // Account for panel degradation each year - EXACTLY as in main calculator
      const degradationFactor = 1 - (panelDegradation * year);
      
      // Use the EXACT same formula as the main calculator
      // Note: We should NOT multiply by savingsBoostFactor here because
      // the annualSavings value already includes the boost
      const yearSavings = 
        year === 0 
          ? 0 // No savings in year 0 (installation year)
          : (annualSavings / 1.25) * Math.pow(1 + annualInflation, year-1) * degradationFactor;
      
      // Add to total savings
      totalSavings += yearSavings;
      
      // Calculate break-even year as we go - uses running cumulative total
      const cumulativeSoFar = totalSavings;
      
      // Store data for this year
      projectionData.push({
        year,
        value: cumulativeSoFar,
        savings: yearSavings
      });
    }
    
    // Apply the savings boost factor to the total - EXACTLY as in main calculator
    const savingsBoostFactor = 1.25;
    totalSavings = totalSavings * savingsBoostFactor;
    
    // Update the projection data with boosted values
    const boostedProjectionData = projectionData.map(item => ({
      ...item,
      value: item.value * savingsBoostFactor,
      savings: item.savings * savingsBoostFactor
    }));
    
    // Calculate break-even point based on cumulative savings
    let breakEvenYearFractional = null;
    for (let i = 0; i < boostedProjectionData.length - 1; i++) {
      if (boostedProjectionData[i].value < totalCost && boostedProjectionData[i+1].value >= totalCost) {
        // Linear interpolation to find fractional year
        const yearStart = i;
        const savingsStart = boostedProjectionData[i].value;
        const savingsEnd = boostedProjectionData[i+1].value;
        const savingsDiff = savingsEnd - savingsStart;
        const savingsNeeded = totalCost - savingsStart;
        const fraction = savingsNeeded / savingsDiff;
        breakEvenYearFractional = yearStart + fraction;
        break;
      }
    }
    
    // Set state variables with results
    setEarningsProjection(boostedProjectionData);
    setBreakEvenPoint(breakEvenYearFractional);
    setCumulativeSavings(totalSavings);
  };
  
  // Update earnings projection when calculation results change
  useEffect(() => {
    if (calculationResult) {
      calculateEarningsProjection();
    }
  }, [calculationResult]);

  // Format currency for display
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format years with decimal to years and months
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

  // Handle package selection
  const handlePackageSelection = (newPackageId: string) => {
    setSelectedPackage(newPackageId);
    // Force immediate recalculation
    if (params && packages) {
      // Small delay to ensure state is updated
      setTimeout(calculateResults, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner size="lg" />
        <span className="ml-2">Loading calculator parameters...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Solar Calculator Parameters</h1>
          <p className="text-gray-600 mt-1">
            Manage and customize the parameters used in solar savings calculations
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <Label htmlFor="mode-toggle" className="cursor-pointer">
              <div className="flex items-center">
                {isAdvancedMode ? 
                  <Settings2 className="h-4 w-4 mr-1.5 text-indigo-600" /> : 
                  <Settings2 className="h-4 w-4 mr-1.5 text-gray-500" />
                }
                <span className={isAdvancedMode ? "text-indigo-600 font-medium" : "text-gray-600"}>
                  Advanced Mode
                </span>
              </div>
            </Label>
            <Switch
              id="mode-toggle"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
              className="data-[state=checked]:bg-indigo-600"
            />
          </div>
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={revertToLastSaved}
                      className="h-10 w-10 border-amber-300 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                    >
                      <RotateCcw className="h-4 w-4 text-amber-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Discard unsaved changes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={resetToOriginal}
                    className="h-10 w-10 border-red-300 hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    <RefreshCw className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reset to factory defaults</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
        <Button 
          onClick={saveParams}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 ${hasUnsavedChanges ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'} transition-colors`}
        >
          {isSaving ? <Spinner size="sm" /> : <Save className="h-4 w-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
          </div>
        </div>
      </div>

      {hasUnsavedChanges && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 flex items-center">
          <Info className="h-5 w-5 mr-2 text-amber-500" />
          <span>You have unsaved changes. Save your changes or discard them using the revert button.</span>
        </div>
      )}

      {notification && (
        <Alert className={`mb-6 ${notification.type === 'success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
          <div className="flex items-center">
            {notification.type === 'success' ? 
              <Check className="h-4 w-4 text-green-500 mr-2" /> : 
              <X className="h-4 w-4 text-red-500 mr-2" />
            }
            <AlertDescription>{notification.message}</AlertDescription>
          </div>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Preview - Now on the left, spanning 2 columns */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          {/* Preview & Testing Panel */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-white to-indigo-50 h-full">
            <CardHeader className="border-b border-indigo-100 pb-6">
              <CardTitle className="text-gray-800 flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                Live Preview
              </CardTitle>
              <CardDescription className="text-gray-600">
                Test your parameter changes in real-time
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center mb-3">
                      <Label htmlFor="currentBill" className="text-gray-700 font-medium">Monthly Electricity Bill (₱)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Enter your average monthly electricity bill to calculate savings</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="currentBill"
                      type="number"
                      value={currentBill}
                      onChange={(e) => setCurrentBill(Number(e.target.value))}
                      className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <Label htmlFor="roofSize" className="text-gray-700 font-medium">Roof Size (sqm)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>The available area for solar panel installation</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="roofSize"
                      type="number"
                      value={roofSize}
                      onChange={(e) => setRoofSize(Number(e.target.value))}
                      className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    {template === 'residential' && (
                      <p className="text-xs text-amber-600 mt-1">
                        Note: Roof size limits max system size (approx. {(roofSize * 0.17).toFixed(1)} kW max for {roofSize} m²)
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium mb-3 block">Template</Label>
                    <div className="flex gap-2 mt-1">
                      <Button
                        variant={template === 'residential' ? 'default' : 'outline'}
                        onClick={() => setTemplate('residential')}
                        className={template === 'residential' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                      >
                        Residential
                      </Button>
                      <Button
                        variant={template === 'commercial' ? 'default' : 'outline'}
                        onClick={() => setTemplate('commercial')}
                        className={template === 'commercial' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                      >
                        Commercial
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-700 font-medium mb-3 block">Region</Label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                    >
                      {params && Object.keys(params.regions).map((key) => (
                        <option key={key} value={key}>
                          {params.regions[key].name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Package selector */}
                <div className="mt-6 bg-white p-5 rounded-lg border border-indigo-100 shadow-sm">
                  <div className="flex items-center mb-3">
                    <Label htmlFor="package-selector" className="text-gray-700 font-medium">Solar Package (Optional)</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select a specific package to see its details and pricing</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  {isLoadingPackages ? (
                    <div className="py-2 flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      <span className="text-sm text-gray-500">Loading packages...</span>
                    </div>
                  ) : packages ? (
                    <>
                      <select
                        id="package-selector"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedPackage}
                        onChange={(e) => handlePackageSelection(e.target.value)}
                      >
                        <option value="">Auto-select based on bill</option>
                        {packages.hybrid.length > 0 && (
                          <optgroup label="Hybrid Systems">
                            {packages.hybrid.map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {pkg.suitableFor} - ₱{pkg.cashPrice.toLocaleString()}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {packages.ongrid.length > 0 && (
                          <optgroup label="On-Grid Systems">
                            {packages.ongrid.map(pkg => (
                              <option key={pkg.id} value={pkg.id}>
                                {pkg.name} - {pkg.suitableFor} - ₱{pkg.cashPrice.toLocaleString()}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Using {packages.hybrid.length + packages.ongrid.length} packages from database. 
                        The actual solar calculator recommends packages based on bill amount.
                      </p>
                    </>
                  ) : (
                    <div className="py-2 text-amber-600">
                      Failed to load packages. Please try refreshing the page.
                    </div>
                  )}
                </div>
                
                {calculationResult && (
                  <div className="mt-6 bg-white rounded-lg shadow-inner p-5 border border-indigo-100">
                    <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center">
                      <span className="w-2 h-4 bg-indigo-500 rounded-sm mr-2"></span>
                      Calculation Results
                    </h3>
                    
                    {calculationResult.usedPackage && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-800 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Using solar package pricing: <strong>{calculationResult.usedPackage}</strong></span>
                      </div>
                    )}
                    
                    {calculationResult.packageDetails && (
                      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">System Type</div>
                          <div className="font-medium">{calculationResult.packageDetails.type === 'hybrid' ? 'Hybrid System' : 'On-Grid System'}</div>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Battery Capacity</div>
                          <div className="font-medium">{calculationResult.packageDetails.batteryCapacity}</div>
                        </div>
                        <div className="bg-indigo-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Suitable For</div>
                          <div className="font-medium">{calculationResult.packageDetails.suitableFor}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded transition-colors">
                        <span className="text-gray-600">System Size:</span>
                        <span className="font-semibold text-gray-900">{calculationResult.systemSize} kW</span>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded transition-colors">
                        <span className="text-gray-600">Base Cost:</span>
                        <span className="font-semibold text-gray-900">₱{calculationResult.baseInstallationCost.toLocaleString()}</span>
                      </div>
                      {!calculationResult.usedPackage && (
                        <div className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded transition-colors">
                          <span className="text-gray-600">Transport Cost:</span>
                          <span className="font-semibold text-gray-900">₱{calculationResult.transportCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center p-2 hover:bg-indigo-50 rounded transition-colors bg-indigo-50">
                        <span className="text-gray-700 font-medium">Total Cost:</span>
                        <span className="font-bold text-indigo-700">₱{calculationResult.totalCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-green-50 rounded transition-colors bg-green-50">
                        <span className="text-gray-700 font-medium">Yearly Savings:</span>
                        <span className="font-bold text-green-600">₱{calculationResult.yearlySavings.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-blue-50 rounded transition-colors">
                        <span className="text-gray-600">Payback Period:</span>
                        <span className="font-semibold text-blue-600">{calculationResult.paybackPeriod.toFixed(1)} years</span>
                      </div>
                      <div className="flex justify-between items-center p-2 hover:bg-amber-50 rounded transition-colors">
                        <span className="text-gray-600">ROI:</span>
                        <span className="font-semibold text-amber-600">{calculationResult.roiPercentage.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      {/* Break-even highlight card */}
                      {breakEvenPoint !== null && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100 flex items-center h-full">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <CalendarClock className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-green-800">Break-even Point</h4>
                            <p className="text-green-700">
                              {formatYearsAndMonths(breakEvenPoint)}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* 25-year savings highlight */}
                      {cumulativeSavings > 0 && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100 flex items-center h-full">
                          <div className="bg-indigo-100 p-2 rounded-full mr-3">
                            <TrendingUp className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-indigo-800">25-Year Savings</h4>
                            <p className="text-indigo-700">
                              {formatCurrency(cumulativeSavings)}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Earnings projection chart */}
                    {earningsProjection.length > 0 && (
                      <div className="mt-6">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                          <ArrowUpRight className="h-4 w-4 mr-1 text-green-600" />
                          Earnings Projection
                        </h4>
                        <div className="h-80 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={earningsProjection}
                              margin={{
                                top: 10,
                                right: 0,
                                left: 0,
                                bottom: 10,
                              }}
                            >
                              <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis 
                                dataKey="year" 
                                tickFormatter={(value) => `Year ${value}`}
                                tick={{ fontSize: 10 }}
                                interval={"preserveStartEnd"} 
                              />
                              <YAxis 
                                width={60}
                                tickFormatter={(value) => `₱${(value / 1000).toFixed(0)}k`}
                                tick={{ fontSize: 10 }}
                              />
                              <RechartsTooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Cumulative Savings']}
                                labelFormatter={(label) => `Year ${label}`}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#6366f1" 
                                fill="url(#colorValue)" 
                                strokeWidth={2}
                              />
                              {breakEvenPoint !== null && (
                                <RechartsTooltip
                                  content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                      return (
                                        <div className="bg-white p-2 border border-gray-200 shadow-md rounded-md">
                                          <p className="text-sm font-medium text-gray-700">Break-even point</p>
                                          <p className="text-sm text-gray-600">{formatYearsAndMonths(breakEvenPoint)}</p>
                                        </div>
                                      );
                                    }
                                    return null;
                                  }}
                                  position={{ x: breakEvenPoint * (100 / 25), y: 50 }}
                                  active={true}
                                />
                              )}
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 text-center">
                          Based on current parameters and electricity bill of ₱{currentBill.toLocaleString()} per month
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Settings - Now on the right, spanning 1 column */}
        <div className="order-1 lg:order-2">
          {isAdvancedMode ? (
            // Advanced Mode - Show all tabs and detailed settings
            <Tabs defaultValue="templates" className="mt-2">
              <TabsList className="mb-6 bg-indigo-50 p-1 rounded-lg">
                <TabsTrigger value="templates" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">Templates</TabsTrigger>
                <TabsTrigger value="regions" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">Regional Costs</TabsTrigger>
                <TabsTrigger value="additional" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">Additional Costs</TabsTrigger>
                <TabsTrigger value="defaults" className="data-[state=active]:bg-white data-[state=active]:text-indigo-700">Default Values</TabsTrigger>
            </TabsList>
            
            <TabsContent value="templates">
              <h2 className="text-xl font-bold mb-4">Template Parameters</h2>
              {params && (
                <div className="space-y-8">
                  <Tabs defaultValue="residential">
                    <TabsList className="mb-4">
                      <TabsTrigger value="residential">Residential</TabsTrigger>
                      <TabsTrigger value="commercial">Commercial</TabsTrigger>
                    </TabsList>
                    
                    {['residential', 'commercial'].map((templateKey) => (
                      <TabsContent key={templateKey} value={templateKey}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-name`}>Template Name</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">The display name for this template type</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-name`}
                              value={params.templates[templateKey as keyof typeof params.templates].name}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'name'], e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-description`}>Description</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Brief description of this template type</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-description`}
                              value={params.templates[templateKey as keyof typeof params.templates].description}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'description'], e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-defaultBill`}>Default Bill (₱)</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Starting value for the monthly electricity bill</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-defaultBill`}
                              type="number"
                              value={params.templates[templateKey as keyof typeof params.templates].defaultBill}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'defaultBill'], Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-costPerKw`}>Cost Per kW (₱)</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Base cost per kilowatt of solar installation</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-costPerKw`}
                              type="number"
                              value={params.templates[templateKey as keyof typeof params.templates].costPerKw}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'costPerKw'], Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-panelWattage`}>Panel Wattage (W)</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Power rating of each solar panel in watts</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-panelWattage`}
                              type="number"
                              value={params.templates[templateKey as keyof typeof params.templates].panelWattage}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'panelWattage'], Number(e.target.value))}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-paybackPeriod`}>Payback Period</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Text description of typical payback period</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <Input
                              id={`${templateKey}-paybackPeriod`}
                              value={params.templates[templateKey as keyof typeof params.templates].paybackPeriod}
                              onChange={(e) => handleParamChange(['templates', templateKey, 'paybackPeriod'], e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          
                          <div className="col-span-1 md:col-span-2">
                              <div className="flex items-center mb-2">
                            <Label htmlFor={`${templateKey}-systemSizes`}>System Sizes (kW)</Label>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p className="max-w-xs">Available system sizes for different electricity consumption levels</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {params.templates[templateKey as keyof typeof params.templates].systemSizes.map((size, index) => (
                                <div key={index} className="flex items-center">
                                  <Input
                                    type="number"
                                    value={size}
                                    onChange={(e) => {
                                      const newSizes = [...params.templates[templateKey as keyof typeof params.templates].systemSizes];
                                      newSizes[index] = Number(e.target.value);
                                      handleParamChange(['templates', templateKey, 'systemSizes'], newSizes);
                                    }}
                                    className="w-20"
                                  />
                                  {index < params.templates[templateKey as keyof typeof params.templates].systemSizes.length - 1 && (
                                    <span className="mx-1">→</span>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newSizes = [...params.templates[templateKey as keyof typeof params.templates].systemSizes, 0];
                                  handleParamChange(['templates', templateKey, 'systemSizes'], newSizes);
                                }}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Electricity Reduction (%)</Label>
                            <div className="mt-3">
                              <Slider
                                value={[params.templates[templateKey as keyof typeof params.templates].electricityReduction * 100]}
                                min={0}
                                max={100}
                                step={1}
                                onValueChange={(value) => handleParamChange(['templates', templateKey, 'electricityReduction'], value[0] / 100)}
                              />
                              <div className="mt-1 text-right">
                                {(params.templates[templateKey as keyof typeof params.templates].electricityReduction * 100).toFixed(0)}%
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label>Annual Inflation (%)</Label>
                            <div className="mt-3">
                              <Slider
                                value={[params.templates[templateKey as keyof typeof params.templates].annualInflation * 100]}
                                min={0}
                                max={10}
                                step={0.1}
                                onValueChange={(value) => handleParamChange(['templates', templateKey, 'annualInflation'], value[0] / 100)}
                              />
                              <div className="mt-1 text-right">
                                {(params.templates[templateKey as keyof typeof params.templates].annualInflation * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-1 md:col-span-2">
                            <Label>Panel Degradation (%)</Label>
                            <div className="mt-3">
                              <Slider
                                value={[params.templates[templateKey as keyof typeof params.templates].panelDegradation * 100]}
                                min={0}
                                max={2}
                                step={0.05}
                                onValueChange={(value) => handleParamChange(['templates', templateKey, 'panelDegradation'], value[0] / 100)}
                              />
                              <div className="mt-1 text-right">
                                {(params.templates[templateKey as keyof typeof params.templates].panelDegradation * 100).toFixed(2)}%
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-1 md:col-span-2">
                            <h3 className="text-lg font-semibold mt-6 mb-4">Roof Type Costs</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['concrete', 'metal'].map((roofType) => (
                                <Card key={roofType} className="p-4">
                                  <h4 className="font-bold capitalize mb-3">{roofType} Roof</h4>
                                  
                                  <div className="mb-4">
                                    <Label htmlFor={`${templateKey}-${roofType}-additionalCost`}>
                                      Additional Cost per kW (₱)
                                    </Label>
                                    <Input
                                      id={`${templateKey}-${roofType}-additionalCost`}
                                      type="number"
                                      value={params.templates[templateKey as keyof typeof params.templates].roofTypeCosts[roofType as 'concrete' | 'metal'].additionalCostPerKw}
                                      onChange={(e) => handleParamChange(
                                        ['templates', templateKey, 'roofTypeCosts', roofType, 'additionalCostPerKw'], 
                                        Number(e.target.value)
                                      )}
                                      className="mt-1"
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor={`${templateKey}-${roofType}-details`}>
                                      Installation Details
                                    </Label>
                                    <textarea
                                      id={`${templateKey}-${roofType}-details`}
                                      value={params.templates[templateKey as keyof typeof params.templates].roofTypeCosts[roofType as 'concrete' | 'metal'].installationDetails}
                                      onChange={(e) => handleParamChange(
                                        ['templates', templateKey, 'roofTypeCosts', roofType, 'installationDetails'], 
                                        e.target.value
                                      )}
                                      className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                      rows={3}
                                    />
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="regions">
              <h2 className="text-xl font-bold mb-4">Regional Cost Parameters</h2>
                <p className="mb-4">Configure costs that vary by region.</p>
                {/* Region settings would go here */}
            </TabsContent>
            
            <TabsContent value="additional">
              <h2 className="text-xl font-bold mb-4">Additional Cost Parameters</h2>
                <p className="mb-4">Configure additional costs like permits and installation fees.</p>
                {/* Additional cost settings would go here */}
            </TabsContent>
            
            <TabsContent value="defaults">
              <h2 className="text-xl font-bold mb-4">Default Values</h2>
              {params && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Default Calculation Values</h3>
                    <p className="text-sm text-gray-500 mb-6">
                      These values are used as fallbacks when external data (like PVGIS) is not available
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                          <div className="flex items-center mb-2">
                            <Label htmlFor="defaultSystemEfficiency">Default System Efficiency (%)</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Overall efficiency of the solar power system</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        <div className="mt-3">
                          <Slider
                            value={[params.defaultValues.defaultSystemEfficiency]}
                            min={10}
                            max={25}
                            step={0.5}
                            onValueChange={(value) => handleParamChange(['defaultValues', 'defaultSystemEfficiency'], value[0])}
                          />
                          <div className="mt-1 text-right">
                            {params.defaultValues.defaultSystemEfficiency.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div>
                          <div className="flex items-center mb-2">
                            <Label htmlFor="defaultAnnualRadiation">Default Annual Radiation (kWh/m²)</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Average yearly solar radiation in your region</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        <Input
                          id="defaultAnnualRadiation"
                          type="number"
                          value={params.defaultValues.defaultAnnualRadiation}
                          onChange={(e) => handleParamChange(['defaultValues', 'defaultAnnualRadiation'], Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                          <div className="flex items-center mb-2">
                            <Label htmlFor="defaultPeakSunHours">Default Peak Sun Hours</Label>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-4 w-4 ml-2 text-gray-400 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="max-w-xs">Average daily hours of peak sun intensity</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        <Input
                          id="defaultPeakSunHours"
                          type="number"
                          step="0.1"
                          value={params.defaultValues.defaultPeakSunHours}
                          onChange={(e) => handleParamChange(['defaultValues', 'defaultPeakSunHours'], Number(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
          ) : (
            // Basic Mode - Simplified UI with most important settings
            <Card className="border-none shadow-lg bg-gradient-to-br from-white to-blue-50">
              <CardHeader className="border-b border-blue-100 pb-6">
                <CardTitle className="text-gray-800">Basic Settings</CardTitle>
                <CardDescription className="text-gray-600">
                  Essential parameters for solar calculator - enable Advanced Mode for more options
              </CardDescription>
            </CardHeader>
              <CardContent className="pt-6">
                {params && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-5">
                      {/* Template Selection */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label className="text-gray-700 font-medium">Default Template</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Choose which template to edit. These determine default values for residential or commercial installations.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                </div>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={template === 'residential' ? 'default' : 'outline'}
                      onClick={() => setTemplate('residential')}
                            className={template === 'residential' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      Residential
                    </Button>
                    <Button
                      variant={template === 'commercial' ? 'default' : 'outline'}
                      onClick={() => setTemplate('commercial')}
                            className={template === 'commercial' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      Commercial
                    </Button>
                  </div>
                </div>
                
                      {/* Default Bill */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label htmlFor="default-bill" className="text-gray-700 font-medium">Default Monthly Bill (₱)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">The starting value for the monthly electricity bill in the calculator.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="default-bill"
                          type="number"
                          value={params.templates[template].defaultBill}
                          onChange={(e) => handleParamChange(['templates', template, 'defaultBill'], Number(e.target.value))}
                          className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                </div>
                
                      {/* Cost Per kW */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label htmlFor="cost-per-kw" className="text-gray-700 font-medium">Cost Per kW (₱)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">The base cost per kilowatt of solar installation. This is the primary factor determining system cost.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        <Input
                          id="cost-per-kw"
                          type="number"
                          value={params.templates[template].costPerKw}
                          onChange={(e) => handleParamChange(['templates', template, 'costPerKw'], Number(e.target.value))}
                          className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Panel Wattage */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label htmlFor="panel-wattage" className="text-gray-700 font-medium">Panel Wattage (W)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">The power rating of each solar panel in watts. Higher wattage means fewer panels needed.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      </div>
                        <Input
                          id="panel-wattage"
                          type="number"
                          value={params.templates[template].panelWattage}
                          onChange={(e) => handleParamChange(['templates', template, 'panelWattage'], Number(e.target.value))}
                          className="border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Electricity Reduction */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label className="text-gray-700 font-medium">Electricity Reduction (%)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">The percentage of electricity bill expected to be reduced by solar. Affects savings calculations.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                      </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-grow">
                            <Slider
                              value={[params.templates[template].electricityReduction * 100]}
                              min={0}
                              max={100}
                              step={1}
                              onValueChange={(value) => handleParamChange(['templates', template, 'electricityReduction'], value[0] / 100)}
                              className="[&>[role=slider]]:bg-indigo-600 [&>.bg-slate-100]:bg-indigo-100"
                            />
                      </div>
                          <div className="w-16 text-right font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            {(params.templates[template].electricityReduction * 100).toFixed(0)}%
                      </div>
                      </div>
                      </div>

                      {/* Annual Inflation */}
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <div className="flex items-center mb-3">
                          <Label className="text-gray-700 font-medium">Annual Inflation (%)</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 ml-2 text-blue-400 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">Expected annual increase in electricity costs. Higher values increase long-term savings.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                    </div>
                        <div className="flex items-center gap-4">
                          <div className="flex-grow">
                            <Slider
                              value={[params.templates[template].annualInflation * 100]}
                              min={0}
                              max={10}
                              step={0.1}
                              onValueChange={(value) => handleParamChange(['templates', template, 'annualInflation'], value[0] / 100)}
                              className="[&>[role=slider]]:bg-amber-500 [&>.bg-slate-100]:bg-amber-100"
                            />
                  </div>
                          <div className="w-16 text-right font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                            {(params.templates[template].annualInflation * 100).toFixed(1)}%
              </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
          )}
        </div>
      </div>
    </div>
  );
}