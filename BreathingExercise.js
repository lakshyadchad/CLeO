function BreathingExercise() {
  try {
    const [isActive, setIsActive] = React.useState(false);
    const [phase, setPhase] = React.useState('inhale'); // inhale, hold, exhale
    const [count, setCount] = React.useState(4);
    const [cycle, setCycle] = React.useState(0);
    const [technique, setTechnique] = React.useState('4-4-4');
    const intervalRef = React.useRef(null);

    const techniques = {
      '4-4-4': { inhale: 4, hold: 4, exhale: 4, name: 'Box Breathing' },
      '4-7-8': { inhale: 4, hold: 7, exhale: 8, name: '4-7-8 Technique' },
      '6-2-6': { inhale: 6, hold: 2, exhale: 6, name: 'Calm Breathing' }
    };

    React.useEffect(() => {
      if (isActive) {
        intervalRef.current = setInterval(() => {
          setCount(prev => {
            if (prev > 1) return prev - 1;
            
            const currentTechnique = techniques[technique];
            if (phase === 'inhale') {
              setPhase('hold');
              return currentTechnique.hold;
            } else if (phase === 'hold') {
              setPhase('exhale');
              return currentTechnique.exhale;
            } else {
              setPhase('inhale');
              setCycle(prev => prev + 1);
              return currentTechnique.inhale;
            }
          });
        }, 1000);
      } else {
        clearInterval(intervalRef.current);
      }

      return () => clearInterval(intervalRef.current);
    }, [isActive, phase, technique]);

    const startExercise = () => {
      setIsActive(true);
      setPhase('inhale');
      setCount(techniques[technique].inhale);
      setCycle(0);
    };

    const stopExercise = () => {
      setIsActive(false);
      setPhase('inhale');
      setCount(techniques[technique].inhale);
    };

    const getPhaseInstruction = () => {
      switch (phase) {
        case 'inhale': return 'Breathe In';
        case 'hold': return 'Hold';
        case 'exhale': return 'Breathe Out';
        default: return 'Breathe In';
      }
    };

    const getCircleScale = () => {
      const progress = (techniques[technique][phase] - count) / techniques[technique][phase];
      if (phase === 'inhale') return 0.5 + (progress * 0.5);
      if (phase === 'exhale') return 1 - (progress * 0.5);
      return 1;
    };

    return (
      <div className="space-y-6" data-name="breathing-exercise" data-file="components/BreathingExercise.js">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Cosmic Breathing</h1>
          <p className="text-[var(--text-secondary)]">Connect with the universe through mindful breathing</p>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
              Choose a technique
            </label>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              disabled={isActive}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[var(--primary-color)]"
            >
              {Object.entries(techniques).map(([key, tech]) => (
                <option key={key} value={key}>{tech.name}</option>
              ))}
            </select>
          </div>

          <div className="relative w-64 h-64 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-teal-400 opacity-70 transition-transform duration-1000 ease-in-out shadow-2xl"
              style={{ 
                transform: `scale(${getCircleScale()})`,
                boxShadow: 'inset 0 0 50px rgba(255,255,255,0.3), 0 0 50px rgba(59,130,246,0.5)'
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-[var(--text-primary)] mb-2">
                {count}
              </div>
              <div className="text-lg font-medium text-[var(--text-secondary)]">
                {getPhaseInstruction()}
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4 mb-6">
            {!isActive ? (
              <button onClick={startExercise} className="btn-primary">
                <div className="icon-play text-lg mr-2 inline-block"></div>
                Start Breathing
              </button>
            ) : (
              <button onClick={stopExercise} className="btn-secondary">
                <div className="icon-pause text-lg mr-2 inline-block"></div>
                Stop
              </button>
            )}
          </div>

          {cycle > 0 && (
            <div className="text-sm text-[var(--text-secondary)]">
              Completed cycles: {cycle}
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Breathing Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Find a comfortable, quiet place to sit or lie down</li>
            <li>• Focus on the visual guide and count along</li>
            <li>• If you feel dizzy, return to normal breathing</li>
            <li>• Practice regularly for best results</li>
          </ul>
        </div>
      </div>
    );
  } catch (error) {
    console.error('BreathingExercise component error:', error);
    return null;
  }
}