import { FAQ, faqData } from '@/data/faqData';

/**
 * List of common words that shouldn't trigger FAQ matches on their own
 */
const COMMON_WORDS = [
  'what', 'how', 'why', 'where', 'when', 'who', 'which', 'will', 'can',
  'is', 'are', 'do', 'does', 'did', 'has', 'have', 'had', 'was', 'were',
  'the', 'a', 'an', 'this', 'that', 'these', 'those', 'it', 'they', 'you',
  'i', 'we', 'he', 'she', 'they', 'them', 'and', 'but', 'or', 'if', 'so',
  'yes', 'no', 'ok', 'okay'
];

/**
 * Patterns that suggest a complex query that should be handled by the LLM
 */
const COMPLEX_QUERY_PATTERNS = [
  // Compare multiple things
  /compare|difference between|vs\.?|versus|or (\w+) better|better (\w+) or/i,
  // Specific customer scenarios
  /my (house|home|roof|bill|situation|specific|case|scenario)/i,
  // Cost-benefit analysis
  /roi|return on investment|worth it|good investment|cost (savings|benefit)/i,
  // Multi-part questions
  /and (also|additionally)|as well as|plus can you|also tell me|several questions/i,
  // Questions with numerical specifications
  /\d+ (kw|kwh|square meters|sqm|php|₱|pesos|percent|%)/i,
  // Custom calculations
  /calculate|compute|estimate|computation|formula/i,
  // Hypothetical scenarios
  /what if|in case|scenario where|assuming|suppose|hypothetically/i,
  // Personal advice
  /recommend|advice|suggestion|should i|best for me|good for my/i
];

/**
 * Check if a query is too complex for the FAQ system and should be handed to the LLM
 */
function isComplexQuery(query: string): boolean {
  // Long queries are likely more complex and specific
  if (query.length > 100) {
    return true;
  }
  
  // Count words (excluding common ones)
  const words = query.toLowerCase().split(/\s+/);
  const significantWords = words.filter(word => !COMMON_WORDS.includes(word) && word.length > 2);
  
  // More than 8 significant words suggests complexity
  if (significantWords.length > 8) {
    return true;
  }
  
  // Check for complex patterns that suggest LLM handling
  for (const pattern of COMPLEX_QUERY_PATTERNS) {
    if (pattern.test(query)) {
      return true;
    }
  }
  
  // Queries with multiple question marks are likely multi-part questions
  const questionMarks = (query.match(/\?/g) || []).length;
  if (questionMarks > 1) {
    return true;
  }
  
  return false;
}

/**
 * Simple scoring system to match user queries to FAQs
 */
export function findMatchingFAQ(userQuery: string): FAQ | null {
  // Check if this is a complex query that should be handled by the LLM
  if (isComplexQuery(userQuery)) {
    return null; // Let the LLM handle it
  }
  
  // Normalize the user query - remove question marks and other punctuation
  const normalizedQuery = userQuery.toLowerCase().trim().replace(/[?!.,;:]/g, '');
  
  // Check if the query is too short
  if (normalizedQuery.length < 2) {
    return null;
  }
  
  // Split into words
  const queryWords = normalizedQuery.split(/\s+/);
  const wordCount = queryWords.length;
  
  // If it's a single word, check if it's in the common words list
  if (wordCount === 1 && COMMON_WORDS.includes(normalizedQuery)) {
    return null;
  }
  
  // Special case for single words that are likely referring to specific topics
  if (wordCount === 1 && normalizedQuery.length >= 3) {
    // Look for exact matches in FAQ keywords first
    for (const faq of faqData) {
      // Check for direct keyword match
      if (faq.keywords.some(keyword => keyword.toLowerCase() === normalizedQuery)) {
        return faq;
      }
      
      // Check if the single word exactly matches start of question
      const questionWords = faq.question.toLowerCase().split(/\s+/);
      if (questionWords.some(word => word === normalizedQuery)) {
        return faq;
      }
    }
  }
  
  let bestMatch: FAQ | null = null;
  let highestScore = 0;
  
  // Calculate score threshold based on query length
  // Shorter queries need higher match percentage to be valid
  // Adjust threshold based on word count - stricter for shorter queries
  const queryLength = normalizedQuery.length;
  const wordBasedThreshold = wordCount <= 2 ? 0.6 : (wordCount <= 3 ? 0.5 : 0.4);
  const lengthBasedThreshold = Math.max(0.4, Math.min(0.7, 10 / queryLength));
  const minScoreThreshold = Math.max(wordBasedThreshold, lengthBasedThreshold);
  
  // Score each FAQ against the user query
  for (const faq of faqData) {
    const score = calculateMatchScore(normalizedQuery, faq);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }
  
  // Only return the match if it's above threshold
  return highestScore >= minScoreThreshold ? bestMatch : null;
}

/**
 * Calculate a match score between a user query and an FAQ
 */
function calculateMatchScore(query: string, faq: FAQ): number {
  let score = 0;
  
  // Check exact match with question (highest score)
  if (query === faq.question.toLowerCase().replace(/[?!.,;:]/g, '')) {
    return 1.0;
  }
  
  // Check if query contains the full question (without punctuation)
  const normalizedQuestion = faq.question.toLowerCase().replace(/[?!.,;:]/g, '');
  if (normalizedQuestion.includes(query)) {
    score += 0.8;
  }
  
  // Check if query is contained in the question
  if (query.length > 3 && normalizedQuestion.includes(query)) {
    score += 0.7;
  }
  
  // Check for keyword matches
  const queryLength = query.length;
  let keywordMatches = [];
  
  if (queryLength <= 5) {
    // For very short queries, check if query is contained in keywords
    keywordMatches = faq.keywords.filter(keyword => 
      keyword.toLowerCase() === query || keyword.toLowerCase().startsWith(query)
    );
  } else {
    // For longer queries, allow partial matches
    keywordMatches = faq.keywords.filter(keyword => 
      query.includes(keyword.toLowerCase())
    );
  }
  
  // Add score based on keyword matches
  if (keywordMatches.length > 0) {
    // More keywords = higher confidence
    score += Math.min(0.9, keywordMatches.length * 0.2);
  }
  
  // Increase score for longer keyword matches
  for (const keyword of faq.keywords) {
    if (keyword.length > 4 && query.includes(keyword.toLowerCase())) {
      score += 0.1;
    }
  }
  
  // Check for word-by-word matches
  const queryWords = query.split(/\s+/);
  const questionWords = normalizedQuestion.split(/\s+/);
  
  let wordMatches = 0;
  for (const word of queryWords) {
    // Skip matching common words
    if (word.length <= 2 || COMMON_WORDS.includes(word)) {
      continue;
    }
    
    if (word.length > 2 && questionWords.includes(word)) {
      wordMatches++;
    }
  }
  
  // Add score based on word matches ratio - but only count non-common words
  const significantQueryWords = queryWords.filter(word => 
    !COMMON_WORDS.includes(word) && word.length > 2
  );
  
  if (significantQueryWords.length > 0) {
    score += (wordMatches / significantQueryWords.length) * 0.5;
  }
  
  return score;
} 