const WeatherUtils = {
  // Get current weather using browser geolocation and weather API
  getCurrentWeather: async () => {
    try {
      // Get user's location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Use OpenWeatherMap API through proxy
      const API_KEY = 'demo'; // In production, use proper API key
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
      
      try {
        // Try with proxy first
        const response = await fetch(`https://proxy-api.trickle-app.host/?url=${encodeURIComponent(weatherUrl)}`);
        
        if (!response.ok) {
          throw new Error('Weather API error');
        }

        const data = await response.json();
        
        return {
          temperature: data.main.temp,
          description: data.weather[0].description,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          location: `${data.name}, ${data.sys.country}`
        };
      } catch (apiError) {
        // Fallback to simulated weather data
        console.log('Using simulated weather data');
        return WeatherUtils.getSimulatedWeather(latitude, longitude);
      }

    } catch (error) {
      console.error('Geolocation error:', error);
      // Return simulated weather if location fails
      return WeatherUtils.getSimulatedWeather();
    }
  },

  // Simulate weather data when API is unavailable
  getSimulatedWeather: (lat = 40.7128, lon = -74.0060) => {
    const conditions = [
      { temp: 22, desc: 'sunny', name: 'Clear sky' },
      { temp: 18, desc: 'partly cloudy', name: 'Partly cloudy' },
      { temp: 15, desc: 'rainy', name: 'Light rain' },
      { temp: 25, desc: 'sunny', name: 'Sunny' },
      { temp: 12, desc: 'cloudy', name: 'Overcast' }
    ];

    const randomWeather = conditions[Math.floor(Math.random() * conditions.length)];
    
    return {
      temperature: randomWeather.temp,
      description: randomWeather.name,
      humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
      windSpeed: Math.floor(Math.random() * 10) + 5, // 5-15 km/h
      location: 'Your Location'
    };
  },

  // Get weather advice based on conditions and mood
  getWeatherAdvice: (weather, mood = 3) => {
    const baseAdvice = {
      sunny: [
        "Take a walk in nature",
        "Practice outdoor meditation", 
        "Have lunch outside"
      ],
      rainy: [
        "Make a warm beverage",
        "Listen to calming music",
        "Try indoor yoga"
      ],
      cloudy: [
        "Perfect for a gentle walk",
        "Visit a cozy café",
        "Practice gratitude"
      ]
    };

    // Adjust for mood level
    if (mood <= 2) {
      return [
        "Start with small, gentle activities",
        "Focus on comfort and self-care",
        "Consider reaching out to a friend"
      ];
    }

    const condition = weather.description.toLowerCase();
    if (condition.includes('sun') || condition.includes('clear')) {
      return baseAdvice.sunny;
    } else if (condition.includes('rain')) {
      return baseAdvice.rainy;
    } else {
      return baseAdvice.cloudy;
    }
  }
};