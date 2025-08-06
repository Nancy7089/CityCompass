const axios = require('axios');

class OllamaService {
  constructor() {
    this.baseURL = 'http://localhost:11434/api';
    this.model = 'llama3.2';
  }

  async generateResponseWithLocationContext(message, locationContext, preferences = {}) {
    try {
      const enhancedPrompt = this.buildLocationAwarePrompt(message, locationContext);
      
      const response = await axios.post(`${this.baseURL}/chat`, {
        model: this.model,
        messages: [
          {
            role: 'system',
            content: this.getLocationAwareSystemPrompt()
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        stream: false
      });

      return response.data.message.content;
    } catch (error) {
      console.error('Ollama location-aware error:', error.message);
      throw new Error('Failed to generate location-aware response');
    }
  }

  buildLocationAwarePrompt(message, locationContext) {
    let prompt = `User Query: "${message}"\n\n`;

    if (locationContext) {
      prompt += `LOCATION CONTEXT:\n`;

      if (locationContext.userLocation) {
        prompt += `- Current Location: ${locationContext.userLocation.lat}, ${locationContext.userLocation.lng}\n`;
      }

      if (locationContext.extractedLocations) {
        const { origin, destination } = locationContext.extractedLocations;
        if (origin) prompt += `- Origin: ${origin}\n`;
        if (destination) prompt += `- Destination: ${destination}\n`;
      }

      if (locationContext.routeInfo) {
        const route = locationContext.routeInfo;
        prompt += `- Route Distance: ${route.distance}\n`;
        prompt += `- Route Duration: ${route.duration}\n`;
        prompt += `- Start Address: ${route.startAddress}\n`;
        prompt += `- End Address: ${route.endAddress}\n`;

        if (route.transitDetails && route.transitDetails.length > 0) {
          prompt += `- Available Transit Options:\n`;
          route.transitDetails.forEach((transit, index) => {
            prompt += `  ${index + 1}. ${transit.mode} - ${transit.lineName}\n`;
            prompt += `     From: ${transit.departure} to ${transit.arrival}\n`;
            prompt += `     Duration: ${transit.duration}\n`;
          });
        }
      }

      if (locationContext.nearbyPlaces && locationContext.nearbyPlaces.length > 0) {
        prompt += `- Nearby Transport Hubs:\n`;
        locationContext.nearbyPlaces.forEach(place => {
          prompt += `  • ${place.name} (${place.type}) - Rating: ${place.rating}\n`;
        });
      }

      prompt += `\n`;
    }

    prompt += `Based on this location context, provide specific, actionable transport advice for Pune, including real costs, timings, and route recommendations.`;

    return prompt;
  }

  getLocationAwareSystemPrompt() {
    return `You are Maya, an expert urban mobility assistant specifically for Pune, India, with access to real-time location and route data.

IMPORTANT INSTRUCTIONS:
1. Use the provided location context to give SPECIFIC, REAL transport advice
2. Include actual route information, costs, and timings when available
3. Suggest the best transport options based on the route data provided
4. Reference specific locations, distances, and transit lines mentioned in the context
5. Provide alternative options if multiple routes are available
6. Always mention real-world factors like traffic, peak hours, and costs
7. Be conversational but precise in your recommendations

For Pune specifically:
- PMPML buses: ₹5-35 depending on distance
- Auto-rickshaws: ₹15-20 per km + waiting charges
- Ola/Uber: Varies with surge pricing
- Pune Metro: ₹10-40 depending on distance
- Consider traffic patterns and peak hours (8-11 AM, 6-9 PM)

Always prioritize the location context provided and give actionable, specific advice.`;
  }
}

module.exports = OllamaService;
