import { NextResponse } from 'next/server';
import { Groq } from 'groq-sdk';
import { ChatRequest } from '@/types/chat';
import connectDB from '@/lib/mongodb';
import FAQ from '@/models/FAQ';
import Package from '@/models/Package';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const systemPrompt = `You are D-Solar's friendly AI solar expert! 🌞 You represent D-Solar Philippines, the premier solar solutions provider in Metro Manila. Keep responses brief and engaging with emojis.

COMPANY PROFILE:  
🏢 D-Solar Philippines - Leading solar provider in Metro Manila
⚡ Full-service solar solutions company
🌱 Committed to sustainable energy solutions
🏆 Known for excellence in design, installation, and maintenance

CORE SERVICES:
🔧 Professional Solar Installation
- Custom system design
- Expert installation team
- Quality equipment & materials
- Grid-tied and off-grid solutions

📊 Free Energy Consultation
- Detailed energy consumption analysis
- Custom ROI calculations
- Solar system sizing
- Financial benefits assessment

🛠️ Maintenance & Support
- Regular system monitoring
- Performance optimization
- Preventive maintenance
- Quick response technical support

VALUE PROPOSITION:
💰 Reduce electricity bills by 50-70%
✨ Premium equipment with 25-year warranty
📈 Return on investment in 3-5 years
⚡ Reliable power supply
🌍 Reduced carbon footprint

CONTACT INFORMATION:
📍 No.30-C Westbend Arcade, Dona Soledad Avenue, Paranaque City
📞 +63960-471-6968
📧 info@d-tec.asia

RESPONSE GUIDELINES:
- Keep responses to 2 sentences maximum
- Always include 1-2 relevant emojis
- Be friendly, professional, and concise
- Direct pricing inquiries to sales team
- Focus on benefits and solutions
- No lengthy explanations or technical jargon
- Maintain positive, helpful tone
- For technical details, suggest consultation`;

// Enhanced FAQ matching function that uses MongoDB
async function findMatchingFAQ(query: string) {
  await connectDB();
  
  // Convert query to lowercase for case-insensitive matching
  const lowercaseQuery = query.toLowerCase().trim();
  
  // Normalize the query - remove common stopwords and special characters
  const normalizedQuery = lowercaseQuery
    .replace(/[?!.,;:\-'"]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^(what|how|when|where|why|can|do|does|is|are|will)\s+/i, '')
    .replace(/\s+(a|an|the|to|for|in|on|with|of|about|please|tell me|i want to know)\s+/g, ' ')
    .trim();
  
  // First try to find all FAQs for evaluation
  const faqs = await FAQ.find({}).exec();
  
  // Create a scoring system for each FAQ
  const scoredFaqs = faqs.map((faq: any) => {
    let score = 0;
    const faqQuestion = faq.question.toLowerCase();
    const normalizedFaqQuestion = faqQuestion
      .replace(/[?!.,;:\-'"]/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/^(what|how|when|where|why|can|do|does|is|are|will)\s+/i, '')
      .replace(/\s+(a|an|the|to|for|in|on|with|of|about)\s+/g, ' ')
      .trim();
    
    // Check for exact keyword matches
    const keywordMatches = faq.keywords.filter((keyword: string) => 
      lowercaseQuery.includes(keyword.toLowerCase())
    );
    score += keywordMatches.length * 10; // Each keyword match adds 10 points
    
    // Check for question similarity
    if (faqQuestion === lowercaseQuery) {
      score += 100; // Exact question match
    } else if (faqQuestion.includes(lowercaseQuery) || lowercaseQuery.includes(faqQuestion)) {
      score += 50; // One contains the other
    }
    
    // Check normalized question similarity
    if (normalizedFaqQuestion === normalizedQuery) {
      score += 80; // Exact normalized match
    } else if (normalizedFaqQuestion.includes(normalizedQuery) || normalizedQuery.includes(normalizedFaqQuestion)) {
      score += 40; // One contains the other
    }
    
    // Word overlap analysis
    const queryWords = normalizedQuery.split(' ').filter((word: string) => word.length > 3);
    const faqWords = normalizedFaqQuestion.split(' ').filter((word: string) => word.length > 3);
    
    // Check for word overlap
    const sharedWords = queryWords.filter(word => 
      word.length > 3 && faqWords.includes(word)
    );
    
    // Calculate word overlap percentage
    const queryOverlap = sharedWords.length / queryWords.length;
    const faqOverlap = sharedWords.length / faqWords.length;
    
    if (queryOverlap > 0.7 || faqOverlap > 0.7) {
      score += 30; // High word overlap
    } else if (queryOverlap > 0.5 || faqOverlap > 0.5) {
      score += 20; // Medium word overlap
    } else if (queryOverlap > 0.3 || faqOverlap > 0.3) {
      score += 10; // Low word overlap
    }
    
    // Special handling for "install/installment" to avoid software installation confusion
    if ((lowercaseQuery.includes("install") || faqQuestion.includes("install")) && 
        !lowercaseQuery.includes("installment") && !faqQuestion.includes("installment")) {
      // Check if query seems unrelated to solar installation
      const unrelatedToSolar = [
        "virus", "software", "program", "app", "application", "download", 
        "computer", "laptop", "phone", "mobile", "system", "install virus",
        "malware", "spyware", "adware", "trojan", "worm", "hack", "hacking"
      ].some(term => lowercaseQuery.includes(term));
      
      if (unrelatedToSolar) {
        score = 0; // Zero score for unrelated installation queries
      }
    }
    
    return {
      faq,
      score
    };
  });
  
  // Sort FAQs by score in descending order
  scoredFaqs.sort((a, b) => b.score - a.score);
  
  // Return the highest scoring FAQ if it meets the threshold
  if (scoredFaqs.length > 0 && scoredFaqs[0].score >= 30) {
    return scoredFaqs[0].faq;
  }
  
  // If no good match, try MongoDB text search
  try {
    const searchResults = await FAQ.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).limit(1);
    
    if (searchResults.length > 0 && searchResults[0].score > 1.0) {
      // For text search matches, add extra verification for problematic keywords
      const keywordsString = searchResults[0].keywords.join(' ').toLowerCase();
      if (keywordsString.includes("install")) {
        // Check if query seems unrelated to solar
        const unrelatedToSolar = [
          "virus", "software", "program", "app", "application", "download", 
          "computer", "laptop", "phone", "mobile", "system", "install virus",
          "malware", "spyware", "adware", "trojan", "worm", "hack", "hacking"
        ].some(term => lowercaseQuery.includes(term));
        
        if (unrelatedToSolar) {
          return null; // Skip this match for unrelated queries
        }
      }
      
      return searchResults[0];
    }
  } catch (error) {
    console.error("Text search error:", error);
  }
  
  return null;
}

// Function to get formatted package info from MongoDB
async function getPackageInfo(packageCode: string) {
  await connectDB();
  
  try {
    const packageInfo = await Package.findOne({ code: packageCode });
    
    if (!packageInfo) {
      return null;
    }
    
    // Format the package information in markdown
    return `**${packageInfo.name} (${packageInfo.wattage.toLocaleString()} Watts)**
- ${packageInfo.suitableFor}
- **Financing (VAT-Inc):** ₱${packageInfo.financingPrice.toLocaleString()}.00
- **SRP (VAT-Ex):** ₱${packageInfo.srpPrice.toLocaleString()}.00
- **Cash (VAT-Ex):** ₱${packageInfo.cashPrice.toLocaleString()}.00

${packageInfo.description}

_Note: Prices are for Metro Manila installation only. Additional transport costs apply for areas outside Metro Manila._`;
  } catch (error) {
    console.error("Error retrieving package info:", error);
    return null;
  }
}

// Function to check if a query is related to solar energy
async function isQuerySolarRelated(query: string): Promise<boolean> {
  try {
    // Check for common solar-related keywords first for efficiency
    const solarKeywords = [
      'solar', 'panel', 'pv', 'photovoltaic', 'sun', 'renewable', 
      'grid', 'battery', 'inverter', 'roof', 'electricity', 'energy', 
      'power', 'dsolar', 'd-solar', 'net metering', 'off-grid', 'on-grid',
      'hybrid', 'installation', 'meralco', 'kilowatt', 'kw', 'kwh', 'watt'
    ];
    
    const lowercaseQuery = query.toLowerCase();
    
    // If query contains obvious solar keywords, return true immediately
    if (solarKeywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return true;
    }
    
    // Check for obviously non-solar topics
    const nonSolarKeywords = [
      'rice', 'food', 'grocery', 'appliance', 'car', 'vehicle', 'clothes', 
      'shoes', 'phone', 'computer', 'laptop', 'tv', 'television', 'house', 
      'condo', 'rent', 'apartment', 'medicine', 'doctor', 'hospital', 
      'restaurant', 'hotel', 'flight', 'travel', 'vacation'
    ];
    
    // If query contains obviously non-solar keywords, return false immediately
    if (nonSolarKeywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return false;
    }
    
    // For ambiguous queries, use the Groq model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a classifier that determines if a query is related to solar energy, solar panels, solar power systems, solar installation, or financing for solar systems.' 
        },
        { 
          role: 'user', 
          content: `Is the following query related to solar energy or solar systems? Answer only with "yes" or "no".\n\nQuery: "${query}"` 
        }
      ],
      model: process.env.GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.1,
      max_completion_tokens: 10,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content?.toLowerCase() || '';
    return response.includes('yes');
  } catch (error) {
    console.error('Error checking if query is solar related:', error);
    // If there's an error, default to assuming it might be solar related
    return true;
  }
}

// Function to check if a query is related to pricing or packages
async function isPricingQuery(query: string): Promise<boolean> {
  try {
    // Check for common pricing-related phrases first
    const pricingKeywords = [
      'price', 'pricing', 'cost', 'how much', 'package', 'packages', 
      'how many', 'quotation', 'quote', 'estimate', 'budget', 'affordable',
      'expensive', 'cheap', 'rates', 'financing', 'payment', 'installment','magkano',
    ];
    
    const lowercaseQuery = query.toLowerCase();
    
    // If query contains obvious pricing keywords, return true immediately
    if (pricingKeywords.some(keyword => lowercaseQuery.includes(keyword))) {
      return true;
    }
    
    // For less obvious queries, use the Groq model
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: 'You are a classifier that determines if a query is specifically asking about solar panel pricing, package options, or system costs. Only detect direct requests for pricing information, not general questions about solar.' 
        },
        { 
          role: 'user', 
          content: `Is the following query specifically asking about solar panel prices, packages, or system costs? Answer only with "yes" or "no".\n\nQuery: "${query}"` 
        }
      ],
      model: process.env.GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.1,
      max_completion_tokens: 10,
      stream: false
    });

    const response = chatCompletion.choices[0]?.message?.content?.toLowerCase() || '';
    return response.includes('yes');
  } catch (error) {
    console.error('Error checking if query is price related:', error);
    // If there's an error, default to not showing pricing options automatically
    return false;
  }
}

// Enhanced function to get all relevant FAQs to provide to the LLM
async function getAllFAQs() {
  await connectDB();
  
  try {
    const faqs = await FAQ.find({}).exec();
    
    // Format FAQs in a way that's easy for the LLM to process
    return faqs.map((faq: any) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer
    }));
  } catch (error) {
    console.error("Error retrieving FAQs:", error);
    return [];
  }
}

// Function to get a formatted list of packages by type
async function getFormattedPackageList(): Promise<string> {
  await connectDB();
  
  try {
    const packages = await Package.find({}).sort({ type: 1, wattage: 1 }).exec();
    
    if (!packages || packages.length === 0) {
      return "No package information available at the moment. Please contact us for more information.";
    }
    
    // Group packages by type
    const ongridPackages = packages.filter(pkg => pkg.type === 'ongrid');
    const hybridSmallPackages = packages.filter(pkg => pkg.type === 'hybrid-small' || (pkg.type === 'hybrid' && pkg.description.includes('5.12kWh')));
    const hybridLargePackages = packages.filter(pkg => pkg.type === 'hybrid-large' || (pkg.type === 'hybrid' && pkg.description.includes('10.24kWh')));
    
    // Format the package information
    let formattedPackages = `💰 **Our Solar Package Pricing** 💰\n\n`;
    
    // Format OnGrid packages
    if (ongridPackages.length > 0) {
      formattedPackages += `🔌 **OnGrid Systems (Grid-Tied, No Battery):**\n\n`;
      ongridPackages.forEach((pkg, index) => {
        formattedPackages += `${index+1}. **${pkg.code}** (${pkg.wattage.toLocaleString()}W)\n`;
        formattedPackages += `   - 🏠 ${pkg.suitableFor}\n`;
        formattedPackages += `   - 💵 Cash: ₱${pkg.cashPrice.toLocaleString()}\n\n`;
      });
    }
    
    // Format Hybrid Small packages
    if (hybridSmallPackages.length > 0) {
      formattedPackages += `🔋 **Hybrid Systems with 5.12kWh Battery:**\n\n`;
      hybridSmallPackages.forEach((pkg, index) => {
        formattedPackages += `${index+1}. **${pkg.code}** (${pkg.wattage.toLocaleString()}W)\n`;
        formattedPackages += `   - 🏠 ${pkg.suitableFor}\n`;
        formattedPackages += `   - 💵 Cash: ₱${pkg.cashPrice.toLocaleString()}\n\n`;
      });
    }
    
    // Format Hybrid Large packages
    if (hybridLargePackages.length > 0) {
      formattedPackages += `🔋🔋 **Hybrid Systems with 10.24kWh Battery:**\n\n`;
      hybridLargePackages.forEach((pkg, index) => {
        formattedPackages += `${index+1}. **${pkg.code}** (${pkg.wattage.toLocaleString()}W)\n`;
        formattedPackages += `   - 🏠 ${pkg.suitableFor}\n`;
        formattedPackages += `   - 💵 Cash: ₱${pkg.cashPrice.toLocaleString()}\n\n`;
      });
    }
    
    // Add footer information
    formattedPackages += `📍 _Prices above are for Metro Manila installation. For more details on any package or to get a personalized quote, ask about a specific package code or contact us at +63960-471-6968._`;
    
    return formattedPackages;
  } catch (error) {
    console.error("Error retrieving package information:", error);
    return "Sorry, I'm having trouble accessing our package information. Please contact us directly for pricing details.";
  }
}

// Enhanced function to get relevant FAQs based on the query
async function getRelevantFAQs(query: string) {
  await connectDB();
  
  try {
    const lowercaseQuery = query.toLowerCase().trim();
    const faqs = await FAQ.find({}).exec();
    
    // Use the same scoring system as in findMatchingFAQ
    const scoredFaqs = faqs.map((faq: any) => {
      let score = 0;
      const faqQuestion = faq.question.toLowerCase();
      
      // Normalize the query
      const normalizedQuery = lowercaseQuery
        .replace(/[?!.,;:\-'"]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^(what|how|when|where|why|can|do|does|is|are|will)\s+/i, '')
        .replace(/\s+(a|an|the|to|for|in|on|with|of|about|please|tell me|i want to know)\s+/g, ' ')
        .trim();

      // Normalize the FAQ question
      const normalizedFaqQuestion = faqQuestion
        .replace(/[?!.,;:\-'"]/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/^(what|how|when|where|why|can|do|does|is|are|will)\s+/i, '')
        .replace(/\s+(a|an|the|to|for|in|on|with|of|about)\s+/g, ' ')
        .trim();
      
      // Check for keyword matches
      const hasMatchingKeyword = faq.keywords.some((keyword: string) => 
        lowercaseQuery.includes(keyword.toLowerCase())
      );
      
      if (hasMatchingKeyword) {
        score += 30;
      }
      
      // Check for question similarity
      if (faqQuestion === lowercaseQuery) {
        score += 100; // Exact question match
      } else if (faqQuestion.includes(lowercaseQuery) || lowercaseQuery.includes(faqQuestion)) {
        score += 50; // One contains the other
      }
      
      // Check normalized question similarity
      if (normalizedFaqQuestion === normalizedQuery) {
        score += 80; // Exact normalized match
      } else if (normalizedFaqQuestion.includes(normalizedQuery) || normalizedQuery.includes(normalizedFaqQuestion)) {
        score += 40; // One contains the other
      }
      
      // Word overlap analysis
      const queryWords = normalizedQuery.split(' ').filter((word: string) => word.length > 3);
      const faqWords = normalizedFaqQuestion.split(' ').filter((word: string) => word.length > 3);
      
      // Check for important word overlap
      const sharedWords = queryWords.filter(word => faqWords.includes(word));
      
      // Add score based on word overlap
      if (queryWords.length > 0 && faqWords.length > 0) {
        const queryOverlap = sharedWords.length / queryWords.length;
        const faqOverlap = sharedWords.length / faqWords.length;
        
        if (queryOverlap > 0.7 || faqOverlap > 0.7) {
          score += 30; // High word overlap
        } else if (queryOverlap > 0.5 || faqOverlap > 0.5) {
          score += 20; // Medium word overlap
        } else if (queryOverlap > 0.3 || faqOverlap > 0.3) {
          score += 10; // Low word overlap
        }
      }
      
      // Special topics handling
      const solarTopics = [
        "panel", "battery", "grid", "energy", "power", "electricity", 
        "cost", "price", "saving", "install", "roof", "hybrid", "sun",
        "solar", "kwh", "inverter", "net meter", "metering", "cell"
      ];
      
      // Boost score if query contains solar-specific terms
      const hasSolarTopic = solarTopics.some(topic => 
        lowercaseQuery.includes(topic) && faqQuestion.includes(topic)
      );
      
      if (hasSolarTopic) {
        score += 15;
      }
      
      // Special handling for "install/installment" to avoid software installation confusion
      if (lowercaseQuery.includes("install") && !lowercaseQuery.includes("installment")) {
        // Check if query seems unrelated to solar installation
        const unrelatedToSolar = [
          "virus", "software", "program", "app", "application", "download", 
          "computer", "laptop", "phone", "mobile", "system", "malware", 
          "spyware", "adware", "trojan", "worm", "hack", "hacking"
        ].some(term => lowercaseQuery.includes(term));
        
        if (unrelatedToSolar) {
          score = 0; // Eliminate score for unrelated installation queries
        }
      }
      
      return {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        score
      };
    });
    
    // Sort the FAQs by score and take the top 5
    scoredFaqs.sort((a, b) => b.score - a.score);
    
    // Filter scored FAQs to only include those with meaningful relevance
    const relevantFaqs = scoredFaqs.filter(faq => faq.score >= 15).slice(0, 5);
    
    // If no relevant FAQs found, try MongoDB text search
    if (relevantFaqs.length === 0) {
      try {
        const searchResults = await FAQ.find(
          { $text: { $search: query } },
          { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .limit(3);
        
        if (searchResults.length > 0) {
          return searchResults.map((result: any) => ({
            id: result.id,
            question: result.question,
            answer: result.answer
          }));
        }
      } catch (error) {
        console.error("Text search error:", error);
      }
    }
    
    // If we still have no relevant FAQs, return some general ones as fallback
    if (relevantFaqs.length === 0) {
      const generalFaqs = faqs.filter((faq: any) => 
        ["savings", "system-difference", "packages"].includes(faq.id)
      ).map((faq: any) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      })).slice(0, 2);
      
      return generalFaqs;
    }
    
    return relevantFaqs;
  } catch (error) {
    console.error("Error retrieving FAQs:", error);
    return [];
  }
}

// Function to check if a user's question can be answered directly by an FAQ
async function canAnswerWithFAQ(query: string, faqs: any[]): Promise<{ canAnswer: boolean; bestFaqId?: string; bestFaqAnswer?: string; confidence?: number }> {
  if (!faqs || faqs.length === 0) {
    return { canAnswer: false };
  }
  
  try {
    // Format FAQs for the LLM to evaluate
    let faqContext = faqs.map((faq, index) => 
      `FAQ ${index + 1}:\nID: ${faq.id}\nQ: ${faq.question}\nA: ${faq.answer}`
    ).join('\n\n');
    
    // Prompt for the LLM
    const promptContent = `
You are an FAQ matcher for D-Solar, a solar energy company. Your task is to determine if a user's question can be directly answered using one of our FAQs.

Here are our FAQs:
${faqContext}

User Question: "${query}"

First, analyze if the user's question can be directly answered by one of the FAQs above.
Then respond in JSON format with the following fields:
- canAnswer: true if one of the FAQs directly answers the user's question, false otherwise
- bestFaqId: the ID of the most relevant FAQ (only if canAnswer is true)
- confidence: a number between 0 and 1 representing how confident you are in this match
- reason: a brief explanation of your decision

Respond with valid JSON only.
`;

    // Query the LLM
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a precise FAQ matching system that outputs only valid JSON.' },
        { role: 'user', content: promptContent }
      ],
      model: process.env.GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.1,
      max_completion_tokens: 600,
      stream: false,
      response_format: { type: "json_object" }
    });

    const response = chatCompletion.choices[0]?.message?.content || '{}';
    
    try {
      const result = JSON.parse(response);
      
      // If we have a confident match, find and return the full FAQ answer
      if (result.canAnswer === true && result.bestFaqId && result.confidence >= 0.7) {
        const matchedFaq = faqs.find(faq => faq.id === result.bestFaqId);
        
        if (matchedFaq) {
          return { 
            canAnswer: true, 
            bestFaqId: result.bestFaqId,
            bestFaqAnswer: matchedFaq.answer,
            confidence: result.confidence
          };
        }
      }
      
      return { canAnswer: false };
    } catch (error) {
      console.error("Error parsing LLM response as JSON:", error);
      return { canAnswer: false };
    }
  } catch (error) {
    console.error("Error checking if query can be answered with FAQ:", error);
    return { canAnswer: false };
  }
}

export async function POST(request: Request) {
  try {
    console.log('API route called');
    
    const body: ChatRequest = await request.json();
    console.log('Received message:', body.message);
    
    // Updated regex to match package codes like "ONG-3K-P2", "HYB-6K5-P5", "HYB-10K10-P12"
    // First pattern: Look for specific code mentions
    const packageCodeMatch = body.message.match(/(?:tell me about|info about|details about|about)\s+([A-Z]+-\d+K\d*-P\d+|[A-Z]+-\d+PK)/i);
    
    // Second pattern: Look for package numbers like "P5" or "P10"
    const packageNumberMatch = !packageCodeMatch && body.message.match(/(?:package|pkg|p)\s*#?\s*(\d+)\b/i);
    
    // Third pattern: Look for any mention of a code that seems like a package code
    const genericCodeMatch = !packageCodeMatch && !packageNumberMatch && 
                          body.message.match(/\b(ONG|HYB)[-\s]*([0-9]+K?[0-9]*[-\s]*P?[0-9]*)\b/i);
    
    // Handle explicit package code
    if (packageCodeMatch && packageCodeMatch[1]) {
      const packageCode = packageCodeMatch[1].toUpperCase().replace(/\s+/g, '');
      const packageInfo = await getPackageInfo(packageCode);
      
      if (packageInfo) {
        return NextResponse.json({ 
          message: `🌞 ${packageInfo}`,
          source: 'llm',
          isPricingQuery: false
        });
      }
    }
    
    // Handle package by number (P1, P2, etc.)
    if (packageNumberMatch && packageNumberMatch[1]) {
      const packageNumber = packageNumberMatch[1];
      // Try to find packages with P[number] in the code
      await connectDB();
      let packageItem = await Package.findOne({ code: { $regex: `-P${packageNumber}$`, $options: 'i' } });
      
      // If not found with exact P-number ending, try finding with the number anywhere in the code
      if (!packageItem) {
        packageItem = await Package.findOne({ code: { $regex: `P${packageNumber}`, $options: 'i' } });
      }
      
      if (packageItem) {
        const packageInfo = await getPackageInfo(packageItem.code);
        if (packageInfo) {
          return NextResponse.json({ 
            message: `🌞 ${packageInfo}`,
            source: 'llm',
            isPricingQuery: false
          });
        }
      }
    }
    
    // Handle generic code matches
    if (genericCodeMatch) {
      const prefix = genericCodeMatch[1].toUpperCase(); // ONG or HYB
      const suffix = genericCodeMatch[2].replace(/\s+/g, '').toUpperCase();
      
      // Try different combinations to find the package
      const possibleCodes = [
        `${prefix}-${suffix}`,
        `${prefix}-${suffix}-P`,
        `${prefix}${suffix}`
      ];
      
      await connectDB();
      let packageItem = null;
      
      // Try each possible code format
      for (const code of possibleCodes) {
        packageItem = await Package.findOne({ 
          code: { $regex: `^${code}`, $options: 'i' }
        });
        
        if (packageItem) break;
      }
      
      // If still not found, try a more general query
      if (!packageItem) {
        packageItem = await Package.findOne({
          code: { 
            $regex: `${prefix}.*${suffix.replace(/[^\w\d]/g, '.*')}`, 
            $options: 'i' 
          }
        });
      }
      
      if (packageItem) {
        const packageInfo = await getPackageInfo(packageItem.code);
        if (packageInfo) {
          return NextResponse.json({ 
            message: `🌞 ${packageInfo}`,
            source: 'llm',
            isPricingQuery: false
          });
        }
      }
    }
    
    // Quick check for non-solar queries to avoid unnecessary processing
    if (body.message.toLowerCase().includes("install") && 
        ["virus", "malware", "software", "hack", "computer", "laptop", "phone"].some(term => 
          body.message.toLowerCase().includes(term))) {
      
      // Direct response for obviously non-solar queries
      return NextResponse.json({ 
        message: '🌞 I\'m sorry, but I can\'t assist with that. I\'m specialized in solar energy solutions. Let me know how I can help you with solar panels, installations, financing, or energy savings!',
        source: 'llm',
        isPricingQuery: false
      });
    }
    
    // Check if the query is specifically asking about pricing and if it's related to solar
    const isPricingRequest = await isPricingQuery(body.message);
    const isSolarRelated = await isQuerySolarRelated(body.message);
    
    // Fetch relevant FAQs
    const relevantFaqs = await getRelevantFAQs(body.message);
    
    // No longer automatically show packages when pricing keywords are detected
    // Instead, continue to normal processing flow and let the LLM respond naturally
    
    // NEW: Check if we can answer directly with an FAQ before using the LLM
    if (relevantFaqs.length > 0) {
      const faqCheck = await canAnswerWithFAQ(body.message, relevantFaqs);
      
      if (faqCheck.canAnswer && faqCheck.bestFaqId && faqCheck.bestFaqAnswer) {
        // Get the appropriate emoji based on the FAQ ID
        const emojis: Record<string, string> = {
          'installment-plans': '💳 ',
          'how-to-avail': '📄 ',
          'quotation': '📊 ',
          'savings': '💰 ',
          'zero-bill': '0️⃣ ',
          'location': '📍 ',
          'system-difference': '⚡ ',
          'cost': '💵 ',
          'night-operation': '🌙 ',
          'power-outage': '⚠️ ',
          'cloudy-days': '☁️ ',
          'maintenance': '🛠️ ',
          'free-maintenance': '🆓 ',
          'lifespan': '⏱️ ',
          'warranty': '🔒 ',
          'installation-time': '⏰ ',
          'permits': '📋 ',
          'roof-damage': '🏠 ',
          'roof-space': '📏 ',
          'panel-size': '📐 ',
          'add-panels': '➕ ',
          'monitoring': '📱 ',
          'component-replacement': '🔄 ',
          'net-metering': '🔌 ',
          'payback': '💸 ',
          'battery-need': '🔋 ',
          'space-requirements': '🏡 ',
          'service-locations': '🗺️ ',
          'brands-used': '🏭 '
        };
        
        // Get emoji for this FAQ or use a default
        const emoji = emojis[faqCheck.bestFaqId] || '🌞 ';
        
        // Clean up the answer to remove any potential source citations
        let cleanAnswer = faqCheck.bestFaqAnswer;
        
        // Remove any [Source: ...] patterns
        cleanAnswer = cleanAnswer.replace(/\[Source:.*?\]/g, '').trim();
        
        return NextResponse.json({ 
          message: `${emoji}${cleanAnswer}`,
          source: 'faq',
          isPricingQuery: false
        });
      }
    }
    
    // If we can't answer directly with an FAQ, proceed with regular LLM processing
    // Prepare condensed FAQ context for the LLM
    let faqContext = "";
    if (relevantFaqs.length > 0) {
      faqContext = "KNOWLEDGE BASE FAQs:\n\n";
      relevantFaqs.forEach((faq, index) => {
        faqContext += `FAQ ${index + 1}:\nQ: ${faq.question}\nA: ${faq.answer}\nID: ${faq.id}\n\n`;
      });
    }
    
    // Condensed system prompt
    const baseSystemPrompt = `You are D-Solar's friendly AI solar expert. You represent D-Solar Philippines, premier solar provider in Metro Manila. Keep responses brief with emojis.

OUR SERVICES:
- Professional solar design & installation
- Energy consultation & ROI calculation
- System monitoring & maintenance

VALUE: 
- 50-70% lower electricity bills
- 25-year equipment warranty
- 3-5 year ROI
- Contact: +63960-471-6968`;

    // Construct a streamlined system prompt
    const augmentedSystemPrompt = `${baseSystemPrompt}

${faqContext}

INSTRUCTIONS:
1. If query is NOT solar-related, politely redirect to solar topics
2. For solar queries, use KNOWLEDGE BASE FAQs if relevant
3. Keep responses under 2 sentences with emojis
4. Be friendly, professional and concise`;

    // Send the query to the LLM
    console.log('Sending query to LLM with relevant knowledge base context');
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { 
          role: 'system', 
          content: augmentedSystemPrompt
        },
        ...body.history.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: body.message }
      ],
      model: process.env.GROQ_MODEL || 'deepseek-r1-distill-llama-70b',
      temperature: 0.7,
      max_completion_tokens: 475,
      top_p: 0.95,
      stream: false,
      stop: null
    });

    console.log('Got response from Groq');
    let response = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    // Determine if the response is based on FAQ content
    let source = 'llm';
    let faqId = '';
    
    // Check if the response matches closely with any of the FAQs we provided
    if (relevantFaqs.length > 0) {
      for (const faq of relevantFaqs) {
        // Normalize both the response and FAQ answer for comparison
        const normalizedResponse = response.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        const normalizedFaqAnswer = faq.answer.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
        
        // Check if there's significant overlap between the response and FAQ
        const overlap = normalizedResponse.includes(normalizedFaqAnswer.substring(0, 30)) || 
                        normalizedFaqAnswer.includes(normalizedResponse.substring(0, 30));
        
        // If there seems to be a significant match
        if (overlap) {
          source = 'faq';
          faqId = faq.id;
          break;
        }
      }
    }
    
    // If the source is from an FAQ, add an appropriate emoji
    if (source === 'faq' && faqId) {
      const emojis: Record<string, string> = {
        'installment-plans': '💳 ',
        'how-to-avail': '📄 ',
        'quotation': '📊 ',
        'savings': '💰 ',
        'zero-bill': '0️⃣ ',
        'location': '📍 ',
        'system-difference': '⚡ ',
        'cost': '💵 ',
        'night-operation': '🌙 ',
        'power-outage': '⚠️ ',
        'cloudy-days': '☁️ ',
        'maintenance': '🛠️ ',
        'free-maintenance': '🆓 ',
        'lifespan': '⏱️ ',
        'warranty': '🔒 ',
        'installation-time': '⏰ ',
        'permits': '📋 ',
        'roof-damage': '🏠 ',
        'roof-space': '📏 ',
        'panel-size': '📐 ',
        'add-panels': '➕ ',
        'monitoring': '📱 ',
        'component-replacement': '🔄 ',
        'net-metering': '🔌 ',
        'payback': '💸 ',
        'battery-need': '🔋 ',
        'space-requirements': '🏡 ',
        'service-locations': '🗺️ ',
        'brands-used': '🏭 '
      };
      
      // Get emoji for this FAQ or use a default
      const emoji = emojis[faqId] || '🌞 ';
      
      // Add emoji at the beginning if it doesn't already start with an emoji
      if (!response.match(/^[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u)) {
        response = emoji + response;
      }
    }
    
    // Enhanced response cleaning with more streamlined patterns
    const thinkingPatterns = [
      /<think>[\s\S]*?<\/think>/g,
      /^<think>.*$/gm,
      /^Think(ing)?:.*$/gm,
      /^(Let me|I need to|I will|Let's|I'm going to|First,|Alright,|Okay,) .*(answer|think|provide|consider|explain).*/gm,
      /^(The user asked|In response to|To answer|I should|I need to|I will|Let me|First,|Next,|Finally,|Based on|According to|Looking at).*/gm
    ];

    // Apply all cleaning patterns
    thinkingPatterns.forEach(pattern => {
      response = response.replace(pattern, '');
    });

    // Clean up any resulting empty lines and extra spaces
    response = response
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('\n')
      .trim();
    
    console.log('Cleaned response:', response.slice(0, 100) + '...');

    return NextResponse.json({ 
      message: response,
      source: source,
      isPricingQuery: false
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response: ' + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
} 