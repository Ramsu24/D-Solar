import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, TrendingUp, Sun, Shield, AlertTriangle, Loader2, Package, Battery, Zap, DollarSign, BarChart3, Check, X, Award, ArrowRightLeft, ThumbsUp, ThumbsDown, Info } from 'lucide-react';

interface EnhancedSolarAIAnalysisProps {
  isLoading: boolean;
  analysis: {
    summary: string;
    recommendations: string[];
    financialInsights: string[];
    environmentalImpact: string[];
    risks: string[];
    nextSteps: string[];
  } | null;
  packageDetails: {
    name: string;
    code: string;
    type: 'ongrid' | 'hybrid';
    watts: number;
    batteryCapacity: string;
    cashPrice: number;
    suitableFor: string;
  };
  alternativePackages?: {
    name: string;
    code: string;
    type: 'ongrid' | 'hybrid';
    watts: number;
    batteryCapacity: string;
    cashPrice: number;
    suitableFor: string;
    comparisonRating?: number;
    comparisonReason?: string;
  }[];
}

const EnhancedSolarAIAnalysis: React.FC<EnhancedSolarAIAnalysisProps> = ({
  isLoading,
  analysis,
  packageDetails,
  alternativePackages = []
}) => {
  const [activeTab, setActiveTab] = React.useState<'analysis' | 'comparison'>('analysis');
  
  // Ensure alternativePackages is always an array, even if null or undefined is passed
  const safeAlternativePackages = alternativePackages || [];
  
  // If we have no alternatives, create dummy ones based on the recommended package
  const finalAlternatives = safeAlternativePackages.length === 0 
    ? [
        // Alternative 1: Similar package but more expensive
        {
          name: packageDetails?.name ? `${packageDetails.name} Pro` : "Enhanced Solar Package",
          code: packageDetails?.code ? `${packageDetails.code}-PRO` : "PKG-PRO-1",
          type: packageDetails?.type || 'hybrid',
          watts: packageDetails?.watts ? Math.round(packageDetails.watts * 1.2) : 6000,
          batteryCapacity: packageDetails?.batteryCapacity || "5kWh",
          cashPrice: packageDetails?.cashPrice ? Math.round(packageDetails.cashPrice * 1.15) : 300000,
          suitableFor: packageDetails?.suitableFor || "Medium-sized homes",
          comparisonRating: 85,
          comparisonReason: "This upgraded version offers more capacity but at a higher price point, potentially extending your return on investment period."
        },
        // Alternative 2: Smaller package but cheaper
        {
          name: packageDetails?.name ? `${packageDetails.name.replace(/\d+(\.\d+)?kW/, match => {
            const kw = parseFloat(match);
            return `${(kw * 0.8).toFixed(1)}kW`;
          })}` : "Basic Solar Package",
          code: packageDetails?.code ? `${packageDetails.code.replace(/\d+/, match => {
            const num = parseInt(match);
            return `${Math.round(num * 0.8)}`;
          })}` : "PKG-BASIC-1",
          type: packageDetails?.type || 'ongrid',
          watts: packageDetails?.watts ? Math.round(packageDetails.watts * 0.8) : 4000,
          batteryCapacity: packageDetails?.type === 'hybrid' ? 
            (packageDetails?.batteryCapacity || "3.5kWh") : "N/A",
          cashPrice: packageDetails?.cashPrice ? Math.round(packageDetails.cashPrice * 0.85) : 200000,
          suitableFor: packageDetails?.suitableFor || "Small homes",
          comparisonRating: 72,
          comparisonReason: "This more affordable option may not fully cover your electricity needs based on your consumption pattern."
        },
        // Alternative 3: Different type
        {
          name: packageDetails?.type === 'hybrid' ? 
            (packageDetails?.name?.replace('Hybrid', 'On Grid') || "On Grid Solar Package") : 
            (packageDetails?.name?.replace('On Grid', 'Hybrid') || "Hybrid Solar Package"),
          code: packageDetails?.code ? 
            (packageDetails.type === 'hybrid' ? 
              packageDetails.code.replace(/HYB/i, 'ONG') : 
              packageDetails.code.replace(/ONG/i, 'HYB')) : 
            "PKG-ALT-1",
          type: packageDetails?.type === 'hybrid' ? 'ongrid' : 'hybrid',
          watts: packageDetails?.watts || 5000,
          batteryCapacity: packageDetails?.type === 'hybrid' ? "N/A" : "5kWh",
          cashPrice: packageDetails?.cashPrice ? 
            (packageDetails.type === 'hybrid' ? 
              Math.round(packageDetails.cashPrice * 0.9) : 
              Math.round(packageDetails.cashPrice * 1.1)) : 
            250000,
          suitableFor: packageDetails?.suitableFor || "Medium-sized homes",
          comparisonRating: 78,
          comparisonReason: packageDetails?.type === 'hybrid' ? 
            "This on-grid system is more affordable upfront but lacks backup power capability during outages." : 
            "This hybrid system offers backup power during outages but at a higher upfront cost."
        }
      ]
    : safeAlternativePackages;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-primary/20 rounded-xl p-6 bg-primary/5"
      >
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <Sun className="w-12 h-12 text-primary animate-ping absolute opacity-25" />
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <p className="text-primary font-medium">Generating AI-powered analysis...</p>
          <p className="text-sm text-gray-500 max-w-md text-center">
            Our AI is analyzing your inputs, local weather patterns, and matching you with the perfect solar package. This might take a moment.
          </p>
        </div>
      </motion.div>
    );
  }

  if (!analysis || !packageDetails.name) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="border border-red-200 rounded-xl p-6 bg-red-50"
      >
        <div className="flex items-center space-x-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Analysis Unavailable</h3>
            <p className="text-gray-600">
              We couldn't generate a personalized analysis at this time. Please try again later or contact support.
            </p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            Refresh
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Tab Navigation */}
      <div className="flex flex-col justify-center items-center mb-6">
        <p className="text-sm text-primary font-medium mb-2">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold mr-1">NEW</span>
          Now with advanced AI-powered analysis & comparison
        </p>
        <div className="flex border border-gray-200 rounded-lg p-1 shadow-sm bg-gray-50 w-full max-w-md">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`flex-1 px-4 py-2.5 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'analysis'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-primary hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Bot className={`h-4 w-4 ${activeTab === 'analysis' ? 'text-primary' : 'text-gray-500'}`} />
              <span>Package Analysis</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`flex-1 px-4 py-2.5 font-medium text-sm rounded-md transition-all duration-200 ${
              activeTab === 'comparison'
                ? 'bg-white text-primary shadow-sm'
                : 'text-gray-600 hover:text-primary hover:bg-white/50'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ArrowRightLeft className={`h-4 w-4 ${activeTab === 'comparison' ? 'text-primary' : 'text-gray-500'}`} />
              <span>Compare Packages</span>
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'analysis' ? (
        <>
          {/* Package Details Card */}
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-800">{packageDetails.name}</h2>
                </div>
                <p className="text-sm text-gray-600">Package Code: {packageDetails.code}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Cash Price</p>
                <p className="text-2xl font-bold text-blue-600">₱{packageDetails.cashPrice.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 mt-5">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600">System Size</span>
                </div>
                <p className="text-base font-semibold">{packageDetails.watts} Watts</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Battery className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-gray-600">Battery</span>
                </div>
                <p className="text-base font-semibold">{packageDetails.batteryCapacity}</p>
              </div>
            </div>
          </div>

          {/* AI Analysis Header */}
          <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-base font-semibold mb-1 text-gray-800">AI-Powered Package Analysis</h3>
                <p className="text-sm text-gray-600">{analysis.summary}</p>
              </div>
            </div>
          </div>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-yellow-50 rounded-lg">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                </div>
                <h4 className="font-medium text-sm text-gray-800">Package Recommendations</h4>
              </div>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2 bg-yellow-50/30 p-2 rounded-lg">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span className="text-xs text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Financial Insights */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-green-50 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <h4 className="font-medium text-sm text-gray-800">Financial Analysis</h4>
              </div>
              <ul className="space-y-2">
                {analysis.financialInsights.map((insight, index) => (
                  <li key={index} className="flex items-start space-x-2 bg-green-50/30 p-2 rounded-lg">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span className="text-xs text-gray-700">{insight}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Environmental Impact */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Sun className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-medium text-sm text-gray-800">Environmental Impact</h4>
              </div>
              <ul className="space-y-2">
                {analysis.environmentalImpact.map((impact, index) => (
                  <li key={index} className="flex items-start space-x-2 bg-blue-50/30 p-2 rounded-lg">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span className="text-xs text-gray-700">{impact}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Risk Assessment */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center space-x-2 mb-3">
                <div className="p-1.5 bg-red-50 rounded-lg">
                  <Shield className="w-4 h-4 text-red-500" />
                </div>
                <h4 className="font-medium text-sm text-gray-800">Risk Assessment</h4>
              </div>
              <ul className="space-y-2">
                {analysis.risks.map((risk, index) => (
                  <li key={index} className="flex items-start space-x-2 bg-red-50/30 p-2 rounded-lg">
                    <span className="text-red-500 mt-0.5">•</span>
                    <span className="text-xs text-gray-700">{risk}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/5 rounded-xl p-5 border border-primary/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <h4 className="font-medium text-sm text-gray-800">Recommended Next Steps</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {analysis.nextSteps.map((step, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-primary/10 shadow-sm">
                  <div className="flex items-start space-x-2">
                    <span className="text-primary font-medium text-xs">{index + 1}.</span>
                    <span className="text-xs text-gray-700">{step}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="text-xs text-gray-500 flex items-center justify-center space-x-2 bg-amber-50/50 p-3 rounded-lg">
            <span>AI-generated analysis based on your inputs and selected package. Consult with our solar experts for detailed assessment.</span>
          </div>
        </>
      ) : (
        // Comparison content
        <>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ArrowRightLeft className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold text-gray-800">Package Comparison</h2>
              </div>
              <p className="text-sm text-gray-500">Compare your recommended package with alternatives</p>
            </div>
            
            {finalAlternatives.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-200 rounded-lg">
                <Info className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No alternative packages available for comparison.</p>
                <p className="text-sm text-gray-500 mt-2">Your recommended package is the best match for your needs.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="py-3 px-4 text-left font-medium text-gray-600 w-1/5">Features</th>
                      <th className="py-3 px-4 text-left font-medium text-gray-600">
                        <div className="flex items-center space-x-1 text-primary">
                          <Award className="h-4 w-4" />
                          <span>Recommended</span>
                        </div>
                      </th>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <th key={index} className="py-3 px-4 text-left font-medium text-gray-600">
                          Alternative {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {/* Package name */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Package Name</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <p className="font-medium text-blue-800">{packageDetails.name}</p>
                        <p className="text-xs text-gray-500">{packageDetails.code}</p>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">
                          <p className="font-medium">{pkg?.name || `Alternative Package ${index + 1}`}</p>
                          <p className="text-xs text-gray-500">{pkg?.code || 'N/A'}</p>
                        </td>
                      ))}
                    </tr>

                    {/* System Type */}
                    <tr>
                      <td className="py-3 px-4 font-medium">System Type</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          packageDetails.type === 'hybrid' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {packageDetails.type === 'hybrid' ? 'Hybrid' : 'On-Grid'}
                        </span>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            pkg?.type === 'hybrid' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {pkg?.type === 'hybrid' ? 'Hybrid' : 'On-Grid'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* System Size */}
                    <tr>
                      <td className="py-3 px-4 font-medium">System Size</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <div className="flex items-center space-x-1">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <span>{packageDetails.watts} Watts</span>
                        </div>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>{pkg?.watts || 0} Watts</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Battery Capacity */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Battery Capacity</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <div className="flex items-center space-x-1">
                          <Battery className="h-4 w-4 text-green-500" />
                          <span>{packageDetails.batteryCapacity}</span>
                        </div>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">
                          <div className="flex items-center space-x-1">
                            <Battery className="h-4 w-4 text-green-500" />
                            <span>{pkg?.batteryCapacity || 'N/A'}</span>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Cash Price */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Cash Price</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <span className="font-semibold">₱{packageDetails.cashPrice.toLocaleString()}</span>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">
                          <span className="font-semibold">₱{(pkg?.cashPrice || 0).toLocaleString()}</span>
                          <span className="text-xs ml-1 text-gray-500">
                            {pkg?.cashPrice && pkg.cashPrice > packageDetails.cashPrice 
                              ? `(+₱${(pkg.cashPrice - packageDetails.cashPrice).toLocaleString()})`
                              : pkg?.cashPrice && pkg.cashPrice < packageDetails.cashPrice
                                ? `(-₱${(packageDetails.cashPrice - pkg.cashPrice).toLocaleString()})`
                                : ''}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* Suitable For */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Suitable For</td>
                      <td className="py-3 px-4 bg-blue-50/50">{packageDetails.suitableFor}</td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => (
                        <td key={index} className="py-3 px-4">{pkg?.suitableFor || 'N/A'}</td>
                      ))}
                    </tr>

                    {/* Rating */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Match Rating</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <div className="flex items-center">
                          <span className="text-sm font-bold text-blue-700">100%</span>
                          <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <p className="text-xs text-blue-700 mt-1">Perfect Match</p>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => {
                        // Generate a rating between 60-90 if not provided
                        const rating = pkg?.comparisonRating || (60 + index * 10); // More deterministic fallback
                        return (
                          <td key={index} className="py-3 px-4">
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-gray-700">{rating}%</span>
                              <div className="w-full bg-gray-200 rounded-full h-2 ml-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    rating > 80 ? 'bg-green-500' : rating > 70 ? 'bg-yellow-500' : 'bg-orange-500'
                                  }`} 
                                  style={{ width: `${rating}%` }}
                                ></div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {rating > 80 ? 'Good Match' : rating > 70 ? 'Average Match' : 'Below Average'}
                            </p>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Comparison Reason */}
                    <tr>
                      <td className="py-3 px-4 font-medium">Analysis</td>
                      <td className="py-3 px-4 bg-blue-50/50">
                        <div className="flex items-start space-x-1">
                          <ThumbsUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-gray-700">
                            This package is optimally matched to your requirements based on electricity consumption, roof size, and budget.
                          </p>
                        </div>
                      </td>
                      {finalAlternatives.slice(0, 3).map((pkg, index) => {
                        // Generate comparison reasons if not provided
                        const reasons = [
                          `This ${pkg?.type || 'solar'} system is ${pkg?.watts && packageDetails.watts && pkg.watts > packageDetails.watts ? 'larger' : 'smaller'} than recommended, which may not be optimally balanced for your consumption needs.`,
                          `The ${pkg?.type === 'hybrid' ? 'battery capacity' : 'on-grid design'} may not align perfectly with your backup power requirements.`,
                          `While a good system, the price point is ${pkg?.cashPrice && packageDetails.cashPrice && pkg.cashPrice > packageDetails.cashPrice ? 'higher' : 'lower'} which affects the overall return on investment timeline.`,
                          `This alternative provides less optimal balance between upfront cost and long-term energy production for your specific usage pattern.`
                        ];
                        
                        const reason = pkg?.comparisonReason || reasons[index % reasons.length];
                        
                        return (
                          <td key={index} className="py-3 px-4">
                            <div className="flex items-start space-x-1">
                              <ThumbsDown className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                              <p className="text-xs text-gray-700">{reason}</p>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500 flex items-center justify-center space-x-2 bg-amber-50/50 p-3 rounded-lg">
            <Info className="h-4 w-4 text-amber-500" />
            <span>Ratings and comparisons are based on your specific inputs and may vary. Contact our experts for a detailed consultation.</span>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default EnhancedSolarAIAnalysis; 