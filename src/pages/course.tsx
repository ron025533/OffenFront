import "./course.css";
import {
  LuUsersRound,
  LuBold,
  LuLaugh,
  LuMessageSquare,
  LuMessageSquareQuote,
  LuType,
  LuListOrdered,
  LuPilcrow,
  LuItalic,
  LuUnderline,
  LuMic,
  LuMicOff,
} from "react-icons/lu";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Question from "../components/question/Question";
import Userlist from "../components/user-list/userlist";
import Offen from "../assets/Offen.svg";

import {
  Editor,
  EditorState,
  ContentState,
  SelectionState,
  RichUtils,
  Modifier,
} from "draft-js";

import "draft-js/dist/Draft.css";
import {
  SpeechRecognition,
  SpeechRecognitionErrorEvent,
  SpeechRecognitionEvent,
} from "../interfaces";
import { LANGUAGES } from "../constant";
import { toRoman } from "../utils";
import QuestionInput from "../components/question/question-form";
import { useNavigate, useParams } from "react-router-dom";
import { useRoomContext } from "../hooks/RoomContext";
import socketService from "../services/chatService";
import QuestionList from "../components/question/question-list";
import { TNote, TNoteResponse, TNoteUpdate, UserRole } from "../types";
import { getNoteWithId, postNote, updateNote } from "../services/api";
// import {} from

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export const Course = () => {
  const { noteId } = useParams();
  const { room, Role, setQuestions } = useRoomContext();
  const to = useNavigate();
  const navigate = useNavigate();

  const [TextToDisplay, setTextToDisplay] = useState("");

  // Editor state
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editorRef = useRef(null);

  // Speech recognition state
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [permissionState, setPermissionState] =
    useState<PermissionState | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const noSpeechDetectedTimerRef = useRef<number | null>(null);
  const previousTranscriptRef = useRef<string>("");

  // UI state
  const [selectedItem, setSelectedItem] = useState<string>("Paragraphe");
  const [isQuestionsDisplayed, setIsQuestionsDisplayed] = useState(false);
  const [isUsersDisplayed, setIsUsersDisplayed] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [activeStyles, setActiveStyles] = useState<Set<string>>(new Set());

  // Counter state for incrementation
  const [chapterCount, setChapterCount] = useState(1);
  const [titleCount, setTitleCount] = useState(1);
  const [subtitleCount, setSubtitleCount] = useState(1);

  //user list
  const [userList, setUserList] = useState<string[]>([]);

  const [dbNote, setdbNote] = useState<TNoteResponse>();

  const [courseTitle, setCourseTitle] = useState("");
  const elementRef = useRef(null);

  // Initialize editor styles
  useEffect(() => {
    const currentStyles = editorState.getCurrentInlineStyle();
    const newActiveStyles = new Set<string>();

    if (currentStyles.has("BOLD")) newActiveStyles.add("BOLD");
    if (currentStyles.has("ITALIC")) newActiveStyles.add("ITALIC");
    if (currentStyles.has("UNDERLINE")) newActiveStyles.add("UNDERLINE");

    setActiveStyles(newActiveStyles);
  }, [editorState]);

  // Toggle questions panel
  const toggleDisplay = () => {
    setIsQuestionsDisplayed((prevState) => !prevState);
    if (isUsersDisplayed) {
      setIsUsersDisplayed(false);
    }
  };

  const toggleDisplayUser = () => {
    setIsUsersDisplayed((prevState) => !prevState);
    setIsQuestionsDisplayed(false);
  };

  // Animation for questions panel
  useEffect(() => {
    if (isQuestionsDisplayed && elementRef.current) {
      gsap.fromTo(
        elementRef.current,
        { opacity: 0, width: "0%" },
        { opacity: 1, width: "24%", duration: 0.1, ease: "power2.out" }
      );
    }
  }, [isQuestionsDisplayed]);

  // Rich text editing functions
  const toggleInlineStyle = (style: string) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));

    if (editorRef.current) {
      setTimeout(() => {
        if (editorRef.current) {
          // @ts-ignore
          editorRef.current.focus();
        }
      }, 0);
    }
  };

  const handleKeyCommand = (command: string): DraftHandleValue => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const focusEditor = () => {
    if (editorRef.current) {
      // @ts-ignore
      editorRef.current.focus();
    }
  };

  // Speech recognition initialization
  useEffect(() => {
    // Check microphone permission
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "microphone" as PermissionName })
        .then((permissionStatus) => {
          setPermissionState(permissionStatus.state);

          permissionStatus.onchange = () => {
            setPermissionState(permissionStatus.state);
          };
        })
        .catch((err) => {
          console.log("Permission API not supported", err);
        });
    }

    // Check if browser supports SpeechRecognition
    if (!window.webkitSpeechRecognition && !window.SpeechRecognition) {
      setErrorMessage("Speech recognition is not supported in this browser.");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionAPI) {
      recognitionRef.current = new SpeechRecognitionAPI();

      // Configure for real-time results
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = selectedLanguage;

      // Handle recognition results
      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        // Reset the no speech timer whenever we get results
        if (noSpeechDetectedTimerRef.current) {
          window.clearTimeout(noSpeechDetectedTimerRef.current);
          noSpeechDetectedTimerRef.current = null;
        }

        let interimTranscript = "";
        let finalTranscript = previousTranscriptRef.current || "";

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            // Add to final transcript
            finalTranscript = finalTranscript
              ? finalTranscript + " " + transcriptText
              : transcriptText;
            previousTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcriptText;
          }
        }

        // Update both the internal transcript state and the editor
        setTranscript(
          finalTranscript + (interimTranscript ? " " + interimTranscript : "")
        );

        // Update the editor with the new complete transcript
        const newContentState = ContentState.createFromText(
          finalTranscript + (interimTranscript ? " " + interimTranscript : "")
        );

        const newEditorState = EditorState.push(
          editorState,
          newContentState,
          "insert-characters"
        );

        setEditorState(newEditorState);

        if (room && Role === 'Teacher') {
          socketService.broadcastSpeech(
            room,
            finalTranscript + (interimTranscript ? " " + interimTranscript : "")
          );
        }
      };

      // Event handlers for speech recognition
      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);

        if (event.error === "not-allowed") {
          setErrorMessage(
            "Microphone access denied. Please allow microphone access in your browser settings."
          );
        } else if (event.error === "no-speech") {
          setStatusMessage(
            "No speech detected. Please try speaking louder or checking your microphone."
          );
        } else if (event.error === "audio-capture") {
          setErrorMessage(
            "No microphone detected. Please check your device settings."
          );
        } else if (event.error === "network") {
          setErrorMessage(
            "Network error occurred. Please check your internet connection."
          );
        } else if (event.error === "aborted") {
          setStatusMessage("Recognition was aborted.");
        } else if (event.error === "language-not-supported") {
          setErrorMessage(
            `The selected language (${selectedLanguage}) is not supported. Please try another language.`
          );
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
          setStatusMessage("Restarting recognition...");

          restartTimerRef.current = window.setTimeout(() => {
            try {
              recognitionRef.current?.start();
              setStatusMessage("Listening...");
            } catch (error) {
              console.error("Failed to restart recognition:", error);
              setErrorMessage(
                `Failed to restart recognition: ${
                  error instanceof Error ? error.message : "Unknown error"
                }`
              );
              setIsListening(false);
            }
          }, 300);
        } else {
          setIsListening(false);
          setStatusMessage("");
        }
      };

      // Additional event handlers for debugging
      recognitionRef.current.onstart = () => {
        console.log("Recognition started successfully");
        setStatusMessage("Listening...");

        // Start a timer to detect if no speech is being detected
        noSpeechDetectedTimerRef.current = window.setTimeout(() => {
          if (isListening) {
            setStatusMessage(
              "No speech detected yet. Please check your microphone or speak louder."
            );
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
        setStatusMessage("Speech detected!");
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
          setStatusMessage(
            `Listening in ${
              LANGUAGES.find((l) => l.code === selectedLanguage)?.name ||
              selectedLanguage
            }...`
          );
        } catch (error) {
          console.error(
            "Error restarting recognition after language change:",
            error
          );
          setErrorMessage(
            `Error restarting speech recognition: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
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
        setErrorMessage(
          `Error starting speech recognition: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
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

  // Speech recognition controls
  const toggleListening = () => {
    if (permissionState === "denied") {
      setErrorMessage(
        "Microphone access is blocked. Please allow microphone access in your browser settings."
      );
      return;
    }

    setErrorMessage("");
    setStatusMessage("");

    if (isListening) {
      setIsListening(false);
    } else {
      // Don't clear the transcript when starting to listen
      // This is key - we don't want to lose our existing text!
      // Instead, we'll append new speech to the existing transcript
      setIsListening(true);

      // If we've never transcribed before, initialize the reference
      // with the current editor content
      if (!previousTranscriptRef.current) {
        const currentContent = editorState.getCurrentContent().getPlainText();
        previousTranscriptRef.current = currentContent;
        setTranscript(currentContent);
      }

      if (!recognitionRef.current) {
        setErrorMessage(
          "Speech recognition is not initialized properly. Please refresh the page."
        );
      }
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    console.log(`Changing language to: ${newLanguage}`);
    setSelectedLanguage(newLanguage);

    // If recognition is active, restart it with the new language
    if (isListening && recognitionRef.current) {
      try {
        // Stop current recognition
        recognitionRef.current.stop();

        // Update language
        recognitionRef.current.lang = newLanguage;

        // Clear previous transcript when changing language
        previousTranscriptRef.current = "";

        // Restart after a brief delay
        setTimeout(() => {
          if (recognitionRef.current && isListening) {
            try {
              recognitionRef.current.start();
              setStatusMessage(
                `Listening in ${
                  LANGUAGES.find((l) => l.code === newLanguage)?.name ||
                  newLanguage
                }...`
              );
            } catch (err) {
              console.error(
                "Failed to restart recognition after language change:",
                err
              );
              setErrorMessage(
                `Failed to restart speech recognition: ${
                  err instanceof Error ? err.message : "Unknown error"
                }`
              );
              setIsListening(false);
            }
          }
        }, 300);
      } catch (err) {
        console.error("Error changing language:", err);
      }
    }
  };

  // Content formatting functions with incrementing numbers

  const addChapter = () => {
    setSelectedItem("Chapitre");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte du chapitre à la position actuelle du curseur
    const chapterText = `\nChapitre ${chapterCount}`;
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte du chapitre à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      chapterText
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Créer une sélection pour le texte du chapitre nouvellement inséré
    const blockKey = selection.getStartKey();
    const block = newContentState.getBlockForKey(blockKey);
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + chapterText.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte du chapitre
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style CHAPTER au texte sélectionné
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "CHAPTER");

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${chapterText}`
      : chapterText;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Incrémenter le compteur de chapitres
    setChapterCount(chapterCount + 1);
  };

  const addTitle = () => {
    setSelectedItem("Titre");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte du titre
    const romanNumber = toRoman(titleCount);
    const textToAdd = `\n${romanNumber}.`;
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      textToAdd
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Sélectionner le texte nouvellement inséré
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + textToAdd.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style TITLE
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "TITLE");

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${textToAdd}`
      : textToAdd;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Incrémenter le compteur
    setTitleCount(titleCount + 1);
  };

  const addSubtitle = () => {
    setSelectedItem("SousTitre");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte du sous-titre
    const textToAdd = `\n${subtitleCount}.`;
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      textToAdd
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Sélectionner le texte nouvellement inséré
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + textToAdd.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style SUBTITLE
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "SUBTITLE");

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${textToAdd}`
      : textToAdd;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Incrémenter le compteur
    setSubtitleCount(subtitleCount + 1);
  };

  const addParagraph = () => {
    setSelectedItem("Paragraphe");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte du paragraphe
    const textToAdd = ".\n";
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      textToAdd
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${textToAdd}`
      : textToAdd;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Sélectionner le texte nouvellement inséré
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + textToAdd.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style PARAGRAPH
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "PARAGRAPH");
  };

  const addExplanation = () => {
    setSelectedItem("Explication");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte d'explication
    const textToAdd = ".\n**";
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      textToAdd
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${textToAdd}`
      : textToAdd;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Sélectionner le texte nouvellement inséré
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + textToAdd.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style PARAGRAPH
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "EXPLANATION");
  };

  const addJokes = () => {
    setSelectedItem("Blague");

    // Obtenir l'état actuel de l'éditeur
    let currentEditorState = editorState;

    // Insérer le texte de blague
    const textToAdd = ".\n 😂";
    const contentState = currentEditorState.getCurrentContent();
    const selection = currentEditorState.getSelection();

    // Insérer le texte à la position actuelle
    const newContentState = Modifier.insertText(
      contentState,
      selection,
      textToAdd
    );

    // Créer un nouvel état d'éditeur avec le texte inséré
    let newEditorState = EditorState.push(
      currentEditorState,
      newContentState,
      "insert-characters"
    );

    // Mettre à jour l'état de l'éditeur
    setEditorState(newEditorState);

    // Mettre à jour le transcript si nécessaire
    const updatedTranscript = transcript
      ? `${transcript}${textToAdd}`
      : textToAdd;
    setTranscript(updatedTranscript);
    previousTranscriptRef.current = updatedTranscript;

    // Sélectionner le texte nouvellement inséré
    const startOffset = selection.getStartOffset();
    const endOffset = startOffset + textToAdd.length;

    const newSelection = selection.merge({
      anchorOffset: startOffset,
      focusOffset: endOffset,
    });

    // Sélectionner le texte
    newEditorState = EditorState.forceSelection(newEditorState, newSelection);

    // Appliquer le style PARAGRAPH
    newEditorState = RichUtils.toggleInlineStyle(newEditorState, "JOKE");
  };

  useEffect(() => {
    if (recognitionRef.current) {
      console.log(`Setting recognition language to: ${selectedLanguage}`);
      recognitionRef.current.lang = selectedLanguage;
    }
  }, [selectedLanguage]);

  const handleUserList = async () => {
    try {
      const users = await socketService.getUsersList(room);
      setUserList(users);
      console.log("Fetched users:", users);
    } catch (error) {
      console.error("Error fetching user list:", error);
    }
  };

  useEffect(() => {
    // Set up listener for user list updates
    socketService.onUserList((data) => {
      console.log("Received updated user list:", data.users);
      setUserList(data.users);
    });

    // Fetch initial user list
    if (room) {
      handleUserList();
    }

    // Clean up listener when component unmounts
    return () => {
      setQuestions([]);
      socketService.removeUserListListener();
    };
  }, [room]);

  useEffect(() => {
    const getDbNote = async () => {
      const res = await getNoteWithId(noteId ?? "");
      if (res.status === "success") {
        setdbNote(res.data);
        setCourseTitle(res.data.titre);
      }
    };

    getDbNote();
  }, [noteId]);

  useEffect(() => {}, [room]);

  const handleEndCourse = async () => {
    // console.log(stateToHTML(editorState.getCurrentContent()))
    if (Role === "Teacher") {
      if (dbNote) {
        const Note: TNoteResponse = {
          _id: dbNote._id,
          noteText: editorState.getCurrentContent().getPlainText(),
          audioUrl: "",
          date: dbNote.date,
          matiere: dbNote.matiere,
          nomProf: dbNote.nomProf,
          titre: dbNote.titre,
        };

        const res = await updateNote(Note);
        if (res.status === "success") {
          console.log("Cours enregistré");
          to("/lobby");
        } else {
          console.log(res.message);
        }
      }
    } else {
      to("/lobby");
      //disconnect
    }
  };

  const customStyleMap = {
    BOLD: { fontWeight: "bold" },
    ITALIC: { fontStyle: "italic" },
    UNDERLINE: { textDecoration: "underline" },
    CHAPTER: { fontSize: "28px", fontWeight: "bold" },
    TITLE: { fontSize: "24px", fontWeight: "bold" },
    SUBTITLE: { fontSize: "20px", fontWeight: "bold" },
    PARAGRAPH: { fontSize: "16px", lineHeight: "1.5" },
    EXPLANATION: { fontSize: "16px", fontStyle: "italic", color: "#555" },
    JOKE: { fontSize: "16px", color: "#0066cc" },
  };

  useEffect(() => {
    if (Role === "Student") {
      // Set up listener for speech broadcasts
      socketService.onReceiveSpeech((data) => {
        // Update the editor with the received text
        setTextToDisplay(data.text)
        // const newContentState = ContentState.createFromText(data.text);
        // const newEditorState = EditorState.push(
        //   editorState,
        //   newContentState,
        //   "insert-characters"
        // );

        // // Update local state
        // setEditorState(newEditorState);
        // setTranscript(data.text);
        // previousTranscriptRef.current = data.text;
      });

      // Clean up listener when component unmounts
      return () => {
        socketService.removeReceiveSpeechListener();
      };
    }
  }, []);

  return (
    <div className="course-container">
      <div className="sidebar">
        <img src={Offen} alt="Offen Logo" width="42px" />
        <div className="section-list">
          <div
            className={`section-icon ${
              isQuestionsDisplayed && "section-icon-selected"
            }`}
            onClick={toggleDisplay}
          >
            <LuMessageSquare className="icon-sidebar" size={20} />
          </div>
          <div
            className={`section-icon ${
              isUsersDisplayed && "section-icon-selected"
            }`}
            onClick={toggleDisplayUser}
          >
            <LuUsersRound className="icon-sidebar" size={20} />
          </div>
        </div>
        <div className="other"></div>
      </div>

      {isQuestionsDisplayed && (
        <div ref={elementRef} className="left-list">
          <QuestionList />
          <QuestionInput noteId={noteId ?? ""} />
        </div>
      )}

      {isUsersDisplayed && <Userlist users={userList} />}

      <div
        className={`course-content ${
          isQuestionsDisplayed || (isUsersDisplayed && "course-content-resized")
        }`}
      >
        <div className="title-container">
          <div className="course-title">Titre - {courseTitle}</div>
          <div className="course-title">Nom du salon - {room}</div>
        </div>

        {/* Speech recognition status messages */}
        {(errorMessage || statusMessage) && (
          <div className={`speech-status ${errorMessage ? "error" : ""}`}>
            {errorMessage || statusMessage}
          </div>
        )}

        {/* Language selector */}
        {showLanguageSelector && (
          <div className="language-selector">
            <select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="language-select"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Éditeur de texte */}
        {
            Role === 'Teacher'?
        <div className="editor" onClick={focusEditor}>
          <Editor
            ref={editorRef}
            editorState={editorState}
            onChange={setEditorState}
            handleKeyCommand={handleKeyCommand}
            customStyleMap={customStyleMap}
            placeholder="Tapez ici ou utilisez la reconnaissance vocale"
          />
        </div>
        :
        <textarea className="editor" contentEditable={false} value={TextToDisplay} placeholder="Le texte apparaitra ici ...">
        </textarea>
        }

        {/* Voice recording indicator */}
        {isListening && (
          <div className="recording-indicator">
            <div className="recording-dot"></div>
            Enregistrement en cours...
          </div>
        )}

        <div className={`item-list-bar `}>
          <div className="item-list">
            {/* Text structure controls */}
            <div
              className={`item-list-section ${
                selectedItem === "Chapitre" && "item-list-section-active"
              }`}
              onClick={addChapter}
            >
              Ch
            </div>
            <div
              className={`item-list-section ${
                selectedItem === "Titre" && "item-list-section-active"
              }`}
              onClick={addTitle}
            >
              <LuType className="item-bar-icon" size={20} />
            </div>
            <div
              className={`item-list-section ${
                selectedItem === "SousTitre" && "item-list-section-active"
              }`}
              onClick={addSubtitle}
            >
              <LuListOrdered className="item-bar-icon" size={20} />
            </div>
            <div
              className={`item-list-section ${
                selectedItem === "Paragraphe" && "item-list-section-active"
              }`}
              onClick={addParagraph}
            >
              <LuPilcrow className="item-bar-icon" size={20} />
            </div>
            <div
              className={`item-list-section ${
                selectedItem === "Explication" && "item-list-section-active"
              }`}
              onClick={addExplanation}
            >
              <LuMessageSquareQuote className="item-bar-icon" size={20} />
            </div>
            <div
              className={`item-list-section ${
                selectedItem === "Blague" && "item-list-section-active"
              }`}
              onClick={addJokes}
            >
              <LuLaugh className="item-bar-icon" size={20} />
            </div>
            <div className="separation-vertical"></div>

            {/* Text formatting controls */}
            <div
              className={`item-list-section ${
                activeStyles.has("BOLD") && "item-list-text-active"
              }`}
              onClick={() => toggleInlineStyle("BOLD")}
              onMouseDown={handleMouseDown}
            >
              <LuBold size={20} className="item-bar-icon" />
            </div>
            <div
              className={`item-list-section ${
                activeStyles.has("UNDERLINE") ? "item-list-text-active" : ""
              }`}
              onClick={() => toggleInlineStyle("UNDERLINE")}
              onMouseDown={handleMouseDown}
            >
              <LuUnderline size={20} className="item-bar-icon" />
            </div>
            <div
              className={`item-list-section ${
                activeStyles.has("ITALIC") ? "item-list-text-active" : ""
              }`}
              onClick={() => toggleInlineStyle("ITALIC")}
              onMouseDown={handleMouseDown}
            >
              <LuItalic size={20} className="item-bar-icon" />
            </div>

            <div className="separation-vertical"></div>

            {/* Speech controls */}
            <div
              className={`item-list-section ${
                isListening ? "item-list-section-active" : ""
              }`}
              onClick={toggleListening}
            >
              {isListening ? (
                <LuMic size={20} className="item-bar-icon" />
              ) : (
                <LuMicOff size={20} className="item-bar-icon" />
              )}
            </div>

            {/* Language toggle */}
            <div
              className={`item-list-section ${
                showLanguageSelector ? "item-list-section-active" : ""
              }`}
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              {selectedLanguage.split("-")[0].toUpperCase()}
            </div>
          </div>
        </div>
        <button onClick={handleEndCourse} className="end-course-btn">
          {Role == "Teacher" ? (
            <div>Terminer le cours</div>
          ) : (
            <div>Quitter le cours</div>
          )}
        </button>
        <button onClick={() => navigate("/lobby")} className="leave-course-btn">
          Quitter le cours
        </button>
      </div>
    </div>
  );
};