function WeatherAdvisor() {
  try {
    const [weather, setWeather] = React.useState(null);
    const [location, setLocation] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
      getCurrentWeather();
    }, []);

    const getCurrentWeather = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const weatherData = await WeatherUtils.getCurrentWeather();
        setWeather(weatherData);
        setLocation(weatherData.location);
      } catch (err) {
        setError('Unable to get weather data. Please check your connection.');
        console.error('Weather error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const getWeatherAdvice = (condition, temp) => {
      const recentMood = StorageUtils.getRecentMood()?.score || 3;
      
      const advice = {
        sunny: {
          high: ["Take a walk in the park", "Try outdoor meditation", "Have a picnic lunch"],
          low: ["Sit by a sunny window", "Do gentle stretching outside", "Water some plants"]
        },
        rainy: {
          high: ["Make warm coffee or tea", "Listen to calming music", "Try indoor yoga"],
          low: ["Cozy reading time", "Watch uplifting movies", "Take a warm bath"]
        },
        cloudy: {
          high: ["Perfect for a nature walk", "Visit a museum", "Try photography"],
          low: ["Practice gratitude journaling", "Listen to podcasts", "Do creative activities"]
        },
        cold: {
          high: ["Bundle up for fresh air", "Try winter sports", "Make warm soup"],
          low: ["Stay cozy indoors", "Practice breathing exercises", "Connect with friends online"]
        }
      };

      const moodLevel = recentMood >= 4 ? 'high' : 'low';
      return advice[condition]?.[moodLevel] || advice.cloudy[moodLevel];
    };

    const getWeatherCondition = (description) => {
      const desc = description.toLowerCase();
      if (desc.includes('sun') || desc.includes('clear')) return 'sunny';
      if (desc.includes('rain') || desc.includes('drizzle')) return 'rainy';
      if (desc.includes('cloud')) return 'cloudy';
      if (desc.includes('snow') || desc.includes('cold')) return 'cold';
      return 'cloudy';
    };

    const getWeatherIcon = (condition) => {
      const icons = {
        sunny: 'icon-sun',
        rainy: 'icon-cloud-rain',
        cloudy: 'icon-cloud',
        cold: 'icon-snowflake'
      };
      return icons[condition] || 'icon-cloud';
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64" data-name="weather-advisor" data-file="components/WeatherAdvisor.js">
          <div className="text-center">
            <div className="icon-loader text-3xl text-[var(--primary-color)] animate-spin mb-2"></div>
            <p>Getting weather data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6" data-name="weather-advisor" data-file="components/WeatherAdvisor.js">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">Weather Wellness</h1>
            <button onClick={getCurrentWeather} className="btn-secondary">
              <div className="icon-refresh-cw text-lg mr-2 inline-block"></div>
              Refresh
            </button>
          </div>
          <p className="text-[var(--text-secondary)]">Weather-based wellness suggestions tailored to your mood</p>
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="icon-alert-circle text-2xl text-red-500 mb-2"></div>
            <p className="text-red-700">{error}</p>
            <button onClick={getCurrentWeather} className="btn-primary mt-4">
              Try Again
            </button>
          </div>
        ) : weather ? (
          <>
            {/* Current Weather */}
            <div className="bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{Math.round(weather.temperature)}°C</div>
                  <div className="text-lg">{weather.description}</div>
                  <div className="text-sm opacity-90">{location}</div>
                </div>
                <div className={`text-5xl ${getWeatherIcon(getWeatherCondition(weather.description))}`}></div>
              </div>
            </div>

            {/* Wellness Suggestions */}
            <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Suggested Activities</h2>
              <div className="grid md:grid-cols-3 gap-4">
                {getWeatherAdvice(getWeatherCondition(weather.description), weather.temperature).map((suggestion, index) => (
                  <div key={index} className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-lg">
                    <div className="icon-heart text-lg text-[var(--primary-color)] mb-2"></div>
                    <p className="text-sm font-medium">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood-Weather Connection */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Weather & Mood Connection</h3>
              <div className="text-sm text-blue-800 space-y-2">
                <p>• Weather can significantly impact our mood and energy levels</p>
                <p>• Sunlight helps boost serotonin, improving mood naturally</p>
                <p>• Rainy days are perfect for cozy, introspective activities</p>
                <p>• Fresh air and nature exposure reduce stress and anxiety</p>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="icon-cloud text-4xl text-gray-300 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Weather Data</h3>
            <p className="text-gray-500 mb-4">Enable location access to get personalized weather wellness tips</p>
            <button onClick={getCurrentWeather} className="btn-primary">
              Get Weather
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('WeatherAdvisor component error:', error);
    return null;
  }
}