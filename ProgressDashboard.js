function ProgressDashboard() {
  try {
    const [moodEntries, setMoodEntries] = React.useState([]);
    const [chatHistory, setChatHistory] = React.useState([]);
    const [insights, setInsights] = React.useState({});
    const weeklyChartRef = React.useRef(null);
    const moodDistributionRef = React.useRef(null);
    const chartInstancesRef = React.useRef([]);

    React.useEffect(() => {
      const loadData = async () => {
        try {
          const entries = await StorageUtils.getMoodEntries();
          const chats = await StorageUtils.getChatHistory();
          
          // Ensure data is arrays
          const moodData = Array.isArray(entries) ? entries : [];
          const chatData = Array.isArray(chats) ? chats : [];
          
          setMoodEntries(moodData);
          setChatHistory(chatData);
          generateInsights(moodData, chatData);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          setMoodEntries([]);
          setChatHistory([]);
          generateInsights([], []);
        }
      };
      
      loadData();
    }, []);

    React.useEffect(() => {
      if (moodEntries.length > 0) {
        renderCharts();
      }
      return () => {
        chartInstancesRef.current.forEach(chart => chart.destroy());
      };
    }, [moodEntries]);

    const generateInsights = (entries, chats) => {
      // Ensure entries is an array
      const validEntries = Array.isArray(entries) ? entries : [];
      const validChats = Array.isArray(chats) ? chats : [];
      
      if (validEntries.length === 0) {
        setInsights({});
        return;
      }

      const last7Days = validEntries.slice(-7);
      const last30Days = validEntries.slice(-30);
      
      const avgMood = validEntries.reduce((sum, entry) => sum + entry.score, 0) / validEntries.length;
      const recentAvg = last7Days.reduce((sum, entry) => sum + entry.score, 0) / last7Days.length;
      
      const moodTrend = last7Days.length > 1 ? 
        (last7Days[last7Days.length - 1].score - last7Days[0].score) > 0 ? 'improving' : 'declining' : 'stable';
      
      const mostCommonMood = validEntries.reduce((acc, entry) => {
        acc[entry.score] = (acc[entry.score] || 0) + 1;
        return acc;
      }, {});
      
      const topMood = Object.entries(mostCommonMood)
        .sort(([,a], [,b]) => b - a)[0];

      setInsights({
        totalEntries: validEntries.length,
        averageMood: avgMood.toFixed(1),
        recentAverage: recentAvg.toFixed(1),
        moodTrend,
        streakDays: calculateStreak(validEntries),
        mostCommonMood: topMood ? parseInt(topMood[0]) : 3,
        chatSessions: validChats.filter(msg => msg && msg.type === 'user').length
      });
    };

    const calculateStreak = (entries) => {
      if (entries.length === 0) return 0;
      let streak = 1;
      const today = new Date().toDateString();
      
      for (let i = entries.length - 1; i > 0; i--) {
        const currentDate = new Date(entries[i].timestamp).toDateString();
        const previousDate = new Date(entries[i-1].timestamp).toDateString();
        
        const daysDiff = Math.floor((new Date(currentDate) - new Date(previousDate)) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          streak++;
        } else {
          break;
        }
      }
      return streak;
    };

    const renderCharts = () => {
      chartInstancesRef.current.forEach(chart => chart.destroy());
      chartInstancesRef.current = [];

      // Weekly mood trend
      if (weeklyChartRef.current) {
        const weeklyCtx = weeklyChartRef.current.getContext('2d');
        const last7Days = moodEntries.slice(-7);
        
        const weeklyChart = new ChartJS(weeklyCtx, {
          type: 'line',
          data: {
            labels: last7Days.map(entry => 
              new Date(entry.timestamp).toLocaleDateString('en', { weekday: 'short' })
            ),
            datasets: [{
              label: 'Daily Mood',
              data: last7Days.map(entry => entry.score),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true,
              pointRadius: 6,
              pointHoverRadius: 8
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, max: 5, ticks: { stepSize: 1 } }
            }
          }
        });
        chartInstancesRef.current.push(weeklyChart);
      }

      // Mood distribution pie chart
      if (moodDistributionRef.current) {
        const distributionCtx = moodDistributionRef.current.getContext('2d');
        const moodCounts = moodEntries.reduce((acc, entry) => {
          acc[entry.score] = (acc[entry.score] || 0) + 1;
          return acc;
        }, {});

        const moodLabels = ['😢 Very Sad', '😔 Sad', '😐 Neutral', '🙂 Good', '😊 Very Good'];
        
        const distributionChart = new ChartJS(distributionCtx, {
          type: 'doughnut',
          data: {
            labels: Object.keys(moodCounts).map(score => moodLabels[score - 1]),
            datasets: [{
              data: Object.values(moodCounts),
              backgroundColor: [
                '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'
              ]
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
          }
        });
        chartInstancesRef.current.push(distributionChart);
      }
    };

    const getMoodEmoji = (score) => {
      const emojis = ['😢', '😔', '😐', '🙂', '😊'];
      return emojis[score - 1] || '😐';
    };

    return (
      <div className="space-y-6" data-name="progress-dashboard" data-file="components/ProgressDashboard.js">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Your Wellness Journey</h1>
          <p className="text-[var(--text-secondary)]">Track your progress and discover insights about your mental health</p>
        </div>

        {moodEntries.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="icon-chart-bar text-4xl text-gray-300 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Data Yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your mood to see insights and progress</p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'mood' }))}
              className="btn-primary"
            >
              Track Your Mood
            </button>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Average Mood</p>
                    <p className="text-2xl font-bold text-[var(--primary-color)]">{insights.averageMood}</p>
                  </div>
                  <div className="text-2xl">{getMoodEmoji(Math.round(insights.averageMood))}</div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Tracking Streak</p>
                    <p className="text-2xl font-bold text-[var(--accent-color)]">{insights.streakDays}</p>
                  </div>
                  <div className="icon-calendar text-2xl text-[var(--accent-color)]"></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Total Entries</p>
                    <p className="text-2xl font-bold text-purple-600">{insights.totalEntries}</p>
                  </div>
                  <div className="icon-bar-chart text-2xl text-purple-600"></div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)]">Chat Sessions</p>
                    <p className="text-2xl font-bold text-orange-600">{insights.chatSessions}</p>
                  </div>
                  <div className="icon-message-circle text-2xl text-orange-600"></div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">7-Day Trend</h2>
                <div className="h-48">
                  <canvas ref={weeklyChartRef}></canvas>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Mood Distribution</h2>
                <div className="h-48">
                  <canvas ref={moodDistributionRef}></canvas>
                </div>
              </div>
            </div>

            {/* Insights & Recommendations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Insights & Recommendations</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="icon-trending-up text-green-600 mt-1"></div>
                  <div>
                    <p className="font-medium text-green-800">Mood Trend</p>
                    <p className="text-sm text-green-700">
                      Your mood has been {insights.moodTrend} recently. 
                      {insights.moodTrend === 'improving' ? ' Keep up the great work!' : 
                       ' Consider trying some grounding exercises or reaching out for support.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="icon-target text-blue-600 mt-1"></div>
                  <div>
                    <p className="font-medium text-blue-800">Consistency Goal</p>
                    <p className="text-sm text-blue-700">
                      You're on a {insights.streakDays}-day tracking streak! 
                      {insights.streakDays < 7 ? ' Try to track daily for better insights.' :
                       ' Excellent consistency - this helps identify patterns.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                  <div className="icon-brain text-purple-600 mt-1"></div>
                  <div>
                    <p className="font-medium text-purple-800">CBT Suggestion</p>
                    <p className="text-sm text-purple-700">
                      {insights.averageMood < 3 ? 
                        'Consider practicing cognitive reframing when you notice negative thought patterns.' :
                        'Your mood tracking shows positive patterns. Continue with mindfulness practices.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  } catch (error) {
    console.error('ProgressDashboard component error:', error);
    return null;
  }
}