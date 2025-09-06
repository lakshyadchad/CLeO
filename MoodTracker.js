function MoodTracker() {
  try {
    const [moodEntries, setMoodEntries] = React.useState([]);
    const [currentMood, setCurrentMood] = React.useState(null);
    const [moodNote, setMoodNote] = React.useState('');
    const chartRef = React.useRef(null);
    const chartInstanceRef = React.useRef(null);

    const moodOptions = [
      { score: 1, emoji: '😢', label: 'Very Sad' },
      { score: 2, emoji: '😔', label: 'Sad' },
      { score: 3, emoji: '😐', label: 'Neutral' },
      { score: 4, emoji: '🙂', label: 'Good' },
      { score: 5, emoji: '😊', label: 'Very Good' }
    ];

    React.useEffect(() => {
      const entries = StorageUtils.getMoodEntries();
      setMoodEntries(entries);
    }, []);

    React.useEffect(() => {
      if (moodEntries.length > 0 && chartRef.current) {
        renderChart();
      }
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
        }
      };
    }, [moodEntries]);

    const renderChart = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      const last30Days = moodEntries.slice(-30);
      
      chartInstanceRef.current = new ChartJS(ctx, {
        type: 'line',
        data: {
          labels: last30Days.map(entry => 
            new Date(entry.timestamp).toLocaleDateString()
          ),
          datasets: [{
            label: 'Mood Score',
            data: last30Days.map(entry => entry.score),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 5,
              ticks: {
                stepSize: 1,
                callback: function(value) {
                  const mood = moodOptions.find(m => m.score === value);
                  return mood ? mood.emoji : value;
                }
              }
            }
          }
        }
      });
    };

    const handleMoodSubmit = async () => {
      if (!currentMood) return;

      const entry = {
        id: Date.now(),
        score: currentMood.score,
        emoji: currentMood.emoji,
        note: moodNote.trim(),
        timestamp: new Date().toISOString()
      };

      try {
        // Save to local storage
        const updatedEntries = [...moodEntries, entry];
        setMoodEntries(updatedEntries);
        StorageUtils.saveMoodEntry(entry);

        // Save to backend if available
        await ApiClient.saveMoodEntry(entry);

        // Reset form
        setCurrentMood(null);
        setMoodNote('');
        
      } catch (error) {
        console.error('Error saving mood entry:', error);
        // Still save locally even if backend fails
        const updatedEntries = [...moodEntries, entry];
        setMoodEntries(updatedEntries);
        StorageUtils.saveMoodEntry(entry);
        setCurrentMood(null);
        setMoodNote('');
      }
    };

    return (
      <div className="space-y-6" data-name="mood-tracker" data-file="components/MoodTracker.js">
        {/* Mood Entry Form */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">How are you feeling right now?</h2>
          
          <div className="grid grid-cols-5 gap-4 mb-6">
            {moodOptions.map((mood) => (
              <button
                key={mood.score}
                onClick={() => setCurrentMood(mood)}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                  currentMood?.score === mood.score
                    ? 'border-[var(--primary-color)] bg-[var(--primary-color)] bg-opacity-10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="mood-emoji">{mood.emoji}</span>
                <span className="text-sm font-medium mt-2">{mood.label}</span>
              </button>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Add a note (optional)
            </label>
            <textarea
              value={moodNote}
              onChange={(e) => setMoodNote(e.target.value)}
              placeholder="What's contributing to your mood today?"
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
              rows="3"
            />
          </div>

          <button
            onClick={handleMoodSubmit}
            disabled={!currentMood}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed w-full"
          >
            Save Mood Entry
          </button>
        </div>

        {/* Mood History Chart */}
        {moodEntries.length > 0 && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Mood Trends</h2>
            <div className="h-64">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        )}

        {/* Recent Entries */}
        {moodEntries.length > 0 && (
          <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Recent Entries</h2>
            <div className="space-y-3">
              {moodEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{entry.emoji}</span>
                    <div>
                      <div className="font-medium">
                        {moodOptions.find(m => m.score === entry.score)?.label}
                      </div>
                      {entry.note && (
                        <div className="text-sm text-[var(--text-secondary)]">{entry.note}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('MoodTracker component error:', error);
    return null;
  }
}