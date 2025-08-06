export class MarkersManager {
  constructor(map) {
    this.map = map;
    this.originMarker = null;
    this.destinationMarker = null;
    this.currentLocationMarker = null;
  }

  addOriginMarker(location) {
    this.clearOriginMarker();
    
    this.originMarker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: this.map,
      title: `From: ${location.address}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#10B981',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF'
      }
    });

    return this.originMarker;
  }

  addDestinationMarker(location) {
    this.clearDestinationMarker();
    
    this.destinationMarker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: this.map,
      title: `To: ${location.address}`,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeWeight: 3,
        strokeColor: '#FFFFFF'
      }
    });

    return this.destinationMarker;
  }

  addCurrentLocationMarker(location) {
    this.clearCurrentLocationMarker();
    
    this.currentLocationMarker = new window.google.maps.Marker({
      position: location,
      map: this.map,
      title: 'Current Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#FFFFFF'
      }
    });

    return this.currentLocationMarker;
  }

  clearOriginMarker() {
    if (this.originMarker) {
      this.originMarker.setMap(null);
      this.originMarker = null;
    }
  }

  clearDestinationMarker() {
    if (this.destinationMarker) {
      this.destinationMarker.setMap(null);
      this.destinationMarker = null;
    }
  }

  clearCurrentLocationMarker() {
    if (this.currentLocationMarker) {
      this.currentLocationMarker.setMap(null);
      this.currentLocationMarker = null;
    }
  }

  clearAllMarkers() {
    this.clearOriginMarker();
    this.clearDestinationMarker();
    this.clearCurrentLocationMarker();
  }

  fitBoundsToMarkers(originLocation, destinationLocation) {
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: originLocation.lat, lng: originLocation.lng });
    bounds.extend({ lat: destinationLocation.lat, lng: destinationLocation.lng });
    this.map.fitBounds(bounds);
  }
}
