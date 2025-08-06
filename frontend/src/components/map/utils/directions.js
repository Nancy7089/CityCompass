export class DirectionsManager {
  constructor(map) {
    this.map = map;
    this.directionsService = new window.google.maps.DirectionsService();
    this.directionsRenderer = null;
  }

  calculateRoute(originLocation, destinationLocation, onSuccess, onError) {
    console.log('🗺️ Calculating route between:', originLocation.address, '→', destinationLocation.address);
    
    // Clear existing renderer
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }

    // Create new DirectionsRenderer for each request
    this.directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: false,
      draggable: false,
      polylineOptions: {
        strokeColor: '#4285F4',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });
    
    // Set renderer to map BEFORE making request
    this.directionsRenderer.setMap(this.map);
    
    const request = {
      origin: new window.google.maps.LatLng(originLocation.lat, originLocation.lng),
      destination: new window.google.maps.LatLng(destinationLocation.lat, destinationLocation.lng),
      travelMode: window.google.maps.TravelMode.DRIVING,
      unitSystem: window.google.maps.UnitSystem.METRIC
    };

    this.directionsService.route(request, (result, status) => {
      console.log('🗺️ Directions API Response:', status, result);
      
      if (status === 'OK' && result) {
        console.log('✅ Route calculated successfully');
        
        // Set directions to renderer
        this.directionsRenderer.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        const leg = route.legs[0];
        
        const routeInfo = {
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.length,
          mode: 'Driving'
        };
        
        onSuccess(routeInfo);
        
      } else {
        console.error('❌ Directions request failed:', status);
        onError(`Route calculation failed: ${status}`);
      }
    });
  }

  clearRoute() {
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
      this.directionsRenderer = null;
    }
  }
}
