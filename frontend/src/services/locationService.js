class LocationService {
  constructor(googleMapsApi) {
    this.mapsApi = googleMapsApi;
    this.geocoder = null;
    this.placesService = null;
    this.directionsService = null;
    this.isInitialized = false;
  }

  // Initialize services when Google Maps is loaded
  initialize() {
    if (window.google && window.google.maps) {
      try {
        this.geocoder = new window.google.maps.Geocoder();
        this.directionsService = new window.google.maps.DirectionsService();
        this.isInitialized = true;
        console.log('LocationService core services initialized');
        return true;
      } catch (error) {
        console.error('Failed to initialize LocationService:', error);
        return false;
      }
    }
    return false;
  }

  // Initialize places service (call this when map is loaded)
  initializePlacesService(map) {
    if (window.google && window.google.maps && map) {
      try {
        this.placesService = new window.google.maps.places.PlacesService(map);
        console.log('Places service initialized successfully');
        return true;
      } catch (error) {
        console.error('Failed to initialize Places service:', error);
        return false;
      }
    }
    return false;
  }

  // Check if service is ready
  isReady() {
    return this.isInitialized && this.directionsService && this.geocoder;
  }

  // Extract location context from user query
// Extract location context from user query
async extractLocationContext(message, userLocation = null) {
  console.log('Extracting location context for message:', message);
  console.log('User location provided:', userLocation);
  
  // Debug Google Maps services
  this.debugGoogleMapsServices();
  
  const locations = this.parseLocationsFromMessage(message);
  const context = {
    userLocation: userLocation,
    extractedLocations: locations,
    nearbyPlaces: null,
    routeInfo: null
  };

  try {
    // Only try to get route info if we have both origin and destination
    if (this.directionsService && locations.origin && locations.destination) {
      console.log('Attempting to get route information...');
      console.log('Route request - Origin:', locations.origin, 'Destination:', locations.destination);
      
      // Convert "Current Location" to coordinates for Google Maps API
      let originForRoute = locations.origin;
      if (locations.origin === 'Current Location' && userLocation && userLocation.lat && userLocation.lng) {
        originForRoute = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
        console.log('Converted origin to coordinates:', userLocation);
      }
      
      context.routeInfo = await this.getRouteInformation(originForRoute, locations.destination);
      console.log('Route info result:', context.routeInfo);
    } else {
      console.log('Skipping route info - Missing service or locations:', {
        hasDirectionsService: !!this.directionsService,
        hasOrigin: !!locations.origin,
        hasDestination: !!locations.destination
      });
    }

    // Try to get nearby places if we have user location and places service
    if (userLocation && userLocation.lat && userLocation.lng && this.placesService) {
      console.log('Attempting to get nearby transport places...');
      context.nearbyPlaces = await this.getNearbyTransportPlaces(userLocation);
      console.log('Nearby places result:', context.nearbyPlaces);
    } else {
      console.log('Skipping nearby places - Missing requirements:', {
        hasUserLocation: !!(userLocation && userLocation.lat && userLocation.lng),
        hasPlacesService: !!this.placesService
      });
    }

    console.log('Final location context:', context);
    return context;
  } catch (error) {
    console.error('Location context extraction error:', error);
    return context;
  }
}


  // More flexible location parsing using NLP-like approaches
parseLocationsFromMessage(message) {
  const lowerMessage = message.toLowerCase();
  const locations = { origin: null, destination: null };

  console.log('Parsing message:', lowerMessage);

  // ALWAYS check for travel intent first and set origin
  const hasTravelIntent = lowerMessage.includes('want to go') || 
                         lowerMessage.includes('go to') || 
                         lowerMessage.includes('going to') ||
                         lowerMessage.includes('route me to') ||
                         lowerMessage.includes('get to') ||
                         lowerMessage.includes('travel to');

  if (hasTravelIntent) {
    locations.origin = 'Current Location'; // ✅ ALWAYS set this for travel queries
    console.log('Travel intent detected - origin set to Current Location');
  }

  // Extract destination from various patterns
  let destination = null;

  // Pattern 1: "want to go to X"
  const wantToGoMatch = lowerMessage.match(/(?:want to go to|go to|going to|route me to|get to|travel to)\s+(.+)/);
  if (wantToGoMatch) {
    destination = wantToGoMatch[1].trim();
  }

  // Pattern 2: "my destination is X"
  const destMatch = lowerMessage.match(/(?:my destination is|destination is)\s+(.+)/);
  if (destMatch) {
    destination = destMatch[1].trim();
  }

  // Pattern 3: "from X to Y"
  const fromToMatch = lowerMessage.match(/from\s+([^to]+)\s+to\s+(.+)/);
  if (fromToMatch) {
    locations.origin = fromToMatch[1].trim();
    destination = fromToMatch[2].trim();
  }

  // Clean and normalize destination
  if (destination) {
    // Handle railway station variations
    if (destination.includes('railway station') || 
        destination.includes('the railway station') ||
        destination.includes('train station') ||
        destination.includes('station')) {
      destination = 'pune railway station';
    }
    
    // Clean up common variations
    destination = destination
      .replace(/^the\s+/, '') // Remove "the" at start
      .replace(/\s+/g, ' ')   // Normalize spaces
      .trim();
    
    locations.destination = destination;
  }

  // Final safety check - ensure origin is set if destination exists
  if (locations.destination && !locations.origin) {
    locations.origin = 'Current Location';
    console.log('Safety check - origin set to Current Location');
  }

  console.log('Final parsed locations:', locations);
  return locations;
}

// Extract all location mentions using fuzzy matching
extractLocationMentions(message, knownLocations) {
  const mentions = [];
  
  // Find exact matches
  knownLocations.forEach(location => {
    if (message.includes(location)) {
      const index = message.indexOf(location);
      mentions.push({
        location: location,
        index: index,
        confidence: 1.0,
        type: 'exact'
      });
    }
  });

  // Find partial matches (fuzzy matching)
  const words = message.split(/\s+/);
  words.forEach((word, wordIndex) => {
    knownLocations.forEach(location => {
      const similarity = this.calculateSimilarity(word, location);
      if (similarity > 0.7 && !mentions.some(m => m.location === location)) {
        mentions.push({
          location: location,
          index: wordIndex,
          confidence: similarity,
          type: 'fuzzy'
        });
      }
    });
  });

  return mentions.sort((a, b) => b.confidence - a.confidence);
}

// Determine context (origin/destination) for each location
determineLocationContext(message, locationMentions, indicators) {
  const result = { origin: null, destination: null };
  
  locationMentions.forEach(mention => {
    const context = this.analyzeLocationContext(message, mention, indicators);
    
    if (context === 'origin' && !result.origin) {
      result.origin = mention.location;
    } else if (context === 'destination' && !result.destination) {
      result.destination = mention.location;
    }
  });

  return result;
}

// Analyze context around a location mention
analyzeLocationContext(message, locationMention, indicators) {
  const words = message.split(/\s+/);
  const locationIndex = message.indexOf(locationMention.location);
  
  // Look for context clues before and after the location
  const beforeText = message.substring(0, locationIndex).split(/\s+/).slice(-5); // Last 5 words
  const afterText = message.substring(locationIndex + locationMention.location.length).split(/\s+/).slice(0, 5); // Next 5 words
  
  const context = [...beforeText, ...afterText].join(' ').toLowerCase();
  
  // Score origin vs destination based on surrounding words
  let originScore = 0;
  let destinationScore = 0;
  
  indicators.origin.forEach(indicator => {
    if (context.includes(indicator)) originScore += 2;
  });
  
  indicators.destination.forEach(indicator => {
    if (context.includes(indicator)) destinationScore += 2;
  });

  // Position-based scoring (destinations often come after origins)
  if (locationIndex > message.length / 2) destinationScore += 1;
  else originScore += 1;

  return destinationScore > originScore ? 'destination' : 'origin';
}

// Apply smart defaults and corrections
applySmartDefaults(locations, message) {
  // If only destination found, set origin to current location
  if (locations.destination && !locations.origin) {
    locations.origin = 'Current Location';
  }

  // If only origin found, try to infer destination from journey context
  if (locations.origin && !locations.destination) {
    if (message.includes('go') || message.includes('travel') || message.includes('journey')) {
      // Could set a default or leave null for user to specify
    }
  }

  // Handle common typos and variations
  if (locations.destination) {
    locations.destination = this.normalizeLocationName(locations.destination);
  }
  if (locations.origin && locations.origin !== 'Current Location') {
    locations.origin = this.normalizeLocationName(locations.origin);
  }

  return locations;
}

// Calculate string similarity (Levenshtein-like)
calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = this.levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Simple Levenshtein distance calculation
levenshteinDistance(str1, str2) {
  const matrix = Array(str2.length + 1).fill().map(() => Array(str1.length + 1).fill(0));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
}

// Normalize and clean location names
normalizeLocationName(location) {
  return location
    .replace(/ispune/g, 'pune')
    .replace(/sttion/g, 'station')
    .replace(/rly/g, 'railway')
    .replace(/stn/g, 'station')
    .replace(/\s+/g, ' ')
    .trim();
}

// Optional: Add machine learning-like intent detection
detectTravelIntent(message) {
  const travelWords = ['go', 'travel', 'journey', 'route', 'direction', 'reach', 'get to'];
  const urgencyWords = ['urgent', 'quickly', 'fast', 'asap', 'immediate'];
  
  return {
    isTravel: travelWords.some(word => message.includes(word)),
    isUrgent: urgencyWords.some(word => message.includes(word)),
    confidence: this.calculateIntentConfidence(message, travelWords)
  };
}

calculateIntentConfidence(message, keywords) {
  const words = message.split(/\s+/);
  const matches = keywords.filter(keyword => message.includes(keyword));
  return matches.length / keywords.length;
}



  // Get route information between two points
  async getRouteInformation(origin, destination) {
    if (!this.directionsService || !origin || !destination) {
      return null;
    }

    return new Promise((resolve) => {
      const request = {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.TRANSIT,
        transitOptions: {
          modes: [
            window.google.maps.TransitMode.BUS,
            window.google.maps.TransitMode.SUBWAY,
            window.google.maps.TransitMode.TRAIN
          ]
        },
        alternatives: true
      };

      this.directionsService.route(request, (result, status) => {
        if (status === 'OK' && result.routes.length > 0) {
          const route = result.routes[0];
          const leg = route.legs[0];

          resolve({
            distance: leg.distance?.text,
            duration: leg.duration?.text,
            startAddress: leg.start_address,
            endAddress: leg.end_address,
            transitDetails: this.extractTransitDetails(leg.steps),
            alternatives: result.routes.length
          });
        } else {
          console.log('Directions request failed:', status);
          resolve(null);
        }
      });
    });
  }

  // Extract transit details from route steps
  extractTransitDetails(steps) {
    const transitSteps = steps.filter(step => step.travel_mode === 'TRANSIT');
    
    return transitSteps.map(step => {
      const transit = step.transit;
      return {
        mode: transit?.line?.vehicle?.type,
        lineName: transit?.line?.name || transit?.line?.short_name,
        departure: transit?.departure_stop?.name,
        arrival: transit?.arrival_stop?.name,
        duration: step.duration?.text,
        instructions: step.instructions.replace(/<[^>]*>/g, '') // Remove HTML tags
      };
    });
  }

  // Get nearby transport places (bus stops, metro stations, etc.)
  async getNearbyTransportPlaces(location) {
    if (!this.placesService || !location || !location.lat || !location.lng) {
      return null;
    }

    return new Promise((resolve) => {
      const request = {
        location: new window.google.maps.LatLng(location.lat, location.lng),
        radius: 1000, // 1km radius
        types: ['bus_station', 'subway_station', 'train_station', 'taxi_stand']
      };

      this.placesService.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results.slice(0, 5).map(place => ({
            name: place.name,
            type: place.types[0],
            rating: place.rating,
            vicinity: place.vicinity,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng()
            }
          })));
        } else {
          console.log('Places search failed:', status);
          resolve(null);
        }
      });
    });
  }

  // Geocode an address to get coordinates
  async geocodeAddress(address) {
    if (!this.geocoder || !address) {
      return null;
    }

    return new Promise((resolve) => {
      this.geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formatted_address: results[0].formatted_address
          });
        } else {
          console.log('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(lat, lng) {
    if (!this.geocoder || !lat || !lng) {
      return null;
    }

    return new Promise((resolve) => {
      const latLng = new window.google.maps.LatLng(lat, lng);
      
      this.geocoder.geocode({ location: latLng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            formatted_address: results[0].formatted_address,
            components: results[0].address_components
          });
        } else {
          console.log('Reverse geocoding failed:', status);
          resolve(null);
        }
      });
    });
  }

  // Calculate distance between two points
  calculateDistance(point1, point2) {
    if (!point1 || !point2 || !point1.lat || !point1.lng || !point2.lat || !point2.lng) {
      return null;
    }

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(point2.lat - point1.lat);
    const dLng = this.deg2rad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.lat)) * Math.cos(this.deg2rad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers

    return {
      kilometers: Math.round(distance * 100) / 100,
      meters: Math.round(distance * 1000)
    };
  }

  // Helper function to convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Check if a location string is likely a Pune location
  isPuneLocation(locationString) {
    const puneKeywords = [
      'pune', 'pimpri', 'chinchwad', 'pcmc', 'dighi', 'hadapsar', 
      'koregaon park', 'baner', 'aundh', 'kothrud', 'camp', 'fc road'
    ];
    
    const lowerLocation = locationString.toLowerCase();
    return puneKeywords.some(keyword => lowerLocation.includes(keyword));
  }

  // Get service status
  getServiceStatus() {
    return {
      isInitialized: this.isInitialized,
      hasGeocoder: !!this.geocoder,
      hasDirectionsService: !!this.directionsService,
      hasPlacesService: !!this.placesService,
      isReady: this.isReady()
    };
  }

  // Add this method to check Google Maps status
checkGoogleMapsStatus() {
  const status = {
    googleMapsLoaded: !!(window.google && window.google.maps),
    directionsService: !!this.directionsService,
    placesService: !!this.placesService,
    geocoder: !!this.geocoder,
    isInitialized: this.isInitialized
  };
  
  console.log('Google Maps service status:', status);
  return status;
}
}




export default LocationService;
