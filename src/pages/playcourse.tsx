import { useState, useEffect, useRef } from "react";
import { LuPlay, LuPause, LuSquare, LuVolume2 } from "react-icons/lu";
import "./playcourse.css";
import { LuAudioWaveform, LuGauge, LuMicVocal } from "react-icons/lu";
import { useParams } from "react-router-dom";
import { TNoteResponse } from "../types";
import { getNoteWithId } from "../services/api";

export const PlayCourse = () => {
    const [text, setText] = useState("");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [rate, setRate] = useState(1);
    const [pitch, setPitch] = useState(1);
    const [autoFollow, setAutoFollow] = useState(true);
    const [speakingWordIndex, setSpeakingWordIndex] = useState(-1);
    const [parsedText, setParsedText] = useState([]);
    const [note, setNote] = useState<TNoteResponse>();
    const { noteId } = useParams();

    const textRef = useRef(null);
    const wordsRef = useRef([]);
    const utteranceRef = useRef(null);

    // Initialiser les voix disponibles
    useEffect(() => {
        const fetchNote = async () => {
            const response = await getNoteWithId(noteId);
            if (response.status === "success") {
                setNote(response.data);
                setText(response.data.noteText);
            } else {
                console.error(response.message);
            }
        };
        fetchNote();
        
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
                setSelectedVoice(availableVoices[0].name);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [noteId]);

    // Parser le texte en mots et caractères spéciaux quand il change
    useEffect(() => {
        if (text) {
            // Diviser le texte en segments (mots + espaces + ponctuation)
            const segments = text.match(/\S+|\s+|[.,!?;:'"()]/g) || [];

            // Créer une structure avec les positions des caractères pour chaque segment
            let position = 0;
            const parsed = segments.map((segment, index) => {
                const start = position;
                position += segment.length;
                return {
                    text: segment,
                    index,
                    start,
                    end: position - 1,
                    isWord: /\w+/.test(segment)
                };
            });

            setParsedText(parsed);
        } else {
            setParsedText([]);
        }
    }, [text]);

    // Gérer le défilement automatique vers le mot en cours
    useEffect(() => {
        if (autoFollow && speakingWordIndex >= 0 && wordsRef.current[speakingWordIndex]) {
            wordsRef.current[speakingWordIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }, [speakingWordIndex, autoFollow]);

    // Nettoyage lors du démontage du composant
    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    // Fonction pour obtenir le texte à partir d'un index de mot spécifique
    const getTextFromIndex = (startIndex) => {
        if (startIndex < 0 || startIndex >= parsedText.length) return text;

        // Récupérer le texte à partir de l'index du mot spécifié
        return parsedText.slice(startIndex).map(segment => segment.text).join('');
    };

    // Gérer la lecture du texte avec le surlignement
    const speak = (startWordIndex = -1) => {
        if (text.trim() === "") return;

        // Si nous sommes en pause et aucun index de départ n'est spécifié, reprendre la lecture
        if (isPaused && startWordIndex === -1) {
            window.speechSynthesis.resume();
            setIsPaused(false);
            return;
        }

        // Arrêter toute lecture en cours
        window.speechSynthesis.cancel();

        // Déterminer le texte à lire (tout le texte ou à partir d'un mot spécifique)
        const textToRead = startWordIndex >= 0 ? getTextFromIndex(startWordIndex) : text;

        // Réinitialiser l'index du mot
        setSpeakingWordIndex(startWordIndex >= 0 ? startWordIndex : -1);

        // Configurer la nouvelle lecture
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utteranceRef.current = utterance;

        // Appliquer la voix sélectionnée
        if (selectedVoice) {
            const voice = voices.find(v => v.name === selectedVoice);
            if (voice) utterance.voice = voice;
        }

        // Appliquer le taux et le pitch
        utterance.rate = rate;
        utterance.pitch = pitch;

        // Gérer les événements
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setSpeakingWordIndex(-1);
        };
        utterance.onerror = () => {
            setIsSpeaking(false);
            setIsPaused(false);
            setSpeakingWordIndex(-1);
        };

        // Gérer l'événement de surlignement des mots
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;

                // Ajouter l'offset si nous commençons à partir d'un mot spécifique
                const adjustedCharIndex = startWordIndex >= 0
                    ? charIndex + (parsedText[startWordIndex]?.start || 0)
                    : charIndex;

                // Trouver le segment correspondant à cette position de caractère
                const segmentIndex = parsedText.findIndex(
                    segment => adjustedCharIndex >= segment.start && adjustedCharIndex <= segment.end
                );

                if (segmentIndex !== -1) {
                    setSpeakingWordIndex(segmentIndex);
                }
            }
        };

        // Démarrer la lecture
        window.speechSynthesis.speak(utterance);
    };

    // Pause la lecture
    const pauseSpeaking = () => {
        if (isSpeaking && !isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        }
    };

    // Arrêter la lecture
    const stopSpeaking = () => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setSpeakingWordIndex(-1);
    };

    // Gérer le clic sur un mot pour commencer la lecture à partir de ce mot
    const handleWordClick = (index) => {
        if (parsedText[index]?.isWord) {
            setAutoFollow(true); // Active le suivi automatique
            speak(index);
        }
    };


    // Référencer chaque mot pour le surlignement et le défilement
    wordsRef.current = [];


    return (
        <div className="play-container">
            <div className="play-container-top">
                <h1>{note?.titre} <LuVolume2 className="icon" /></h1>
                <div className="instruction-text">
                    <p>"Cliquez sur un mot pour recommencer la lecture à partir de ce point"</p>
                </div>
            </div>

            <div className="text-input-container">
                {!isSpeaking ? (
                    <textarea
                        ref={textRef}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Entrez le texte à lire..."
                        rows={6}
                        className="text-input"
                    />
                ) : (
                    <div className="highlighted-text" ref={textRef}>
                        {parsedText.map((segment, idx) => (
                            <span
                                key={idx}
                                ref={el => wordsRef.current[segment.index] = el}
                                className={`
                                    ${speakingWordIndex === segment.index
                                        ? segment.isWord
                                            ? "highlighted-word"
                                            : "highlighted-space"
                                        : ""}
                                    ${segment.isWord ? "clickable-word" : ""}
                                `}
                                onClick={() => handleWordClick(segment.index)}
                            >
                                {segment.text}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="controls-container">
                <div className="voice-selector">
                    <LuAudioWaveform size={24} />
                    <select
                        id="voice-select"
                        value={selectedVoice || ""}
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="voice-select"
                    >
                        {voices.map((voice) => (
                            <option key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="rate-control">
                    <label className="rate" htmlFor="rate">
                        <LuGauge size={24} /> {rate}
                    </label>
                    <input
                        type="range"
                        id="rate"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="slider"
                    />
                </div>

                <div className="pitch-control">
                    <label className="rate" htmlFor="pitch">
                        <LuMicVocal size={24} /> {pitch}
                    </label>
                    <input
                        type="range"
                        id="pitch"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={pitch}
                        onChange={(e) => setPitch(parseFloat(e.target.value))}
                        className="slider"
                    />
                </div>
            </div>

            <div className="follow-option">
                <label htmlFor="auto-follow">
                    <input
                        type="checkbox"
                        id="auto-follow"
                        checked={autoFollow}
                        onChange={(e) => setAutoFollow(e.target.checked)}
                    />
                    Suivi automatique
                </label>
            </div>
            <div className="play-stop-container">
                {!isSpeaking ? (
                    <button onClick={() => speak()} className="speak-button" disabled={text.trim() === ""}>
                        <LuPlay className="button-icon" /> Lire
                    </button>
                ) : (
                    <>
                        {isPaused ? (
                            <button onClick={() => speak()} className="play-button">
                                <LuPlay className="button-icon" />
                            </button>
                        ) : (
                            <button onClick={pauseSpeaking} className="pause-button">
                                <LuPause className="button-icon" />
                            </button>
                        )}
                        <button onClick={stopSpeaking} className="stop-button">
                            <LuSquare className="button-icon" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};