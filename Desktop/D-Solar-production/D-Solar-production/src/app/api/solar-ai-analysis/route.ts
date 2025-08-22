import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { MongoClient } from 'mongodb';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

const mongoUri = process.env.MONGODB_URI;

// Define the SolarPackage type
interface SolarPackage {
  name: string;
  code: string;
  type: 'hybrid' | 'ongrid';
  watts: number;
  batteryCapacity: string;
  cashPrice: number;
  suitableFor: string;
  comparisonRating?: number;
  comparisonReason?: string;
}

// Define fallback packages with proper type assertion
const fallbackPackages: SolarPackage[] = [
  {
    name: "3.48kW Hybrid Solar PV System with 5.12kWh Battery",
    code: "HYB-3KS-P3",
    type: "hybrid" as 'hybrid',
    watts: 3480,
    batteryCapacity: "5.12kWh",
    cashPrice: 260800,
    suitableFor: "₱2500-4000 monthly bill"
  },
  {
    name: "5.8kW Hybrid Solar PV System with 10.24kWh Battery",
    code: "HYB-6K10-P5",
    type: "hybrid" as 'hybrid',
    watts: 5800,
    batteryCapacity: "10.24kWh",
    cashPrice: 395800,
    suitableFor: "₱3000-6000 monthly bill"
  },
  {
    name: "8.12kW On Grid Solar PV System",
    code: "ONG-8K-P7",
    type: "ongrid" as 'ongrid',
    watts: 8120,
    batteryCapacity: "N/A",
    cashPrice: 272800,
    suitableFor: "₱5000-8000 monthly bill"
  }
];

// Add fallback ongrid packages with proper type assertion
const fallbackOngridPackages: SolarPackage[] = [
  {
    name: "5.8kW On Grid Solar PV System",
    code: "ONG-6K-P5",
    type: "ongrid" as 'ongrid',
    watts: 5800,
    batteryCapacity: "N/A",
    cashPrice: 195800,
    suitableFor: "₱3000-6000 monthly bill"
  },
  {
    name: "8.12kW On Grid Solar PV System",
    code: "ONG-8K-P7",
    type: "ongrid" as 'ongrid',
    watts: 8120,
    batteryCapacity: "N/A",
    cashPrice: 272800,
    suitableFor: "₱5000-8000 monthly bill"
  },
  {
    name: "11.6kW On Grid Solar PV System",
    code: "ONG-12K-P13",
    type: "ongrid" as 'ongrid',
    watts: 11600,
    batteryCapacity: "N/A",
    cashPrice: 390800,
    suitableFor: "₱10000-13000 monthly bill"
  }
];

// Helper function to check if alternative packages are different from each other and from the recommended package
function alternativePackagesAreDifferent(alternatives: SolarPackage[], recommended: SolarPackage): boolean {
  // Check if we have at least 3 alternatives
  if (alternatives.length < 3) return false;
  
  // Check if any alternatives have the same code as the recommended package
  const hasSameAsRecommended = alternatives.some(alt => alt.code === recommended.code);
  if (hasSameAsRecommended) return false;
  
  // Check if all alternatives have unique codes
  const uniqueCodes = new Set(alternatives.map(alt => alt.code));
  return uniqueCodes.size >= 3; // We want at least 3 unique alternatives
}

export async function POST(req: Request) {
  try {
    const { inputs, result, weatherData, solarData, systemTypePreference } = await req.json();
    
    console.log("System type preference received:", systemTypePreference);
    
    let solarPackage: SolarPackage | null = null;
    let alternativePackages: SolarPackage[] = [];
    let client;

    // Initialize with fallback packages that we'll use if we can't get real ones
    // This ensures we always have alternatives to show
    const currentSystemType = systemTypePreference || 'hybrid';
    const fallbacksForCurrentType = currentSystemType === 'ongrid' ? fallbackOngridPackages : fallbackPackages;
    const fallbacksForOtherType = currentSystemType === 'ongrid' ? fallbackPackages : fallbackOngridPackages;
    
    // Pre-populate alternatives with fallbacks to ensure we have something to show
    const prePopulatedAlternatives = [
      // Similar package from opposite type
      { 
        ...fallbacksForOtherType[1],
        comparisonRating: 85,
        comparisonReason: `This ${currentSystemType === 'ongrid' ? 'hybrid' : 'on-grid'} system differs from your preferred type and offers different backup capabilities.`
      },
      // Smaller system from current type
      {
        ...fallbacksForCurrentType[0],
        comparisonRating: 72,
        comparisonReason: "This smaller system may not fully cover your electricity needs based on your consumption pattern."
      },
      // Larger system from current type
      {
        ...fallbacksForCurrentType[fallbacksForCurrentType.length - 1],
        comparisonRating: 78,
        comparisonReason: "While providing more capacity, this larger system represents a higher initial investment that may extend your payback period."
      }
    ];

    try {
      // Try to connect to MongoDB and fetch package details
      if (mongoUri) {
        client = await MongoClient.connect(mongoUri);
        const db = client.db('dsolar');
        const packagesCollection = db.collection('packages');
        
        // Build query based on monthly bill and system type preference
        const monthlyBill = inputs.currentBill;
        const query: any = {};
        
        // Add suitableFor filter with proper regex pattern
        if (monthlyBill) {
          // Get the bill in thousands, rounded down (e.g. 5500 → 5)
          const billRange = Math.floor(monthlyBill / 1000);
          
          // Create a proper regex pattern for matching the bill range in the suitableFor field
          // Use a string-based regex to avoid serialization issues
          query.suitableFor = { 
            $regex: `₱${billRange}`
          };
          
          console.log(`Looking for packages suitable for bill range: ₱${billRange}000`);
        }
        
        // Add system type filter if preference is provided
        if (systemTypePreference) {
          // Create proper regex pattern for code matching using string-based regex
          // to avoid serialization issues
          query.$or = [
            { type: systemTypePreference },
            { code: { $regex: systemTypePreference === 'ongrid' ? "^ONG" : "^HYB" } }
          ];
        }
        
        console.log("MongoDB query:", JSON.stringify(query));
        
        // First try to find a package matching all criteria
        const dbPackage = await packagesCollection.findOne(query);
        
        // If no package found with exact criteria, try a more flexible query
        if (!dbPackage) {
          console.log("No exact match found, trying more flexible query");
          
          // Create a more flexible query without bill range constraints
          const flexibleQuery: any = {};
          
          if (systemTypePreference) {
            flexibleQuery.$or = [
              { type: systemTypePreference },
              { code: { $regex: systemTypePreference === 'ongrid' ? "^ONG" : "^HYB" } }
            ];
          }
          
          // Try to find any package with the system type
          const flexiblePackage = await packagesCollection.findOne(flexibleQuery);
          
          if (flexiblePackage) {
            console.log("Found package with flexible criteria");
            solarPackage = flexiblePackage as unknown as SolarPackage;
            // Ensure type field is correctly set
            if (!solarPackage.type) {
              solarPackage.type = solarPackage.code.startsWith('ONG') ? 'ongrid' as 'ongrid' : 'hybrid' as 'hybrid';
            }
          } else {
            console.log("No packages found even with flexible query");
          }
        } else {
          solarPackage = dbPackage as unknown as SolarPackage;
          // Ensure type field is correctly set
          if (!solarPackage.type) {
            solarPackage.type = solarPackage.code.startsWith('ONG') ? 'ongrid' as 'ongrid' : 'hybrid' as 'hybrid';
          }
        }
        
        // Get all packages to serve as alternatives, excluding the recommended one
        let dbAlternatives = [];
        try {
          // Get all packages from the database to serve as potential alternatives
          dbAlternatives = await packagesCollection.find({}).toArray();
          console.log(`Found ${dbAlternatives.length} total packages in database`);
          
          // If no packages found, try a direct approach by examining document count
          if (dbAlternatives.length === 0) {
            const count = await packagesCollection.countDocuments({});
            console.log(`Collection contains ${count} documents`);
            
            // If collection is empty, we'll resort to fallbacks
            if (count === 0) {
              console.log("Package collection appears to be empty");
            } else {
              // Try again with no filter to ensure we can access the collection
              dbAlternatives = await packagesCollection.find({}).limit(10).toArray();
              console.log(`Retrieved ${dbAlternatives.length} packages with direct approach`);
            }
          }
          
          // Filter out the recommended package if we found one
          if (solarPackage) {
            // Make sure we have a valid ID before comparing
            if ((solarPackage as any)._id) {
              dbAlternatives = dbAlternatives.filter(pkg => 
                (pkg as any)._id.toString() !== (solarPackage as any)._id.toString()
              );
            } else if (solarPackage && solarPackage.code) {
              // If no _id, use code for comparison
              const packageCode = solarPackage.code;
              dbAlternatives = dbAlternatives.filter(pkg => 
                (pkg as any).code !== packageCode
              );
            }
          }
          
          // Convert to proper type
          alternativePackages = dbAlternatives.map(pkg => {
            const typedPkg = pkg as unknown as SolarPackage;
            // Ensure type field is set for each package
            if (!typedPkg.type) {
              typedPkg.type = typedPkg.code.startsWith('ONG') ? 'ongrid' as 'ongrid' : 'hybrid' as 'hybrid';
            }
            return typedPkg;
          });
          
          console.log(`Found ${alternativePackages.length} alternative packages in database`);
          
          // If we still have no alternatives, log more details for debugging
          if (alternativePackages.length === 0) {
            console.log("Debug info - No alternative packages found");
            console.log(`MongoDB URI: ${mongoUri ? "Set" : "Not set"}`);
            console.log(`Recommended package: ${solarPackage ? solarPackage.code : "None"}`);
          }
        } catch (alternativesError) {
          console.error('Error fetching alternative packages:', alternativesError);
        }
      }
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
    }

    // If no package found in MongoDB or connection failed, use fallback
    if (!solarPackage) {
      console.log('Using fallback package data');
      const monthlyBill = inputs.currentBill;
      
      // Select fallback package based on system type preference
      const packagesToUse = systemTypePreference === 'ongrid' 
        ? fallbackOngridPackages 
        : fallbackPackages;
      
      if (monthlyBill <= 4000) {
        solarPackage = packagesToUse[0] ? { ...packagesToUse[0] } : { ...fallbackPackages[0] };
      } else if (monthlyBill <= 8000) {
        solarPackage = packagesToUse[1] ? { ...packagesToUse[1] } : { ...fallbackPackages[1] };
      } else {
        solarPackage = packagesToUse[2] ? { ...packagesToUse[2] } : { ...fallbackPackages[2] };
      }
    }
    
    // At this point, we should have a valid solarPackage, but add a safety default just in case
    if (!solarPackage) {
      console.error("Failed to get any package. Using emergency default.");
      solarPackage = { ...fallbackPackages[1] };
    }
    
    // If we don't have any alternatives from the database, use our pre-populated fallbacks
    if (alternativePackages.length === 0) {
      console.log('No alternatives from database, using fallback alternatives');
      alternativePackages = [...prePopulatedAlternatives];
    }
    
    // Make sure we have at least 3 different alternative packages that are different from the recommended package
    if (alternativePackages.length < 3 || !alternativePackagesAreDifferent(alternativePackages, solarPackage)) {
      console.log('Not enough unique alternatives, adding fallback packages');
      
      // Add the pre-populated alternatives
      const combinedAlternatives = [...alternativePackages];
      
      // Filter out any alternatives that have the same code as the recommended package
      const uniquePrePopulated = prePopulatedAlternatives.filter(pkg => 
        pkg.code !== solarPackage.code && 
        !combinedAlternatives.some(alt => alt.code === pkg.code)
      );
      
      // Add unique pre-populated alternatives until we have at least 3
      for (const pkg of uniquePrePopulated) {
        if (!combinedAlternatives.some(alt => alt.code === pkg.code)) {
          combinedAlternatives.push(pkg);
          if (combinedAlternatives.length >= 3) break;
        }
      }
      
      // Update alternativePackages with our combined list
      alternativePackages = combinedAlternatives;
    }

    // Format the data for better prompt context
    const context = {
      customerProfile: {
        monthlyBill: inputs.currentBill,
        roofSize: inputs.roofSize,
        roofType: inputs.roofType,
        location: inputs.location,
        region: inputs.region,
        systemTypePreference: systemTypePreference
      },
      recommendedPackage: {
        name: solarPackage.name,
        code: solarPackage.code,
        type: solarPackage.type,
        watts: solarPackage.watts,
        batteryCapacity: solarPackage.batteryCapacity,
        cashPrice: solarPackage.cashPrice,
        suitableFor: solarPackage.suitableFor,
      },
      environmentalConditions: {
        temperature: weatherData?.temperature || 30,
        cloudCover: weatherData?.clouds || 20,
        windSpeed: weatherData?.windSpeed || 5,
        solarRadiation: solarData?.annualRadiation || 1800,
        peakSunHours: solarData?.peakSunHours || 5.5,
        systemEfficiency: solarData?.systemEfficiency || 85,
      }
    };

    let analysis;

    try {
      // Check if GROQ API key is available
      if (!process.env.GROQ_API_KEY) {
        throw new Error('GROQ API key is missing');
      }

      const prompt = `You are an expert solar energy consultant and analyst for D-Solar. Based on the following data, provide a comprehensive analysis of the recommended solar package and its suitability for the customer:

${JSON.stringify(context, null, 2)}

Consider the following aspects in your analysis:
1. Why this specific package is recommended for the customer's needs
2. How the package's specifications (system size, battery capacity) match their consumption
3. Financial analysis including ROI, comparing cash vs financing options
4. How local weather and environmental conditions affect system performance
5. Potential risks and mitigation strategies
6. Clear next steps for proceeding with the installation

IMPORTANT: You MUST respond with ONLY a valid JSON object with no markdown formatting. Your response must be a parseable JSON object with the following structure:
{
  "summary": "A concise overview of why this package is recommended and its key benefits",
  "recommendations": [
    "Specific recommendations about the package and its usage",
    "Installation considerations based on roof type and location",
    "Optimization suggestions for maximum benefit"
  ],
  "financialInsights": [
    "Detailed cost-benefit analysis",
    "Comparison of payment options",
    "Expected savings and ROI timeline",
    "Additional financial benefits and incentives"
  ],
  "environmentalImpact": [
    "Carbon footprint reduction",
    "Energy independence benefits",
    "Environmental savings in relatable terms"
  ],
  "risks": [
    "Installation considerations",
    "Performance factors",
    "Maintenance requirements",
    "Mitigation strategies"
  ],
  "nextSteps": [
    "Clear actionable steps for proceeding",
    "Documentation requirements",
    "Timeline expectations"
  ]
}

Do not include any text before or after the JSON object. Do not use markdown formatting, headings, or non-JSON syntax. Return only the JSON object.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a highly knowledgeable D-Solar energy consultant providing detailed, data-driven analysis and recommendations. You have deep knowledge of D-Solar's product catalog and installation processes. YOU MUST RESPOND WITH VALID JSON ONLY. DO NOT USE MARKDOWN OR TEXT FORMATTING.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 1,
        stream: false,
      });

      try {
        // Get the raw content from the completion
        const rawContent = completion.choices[0]?.message?.content || '{}';
        
        // Clean the content to extract only the JSON part
        let cleanedContent = rawContent;
        
        // Remove any thinking markers or XML-like tags
        cleanedContent = cleanedContent.replace(/<think>[\s\S]*?<\/think>/g, '');
        cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');
        
        // Find the first { and last } to extract just the JSON part
        const firstBrace = cleanedContent.indexOf('{');
        const lastBrace = cleanedContent.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          cleanedContent = cleanedContent.substring(firstBrace, lastBrace + 1);
        }
        
        try {
          // Parse the cleaned JSON
          analysis = JSON.parse(cleanedContent);
        } catch (jsonError) {
          console.error('Error parsing JSON, attempting to create structured response from text:', jsonError);
          
          // Create a fallback analysis based on the package details
          analysis = {
            summary: `Based on your inputs, I recommend the ${solarPackage.name}. This system is well-suited for your needs with a cash price of ₱${solarPackage.cashPrice.toLocaleString()}. The system includes premium components and comes with comprehensive warranties.`,
            recommendations: [
              "This package provides optimal coverage for your electricity consumption",
              "The system size matches your roof area and energy needs",
              "The price point offers good value for the features included"
            ],
            financialInsights: [
              `The cash price of ₱${solarPackage.cashPrice.toLocaleString()} provides excellent value for the system size`,
              "Expected payback period is within industry standards",
              "Long-term savings will significantly outweigh the initial investment"
            ],
            environmentalImpact: [
              "Reduces carbon footprint by utilizing clean solar energy",
              "Contributes to a more sustainable future",
              "Helps reduce dependency on fossil fuels"
            ],
            risks: [
              "Initial investment required",
              "System performance depends on weather conditions",
              "Regular maintenance needed for optimal performance"
            ],
            nextSteps: [
              "Schedule a site inspection",
              "Review detailed proposal",
              "Discuss installation timeline"
            ]
          };
        }
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError, 'Raw content:', completion.choices[0]?.message?.content);
        
        // Create a fallback analysis instead of throwing an error
        console.log('Using default analysis values instead of failing');
        analysis = {
          summary: `Based on your inputs, I recommend the ${solarPackage.name}. This system is well-suited for your needs with a cash price of ₱${solarPackage.cashPrice.toLocaleString()}. The system includes premium components and comes with comprehensive warranties.`,
          recommendations: [
            "This package provides optimal coverage for your electricity consumption",
            "The system size matches your roof area and energy needs",
            "The price point offers good value for the features included"
          ],
          financialInsights: [
            `The cash price of ₱${solarPackage.cashPrice.toLocaleString()} provides excellent value for the system size`,
            "Expected payback period is within industry standards",
            "Long-term savings will significantly outweigh the initial investment"
          ],
          environmentalImpact: [
            "Reduces carbon footprint by utilizing clean solar energy",
            "Contributes to a more sustainable future",
            "Helps reduce dependency on fossil fuels"
          ],
          risks: [
            "Initial investment required", 
            "System performance depends on weather conditions",
            "Regular maintenance needed for optimal performance"
          ],
          nextSteps: [
            "Schedule a site inspection",
            "Review detailed proposal",
            "Discuss installation timeline"
          ]
        };
      }
    } catch (aiError) {
      console.error('AI analysis generation error:', aiError);
      
      // Fallback AI analysis in case the API call fails
      analysis = {
        summary: `Based on your inputs, I recommend the ${solarPackage.name}. This system is well-suited for your needs with a cash price of ₱${solarPackage.cashPrice.toLocaleString()}. The system includes premium components and comes with comprehensive warranties.`,
        recommendations: [
          "This package provides optimal coverage for your electricity consumption",
          "The system size matches your roof area and energy needs",
          "The price point offers good value for the features included"
        ],
        financialInsights: [
          `The cash price of ₱${solarPackage.cashPrice.toLocaleString()} provides excellent value for the system size`,
          "Expected payback period is within industry standards",
          "Long-term savings will significantly outweigh the initial investment"
        ],
        environmentalImpact: [
          "Reduces carbon footprint by utilizing clean solar energy",
          "Contributes to a more sustainable future",
          "Helps reduce dependency on fossil fuels"
        ],
        risks: [
          "Initial investment required",
          "System performance depends on weather conditions",
          "Regular maintenance needed for optimal performance"
        ],
        nextSteps: [
          "Schedule a site inspection",
          "Review detailed proposal",
          "Discuss installation timeline"
        ]
      };
    }

    // Close MongoDB connection if it was opened
    if (client) {
      await client.close();
    }

    // Generate comparison ratings and reasons for alternative packages
    if (alternativePackages.length > 0) {
      try {
        // Only try to generate comparison if GROQ API key is available
        if (process.env.GROQ_API_KEY) {
          const comparisonPrompt = `
You are an expert solar energy consultant comparing different solar packages for a customer.

The customer's profile is:
- Monthly electricity bill: ₱${inputs.currentBill}
- Roof size: ${inputs.roofSize}
- Roof type: ${inputs.roofType}
- Location: ${inputs.location}
- Region: ${inputs.region}
- System type preference: ${systemTypePreference || 'No specific preference'}

The RECOMMENDED package is:
${JSON.stringify(solarPackage, null, 2)}

The ALTERNATIVE packages to compare are:
${JSON.stringify(alternativePackages, null, 2)}

For each alternative package, provide:
1. A numerical rating from 60-95 (with the recommended package being 100)
2. A brief, clear explanation (1-2 sentences) of why this alternative is not as ideal as the recommended package

Format your response as a JSON array where each object has 'code', 'rating', and 'reason' properties:
[
  {
    "code": "package-code-1",
    "rating": 85,
    "reason": "This package is slightly oversized for your consumption needs, leading to unnecessary upfront costs."
  },
  {
    "code": "package-code-2",
    "rating": 72,
    "reason": "While more affordable, this system lacks sufficient battery capacity for your backup power requirements."
  }
]
`;

          const comparisonCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are a highly knowledgeable solar energy consultant providing precise comparisons between solar packages. Respond ONLY with the requested JSON format - no preamble or explanation. YOU MUST RETURN ONLY VALID JSON WITH NO MARKDOWN.",
              },
              {
                role: "user",
                content: comparisonPrompt,
              },
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stream: false,
          });

          try {
            // Get the raw comparison content
            const rawContent = comparisonCompletion.choices[0]?.message?.content || '[]';
            
            // Clean the content to extract only the JSON part
            let cleanedContent = rawContent;
            
            // Remove any thinking markers or XML-like tags
            cleanedContent = cleanedContent.replace(/<think>[\s\S]*?<\/think>/g, '');
            cleanedContent = cleanedContent.replace(/<[^>]*>/g, '');
            
            // Find the first [ and last ] to extract just the JSON array part
            const firstBracket = cleanedContent.indexOf('[');
            const lastBracket = cleanedContent.lastIndexOf(']');
            
            if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
              cleanedContent = cleanedContent.substring(firstBracket, lastBracket + 1);
            }
            
            try {
              // Parse the cleaned JSON
              const comparisonResults = JSON.parse(cleanedContent);
              
              // Apply the ratings and reasons to the alternative packages
              alternativePackages = alternativePackages.map(pkg => {
                const comparison = comparisonResults.find((c: { code: string; rating: number; reason: string }) => c.code === pkg.code);
                if (comparison) {
                  return {
                    ...pkg,
                    comparisonRating: comparison.rating,
                    comparisonReason: comparison.reason
                  };
                }
                return pkg;
              });
            } catch (jsonError) {
              console.error('Error parsing comparison JSON, using default ratings:', jsonError);
              
              // Create default ratings if parsing fails
              alternativePackages = alternativePackages.map((pkg, index) => {
                // Generate rating between 70-90 based on index
                const rating = 90 - (index * 7);
                // Generate reason based on package details
                let reason = "";
                
                if (pkg.type !== solarPackage.type) {
                  reason = `This ${pkg.type} system differs from the recommended ${solarPackage.type} system in terms of backup capability.`;
                } else if (pkg.watts > solarPackage.watts) {
                  reason = "This larger system provides more capacity but at a higher cost, potentially extending your return on investment period.";
                } else if (pkg.watts < solarPackage.watts) {
                  reason = "This smaller system is more affordable but may not fully cover your electricity needs based on your consumption.";
                } else {
                  reason = "This alternative package has slightly different specifications that may not align optimally with your specific requirements.";
                }
                
                return {
                  ...pkg,
                  comparisonRating: rating,
                  comparisonReason: reason
                };
              });
            }
          } catch (parseError) {
            console.error('Error parsing comparison results:', parseError, 'Raw content:', comparisonCompletion.choices[0]?.message?.content);
            // Continue with default ratings instead of failing
            console.log('Using default comparison ratings');
            
            // Create default ratings
            alternativePackages = alternativePackages.map((pkg, index) => {
              // Generate rating between 70-90 based on index
              const rating = 90 - (index * 7);
              // Generate reason based on package details
              let reason = "";
              
              if (pkg.type !== solarPackage.type) {
                reason = `This ${pkg.type} system differs from the recommended ${solarPackage.type} system in terms of backup capability.`;
              } else if (pkg.watts > solarPackage.watts) {
                reason = "This larger system provides more capacity but at a higher cost, potentially extending your return on investment period.";
              } else if (pkg.watts < solarPackage.watts) {
                reason = "This smaller system is more affordable but may not fully cover your electricity needs based on your consumption.";
              } else {
                reason = "This alternative package has slightly different specifications that may not align optimally with your specific requirements.";
              }
              
              return {
                ...pkg,
                comparisonRating: rating,
                comparisonReason: reason
              };
            });
          }
        }
      } catch (comparisonError) {
        console.error('Error generating package comparisons:', comparisonError);
        // Continue without the comparisons if the API call fails
      }
    }

    return NextResponse.json({
      analysis,
      packageDetails: context.recommendedPackage,
      alternativePackages: alternativePackages.map(pkg => ({
        name: pkg.name,
        code: pkg.code,
        type: pkg.type,
        watts: pkg.watts,
        batteryCapacity: pkg.batteryCapacity,
        cashPrice: pkg.cashPrice,
        suitableFor: pkg.suitableFor,
        comparisonRating: pkg.comparisonRating,
        comparisonReason: pkg.comparisonReason
      }))
    });
  } catch (error: unknown) {
    console.error('Error in solar AI analysis:', error);
    
    // Return a default package based on system type preference
    const systemType = (error as any).systemTypePreference || 'hybrid';
    const defaultPackage: SolarPackage = {
      name: "5.8kW Hybrid Solar PV System with 5.12kWh Battery",
      code: "HYB-6K5-P5",
      type: "hybrid",
      watts: 5800,
      batteryCapacity: "5.12kWh",
      cashPrice: 330800,
      suitableFor: "₱3000-6000 monthly bill"
    };
    
    const defaultAnalysis = {
      summary: `Based on your inputs, I recommend the ${defaultPackage.name}. This system is well-suited for your needs with a cash price of ₱${defaultPackage.cashPrice.toLocaleString()}. The system includes premium components and comes with comprehensive warranties.`,
      recommendations: [
        "This package provides optimal coverage for your electricity consumption",
        "The system size matches your roof area and energy needs",
        "The price point offers good value for the features included"
      ],
      financialInsights: [
        `The cash price of ₱${defaultPackage.cashPrice.toLocaleString()} provides excellent value for the system size`,
        "Expected payback period is within industry standards",
        "Long-term savings will significantly outweigh the initial investment"
      ],
      environmentalImpact: [
        "Reduces carbon footprint by utilizing clean solar energy",
        "Contributes to a more sustainable future",
        "Helps reduce dependency on fossil fuels"
      ],
      risks: [
        "Initial investment required",
        "System performance depends on weather conditions",
        "Regular maintenance needed for optimal performance"
      ],
      nextSteps: [
        "Schedule a site inspection",
        "Review detailed proposal",
        "Discuss installation timeline"
      ]
    };
    
    // Generate fallback alternatives with comparison data
    const fallbackAlternatives = [
      // First alternative - similar package but different type
      {
        ...(systemType === 'ongrid' ? fallbackPackages[1] : fallbackOngridPackages[1]),
        comparisonRating: 85,
        comparisonReason: `This ${systemType === 'ongrid' ? 'hybrid' : 'on-grid'} system differs from the recommended package mainly in backup capability during power outages.`
      },
      // Second alternative - smaller system
      {
        ...(systemType === 'ongrid' ? fallbackOngridPackages[0] : fallbackPackages[0]),
        comparisonRating: 72,
        comparisonReason: "This smaller system may not fully cover your electricity needs based on your current consumption pattern."
      },
      // Third alternative - larger system
      {
        ...(systemType === 'ongrid' ? fallbackOngridPackages[2] : fallbackPackages[2]),
        comparisonRating: 78,
        comparisonReason: "While providing more capacity, this larger system represents a higher initial investment that may extend your payback period."
      }
    ];
    
    return NextResponse.json({
      analysis: defaultAnalysis,
      packageDetails: {
        name: defaultPackage.name,
        code: defaultPackage.code,
        type: defaultPackage.type,
        watts: defaultPackage.watts,
        batteryCapacity: defaultPackage.batteryCapacity,
        cashPrice: defaultPackage.cashPrice,
        suitableFor: defaultPackage.suitableFor
      },
      alternativePackages: fallbackAlternatives
    });
  }
} 