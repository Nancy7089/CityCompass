# City Compass

An intelligent transportation assistant powered by AI that helps users plan optimal routes using buses, metros, ride-sharing, and bike-sharing services in Pune, India.

## Features

- **AI-Powered Route Planning** - Smart route suggestions using Ollama LLaMA 3.2
- **Real-time Location Services** - GPS-based route optimization
- **Multi-Modal Transport** - Buses, metros, taxis, autos, and bike-sharing options
- **Interactive Maps** - Google Maps integration with route visualization
- **Smart Chat Interface** - Context-aware conversations with intelligent titles
- **Modern UI** - Glass morphism design with smooth animations

## Tech Stack

**Frontend:** React 18, Vite, Socket.IO Client, Google Maps API  
**Backend:** Node.js, Express, Socket.IO, Ollama  
**AI:** LLaMA 3.2 for natural language processing  
**Maps:** Google Maps Platform for routing and visualization  

## Installation

### Prerequisites
- Node.js 18+
- Ollama installed locally
- Google Maps API key

### Setup
Clone the repository

git clone https://github.com/yourusername/city-compass.git
cd city-compass
Setup frontend

cd frontend
npm install
Setup backend

cd ../backend
npm install

Install AI model

ollama pull llama3.2

### Environment Variables
Create `.env` in frontend directory:

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key


### Run Application

Terminal 1: Start Ollama

ollama serve
Terminal 2: Start Backend

cd backend && npm start
Terminal 3: Start Frontend

cd frontend && npm run dev


Visit `http://localhost:5173` to use the application.

## Usage

1. **Landing Page** - Enter your starting location and destination
2. **Choose Transport Mode** - Select from buses, metros, taxis, or bike-sharing
3. **AI Chat** - Get intelligent route suggestions and real-time assistance
4. **Interactive Map** - View routes with turn-by-turn directions
5. **Chat History** - Access previous conversations with smart titles

## Key Components

- **LandingSearch** - Hero page with route planning form
- **ChatInterface** - AI-powered conversation with glassmorphism UI
- **GoogleMap** - Interactive maps with route visualization
- **Sidebar** - Navigation with intelligent conversation history

## Example Queries

- *"From Dighi to Pune Railway Station"* → Shows transport options
- *"Trip to Mumbai"* → Suggests optimal routes and timings
- *"Bus schedule to Airport"* → Real-time transit information

## Team

**Sahil Kumar Singh** - Full Stack Developer & Project Lead  
**Nancy** - Frontend Developer & UI/UX Designer  

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Google Maps Platform for location services
- Ollama for local AI capabilities
- React community for excellent documentation

---

**Built with love for smarter urban transportation in Pune**

*Making public transit accessible through AI-powered conversations*



