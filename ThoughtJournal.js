function ThoughtJournal() {
  try {
    const [entries, setEntries] = React.useState([]);
    const [currentEntry, setCurrentEntry] = React.useState({
      situation: '',
      automatic_thought: '',
      emotion: '',
      evidence_for: '',
      evidence_against: '',
      balanced_thought: ''
    });
    const [isEditing, setIsEditing] = React.useState(false);

    React.useEffect(() => {
      const savedEntries = StorageUtils.getThoughtEntries();
      setEntries(savedEntries);
    }, []);

    const handleSave = () => {
      if (!currentEntry.situation.trim() || !currentEntry.automatic_thought.trim()) {
        return;
      }

      const entry = {
        ...currentEntry,
        id: Date.now(),
        timestamp: new Date().toISOString()
      };

      const updatedEntries = [...entries, entry];
      setEntries(updatedEntries);
      StorageUtils.saveThoughtEntry(entry);
      
      setCurrentEntry({
        situation: '',
        automatic_thought: '',
        emotion: '',
        evidence_for: '',
        evidence_against: '',
        balanced_thought: ''
      });
      setIsEditing(false);
    };

    const handleDelete = (id) => {
      const updatedEntries = entries.filter(entry => entry.id !== id);
      setEntries(updatedEntries);
      StorageUtils.deleteThoughtEntry(id);
    };

    return (
      <div className="space-y-6" data-name="thought-journal" data-file="components/ThoughtJournal.js">
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Thought Journal</h1>
          <p className="text-[var(--text-secondary)]">Challenge negative thoughts using CBT techniques</p>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">New Entry</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-secondary"
            >
              {isEditing ? 'Cancel' : 'Add Entry'}
            </button>
          </div>

          {isEditing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Situation *</label>
                <textarea
                  value={currentEntry.situation}
                  onChange={(e) => setCurrentEntry({...currentEntry, situation: e.target.value})}
                  placeholder="What happened? Where were you?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Automatic Thought *</label>
                <textarea
                  value={currentEntry.automatic_thought}
                  onChange={(e) => setCurrentEntry({...currentEntry, automatic_thought: e.target.value})}
                  placeholder="What went through your mind?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Emotion & Intensity (1-10)</label>
                <input
                  value={currentEntry.emotion}
                  onChange={(e) => setCurrentEntry({...currentEntry, emotion: e.target.value})}
                  placeholder="e.g., Anxious (8/10)"
                  className="w-full p-3 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Evidence For Thought</label>
                <textarea
                  value={currentEntry.evidence_for}
                  onChange={(e) => setCurrentEntry({...currentEntry, evidence_for: e.target.value})}
                  placeholder="What supports this thought?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Evidence Against Thought</label>
                <textarea
                  value={currentEntry.evidence_against}
                  onChange={(e) => setCurrentEntry({...currentEntry, evidence_against: e.target.value})}
                  placeholder="What contradicts this thought?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Balanced Thought</label>
                <textarea
                  value={currentEntry.balanced_thought}
                  onChange={(e) => setCurrentEntry({...currentEntry, balanced_thought: e.target.value})}
                  placeholder="What's a more balanced way to think about this?"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows="2"
                />
              </div>

              <button onClick={handleSave} className="btn-primary w-full">
                Save Entry
              </button>
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <div className="space-y-4">
            {entries.slice(-5).reverse().map((entry) => (
              <div key={entry.id} className="bg-white bg-opacity-95 backdrop-blur-sm rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-sm text-[var(--text-secondary)]">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <div className="icon-trash text-lg"></div>
                  </button>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div><strong>Situation:</strong> {entry.situation}</div>
                  <div><strong>Thought:</strong> {entry.automatic_thought}</div>
                  {entry.emotion && <div><strong>Emotion:</strong> {entry.emotion}</div>}
                  {entry.balanced_thought && <div><strong>Balanced View:</strong> {entry.balanced_thought}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('ThoughtJournal component error:', error);
    return null;
  }
}