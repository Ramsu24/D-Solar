import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SolarCalculatorParams, { ICalculatorParams } from '@/models/SolarCalculatorParams';

// Helper function to check if the request is from an authenticated admin
async function isAdmin(request: NextRequest): Promise<boolean> {
  // Get admin username from cookie
  const adminUsername = request.cookies.get('adminUsername')?.value;
  return !!adminUsername; // Return true if username exists
}

// GET handler to retrieve calculator parameters
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Find the calculator parameters
    let params = await SolarCalculatorParams.findOne();

    // If no parameters exist, create default parameters based on current implementation
    if (!params) {
      // Default values from SolarCalculator.tsx
      const defaultParams: ICalculatorParams = {
        templates: {
          residential: {
            name: "Residential",
            description: "For homes and small properties",
            defaultBill: 0,
            systemSizes: [3, 5, 8, 10, 15],
            costPerKw: 70000,
            roofTypeCosts: {
              concrete: {
                additionalCostPerKw: 14000,
                installationDetails: "Installation on concrete roofs requires metal structures for mounting the solar panels. This typically adds about 20% to the total package cost due to the additional materials and labor needed for proper structural support."
              },
              metal: {
                additionalCostPerKw: 0,
                installationDetails: "Installation on metal tin roofs is straightforward with regular installation methods. There's no additional cost as the panels can be mounted directly to the metal surface using standard mounting hardware."
              }
            },
            panelWattage: 450,
            electricityReduction: 0.90,
            annualInflation: 0.055,
            panelDegradation: 0.005,
            paybackPeriod: "5-7 years"
          },
          commercial: {
            name: "Commercial",
            description: "For businesses and large installations",
            defaultBill: 0,
            systemSizes: [50, 100, 200, 300, 400],
            costPerKw: 34000,
            roofTypeCosts: {
              concrete: {
                additionalCostPerKw: 6800,
                installationDetails: "Installation on concrete roofs requires metal structures for mounting the solar panels. This typically adds about 20% to the total package cost due to the additional materials and labor needed for proper structural support."
              },
              metal: {
                additionalCostPerKw: 0,
                installationDetails: "Installation on metal tin roofs is straightforward with regular installation methods. There's no additional cost as the panels can be mounted directly to the metal surface using standard mounting hardware."
              }
            },
            panelWattage: 580,
            electricityReduction: 0.95,
            annualInflation: 0.05,
            panelDegradation: 0.004,
            paybackPeriod: "3 years, 2 months"
          }
        },
        regions: {
          'metro-manila': {
            name: 'Metro Manila',
            transportCosts: {
              small: 0,
              medium: 0,
              large: 0,
            },
            description: 'No additional transport and mobilization costs'
          },
          'central-luzon': {
            name: 'Central Luzon',
            transportCosts: {
              small: 10000,
              medium: 20000,
              large: 30000,
            },
            description: 'Additional fees for transport and mobilization to Central Luzon area'
          },
          'calabarzon': {
            name: 'CALABARZON',
            transportCosts: {
              small: 10000,
              medium: 20000,
              large: 30000,
            },
            description: 'Additional fees for transport and mobilization to CALABARZON area'
          },
          'northern-luzon': {
            name: 'Northern Luzon',
            transportCosts: {
              small: 20000,
              medium: 30000,
              large: 40000,
            },
            description: 'Additional fees for transport and mobilization to Northern Luzon area'
          },
          'southern-luzon': {
            name: 'Southern Luzon',
            transportCosts: {
              small: 20000,
              medium: 30000,
              large: 40000,
            },
            description: 'Additional fees for transport and mobilization to Southern Luzon area'
          }
        },
        additionalCosts: {
          residential: {
            netMeteringProcessingFee: 19500,
            otherFees: 5500,
            netMeteringPipingCost: 9500
          },
          commercial: {
            netMeteringProcessingFee: 25000,
            otherFees: 15000,
            netMeteringPipingCost: 20000
          }
        },
        defaultValues: {
          defaultSystemEfficiency: 18,
          defaultAnnualRadiation: 1800,
          defaultPeakSunHours: 5.5
        }
      };

      // Create new parameters document
      params = await SolarCalculatorParams.create(defaultParams);
    }

    return NextResponse.json(params);
  } catch (error) {
    console.error('Error retrieving calculator parameters:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve calculator parameters' },
      { status: 500 }
    );
  }
}

// POST handler to update calculator parameters
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const updatedParams = await request.json();

    // Connect to database
    await connectDB();

    // Find existing params
    const existingParams = await SolarCalculatorParams.findOne();

    // Update or create params
    let params;
    if (existingParams) {
      // Update existing document
      params = await SolarCalculatorParams.findByIdAndUpdate(
        existingParams._id,
        updatedParams,
        { new: true, runValidators: true }
      );
    } else {
      // Create new document
      params = await SolarCalculatorParams.create(updatedParams);
    }

    return NextResponse.json({
      message: 'Calculator parameters updated successfully',
      params
    });
  } catch (error) {
    console.error('Error updating calculator parameters:', error);
    return NextResponse.json(
      { error: 'Failed to update calculator parameters' },
      { status: 500 }
    );
  }
} 