# Voice Recognition Error Handling Rule

When user reports "no-speech" errors in voice recognition:

- Remove alert popups for no-speech errors as they are common and expected
- Implement graceful timeout handling (5-8 seconds maximum)
- Add visual feedback showing listening status
- Handle browser permission issues proactively
- Provide fallback text input when voice fails
- Never show error alerts for expected voice recognition states
- Use console.log instead of alerts for debugging voice issues
- Always clean up timeouts and event handlers properly