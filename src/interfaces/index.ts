// TypeScript interfaces (same as before)
export interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

export interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  onnomatch: () => void;
  onaudiostart: () => void;
  onaudioend: () => void;
  onsoundstart: () => void;
  onsoundend: () => void;
  onspeechstart: () => void;
  onspeechend: () => void;
}

export interface LanguageOption {
  code: string;
  name: string;
}

//socket types

export interface User {
  userId: string;
  userName: string;
  role: 'user' | 'admin' | 'guest';
}

export interface Message {
  id?: string;
  userId: string;
  user: string;
  message: string;
  room: string;
  timestamp: number;
}

export interface Room {
  name: string;
  joined: boolean;
}

// Events response types
export interface RoomResponse {
  success: boolean;
  roomName?: string;
  message?: string;
  noteId?: string;
}

export interface MessageResponse {
  success: boolean;
  message?: string;
}

export interface RoomUserEvent {
  roomName: string;
  userName: string;
  userId: string;
}

export interface UserNameChangedEvent {
  userId: string;
  oldName: string;
  newName: string;
}

export interface ErrorEvent {
  message: string;
}

// To:
export interface ErrorResponse {
  message: string;
}