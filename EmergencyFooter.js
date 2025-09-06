function EmergencyFooter() {
  try {
    return (
      <footer className="bg-gray-900 border-t border-gray-700 shadow-lg mt-8" data-name="emergency-footer" data-file="components/EmergencyFooter.js">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="icon-phone text-red-400 mr-3 text-xl"></div>
            <h3 className="font-semibold text-white text-lg">Crisis Resources - Available 24/7</h3>
          </div>
          
          <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <p className="font-medium text-white mb-2">If you're having thoughts of suicide or self-harm:</p>
              <ul className="space-y-1">
                <li>• <strong className="text-red-400">National Suicide Prevention Lifeline:</strong> 988</li>
                <li>• <strong className="text-red-400">Crisis Text Line:</strong> Text HOME to 741741</li>
                <li>• <strong className="text-red-400">Emergency Services:</strong> 112</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-white mb-2">Additional Support:</p>
              <ul className="space-y-1">
                <li>• <strong className="text-orange-400">SAMHSA Helpline:</strong> 1-800-662-4357</li>
                <li>• <strong className="text-orange-400">Veterans Crisis Line:</strong> 1-800-273-8255</li>
                <li>• <strong className="text-orange-400">LGBTQ+ Support:</strong> 1-866-488-7386</li>
              </ul>
            </div>
          </div>
          
          <p className="mt-4 text-xs text-gray-400 text-center sm:text-left">
            Remember: CLeO is a support tool and cannot replace professional mental health care. 
            If you're in crisis, please reach out to trained professionals immediately.
          </p>
        </div>
      </footer>
    );
  } catch (error) {
    console.error('EmergencyFooter component error:', error);
    return null;
  }
}
