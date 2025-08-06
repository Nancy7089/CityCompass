import { useState, useEffect } from 'react';

export const useRouteHistory = () => {
  const [recentRoutes, setRecentRoutes] = useState([]);
  const [currentRouteId, setCurrentRouteId] = useState(null);

  // Load routes from localStorage on mount
  useEffect(() => {
    const savedRoutes = localStorage.getItem('urbanai_recent_routes');
    if (savedRoutes) {
      try {
        const routes = JSON.parse(savedRoutes);
        setRecentRoutes(routes);
      } catch (error) {
        console.error('Failed to load recent routes:', error);
      }
    }
  }, []);

  // Save routes to localStorage whenever recentRoutes changes
  useEffect(() => {
    localStorage.setItem('urbanai_recent_routes', JSON.stringify(recentRoutes));
  }, [recentRoutes]);

  const addRoute = (query) => {
    const newRoute = {
      id: Date.now(),
      query: query,
      shortTitle: generateShortTitle(query),
      timestamp: new Date().toISOString(),
      messages: [] // Will store the conversation
    };

    setRecentRoutes(prev => {
      // Remove if already exists (to move to top)
      const filtered = prev.filter(route => route.query !== query);
      // Add to beginning and limit to 10 routes
      return [newRoute, ...filtered].slice(0, 10);
    });

    setCurrentRouteId(newRoute.id);
    return newRoute.id;
  };

  const updateRouteMessages = (routeId, messages) => {
    setRecentRoutes(prev => 
      prev.map(route => 
        route.id === routeId 
          ? { ...route, messages }
          : route
      )
    );
  };

  const selectRoute = (route) => {
    setCurrentRouteId(route.id);
    return route;
  };

  const startNewChat = () => {
    setCurrentRouteId(null);
  };

  const generateShortTitle = (query) => {
    // Extract key locations from query
    const fromMatch = query.match(/from\s+([^to]+)\s+to\s+(.+)/i);
    if (fromMatch) {
      const from = fromMatch[1].trim();
      const to = fromMatch[2].trim();
      return `${from} → ${to}`;
    }
    
    // If no "from...to" pattern, just truncate
    return query.length > 30 ? query.substring(0, 30) + '...' : query;
  };

  return {
    recentRoutes,
    currentRouteId,
    addRoute,
    updateRouteMessages,
    selectRoute,
    startNewChat
  };
};
