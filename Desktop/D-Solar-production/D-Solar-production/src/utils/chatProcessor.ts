import { Groq } from 'groq-sdk';
import { Message } from '@/types/chat';
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
📧 info@d-tec.asia`;

// Get package information (previously in route.ts)
async function getPackageInfo(packageCode: string) {
  try {
    await connectDB();
    const packageItem = await Package.findOne({ code: packageCode });
    
    if (!packageItem) {
      return null;
    }
    
    return `**${packageItem.name} (${packageItem.wattage.toLocaleString()} Watts)**
- ${packageItem.suitableFor}
- **Financing (VAT-Inc):** ₱${packageItem.financingPrice.toLocaleString()}.00
- **SRP (VAT-Ex):** ₱${packageItem.srpPrice.toLocaleString()}.00
- **Cash (VAT-Ex):** ₱${packageItem.cashPrice.toLocaleString()}.00

${packageItem.description}

_Note: Prices are for Metro Manila installation only. Additional transport costs apply for areas outside Metro Manila._`;
  } catch (error) {
    console.error("Error getting package info:", error);
    return null;
  }
}

// Find relevant FAQs
async function findRelevantFAQs(query: string) {
  try {
    await connectDB();
    
    // Get all FAQs from database
    const allFaqs = await FAQ.find({});
    
    if (allFaqs.length === 0) {
      return [];
    }
    
    // Return all FAQs for now (in a real implementation, you'd have relevance scoring)
    return allFaqs;
  } catch (error) {
    console.error("Error finding relevant FAQs:", error);
    return [];
  }
}

// Main function to process chat messages
export async function processChatMessage(message: string, history: Message[] = []) {
  try {
    console.log('Processing chat message:', message);
    
    // Updated regex to match package codes like "ONG-3K-P2", "HYB-6K5-P5", "HYB-10K10-P12"
    // First pattern: Look for specific code mentions
    const packageCodeMatch = message.match(/(?:tell me about|info about|details about|about)\s+([A-Z]+-\d+K\d*-P\d+|[A-Z]+-\d+PK)/i);
    
    // Second pattern: Look for package numbers like "P5" or "P10"
    const packageNumberMatch = !packageCodeMatch && message.match(/(?:package|pkg|p)\s*#?\s*(\d+)\b/i);
    
    // Third pattern: Look for any mention of a code that seems like a package code
    const genericCodeMatch = !packageCodeMatch && !packageNumberMatch && 
                          message.match(/\b(ONG|HYB)[-\s]*([0-9]+K?[0-9]*[-\s]*P?[0-9]*)\b/i);
    
    // Handle explicit package code
    if (packageCodeMatch && packageCodeMatch[1]) {
      const packageCode = packageCodeMatch[1].toUpperCase().replace(/\s+/g, '');
      const packageInfo = await getPackageInfo(packageCode);
      
      if (packageInfo) {
        return { 
          message: `🌞 ${packageInfo}`,
          source: 'llm'
        };
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
          return { 
            message: `🌞 ${packageInfo}`,
            source: 'llm'
          };
        }
      }
    }
    
    // Check if query is about pricing/packages
    const pricingKeywords = ['price', 'pricing', 'cost', 'how much', 'package', 'packages', 'pkg', 'system cost', 'system price'];
    const isPricingRequest = pricingKeywords.some(keyword => message.toLowerCase().includes(keyword.toLowerCase()));
    
    // Find relevant FAQs
    const relevantFaqs = await findRelevantFAQs(message);
    
    // Check if we have a matching FAQ
    if (relevantFaqs.length > 0) {
      // Logic to find best matching FAQ
      // Simple implementation here, in real app would use embeddings
      const faqMatch = relevantFaqs.find(faq => 
        message.toLowerCase().includes(faq.question.toLowerCase().substring(0, 10))
      );
      
      if (faqMatch) {
        return { 
          message: `${faqMatch.answer}`,
          source: 'faq'
        };
      }
    }
    
    // Send the query to LLM (Groq)
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

    const fullPrompt = `${baseSystemPrompt}\n\n${faqContext}`;
    
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: fullPrompt },
        ...history,
        { role: "user", content: message }
      ],
      model: "llama3-70b-8192",
      temperature: 0.5,
      max_tokens: 1024,
      top_p: 0.9,
      stream: false,
    });
    
    const llmResponse = chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    return {
      message: llmResponse,
      source: 'llm'
    };
    
  } catch (error) {
    console.error('Chat processing error:', error);
    return { 
      message: 'Sorry, I encountered an error. Please try again later.',
      source: 'error' 
    };
  }
} 