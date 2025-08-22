import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Lightbulb, TrendingUp, Sun, Shield, AlertTriangle, Loader2 } from 'lucide-react';

interface SolarAIAnalysisProps {
  inputs: {
    currentBill: number;
    roofSize: number;
    roofType: 'concrete' | 'metal';
    location: {
      lat: number;
      lng: number;
      address?: string;
    };
    template: string;
    region: string;
  };
  result: {
    savings: number;
    system: string;
    totalCost: number;
    formattedPayback: string;
  };
  weatherData: {
    temperature: number | null;
    clouds: number | null;
    windSpeed: number | null;
  };
  solarData: {
    annualRadiation: number | null;
    peakSunHours: number | null;
    systemEfficiency: number | null;
  };
}

const SolarAIAnalysis: React.FC<SolarAIAnalysisProps> = ({ inputs, result, weatherData, solarData }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    recommendations: string[];
    financialInsights: string[];
    environmentalImpact: string[];
    risks: string[];
    nextSteps: string[];
  } | null>(null);

  useEffect(() => {
    const generateAnalysis = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/solar-ai-analysis', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs,
            result,
            weatherData,
            solarData,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate AI analysis');
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (error) {
        console.error('Error generating AI analysis:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generateAnalysis();
  }, [inputs, result, weatherData, solarData]);

  if (isLoading) {
    return (
      <div className="border border-primary/20 rounded-xl p-6 bg-primary/5">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
          <p className="text-primary font-medium">Generating AI-powered analysis...</p>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* AI Analysis Header */}
      <div className="border border-primary/20 rounded-xl p-6 bg-primary/5">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Bot className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">AI-Powered Solar Analysis</h3>
            <p className="text-gray-600 text-sm">{analysis.summary}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommendations */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <h4 className="font-semibold text-gray-800">Key Recommendations</h4>
          </div>
          <ul className="space-y-3">
            {analysis.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-yellow-500 mt-1">•</span>
                <span className="text-sm text-gray-600">{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Financial Insights */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h4 className="font-semibold text-gray-800">Financial Analysis</h4>
          </div>
          <ul className="space-y-3">
            {analysis.financialInsights.map((insight, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-sm text-gray-600">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Environmental Impact */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <Sun className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold text-gray-800">Environmental Impact</h4>
          </div>
          <ul className="space-y-3">
            {analysis.environmentalImpact.map((impact, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-sm text-gray-600">{impact}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Risk Assessment */}
        <div className="border border-gray-200 rounded-xl p-6 bg-white">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="w-5 h-5 text-red-500" />
            <h4 className="font-semibold text-gray-800">Risk Assessment</h4>
          </div>
          <ul className="space-y-3">
            {analysis.risks.map((risk, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-red-500 mt-1">•</span>
                <span className="text-sm text-gray-600">{risk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="border border-gray-200 rounded-xl p-6 bg-white">
        <div className="flex items-center space-x-3 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h4 className="font-semibold text-gray-800">Recommended Next Steps</h4>
        </div>
        <ul className="space-y-3">
          {analysis.nextSteps.map((step, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-primary mt-1">•</span>
              <span className="text-sm text-gray-600">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-xs text-gray-500 flex items-center justify-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span>AI-generated analysis based on your inputs and local conditions. Consult with our solar experts for detailed assessment.</span>
      </div>
    </motion.div>
  );
};

export default SolarAIAnalysis; 