const OllamaService = require('./ollamaService');
const MockJourneyPlanner = require('./mockJourneyPlanner');

class LocationAwareAIService {
  constructor() {
    this.ollamaService = new OllamaService();
    this.mockJourneyPlanner = new MockJourneyPlanner();
    this.locationService = null; // Will be set from frontend
  }

  setLocationService(locationService) {
    this.locationService = locationService;
  }

  async processMessageWithLocation(message, userId = null, userLocation = null) {
    try {
      // Extract location context if location service is available
      let locationContext = null;
      if (this.locationService) {
        locationContext = await this.locationService.extractLocationContext(message, userLocation);
      }

      const intent = this.classifyIntent(message);
      
      switch (intent) {
        case 'plan_journey':
          return await this.handleLocationAwareJourneyPlanning(message, locationContext);
        case 'check_status':
          return await this.handleLocationAwareStatusCheck(locationContext);
        case 'greeting':
          return await this.handleGreeting();
        case 'help':
          return await this.handleHelp();
        default:
          return await this.handleLocationAwareGeneral(message, locationContext);
      }
    } catch (error) {
      console.error('Location-aware AI processing error:', error);
      return this.handleError();
    }
  }

  async handleLocationAwareJourneyPlanning(message, locationContext) {
    try {
      // Use Ollama with location context for intelligent response
      const aiResponse = await this.ollamaService.generateResponseWithLocationContext(
        message, 
        locationContext
      );
      
      // Also get structured mock data for UI widgets
      const origin = locationContext?.extractedLocations?.origin || 'Current Location';
      const destination = locationContext?.extractedLocations?.destination || 'Destination';
      const mockPlan = await this.mockJourneyPlanner.planJourney(origin, destination);
      
      return {
        type: 'journey_plan',
        message: aiResponse,
        data: mockPlan,
        locationContext: locationContext
      };
    } catch (error) {
      console.error('Location-aware journey planning error:', error);
      // Fallback to mock service
      const mockPlan = await this.mockJourneyPlanner.planJourney('Origin', 'Destination');
      return {
        type: 'journey_plan',
        message: "I've found several journey options for you:",
        data: mockPlan
      };
    }
  }

  async handleLocationAwareStatusCheck(locationContext) {
    try {
      const aiResponse = await this.ollamaService.generateResponseWithLocationContext(
        "Check current transport status", 
        locationContext
      );
      const mockStatus = await this.mockJourneyPlanner.getTransportStatus();
      
      return {
        type: 'transport_status',
        message: aiResponse,
        data: mockStatus
      };
    } catch (error) {
      console.error('Location-aware status check error:', error);
      const mockStatus = await this.mockJourneyPlanner.getTransportStatus();
      return {
        type: 'transport_status',
        message: "Here's the current transport service status:",
        data: mockStatus
      };
    }
  }

  async handleGreeting() {
    try {
      const response = await this.ollamaService.generateResponse(
        "Greet the user as an urban mobility assistant for Pune. Be friendly and explain how you can help with transportation planning, status checks, and journey coordination."
      );
      
      return {
        type: 'text',
        message: response
      };
    } catch (error) {
      return {
        type: 'text',
        message: "Hello! I'm your urban mobility assistant for Pune. I can help you plan journeys using buses, metros, ride-sharing, and bike-sharing services. Where would you like to go?"
      };
    }
  }

  async handleHelp() {
    try {
      const response = await this.ollamaService.generateResponse(
        "Explain your capabilities as an urban mobility assistant for Pune. List the specific ways you can help users with transportation including journey planning, status checks, multi-modal options, etc."
      );
      
      return {
        type: 'text',
        message: response
      };
    } catch (error) {
      return {
        type: 'text',
        message: "I can help you with:\n• Journey planning across multiple transport modes\n• Real-time transport status and delays\n• Route recommendations for buses, metros, ride-sharing, and bike-sharing\n• Multi-modal travel coordination\n\nJust tell me where you want to go!"
      };
    }
  }

  async handleLocationAwareGeneral(message, locationContext) {
    try {
      const response = await this.ollamaService.generateResponseWithLocationContext(
        message,
        locationContext,
        "Focus on urban mobility, transportation, and location-specific advice for Pune."
      );
      
      return {
        type: 'text',
        message: response,
        locationContext: locationContext
      };
    } catch (error) {
      return this.handleError();
    }
  }

  handleError() {
    return {
      type: 'text',
      message: 'Sorry, I encountered an error. Please try again, or ask me about specific transportation routes or service status.'
    };
  }

  classifyIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return 'greeting';
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      return 'help';
    }
    if (lowerMessage.includes('status') || lowerMessage.includes('delay') || lowerMessage.includes('disruption')) {
      return 'check_status';
    }
    if (lowerMessage.includes('from') || lowerMessage.includes('to') || lowerMessage.includes('go to') || 
        lowerMessage.includes('travel') || lowerMessage.includes('journey') || lowerMessage.includes('route')) {
      return 'plan_journey';
    }
    
    return 'general';
  }

  extractLocations(message) {
    const fromMatch = message.match(/from\s+([^to]+?)(?:\s+to|\s|$)/i);
    const toMatch = message.match(/to\s+(.+?)(?:\s|$)/i);
    
    return {
      origin: fromMatch ? fromMatch[1].trim() : null,
      destination: toMatch ? toMatch[1].trim() : null
    };
  }
}

module.exports = LocationAwareAIService;
