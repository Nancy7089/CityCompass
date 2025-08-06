const { faker } = require('@faker-js/faker');

class MockJourneyPlanner {
  constructor() {
    this.busRoutes = this.generateBusRoutes();
    this.metroRoutes = this.generateMetroRoutes();
    this.rideOptions = this.generateRideOptions();
    this.bikeStations = this.generateBikeStations();
  }

  generateBusRoutes() {
    return [
      {
        id: 'bus-001',
        routeNumber: '42A',
        serviceName: 'City Bus',
        origin: 'Downtown Station',
        destination: 'Airport Terminal',
        nextDepartures: ['5 min', '15 min', '25 min'],
        duration: 35,
        cost: 2.50,
        status: 'on-time'
      },
      {
        id: 'bus-002', 
        routeNumber: '15B',
        serviceName: 'Express Bus',
        origin: 'City Center',
        destination: 'University Campus',
        nextDepartures: ['8 min', '18 min', '28 min'],
        duration: 22,
        cost: 3.00,
        status: 'delayed'
      }
    ];
  }

  generateMetroRoutes() {
    return [
      {
        id: 'metro-001',
        lineName: 'Red Line',
        serviceName: 'Metro Rail',
        origin: 'Central Hub',
        destination: 'North Station',
        nextDepartures: ['3 min', '9 min', '15 min'],
        duration: 18,
        cost: 3.25,
        status: 'on-time'
      },
      {
        id: 'metro-002',
        lineName: 'Blue Line', 
        serviceName: 'Metro Rail',
        origin: 'Downtown',
        destination: 'Riverside',
        nextDepartures: ['6 min', '16 min', '26 min'],
        duration: 28,
        cost: 3.25,
        status: 'on-time'
      }
    ];
  }

  generateRideOptions() {
    return [
      {
        id: 'uber-001',
        serviceName: 'UberX',
        driverName: faker.person.firstName(),
        vehicleType: 'Sedan',
        estimatedArrival: '4 min',
        duration: 12,
        cost: 18.50,
        rating: 4.8,
        status: 'available'
      },
      {
        id: 'lyft-001',
        serviceName: 'Lyft',
        driverName: faker.person.firstName(),
        vehicleType: 'SUV',
        estimatedArrival: '7 min',
        duration: 15,
        cost: 22.00,
        rating: 4.6,
        status: 'available'
      }
    ];
  }

  generateBikeStations() {
    return [
      {
        id: 'bike-001',
        stationName: 'Park Avenue Station',
        serviceName: 'CityBike',
        availableBikes: 12,
        availableDocks: 8,
        distance: '0.2 miles',
        walkTime: '3 min',
        cost: 4.95,
        status: 'active'
      },
      {
        id: 'bike-002',
        stationName: 'Main Street Hub',
        serviceName: 'CityBike', 
        availableBikes: 5,
        availableDocks: 15,
        distance: '0.4 miles',
        walkTime: '6 min',
        cost: 4.95,
        status: 'active'
      }
    ];
  }

  async planJourney(origin, destination, preferences = {}) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const journeyOptions = [];

    // Add bus options
    if (!preferences.excludeBus) {
      this.busRoutes.forEach(route => {
        journeyOptions.push({
          id: `journey-${route.id}`,
          type: 'single-mode',
          transportModes: ['bus'],
          totalDuration: route.duration,
          totalCost: route.cost,
          reliability: 85,
          steps: [{
            transport: 'bus',
            serviceName: route.serviceName,
            routeInfo: route.routeNumber,
            instruction: `Take ${route.routeNumber} from ${route.origin}`,
            duration: route.duration,
            cost: route.cost,
            departureTime: route.nextDepartures[0],
            status: route.status
          }]
        });
      });
    }

    // Add metro options
    if (!preferences.excludeMetro) {
      this.metroRoutes.forEach(route => {
        journeyOptions.push({
          id: `journey-${route.id}`,
          type: 'single-mode',
          transportModes: ['metro'],
          totalDuration: route.duration,
          totalCost: route.cost,
          reliability: 92,
          steps: [{
            transport: 'metro',
            serviceName: route.serviceName,
            routeInfo: route.lineName,
            instruction: `Take ${route.lineName} from ${route.origin}`,
            duration: route.duration,
            cost: route.cost,
            departureTime: route.nextDepartures[0],
            status: route.status
          }]
        });
      });
    }

    // Add multi-modal options
    journeyOptions.push({
      id: 'journey-multimodal-001',
      type: 'multi-modal',
      transportModes: ['bus', 'metro'],
      totalDuration: 32,
      totalCost: 5.75,
      reliability: 88,
      steps: [
        {
          transport: 'bus',
          serviceName: 'City Bus',
          routeInfo: '42A',
          instruction: 'Take Bus 42A to Metro Station',
          duration: 12,
          cost: 2.50,
          departureTime: '5 min',
          status: 'on-time'
        },
        {
          transport: 'walk',
          instruction: 'Walk to Metro platform',
          duration: 3,
          cost: 0
        },
        {
          transport: 'metro', 
          serviceName: 'Metro Rail',
          routeInfo: 'Red Line',
          instruction: 'Take Red Line to destination',
          duration: 17,
          cost: 3.25,
          departureTime: '3 min',
          status: 'on-time'
        }
      ]
    });

    // Sort by total duration
    journeyOptions.sort((a, b) => a.totalDuration - b.totalDuration);

    return {
      origin,
      destination,
      searchTime: new Date().toISOString(),
      recommendedOption: journeyOptions[0],
      allOptions: journeyOptions.slice(0, 5),
      preferences
    };
  }

  async getTransportStatus() {
    return {
      buses: this.busRoutes.map(route => ({
        id: route.id,
        name: route.routeNumber,
        status: route.status,
        nextDeparture: route.nextDepartures[0]
      })),
      metros: this.metroRoutes.map(route => ({
        id: route.id,
        name: route.lineName,
        status: route.status,
        nextDeparture: route.nextDepartures[0]
      })),
      bikes: this.bikeStations.map(station => ({
        id: station.id,
        name: station.stationName,
        status: station.status,
        available: `${station.availableBikes} bikes`
      }))
    };
  }
}

module.exports = MockJourneyPlanner;
