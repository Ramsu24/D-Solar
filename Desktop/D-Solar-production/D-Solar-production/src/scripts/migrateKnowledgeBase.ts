/**
 * Knowledge Base Migration Script
 * 
 * This script migrates the static FAQ and package data to MongoDB.
 * 
 * How to run this script:
 * 1. Make sure MongoDB connection string is set in your .env file:
 *    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
 * 
 * 2. Run the script with ts-node:
 *    npx ts-node src/scripts/migrateKnowledgeBase.ts
 * 
 * 3. Alternatively, you can compile and run with:
 *    npx tsc src/scripts/migrateKnowledgeBase.ts
 *    node src/scripts/migrateKnowledgeBase.js
 */

import { faqData } from '../data/faqData';
import connectDB from '../lib/mongodb';
import FAQ from '../models/FAQ';
import Package from '../models/Package';
import mongoose from 'mongoose';

// Define package data based on the packageInfoMap in ChatBot.tsx
const packageData = [
  {
    code: 'ONG-2K-P1',
    name: 'OnGrid Basic Package',
    description: 'This package is perfect for homes with low electricity consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 2320,
    suitableFor: 'Suitable for monthly bills around ₱2,500 and below',
    financingPrice: 124880,
    srpPrice: 111500,
    cashPrice: 104800
  },
  {
    code: 'ONG-3K-P2',
    name: 'OnGrid Medium Package',
    description: 'This mid-sized OnGrid system provides excellent value for homes with moderate electricity usage. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 3480,
    suitableFor: 'Suitable for monthly bills ₱2,500-₱4,000',
    financingPrice: 171360,
    srpPrice: 153000,
    cashPrice: 143800
  },
  {
    code: 'ONG-6K-P4',
    name: 'OnGrid Large Package',
    description: 'This powerful OnGrid system is ideal for homes with moderate to high electricity consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 5800,
    suitableFor: 'Suitable for monthly bills ₱3,000-₱6,000',
    financingPrice: 258720,
    srpPrice: 231000,
    cashPrice: 216800
  },
  {
    code: 'HYB-3K-P1',
    name: 'Hybrid Small Battery Package',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid-small',
    wattage: 3480,
    suitableFor: 'Suitable for monthly bills ₱2,500-₱4,000',
    financingPrice: 310800,
    srpPrice: 277300,
    cashPrice: 260800
  },
  {
    code: 'HYB-10K-P2',
    name: 'Hybrid Large Battery Package',
    description: 'This premium hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid-large',
    wattage: 9860,
    suitableFor: 'Suitable for monthly bills ₱8,000-₱10,000',
    financingPrice: 756000,
    srpPrice: 674800,
    cashPrice: 634300
  }
];

async function migrateData() {
  try {
    console.log('Starting knowledge base migration...');
    
    // Connect to MongoDB
    await connectDB();
    console.log('Connected to MongoDB');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    await FAQ.deleteMany({});
    await Package.deleteMany({});
    console.log('Cleared existing data');
    
    // Migrate FAQs
    console.log(`Migrating ${faqData.length} FAQs...`);
    const faqPromises = faqData.map(faq => FAQ.create(faq));
    await Promise.all(faqPromises);
    console.log('FAQs migrated successfully');
    
    // Migrate Packages
    console.log(`Migrating ${packageData.length} packages...`);
    const packagePromises = packageData.map(pkg => Package.create(pkg));
    await Promise.all(packagePromises);
    console.log('Packages migrated successfully');
    
    console.log('Migration completed successfully!');
    
    // Close the MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migrateData(); 