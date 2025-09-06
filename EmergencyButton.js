function EmergencyButton() {
  try {
    const [isOpen, setIsOpen] = React.useState(false);
    const [emergencyContacts, setEmergencyContacts] = React.useState([]);
    const [isEditingContacts, setIsEditingContacts] = React.useState(false);
    const [newContact, setNewContact] = React.useState({ name: '', phone: '' });
    const [locationConsent, setLocationConsent] = React.useState(false);
    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
      const loadData = async () => {
        const currentUser = await AuthUtils.getCurrentUser();
        setUser(currentUser);
        
        if (currentUser) {
          await loadEmergencyContacts(currentUser.id);
        }
        
        const consent = StorageUtils.getLocationConsent();
        setLocationConsent(consent);
      };
      
      loadData();
    }, []);

    const loadEmergencyContacts = async (userId) => {
      try {
        const contacts = await trickleListObjects(`emergency_contacts:${userId}`, 100, false);
        setEmergencyContacts(contacts.items.map(item => ({
          ...item.objectData,
          dbObjectId: item.objectId
        })));
      } catch (error) {
        console.error('Error loading emergency contacts:', error);
        setEmergencyContacts([]);
      }
    };

    const shareLocation = () => {
      if (emergencyContacts.length === 0) {
        alert("⚠️ No emergency contacts found!\n\nPlease add emergency contacts first before sharing your location.\n\nClick 'Edit' to add contacts now.");
        return;
      }

      if (!locationConsent) {
        const consent = confirm("Share your current live location with emergency contacts via WhatsApp? This helps responders find you quickly.");
        if (consent) {
          StorageUtils.setLocationConsent(true);
          setLocationConsent(true);
        } else {
          return;
        }
      }
      
      // Check for geolocation support
      if (!navigator.geolocation) {
        alert("❌ Location services are not supported on this device.\n\nPlease manually share your address with emergency contacts or call 112 directly.");
        return;
      }

      // Check if running on HTTPS (required for geolocation)
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        alert("❌ Location services require a secure connection (HTTPS).\n\nPlease use the crisis hotlines: 988 or 112");
        return;
      }

      // Show loading feedback
      const originalText = document.querySelector('[data-location-button]')?.textContent;
      const button = document.querySelector('[data-location-button]');
      if (button) button.textContent = 'Getting location...';

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy, altitude, heading, speed } = position.coords;
          const timestamp = new Date(position.timestamp);
          
          console.log('Live location obtained:', { latitude, longitude, accuracy, timestamp });
          
          const locationText = `🚨 EMERGENCY ALERT 🚨\n\nI NEED IMMEDIATE HELP!\n\nLIVE LOCATION (${timestamp.toLocaleString()}):\nhttps://maps.google.com/?q=${latitude},${longitude}\n\nPrecise Coordinates:\nLatitude: ${latitude.toFixed(8)}\nLongitude: ${longitude.toFixed(8)}\nAccuracy: ±${Math.round(accuracy)} meters\n${altitude ? `Altitude: ${Math.round(altitude)}m\n` : ''}${heading ? `Heading: ${Math.round(heading)}°\n` : ''}${speed ? `Speed: ${Math.round(speed)} m/s\n` : ''}\nTimestamp: ${timestamp.toISOString()}\n\nPLEASE SEND HELP OR CALL EMERGENCY SERVICES IMMEDIATELY!\n\nThis is my current live position - not cached data.`;
          
          // Reset button text
          if (button) button.textContent = originalText;
          
          // Send to each emergency contact via WhatsApp
          emergencyContacts.forEach((contact, index) => {
            setTimeout(() => {
              const whatsappUrl = `https://wa.me/${contact.phone_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(locationText)}`;
              window.open(whatsappUrl, `_blank${index}`);
            }, index * 1000); // Stagger opens by 1 second
          });

          // Also copy to clipboard as backup
          navigator.clipboard.writeText(locationText).then(() => {
            alert(`✅ EMERGENCY LOCATION SENT!\n\nWhatsApp messages opened to ${emergencyContacts.length} contact(s):\n${emergencyContacts.map(c => `• ${c.contact_name}`).join('\n')}\n\nAccuracy: ±${Math.round(accuracy)}m\nTime: ${timestamp.toLocaleString()}\n\nLocation also copied to clipboard as backup!`);
          }).catch(() => {
            alert(`✅ EMERGENCY LOCATION SENT!\n\nWhatsApp messages opened to ${emergencyContacts.length} contact(s):\n${emergencyContacts.map(c => `• ${c.contact_name}`).join('\n')}\n\nAccuracy: ±${Math.round(accuracy)}m\nTime: ${timestamp.toLocaleString()}`);
          });
        },
        (error) => {
          // Reset button text
          if (button) button.textContent = originalText;
          
          // Better error logging for debugging
          console.error('Geolocation error details:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.PERMISSION_DENIED,
            POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
            TIMEOUT: error.TIMEOUT
          });
          
          let errorMessage = "❌ Cannot get your live location.\n\n";
          
          // More robust error code checking
          if (error.code === 1 || error.code === error.PERMISSION_DENIED) {
            errorMessage += "LOCATION ACCESS DENIED\n\n• Please enable location services in your browser\n• Click the location icon in address bar\n• Allow location access for this site\n• Try refreshing the page\n\nFor emergencies, call 112 directly!";
          } else if (error.code === 2 || error.code === error.POSITION_UNAVAILABLE) {
            errorMessage += "LOCATION UNAVAILABLE\n\n• GPS signal may be weak\n• Try going outside or near a window\n• Check if location services are enabled\n• Ensure you have internet connection\n\nFor emergencies, call 112 immediately!";
          } else if (error.code === 3 || error.code === error.TIMEOUT) {
            errorMessage += "LOCATION TIMEOUT\n\n• GPS is taking too long to respond\n• Try moving to an area with better signal\n• Ensure location services are enabled\n• Check your internet connection\n\nFor emergencies, call 112 now!";
          } else {
            errorMessage += `UNKNOWN LOCATION ERROR (Code: ${error.code})\n\nError: ${error.message}\n\n• Try refreshing the page\n• Check browser permissions\n• Ensure location services are on\n\nFor emergencies, call 112 immediately!`;
          }
          
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0  // Always get fresh location, no cached data
        }
      );
    };

    const addContact = async () => {
      if (newContact.name.trim() && newContact.phone.trim() && user) {
        try {
          const contactData = {
            id: 'contact_' + Date.now(),
            user_id: user.id,
            contact_name: newContact.name.trim(),
            phone_number: newContact.phone.trim(),
            created_at: new Date().toISOString()
          };

          await trickleCreateObject(`emergency_contacts:${user.id}`, contactData);
          await loadEmergencyContacts(user.id);
          setNewContact({ name: '', phone: '' });
        } catch (error) {
          console.error('Error adding contact:', error);
          alert('Failed to add contact. Please try again.');
        }
      }
    };

    const deleteContact = async (contact) => {
      if (user && confirm(`Delete ${contact.contact_name}?`)) {
        try {
          // Find the object in database and delete using object ID
          const contacts = await trickleListObjects(`emergency_contacts:${user.id}`, 100, false);
          const contactToDelete = contacts.items.find(item => 
            item.objectData.id === contact.id
          );
          
          if (contactToDelete) {
            await trickleDeleteObject(`emergency_contacts:${user.id}`, contactToDelete.objectId);
            await loadEmergencyContacts(user.id);
          }
        } catch (error) {
          console.error('Error deleting contact:', error);
          alert('Failed to delete contact. Please try again.');
        }
      }
    };

    return (
      <>
        {/* Emergency Button - Fixed Position */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-20 right-4 z-40 bg-red-600 hover:bg-red-700 text-white p-2 sm:p-3 rounded-full shadow-lg transition-all"
          title="Emergency Help"
        >
          <div className="icon-phone text-lg sm:text-xl"></div>
        </button>

        {/* Emergency Modal */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" data-name="emergency-modal" data-file="components/EmergencyButton.js">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-red-700">Emergency Help</h2>
                  <button onClick={() => setIsOpen(false)} className="text-gray-500">
                    <div className="icon-x text-xl"></div>
                  </button>
                </div>

                {/* Crisis Numbers */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Crisis Hotlines</h3>
                  <div className="space-y-2">
                    <a href="tel:988" className="block p-3 bg-red-50 rounded-lg">
                      <div className="font-medium">Suicide Prevention: 988</div>
                    </a>
                    <a href="tel:112" className="block p-3 bg-red-50 rounded-lg">
                      <div className="font-medium">Emergency Services: 112</div>
                    </a>
                  </div>
                </div>

                {/* Personal Contacts */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold">Emergency Contacts</h3>
                    <button onClick={() => setIsEditingContacts(!isEditingContacts)} className="text-sm text-blue-600">
                      {isEditingContacts ? 'Done' : 'Edit'}
                    </button>
                  </div>
                  
                  {isEditingContacts && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <input
                        value={newContact.name}
                        onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                        placeholder="Contact name (e.g., John Doe)"
                        className="w-full p-2 border rounded mb-2 text-sm"
                      />
                      <input
                        value={newContact.phone}
                        onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        placeholder="Phone with country code (e.g., +1234567890)"
                        className="w-full p-2 border rounded mb-2 text-sm"
                        type="tel"
                      />
                      <button onClick={addContact} className="btn-primary text-sm">Add Contact</button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <a href={`tel:${contact.phone_number}`} className="flex-1">
                          <div className="font-medium">{contact.contact_name}</div>
                          <div className="text-sm text-gray-600">{contact.phone_number}</div>
                        </a>
                        {isEditingContacts && (
                          <button
                            onClick={() => deleteContact(contact)}
                            className="text-red-500 hover:text-red-700 ml-2"
                          >
                            <div className="icon-trash text-sm"></div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button 
                    onClick={shareLocation} 
                    data-location-button="true"
                    className="w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="icon-map-pin text-blue-600 mr-2"></div>
                      <div>
                        <div className="font-medium text-blue-800">Share My Live Location</div>
                        <div className="text-sm text-blue-600">Get current GPS coordinates (not cached)</div>
                      </div>
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      const manualMessage = "🚨 EMERGENCY ALERT 🚨\n\nI NEED IMMEDIATE HELP!\n\nMy approximate location: [Please describe where you are]\n\nPLEASE SEND HELP OR CALL EMERGENCY SERVICES IMMEDIATELY!";
                      navigator.clipboard.writeText(manualMessage).then(() => {
                        alert("📋 Emergency message copied to clipboard!\n\nPaste this message and add your location details before sending to emergency contacts.");
                      }).catch(() => {
                        alert("Manual emergency message:\n\n" + manualMessage + "\n\nCopy this text and add your location details before sending.");
                      });
                    }}
                    className="w-full p-3 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="icon-edit text-orange-600 mr-2"></div>
                      <div>
                        <div className="font-medium text-orange-800">Manual Emergency Alert</div>
                        <div className="text-sm text-orange-600">Copy message template (add your location)</div>
                      </div>
                    </div>
                  </button>
                </div>
                </div>

                {/* Grounding Instructions */}
                <div>
                  <h3 className="font-semibold mb-3">Right Now: 5-4-3-2-1 Grounding</h3>
                  <div className="text-sm space-y-1 text-gray-700">
                    <div>• 5 things you can SEE</div>
                    <div>• 4 things you can TOUCH</div>
                    <div>• 3 things you can HEAR</div>
                    <div>• 2 things you can SMELL</div>
                    <div>• 1 thing you can TASTE</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('EmergencyButton component error:', error);
    return null;
  }
}