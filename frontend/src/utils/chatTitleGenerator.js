// src/utils/chatTitleGenerator.js

import { LOCATION_PATTERNS } from '../constants/sidebarConstants';

// Helper function to find location matches
export const findLocationMatch = (text, locations) => {
  const cleanText = text.toLowerCase().trim();
  
  // Direct match
  if (locations[cleanText]) {
    return locations[cleanText];
  }
  
  // Partial match for compound locations
  for (const [key, value] of Object.entries(locations)) {
    if (cleanText.includes(key) || key.includes(cleanText)) {
      return value;
    }
  }
  
  return null;
};

// Enhanced title generation using AI response
export const generateTitleFromConversation = (userMessage, aiResponse) => {
  // Extract key information from AI response
  const response = aiResponse.toLowerCase();
  const userMsg = userMessage.toLowerCase();
  
  // Look for route information in AI response
  const routeMatch = response.match(/route from ([^to]+) to ([^.!?]+)/i);
  if (routeMatch) {
    const from = capitalizeLocation(routeMatch[1].trim());
    const to = capitalizeLocation(routeMatch[2].trim());
    return `${from} → ${to}`;
  }
  
  // Look for destination in AI response
  const destinationMatch = response.match(/to reach ([^,.\n]+)/i) || 
                          response.match(/getting to ([^,.\n]+)/i) ||
                          response.match(/travel to ([^,.\n]+)/i);
  if (destinationMatch) {
    const destination = capitalizeLocation(destinationMatch[1].trim());
    return `Route to ${destination}`;
  }
  
  // Look for transport mode mentioned in response
  if (response.includes('bus') && (response.includes('route') || response.includes('service'))) {
    return 'Bus Routes';
  }
  if (response.includes('metro') || response.includes('train')) {
    return 'Metro/Train Info';
  }
  if (response.includes('taxi') || response.includes('auto')) {
    return 'Taxi/Auto Info';
  }
  
  // Extract location names from AI response
  const locations = extractLocationsFromAI(aiResponse);
  if (locations.length >= 2) {
    return `${locations[0]} → ${locations[1]}`;
  } else if (locations.length === 1) {
    return `${locations[0]} Journey`;
  }
  
  // Fallback to analyzing user message
  return generateFallbackTitle(userMessage);
};

// 🆕 ENHANCED: Ask Ollama to generate the title
export const generateTitleWithOllama = async (userMessage, aiResponse, socket) => {
  try {
    const titlePrompt = `Based on this conversation, generate a short 3-4 word title:
User: ${userMessage}
Assistant: ${aiResponse.substring(0, 200)}...

Generate only a concise title (like "Mumbai to Pune" or "Bus Route Info"):`;

    return new Promise((resolve) => {
      socket.emit('generate_title', {
        prompt: titlePrompt,
        userId: 'title-generation'
      });
      
      socket.once('title_generated', (response) => {
        const title = response.message.trim().replace(/['"]/g, '');
        resolve(title.length > 30 ? title.substring(0, 30) + '...' : title);
      });
      
      // Fallback timeout
      setTimeout(() => {
        resolve(generateFallbackTitle(userMessage));
      }, 3000);
    });
  } catch (error) {
    console.error('Error generating title with Ollama:', error);
    return generateFallbackTitle(userMessage);
  }
};

// Helper to extract location names from AI response
const extractLocationsFromAI = (aiResponse) => {
  const locations = [];
  const locationKeywords = [
    'Dighi', 'Airport', 'Pune Airport', 'Koregaon Park', 'Camp', 
    'Hinjewadi', 'Baner', 'Wakad', 'Hadapsar', 'Kharadi', 
    'Deccan', 'Shivajinagar', 'Mumbai', 'Delhi', 'Bangalore'
  ];
  
  locationKeywords.forEach(location => {
    if (aiResponse.includes(location) && !locations.includes(location)) {
      locations.push(location);
    }
  });
  
  return locations.slice(0, 2); // Return max 2 locations
};

// Helper to capitalize location names properly
const capitalizeLocation = (location) => {
  return location.replace(/\b\w/g, l => l.toUpperCase())
                .replace(/\bTo\b/g, 'to')
                .replace(/\bAnd\b/g, 'and');
};

// Fallback title generation
const generateFallbackTitle = (userMessage) => {
  const words = userMessage.split(' ').slice(0, 4);
  const title = words.join(' ');
  return title.length > 25 ? title.substring(0, 25) + '...' : title;
};

// Original intelligent chat title generation (fallback)
export const generateIntelligentTitle = (message) => {
  const lowerMessage = message.toLowerCase();
  
  // 1. "from X to Y" pattern
  const fromToMatch = lowerMessage.match(/from\s+([^to]+)\s+to\s+(.+?)(?:\s|$)/);
  if (fromToMatch) {
    const fromLocation = fromToMatch[1].trim();
    const toLocation = fromToMatch[2].trim();
    
    const fromCity = findLocationMatch(fromLocation, LOCATION_PATTERNS);
    const toCity = findLocationMatch(toLocation, LOCATION_PATTERNS);
    
    if (fromCity && toCity) {
      return `${fromCity} → ${toCity}`;
    }
  }

  // 2. "trip to X" or "going to X" pattern
  const tripToMatch = lowerMessage.match(/(?:trip to|going to|travel to|visit)\s+([a-z\s]+)/);
  if (tripToMatch) {
    const destination = tripToMatch[1].trim();
    const city = findLocationMatch(destination, LOCATION_PATTERNS);
    if (city) {
      return `${city} Trip`;
    }
  }

  // 3. "X to Y" pattern (without "from")
  const directRouteMatch = lowerMessage.match(/([a-z\s]+)\s+to\s+([a-z\s]+)/);
  if (directRouteMatch) {
    const fromLocation = directRouteMatch[1].trim();
    const toLocation = directRouteMatch[2].trim();
    
    const fromCity = findLocationMatch(fromLocation, LOCATION_PATTERNS);
    const toCity = findLocationMatch(toLocation, LOCATION_PATTERNS);
    
    if (fromCity && toCity) {
      return `${fromCity} → ${toCity}`;
    }
  }

  // 4. Single location mentioned
  for (const [key, value] of Object.entries(LOCATION_PATTERNS)) {
    if (lowerMessage.includes(key)) {
      if (lowerMessage.includes('how to reach') || lowerMessage.includes('way to')) {
        return `Route to ${value}`;
      }
      return `${value} Info`;
    }
  }

  // 5. Transport mode specific queries
  if (lowerMessage.includes('bus') && lowerMessage.includes('schedule')) {
    return 'Bus Schedule';
  }
  if (lowerMessage.includes('metro') || lowerMessage.includes('train')) {
    return 'Metro/Train Info';
  }
  if (lowerMessage.includes('auto') || lowerMessage.includes('taxi')) {
    return 'Taxi/Auto Info';
  }
  if (lowerMessage.includes('bike share') || lowerMessage.includes('bicycle')) {
    return 'Bike Share Info';
  }

  // 6. General transport queries
  if (lowerMessage.includes('transport') || lowerMessage.includes('travel')) {
    return 'Transport Query';
  }
  if (lowerMessage.includes('route') || lowerMessage.includes('way')) {
    return 'Route Planning';
  }

  // 7. Fallback: Use first few words (improved)
  return generateFallbackTitle(message);
};
