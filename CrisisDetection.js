function CrisisDetection() {
  try {
    const [isVisible, setIsVisible] = React.useState(false);
    const [userResponse, setUserResponse] = React.useState('');

    const emergencyResources = [
      {
        name: 'National Suicide Prevention Lifeline',
        number: '988',
        description: '24/7 crisis support for suicidal thoughts'
      },
      {
        name: 'Crisis Text Line',
        number: 'Text HOME to 741741',
        description: 'Text-based crisis support'
      },
      {
        name: 'Emergency Services',
        number: '112',
        description: 'For immediate medical emergencies'
      },
      {
        name: 'SAMHSA National Helpline',
        number: '1-800-662-4357',
        description: 'Mental health and substance abuse support'
      }
    ];

    const warningSigns = [
      'Talking about wanting to die or kill oneself',
      'Looking for ways to kill oneself',
      'Talking about feeling hopeless or having no purpose',
      'Talking about feeling trapped or in unbearable pain',
      'Talking about being a burden to others',
      'Increasing use of alcohol or drugs',
      'Acting anxious, agitated, or reckless',
      'Sleeping too little or too much',
      'Withdrawing or feeling isolated',
      'Showing rage or talking about seeking revenge'
    ];

    return (
      <div className="space-y-6" data-name="crisis-detection" data-file="components/CrisisDetection.js">
        <div className="emergency-banner">
          <div className="flex items-start">
            <div className="icon-alert-triangle text-red-500 mr-3 mt-1"></div>
            <div>
              <h2 className="text-xl font-bold mb-2">Crisis Support Resources</h2>
              <p className="text-sm mb-4">
                If you or someone you know is in crisis, please reach out for help immediately. 
                You are not alone, and support is available 24/7.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-red-700 mb-4">Emergency Contacts</h3>
            <div className="space-y-4">
              {emergencyResources.map((resource, index) => (
                <div key={index} className="border-l-4 border-red-400 pl-4">
                  <div className="font-semibold text-red-800">{resource.name}</div>
                  <div className="text-lg font-bold text-red-900">{resource.number}</div>
                  <div className="text-sm text-red-700">{resource.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-orange-700 mb-4">Warning Signs</h3>
            <ul className="space-y-2 text-sm">
              {warningSigns.slice(0, 6).map((sign, index) => (
                <li key={index} className="flex items-start">
                  <div className="icon-alert-circle text-orange-500 mr-2 mt-0.5 text-xs"></div>
                  <span className="text-orange-800">{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">How to Help Someone in Crisis</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">DO:</h4>
              <ul className="space-y-1">
                <li>• Listen without judgment</li>
                <li>• Take them seriously</li>
                <li>• Help them connect with professional help</li>
                <li>• Stay with them or ensure they're not alone</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">DON'T:</h4>
              <ul className="space-y-1">
                <li>• Promise to keep it secret</li>
                <li>• Leave them alone if at immediate risk</li>
                <li>• Argue or challenge their feelings</li>
                <li>• Try to solve everything yourself</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error('CrisisDetection component error:', error);
    return null;
  }
}