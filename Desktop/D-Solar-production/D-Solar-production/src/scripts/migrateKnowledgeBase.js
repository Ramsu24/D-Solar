/**
 * Knowledge Base Migration Script (JavaScript version)
 * 
 * This script migrates the static FAQ and package data to MongoDB.
 * 
 * How to run this script:
 * 1. Make sure MongoDB connection string is set in your .env file
 * 2. Run with: node src/scripts/migrateKnowledgeBase.js
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define schemas first
const faqSchema = new Schema({
  id: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  answer: { type: String, required: true },
  category: { type: String, required: true },
  keywords: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const packageSchema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  wattage: { type: Number, required: true },
  suitableFor: { type: String, required: true },
  financingPrice: { type: Number, required: true },
  srpPrice: { type: Number, required: true },
  cashPrice: { type: Number, required: true },
});

// Create models
const FAQ = mongoose.models.FAQ || mongoose.model('FAQ', faqSchema);
const Package = mongoose.models.Package || mongoose.model('Package', packageSchema);

// Define FAQ data
const faqData = [
  {
    id: "faq-1",
    question: "What is solar energy?",
    answer: "Solar energy is power generated from the sun's rays. It's a renewable, sustainable source of energy that can be harnessed using solar panels (photovoltaic cells) that convert sunlight into electricity.",
    category: "Basics",
    keywords: ["solar", "energy", "renewable", "sustainable"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-2",
    question: "How do solar panels work?",
    answer: "Solar panels contain photovoltaic cells that convert sunlight into electricity. When sunlight hits these cells, it causes electrons to move, creating an electric current. This direct current (DC) electricity is then converted to alternating current (AC) by an inverter, which can be used to power your home.",
    category: "Basics",
    keywords: ["solar panels", "photovoltaic", "electricity", "inverter", "DC", "AC"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-3",
    question: "What are the benefits of switching to solar?",
    answer: "Switching to solar offers numerous benefits including: lower electricity bills, reduced carbon footprint, energy independence, potential increase in property value, and protection against rising utility costs. Solar systems also have low maintenance requirements and long lifespans.",
    category: "Benefits",
    keywords: ["benefits", "electricity bills", "carbon footprint", "energy independence", "property value"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-4",
    question: "Will solar panels work during power outages?",
    answer: "Standard grid-tied solar systems will shut down during power outages for safety reasons. However, if you opt for a system with battery storage or a hybrid system, you can continue to have electricity during outages.",
    category: "Operation",
    keywords: ["power outages", "grid-tied", "battery storage", "hybrid system"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-5",
    question: "How much can I save with solar panels?",
    answer: "Savings vary based on your location, current electricity rates, system size, and energy consumption. Many households can save 50-90% on their monthly electricity bills. We provide detailed savings projections during our consultation.",
    category: "Financial",
    keywords: ["savings", "electricity rates", "bills", "financial"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-6",
    question: "Do you have installment plans?",
    answer: "We offer flexible installment plans through our partner financing institutions, SB Finance (3 Years) and BPI (5 Years). Our team will guide you through the application process, including the necessary requirements and terms.",
    category: "Financial",
    keywords: ["installment", "financing", "SB Finance", "BPI", "payment plans"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-7",
    question: "How to avail your installment plans?",
    answer: "We're more than happy to help and guide you through the process. Here's the list of requirements: (insert screenshot)",
    category: "Financial",
    keywords: ["installment", "requirements", "avail", "process"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-8",
    question: "Can I ask for a quotation?",
    answer: "Yes! You can request a free quotation. Share your latest MERALCO bill, roof type (concrete, metal tin or yero), and exact address, and we'll provide you with a customized proposal. (sales personnel should probe about client's energy usage if mostly daytime or nighttime)",
    category: "Sales",
    keywords: ["quotation", "MERALCO bill", "roof type", "proposal", "quote"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-9",
    question: "How much money will I save with Solar?",
    answer: "Savings vary based on your energy usage, solar system size, and location. Typically, customers save 30-70% on their electricity bills. Over time, this can result in significant savings. We'd love to explain more, let's hop on a call and go over the details.",
    category: "Financial",
    keywords: ["savings", "electricity bills", "energy usage", "solar system size"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-10",
    question: "Can I get Zero Bill?",
    answer: "Achieving a \"Zero Bill\" is possible under specific conditions, such as using an adequately sized solar setup with battery that fully offsets your consumption and participating in net metering.",
    category: "Financial",
    keywords: ["zero bill", "battery", "net metering", "consumption", "offset"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-11",
    question: "Where are you located?",
    answer: "We are based in Parañaque City and serve nearby provinces. Where is your property located so we can confirm if we serve your area.",
    category: "Company",
    keywords: ["location", "Parañaque", "service area", "provinces"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-12",
    question: "What's the difference between On-Grid and Hybrid System?",
    answer: "On-Grid Systems: Uses both your energy supplier (eg. Meralco) at night and solar power for day time.\nHybrid Systems: Uses solar power during daytime, and battery during night time.",
    category: "Technical",
    keywords: ["on-grid", "hybrid", "Meralco", "battery", "system types"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-13",
    question: "How much is a (kw) system?",
    answer: "To assist you further, can you provide your latest electric bill so we can give you a detailed analysis and quotation.",
    category: "Financial",
    keywords: ["price", "cost", "kw system", "quotation", "electric bill"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-14",
    question: "Can I use the On-Grid System during night time?",
    answer: "On-grid systems rely on sunlight and do not work at night unless paired with batteries.",
    category: "Technical",
    keywords: ["on-grid", "night time", "batteries", "sunlight"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-15",
    question: "What happens during a power outage?",
    answer: "On-grid systems automatically shut down during outages for safety reasons. Hybrid systems with batteries can provide backup power.",
    category: "Operation",
    keywords: ["power outage", "shutdown", "hybrid", "backup power", "safety"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-16",
    question: "Will solar panels work during cloudy days or rainy weather?",
    answer: "Yes but the power produced may be reduced compared to sunny days.",
    category: "Technical",
    keywords: ["cloudy days", "rainy weather", "power production", "efficiency"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-17",
    question: "How much maintenance do solar panels require?",
    answer: "Solar panels require minimal maintenance at least once a year. Regular cleaning to remove dust and debris is sufficient. Our team offers maintenance services upon installation.",
    category: "Maintenance",
    keywords: ["maintenance", "cleaning", "dust", "debris", "services"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-18",
    question: "Do you offer free maintenance service?",
    answer: "Free 2-year maintenance is included in our packages.",
    category: "Maintenance",
    keywords: ["free maintenance", "packages", "service", "included"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-19",
    question: "What is the lifespan of a solar panel?",
    answer: "Solar panels typically last 25–30 years, with efficiency slightly decreasing over time.",
    category: "Technical",
    keywords: ["lifespan", "durability", "efficiency", "years"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-20",
    question: "How about your warranty?",
    answer: "We offer 12-year warranty on panels with 30 years performance warranty, 5 yrs on inverter, 5 yrs on battery, 2 yrs on workmanship",
    category: "Warranty",
    keywords: ["warranty", "panels", "inverter", "battery", "workmanship"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-21",
    question: "How long does it take to install a solar power system?",
    answer: "Installation typically takes 1–2 days for residential systems. Larger systems may take longer.",
    category: "Installation",
    keywords: ["installation time", "residential", "days", "process"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-22",
    question: "Are there any permits required for a solar installation?",
    answer: "For residential installation, permits are not required, but the process varies by location",
    category: "Installation",
    keywords: ["permits", "residential", "requirements", "location"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-23",
    question: "Will solar panels damage my roof?",
    answer: "No, properly installed solar panels should not damage your roof. In fact, they can provide additional protection by shielding your roof from direct sunlight and weather elements",
    category: "Installation",
    keywords: ["roof damage", "installation", "protection", "shielding"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-24",
    question: "How much roof space do I need for a solar installation?",
    answer: "For every 3kW system, it requires 8sqm",
    category: "Technical",
    keywords: ["roof space", "3kW", "8sqm", "installation requirements"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-25",
    question: "How big is a solar panel?",
    answer: "Sizes of the panels vary on the Wattage, for example, a 600W Solar Panel is around (7.8ft x 3.7ft) 2.4m x 1.1m",
    category: "Technical",
    keywords: ["panel size", "dimensions", "600W", "wattage"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-26",
    question: "Can I add more panels to my system later?",
    answer: "This depends on the design of the system. It will help if you can tell us about your plans so we can properly recommend a design that is future-proof.",
    category: "Technical",
    keywords: ["add panels", "expansion", "future-proof", "system design"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-27",
    question: "Can I monitor my system's performance?",
    answer: "Yes, we provide monitoring solutions that allow you to track your system's performance through a mobile app",
    category: "Operation",
    keywords: ["monitoring", "performance", "mobile app", "tracking"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-28",
    question: "What happens if a component of my solar system needs to be replaced?",
    answer: "If a component under warranty needs replacement, we will handle it in accordance with the warranty terms. If the warranty has expired, we offer discounted pricing on replacement parts and labor.",
    category: "Warranty",
    keywords: ["replacement", "warranty", "parts", "labor", "discounted pricing"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-29",
    question: "What's net metering and how does it work?",
    answer: "Net metering allows you to sell excess energy to your electric company and this will be subtracted on your next bill, effectively reducing your electricity costs.",
    category: "Technical",
    keywords: ["net metering", "excess energy", "electric company", "bill reduction"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-30",
    question: "What is the payback period?",
    answer: "The payback period is typically 4-5 years, depending on your energy savings and system cost.",
    category: "Financial",
    keywords: ["payback period", "years", "energy savings", "system cost", "ROI"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-31",
    question: "Do I need a battery for my solar power system?",
    answer: "Batteries are optional for on-grid systems but essential for hybrid setups, especially if you want backup power during outages or utilize solar energy produced at night.",
    category: "Technical",
    keywords: ["battery", "on-grid", "hybrid", "backup power", "outages"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-32",
    question: "Do I need a lot of space for the set up?",
    answer: "No, even smaller rooftops can accommodate a system. We can schedule a site visit to assess your available space.",
    category: "Installation",
    keywords: ["space", "rooftop", "site visit", "assessment"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-33",
    question: "Do you offer your services in (location)?",
    answer: "We serve Metro Manila and Central Luzon.",
    category: "Company",
    keywords: ["services", "Metro Manila", "Central Luzon", "location"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "faq-34",
    question: "What are the brands you carry?",
    answer: "For solar panels we use AE Solar (German brand), JA Solar (China), Panasonic\nFor the inverters we use Solis, Deye, Huawei, Enphase\nFor the batteries we use Lvtopsun and Deye",
    category: "Products",
    keywords: ["brands", "AE Solar", "JA Solar", "Panasonic", "Solis", "Deye", "Huawei", "Enphase", "Lvtopsun"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Define package data
const packageData = [
  {
    code: 'ONG-2K-P1',
    name: 'OnGrid Basic Package',
    description: 'This package is perfect for homes with low electricity consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 2320,
    suitableFor: 'Suitable for monthly bills ₱2,500 and below',
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
    code: 'HYB-3K5-P3',
    name: 'Hybrid Small Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 3480,
    suitableFor: 'Suitable for monthly bills ₱2,500-₱4,000',
    financingPrice: 311360,
    srpPrice: 278000,
    cashPrice: 260800
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
    code: 'HYB-6K5-P5',
    name: 'Hybrid Medium Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 5800,
    suitableFor: 'Suitable for monthly bills ₱3,000-₱6,000',
    financingPrice: 394240,
    srpPrice: 352000,
    cashPrice: 330800
  },
  {
    code: 'HYB-6K10-P6',
    name: 'Hybrid Medium Package with 10.24KWh Battery',
    description: 'This hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 5800,
    suitableFor: 'Suitable for monthly bills ₱3,000-₱6,000',
    financingPrice: 472640,
    srpPrice: 422000,
    cashPrice: 395800
  },
  {
    code: 'ONG-8K-P7',
    name: 'OnGrid Premium Package',
    description: 'This premium OnGrid system is designed for homes with higher electricity demands. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 8120,
    suitableFor: 'Suitable for monthly bills ₱6,000-₱8,000',
    financingPrice: 325920,
    srpPrice: 291000,
    cashPrice: 272800
  },
  {
    code: 'HYB-8K5-P8',
    name: 'Hybrid Large Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 8120,
    suitableFor: 'Suitable for monthly bills ₱6,000-₱8,000',
    financingPrice: 478240,
    srpPrice: 427000,
    cashPrice: 400800
  },
  {
    code: 'HYB-8K10-P9',
    name: 'Hybrid Large Package with 10.24KWh Battery',
    description: 'This hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 8120,
    suitableFor: 'Suitable for monthly bills ₱6,000-₱8,000',
    financingPrice: 555520,
    srpPrice: 496000,
    cashPrice: 465800
  },
  {
    code: 'ONG-10K-P10',
    name: 'OnGrid Advanced Package',
    description: 'This advanced OnGrid system is designed for homes with high electricity demands. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 9860,
    suitableFor: 'Suitable for monthly bills ₱8,000-₱10,000',
    financingPrice: 412160,
    srpPrice: 368000,
    cashPrice: 345800
  },
  {
    code: 'HYB-10K5-P11',
    name: 'Hybrid Advanced Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 9860,
    suitableFor: 'Suitable for monthly bills ₱8,000-₱10,000',
    financingPrice: 603680,
    srpPrice: 539000,
    cashPrice: 505800
  },
  {
    code: 'HYB-10K10-P12',
    name: 'Hybrid Advanced Package with 10.24KWh Battery',
    description: 'This hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 9860,
    suitableFor: 'Suitable for monthly bills ₱8,000-₱10,000',
    financingPrice: 686560,
    srpPrice: 613000,
    cashPrice: 570800
  },
  {
    code: 'ONG-12K-P13',
    name: 'OnGrid Enterprise Package',
    description: 'This enterprise-grade OnGrid system is designed for large homes and small businesses with high electricity demands. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 11600,
    suitableFor: 'Suitable for monthly bills ₱10,000-₱13,000',
    financingPrice: 465920,
    srpPrice: 416000,
    cashPrice: 390800
  },
  {
    code: 'HYB-12K5-P14',
    name: 'Hybrid Enterprise Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 11600,
    suitableFor: 'Suitable for monthly bills ₱10,000-₱13,000',
    financingPrice: 668640,
    srpPrice: 597000,
    cashPrice: 560800
  },
  {
    code: 'HYB-12K10-P15',
    name: 'Hybrid Enterprise Package with 10.24KWh Battery',
    description: 'This hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 11600,
    suitableFor: 'Suitable for monthly bills ₱10,000-₱13,000',
    financingPrice: 745920,
    srpPrice: 666000,
    cashPrice: 625800
  },
  {
    code: 'ONG-15K-P16',
    name: 'OnGrid Commercial Package',
    description: 'This commercial-grade OnGrid system is designed for large establishments with very high electricity demands. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'ongrid',
    wattage: 14500,
    suitableFor: 'Suitable for monthly bills ₱13,000-₱16,000',
    financingPrice: 585760,
    srpPrice: 523000,
    cashPrice: 490800
  },
  {
    code: 'HYB-15K5-P17',
    name: 'Hybrid Commercial Package with 5.12KWh Battery',
    description: 'This hybrid system with 5.12kWh battery provides backup power during outages and reduces nighttime grid consumption. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 14500,
    suitableFor: 'Suitable for monthly bills ₱13,000-₱16,000',
    financingPrice: 823200,
    srpPrice: 735000,
    cashPrice: 690800
  },
  {
    code: 'HYB-15K10-P18',
    name: 'Hybrid Commercial Package with 10.24KWh Battery',
    description: 'This hybrid system with 10.24kWh battery provides extended backup power during outages and significantly reduces grid dependency. It includes premium AE Solar panels with 30-year warranty, Solis/Deye inverter with 5-year warranty, LVTOPSUN battery with 5-year warranty, complete installation, and 2 years free maintenance.',
    type: 'hybrid',
    wattage: 14500,
    suitableFor: 'Suitable for monthly bills ₱13,000-₱16,000',
    financingPrice: 901600,
    srpPrice: 805000,
    cashPrice: 755800
  }
];

// Connect to MongoDB
async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

async function migrateData() {
  try {
    console.log('Starting knowledge base migration...');
    
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.error('Could not connect to MongoDB. Exiting.');
      process.exit(1);
    }
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    await FAQ.deleteMany({});
    await Package.deleteMany({});
    console.log('Cleared existing data');
    
    // Set timestamp for all FAQs
    const now = new Date();
    const faqsWithTimestamps = faqData.map(faq => ({
      ...faq,
      createdAt: now,
      updatedAt: now
    }));
    
    // Migrate FAQs
    console.log(`Migrating ${faqsWithTimestamps.length} FAQs...`);
    const faqPromises = faqsWithTimestamps.map(faq => FAQ.create(faq));
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

// Make sure we have .env loaded
try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, attempting to continue without it...');
}

// Run the migration
migrateData(); 