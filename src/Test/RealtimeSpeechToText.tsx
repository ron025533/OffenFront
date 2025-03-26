import { useState, useEffect, useRef } from 'react';
import './SpeechToText.css';
import { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from '../interfaces';
import { LANGUAGES } from '../constant';

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default function MultilingualSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [permissionState, setPermissionState] = useState<PermissionState | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en-US');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const noSpeechDetectedTimerRef = useRef<number | null>(null);
  const previousTranscriptRef = useRef<string>('');

  // Check microphone permission
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(permissionStatus => {
          setPermissionState(permissionStatus.state);
          
          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
          };
        })
        .catch(err => {
          console.log("Permission API not supported", err);
        });
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();
      
      // Configure for real-time results
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage; // Set the initial language
      
      // Handle results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        // Reset the no speech timer whenever we get results
        if (noSpeechDetectedTimerRef.current) {
          window.clearTimeout(noSpeechDetectedTimerRef.current);
          noSpeechDetectedTimerRef.current = null;
        }

        let interimTranscript = '';
        let finalTranscript = previousTranscriptRef.current || '';
        
        // Process all results, building interim and final transcripts
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            // Add to final transcript only if it's new content
            finalTranscript = finalTranscript ? finalTranscript + ' ' + transcriptText : transcriptText;
            previousTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcriptText;
          }
        }
        
        // Display final transcript plus any interim results
        setTranscript(finalTranscript + (interimTranscript ? ' ' + interimTranscript : ''));
      };

      // Various event handlers for better debugging
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setStatusMessage('No speech detected. Please try speaking louder or checking your microphone.');
        } else if (event.error === 'audio-capture') {
          setErrorMessage('No microphone detected. Please check your device settings.');
        } else if (event.error === 'network') {
          setErrorMessage('Network error occurred. Please check your internet connection.');
        } else if (event.error === 'aborted') {
          setStatusMessage('Recognition was aborted.');
        } else if (event.error === 'language-not-supported') {
          setErrorMessage(`The selected language (${selectedLanguage}) is not supported. Please try another language.`);
        } else {
          setErrorMessage(`Error occurred: ${event.error}`);
        }
        
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        console.log("Speech recognition ended");
        
        // Clear any pending restart timer
        if (restartTimerRef.current) {
          window.clearTimeout(restartTimerRef.current);
        }
        
        // If we're supposed to be listening, restart after a short delay
        if (isListening && recognitionRef.current) {
          setStatusMessage('Restarting recognition...');
          
          restartTimerRef.current = window.setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setStatusMessage('Listening...');
            } catch (error) {
              console.error("Failed to restart recognition:", error);
              setErrorMessage(`Failed to restart recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
              setIsListening(false);
            }
          }, 300);
        } else {
          setIsListening(false);
          setStatusMessage('');
        }
      };

      // Add additional event handlers for debugging
      recognitionRef.current.onstart = () => {
        console.log("Recognition started successfully");
        setStatusMessage('Listening...');
        
        // Start a timer to detect if no speech is being detected
        noSpeechDetectedTimerRef.current = window.setTimeout(() => {
          if (isListening) {
            setStatusMessage('No speech detected yet. Please check your microphone or speak louder.');
          }
        }, 5000);
      };

      recognitionRef.current.onaudiostart = () => {
        console.log("Audio capturing started");
      };

      recognitionRef.current.onsoundstart = () => {
        console.log("Sound detected");
      };

      recognitionRef.current.onspeechstart = () => {
        console.log("Speech started");
        setStatusMessage('Speech detected!');
      };

      recognitionRef.current.onspeechend = () => {
        console.log("Speech ended");
      };

      recognitionRef.current.onsoundend = () => {
        console.log("Sound ended");
      };

      recognitionRef.current.onaudioend = () => {
        console.log("Audio capturing ended");
      };

      recognitionRef.current.onnomatch = () => {
        console.log("No match found");
        setStatusMessage('No match found for speech. Please try again.');
      };
    }

    return () => {
      // Clean up all timers and recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recognition:", e);
        }
      }
      
      if (restartTimerRef.current) {
        window.clearTimeout(restartTimerRef.current);
      }
      
      if (noSpeechDetectedTimerRef.current) {
        window.clearTimeout(noSpeechDetectedTimerRef.current);
      }
    };
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      const wasListening = isListening;
      
      // Need to stop recognition to change language
      if (wasListening) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Error stopping recognition to change language:", e);
        }
      }
      
      // Set the new language
      recognitionRef.current.lang = selectedLanguage;
      console.log(`Language changed to: ${selectedLanguage}`);
      
      // Restart if we were listening
      if (wasListening) {
        try {
          recognitionRef.current.start();
          setStatusMessage(`Listening in ${LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}...`);
        } catch (error) {
          console.error("Error restarting recognition after language change:", error);
          setErrorMessage(`Error restarting speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
          setIsListening(false);
        }
      }
    }
  }, [selectedLanguage]);

  // Update behavior when isListening changes
  useEffect(() => {
    if (!recognitionRef.current) return;
    
    if (isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error("Error starting recognition:", error);
        setErrorMessage(`Error starting speech recognition: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsListening(false);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn("Error stopping recognition:", e);
      }
    }
  }, [isListening]);

  const toggleListening = () => {
    if (permissionState === 'denied') {
      setErrorMessage('Microphone access is blocked. Please allow microphone access in your browser settings.');
      return;
    }
    
    setErrorMessage('');
    setStatusMessage('');
    
    if (isListening) {
      setIsListening(false);
    } else {
      // When starting fresh, clear the transcript
      setTranscript('');
      previousTranscriptRef.current = '';
      setIsListening(true);
      
      // If permission state is not known or prompted, we'll request it by attempting to start
      if (!recognitionRef.current) {
        setErrorMessage('Speech recognition is not initialized properly. Please refresh the page.');
      }
    }
  };

  const clearTranscript = () => {
    setTranscript('');
    previousTranscriptRef.current = '';
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  const addChapter = () => {
    const textToAdd = '\n Chapitre 1';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }

  const addTitle = () => {
    const textToAdd = '\n I.';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }

  const addSubtitle = () => {
    const textToAdd = '\n 1.';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }

  const addParagraph = () => {
    const textToAdd = '.\n';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }


  const addExplanation = () => {
    const textToAdd = '.\n **';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }

  const addJokes = () => {
    const textToAdd = '.\n --';
    setTranscript(prev => {
      const newText = prev ? `${prev} ${textToAdd}` : textToAdd;
      previousTranscriptRef.current = newText;
      return newText;
    });
  }
  return (
    <div className="speech-container">
      <h2 className="speech-title">Multilingual Speech to Text</h2>
      
      <div className="controls">
        <div className="language-selector">
          <label htmlFor="language-select">Language:</label>
          <select 
            id="language-select" 
            value={selectedLanguage} 
            onChange={handleLanguageChange}
            className="language-select"
          >
            {LANGUAGES.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className='title-group'>
          <button type='button' onClick={addChapter}>Chapitre</button>
          <button type='button' onClick={addTitle}>Titre</button>
          <button type='button' onClick={addSubtitle}>Sous-titre</button>
          <button type='button' onClick={addParagraph}>Paragraphe</button>
          <button type='button' onClick={addExplanation}>Explication</button>
          <button type='button' onClick={addJokes}>Blague</button>
        </div>
        
        <div className="button-group">
          <button 
            onClick={toggleListening} 
            className={`speech-button ${isListening ? 'listening' : ''}`}
          >
            {isListening ? 'Stop Listening' : 'Start Listening'}
          </button>
          
          <button 
            onClick={clearTranscript} 
            className="clear-button"
            disabled={!transcript}
          >
            Clear Text
          </button>
        </div>
      </div>
      
      {permissionState === 'denied' && (
        <div className="speech-error">
          Microphone access is blocked in your browser settings. Please allow access to use this feature.
        </div>
      )}
      
      {errorMessage && (
        <div className="speech-error">
          {errorMessage}
        </div>
      )}
      
      {statusMessage && !errorMessage && (
        <div className="speech-status">
          {statusMessage}
        </div>
      )}
      
      <div className="transcript-container">
        <h3 className="transcript-title">Transcript ({LANGUAGES.find(l => l.code === selectedLanguage)?.name}):</h3>
        <div className={`transcript-box ${isListening ? 'active' : ''}`}>
          {transcript || (isListening ? 'Listening...' : 'Click "Start Listening" to begin')}
        </div>
      </div>
      
      {isListening && (
        <div className="recording-indicator">
          <div className="recording-dot"></div>
          Recording...
        </div>
      )}
      
      <div className="debug-info">
        <details>
          <summary>Troubleshooting</summary>
          <ul>
            <li>Microphone permission: {permissionState || 'unknown'}</li>
            <li>Current language: {LANGUAGES.find(l => l.code === selectedLanguage)?.name || selectedLanguage}</li>
            <li>
              <strong>If not working:</strong>
              <ul>
                <li>Check if your microphone is working in other applications</li>
                <li>Make sure you've granted microphone permission to the browser</li>
                <li>Try speaking louder or moving closer to the microphone</li>
                <li>Try a different language if the current one isn't being recognized</li>
                <li>Try refreshing the page</li>
                <li>Try a different browser (Chrome works best for speech recognition)</li>
              </ul>
            </li>
          </ul>
        </details>
      </div>
    </div>
  );
}