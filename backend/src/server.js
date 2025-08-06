const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const LocationAwareAIService = require('./services/mockAIService'); // Updated to LocationAwareAIService

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true
  }
});

const aiService = new LocationAwareAIService();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// REST API Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Urban Mobility API with Ollama and Location Services is running',
    features: {
      ollama: true,
      locationAware: true,
      googleMaps: true
    }
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, userId, locationContext, userLocation } = req.body;
    console.log('REST API chat request:', { message, userId, hasLocationContext: !!locationContext });
    
    const response = await aiService.processMessageWithLocation(
      message, 
      userId, 
      userLocation
    );
    
    res.json(response);
  } catch (error) {
    console.error('REST API processing error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: error.message 
    });
  }
});

// Additional endpoint for location-specific queries
app.post('/api/journey', async (req, res) => {
  try {
    const { origin, destination, preferences, userLocation } = req.body;
    console.log('Journey planning request:', { origin, destination, preferences });
    
    const message = `Plan a journey from ${origin} to ${destination}`;
    const response = await aiService.processMessageWithLocation(
      message,
      'api-user',
      userLocation
    );
    
    res.json(response);
  } catch (error) {
    console.error('Journey planning error:', error);
    res.status(500).json({ 
      error: 'Failed to plan journey',
      details: error.message 
    });
  }
});

// WebSocket connection handling with enhanced location support and conversation history
io.on('connection', (socket) => {
  console.log('User connected with location services:', socket.id);

  socket.on('send_message', async (data) => {
    try {
      const { 
        message, 
        userId, 
        locationContext, 
        userLocation, 
        hasLocationData,
        conversationHistory = [] // ✅ Get conversation history from frontend
      } = data;
      
      console.log('[BACKEND] Processing message with conversation context:');
      console.log('[BACKEND] Current message:', message);
      console.log('[BACKEND] Conversation history:', conversationHistory.length, 'messages');
      console.log('[BACKEND] Location context:', {
        hasLocationContext: !!locationContext,
        hasUserLocation: !!userLocation,
        locationEnabled: hasLocationData
      });
      
      // Log location context details for debugging
      if (locationContext) {
        console.log('Location context details:', {
          extractedLocations: locationContext.extractedLocations,
          routeInfo: locationContext.routeInfo ? 'Available' : 'Not available',
          nearbyPlaces: locationContext.nearbyPlaces ? locationContext.nearbyPlaces.length : 0
        });
      }

      // ✅ Build context messages for AI including conversation history
      const contextMessages = [];
      
      // Add conversation history to context
      conversationHistory.forEach(histMsg => {
        contextMessages.push({
          role: histMsg.role,
          content: histMsg.content
        });
      });
      
      // Add current message
      contextMessages.push({
        role: "user",
        content: message
      });

      // ✅ Enhanced system message with location context
      let systemMessage = "You are an urban mobility assistant for Pune, India. You help with transportation planning including buses, trains, autos, taxis, and bike-sharing. Maintain conversation context and remember previous discussions.";
      
      if (locationContext && locationContext.extractedLocations) {
        systemMessage += ` Current location context: ${JSON.stringify(locationContext.extractedLocations)}`;
      }
      
      if (userLocation) {
        systemMessage += ` User's GPS location: ${userLocation.lat}, ${userLocation.lng}`;
      }

      // ✅ Make request to Ollama with full conversation context
      try {
        const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama3.2',
            messages: [
              { role: "system", content: systemMessage },
              ...contextMessages // ✅ Include full conversation history
            ],
            stream: false
          })
        });

        if (ollamaResponse.ok) {
          const ollamaData = await ollamaResponse.json();
          const aiResponse = ollamaData.message.content;

          socket.emit('receive_message', {
            id: Date.now(),
            type: 'text',
            message: aiResponse,
            timestamp: new Date().toISOString(),
            locationProcessed: !!locationContext
          });

        } else {
          console.error('[BACKEND] Ollama request failed:', ollamaResponse.status);
          socket.emit('receive_message', {
            id: Date.now(),
            type: 'text',
            message: 'Sorry, I encountered an error processing your request.',
            timestamp: new Date().toISOString(),
            error: true
          });
        }

      } catch (ollamaError) {
        console.error('[BACKEND] Ollama connection error:', ollamaError);
        
        // Fallback to your existing AI service
        const response = await aiService.processMessageWithLocation(
          message, 
          userId, 
          userLocation
        );
        
        socket.emit('receive_message', {
          id: Date.now(),
          ...response,
          timestamp: new Date().toISOString(),
          locationProcessed: !!locationContext
        });
      }

    } catch (error) {
      console.error('Location-aware processing error:', error);
      
      socket.emit('receive_message', {
        id: Date.now(),
        type: 'text',
        message: 'Sorry, I encountered an error processing your location-aware request. Please try again.',
        timestamp: new Date().toISOString(),
        error: true
      });
    }
  });

  // Handle location updates from client
  socket.on('location_update', (data) => {
    const { userLocation, accuracy } = data;
    console.log('Received location update:', {
      lat: userLocation?.lat,
      lng: userLocation?.lng,
      accuracy: accuracy
    });
    
    // Acknowledge location update
    socket.emit('location_acknowledged', {
      received: true,
      timestamp: new Date().toISOString()
    });
  });

  // Handle journey planning requests
  socket.on('plan_journey', async (data) => {
    try {
      const { origin, destination, preferences, userLocation } = data;
      console.log('Journey planning via WebSocket:', { origin, destination });
      
      const message = `Plan a journey from ${origin} to ${destination}`;
      const response = await aiService.processMessageWithLocation(
        message,
        socket.id,
        userLocation
      );
      
      socket.emit('journey_planned', {
        id: Date.now(),
        ...response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('WebSocket journey planning error:', error);
      socket.emit('journey_error', {
        error: 'Failed to plan journey',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Handle transport status requests
  socket.on('check_status', async (data) => {
    try {
      const { userLocation } = data;
      console.log('Transport status check via WebSocket');
      
      const response = await aiService.processMessageWithLocation(
        'Check current transport status',
        socket.id,
        userLocation
      );
      
      socket.emit('status_update', {
        id: Date.now(),
        ...response,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status check error:', error);
      socket.emit('status_error', {
        error: 'Failed to check transport status',
        details: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: 'Something went wrong processing your request'
  });
});

// Health monitoring
const startTime = new Date();
app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    uptime: Math.floor((new Date() - startTime) / 1000),
    memory: process.memoryUsage(),
    features: {
      ollama: true,
      locationServices: true,
      googleMapsIntegration: true,
      webSocketSupport: true,
      conversationHistory: true // ✅ New feature
    },
    endpoints: {
      health: '/api/health',
      chat: '/api/chat',
      journey: '/api/journey',
      status: '/api/status'
    }
  });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Urban Mobility Server with Ollama and Location Services running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Status dashboard: http://localhost:${PORT}/api/status`);
  console.log(`🗺️ Features: Location-aware AI, Google Maps integration, Real-time WebSocket, Conversation History`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Urban Mobility Server...');
  server.close(() => {
    console.log('✅ Server shut down gracefully');
    process.exit(0);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
