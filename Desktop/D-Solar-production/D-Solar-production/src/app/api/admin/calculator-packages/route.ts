import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Package from '@/models/Package';

// Get all packages formatted for the solar calculator
export async function GET() {
  try {
    await connectDB();
    
    // Get all packages and sort by type and wattage
    const packages = await Package.find({}).sort({ type: 1, wattage: 1 });
    
    // Map the MongoDB packages to the format expected by the calculator
    const formattedPackages = packages.map(pkg => {
      // Determine if the package is hybrid or ongrid based on the type field or code
      const type = pkg.type.startsWith('hybrid') ? 'hybrid' : 'ongrid';
      
      // Generate proper ID
      const id = pkg.code.toLowerCase().replace(/\s+/g, '-');
      
      // Map MongoDB package to calculator format
      return {
        id,
        name: pkg.name,
        code: pkg.code,
        type,
        watts: pkg.wattage,
        // For hybrid types, provide battery capacity information
        batteryCapacity: type === 'hybrid' ? 
          (pkg.type === 'hybrid-large' ? '10.24kWh' : 
           pkg.type === 'hybrid-small' ? '5.12kWh' : '5.12kWh') : 
          'N/A',
        cashPrice: pkg.cashPrice,
        financingPrice: pkg.financingPrice,
        srpPrice: pkg.srpPrice,
        suitableFor: pkg.suitableFor,
        description: pkg.description
      };
    });
    
    // Organize by type (hybrid/ongrid)
    const organizedPackages = {
      hybrid: formattedPackages.filter(pkg => pkg.type === 'hybrid'),
      ongrid: formattedPackages.filter(pkg => pkg.type === 'ongrid')
    };
    
    // Return the organized packages
    return NextResponse.json(organizedPackages);
  } catch (error) {
    console.error('Error fetching calculator packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calculator packages' },
      { status: 500 }
    );
  }
} 