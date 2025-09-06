function ConsentModal({ onConsent }) {
  try {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-name="consent-modal" data-file="components/ConsentModal.js">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                <img 
                  src="https://app.trickle.so/storage/public/images/usr_14b22d54c0000001/50172161-97bf-450f-8874-37b4aba2940c.Untitled design" 
                  alt="CLeO Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Welcome to CLeO</h2>
              <p className="text-[var(--text-secondary)]">Your Mental Health Support Companion</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="emergency-banner">
                <div className="flex items-start">
                  <div className="icon-alert-triangle text-red-500 mr-3 mt-1"></div>
                  <div>
                    <h3 className="font-semibold mb-2">Emergency Notice</h3>
                    <p className="text-sm">
                      If you are in immediate danger or having suicidal thoughts, please contact your local emergency services or a crisis hotline immediately. CLeO is not for emergency situations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Important Disclaimer</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• CLeO provides general wellness support using cognitive behavioral therapy techniques</li>
                  <li>• CLeO is NOT a substitute for professional mental health care</li>
                  <li>• CLeO cannot provide medical diagnoses or treatment</li>
                  <li>• All conversations are stored locally on your device only</li>
                  <li>• Your privacy is protected - no personal data is shared</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">What CLeO Can Help With</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Cognitive reframing exercises</li>
                  <li>• Mood tracking and reflection</li>
                  <li>• Grounding techniques</li>
                  <li>• Behavioral activation suggestions</li>
                  <li>• General wellness check-ins</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex-1"
              >
                I Don't Agree
              </button>
              <button
                onClick={onConsent}
                className="btn-primary flex-1"
              >
                I Understand & Agree
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
              By continuing, you acknowledge that you have read and understood this disclaimer.
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('ConsentModal component error:', error);
    return null;
  }
}