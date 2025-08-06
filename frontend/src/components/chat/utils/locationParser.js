export const parseLocationsFromMessage = (message) => {
  const lowerMessage = message.toLowerCase();
  const locations = { origin: null, destination: null };

  const fromToMatch = lowerMessage.match(/from\s+([^to]+)\s+to\s+(.+)/);
  if (fromToMatch) {
    locations.origin = fromToMatch[1].trim();    // Access first capture group
    locations.destination = fromToMatch[2].trim(); // Access second capture group
  }

  const goToMatch = lowerMessage.match(/(?:go to|want to go to|going to)\s+(.+)/);
  if (goToMatch && !locations.destination) {
    locations.destination = goToMatch[1].trim(); // Access first capture group
  }

  if (lowerMessage.includes('current location') || lowerMessage.includes('here') || lowerMessage.includes('my location')) {
    locations.origin = 'Current Location';
  }

  const puneLocations = ['dighi', 'airport', 'pune airport', 'pnq', 'railway station', 'pune station', 'koregaon park', 'camp'];
  puneLocations.forEach(location => {
    if (lowerMessage.includes(location)) {
      if (!locations.destination) {
        locations.destination = location;
      }
    }
  });

  return locations;
};
