function GoalTracker() {
  try {
    const [goals, setGoals] = React.useState([]);
    const [newGoal, setNewGoal] = React.useState('');
    const [goalType, setGoalType] = React.useState('daily');


    React.useEffect(() => {
      const savedGoals = StorageUtils.getGoals();
      setGoals(savedGoals);
    }, []);



    const addGoal = () => {
      if (!newGoal.trim()) return;

      const goal = {
        id: Date.now(),
        text: newGoal.trim(),
        type: goalType,
        completed: false,
        createdAt: new Date().toISOString(),
        completedDates: []
      };

      const updatedGoals = [...goals, goal];
      setGoals(updatedGoals);
      StorageUtils.saveGoal(goal);
      setNewGoal('');
    };

    const toggleGoal = (id) => {
      const today = new Date().toDateString();
      const updatedGoals = goals.map(goal => {
        if (goal.id === id) {
          const isCompletedToday = goal.completedDates.includes(today);
          const newCompletedDates = isCompletedToday
            ? goal.completedDates.filter(date => date !== today)
            : [...goal.completedDates, today];
          
          return {
            ...goal,
            completed: !isCompletedToday,
            completedDates: newCompletedDates
          };
        }
        return goal;
      });
      
      setGoals(updatedGoals);
      StorageUtils.updateGoals(updatedGoals);
    };

    const deleteGoal = (id) => {
      const updatedGoals = goals.filter(goal => goal.id !== id);
      setGoals(updatedGoals);
      StorageUtils.deleteGoal(id);
    };

    const getStreak = (goal) => {
      const dates = goal.completedDates.sort().reverse();
      let streak = 0;
      let currentDate = new Date();
      
      for (const dateStr of dates) {
        const date = new Date(dateStr);
        const diffDays = Math.floor((currentDate - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === streak) {
          streak++;
          currentDate = date;
        } else {
          break;
        }
      }
      
      return streak;
    };

    return (
      <div className="space-y-6" data-name="goal-tracker" data-file="components/GoalTracker.js">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Wellness Goals</h1>
          <p className="text-[var(--text-secondary)]">Set and track your mental health goals</p>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Add New Goal</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              placeholder="e.g., Practice mindfulness for 10 minutes"
              className="flex-1 p-3 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && addGoal()}
            />
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="p-3 border rounded-lg"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <button onClick={addGoal} className="btn-primary">
              Add Goal
            </button>
          </div>
        </div>

        {goals.length > 0 && (
          <div className="space-y-4">
            {goals.map((goal) => {
              const today = new Date().toDateString();
              const isCompletedToday = goal.completedDates.includes(today);
              const streak = getStreak(goal);
              
              return (
                <div key={goal.id} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => toggleGoal(goal.id)}
                        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isCompletedToday
                            ? 'bg-[var(--primary-color)] border-[var(--primary-color)] text-white'
                            : 'border-gray-300 hover:border-[var(--primary-color)]'
                        }`}
                      >
                        {isCompletedToday && <div className="icon-check text-sm"></div>}
                      </button>
                      
                      <div className="flex-1">
                        <div className={`font-medium ${isCompletedToday ? 'text-green-700' : 'text-[var(--text-primary)]'}`}>
                          {goal.text}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-[var(--text-secondary)]">
                          <span className="capitalize">{goal.type}</span>
                          <span>• {goal.completedDates.length} times completed</span>
                          {streak > 0 && <span>• {streak} day streak</span>}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <div className="icon-trash text-lg"></div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {goals.length === 0 && (
          <div className="bg-gray-50 rounded-xl p-12 text-center">
            <div className="icon-target text-4xl text-gray-300 mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Goals Yet</h3>
            <p className="text-gray-500">Start by adding your first wellness goal above</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('GoalTracker component error:', error);
    return null;
  }
}