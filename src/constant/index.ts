import { LanguageOption } from "../interfaces";

export const BACKEND_BASE_URL = 'http://192.168.154.242:3000'
export const BACKEND_API_URL = `${BACKEND_BASE_URL}/api`
export const SOCKET_URL = 'http://192.168.154.242:3000'

// List of common languages with their codes
export const LANGUAGES: LanguageOption[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'en-GB', name: 'English (UK)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)' },
  { code: 'ru-RU', name: 'Russian' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
  { code: 'ja-JP', name: 'Japanese' },
  { code: 'ko-KR', name: 'Korean' },
  { code: 'ar-SA', name: 'Arabic' },
  { code: 'hi-IN', name: 'Hindi' },
  { code: 'nl-NL', name: 'Dutch' },
  { code: 'sv-SE', name: 'Swedish' },
  { code: 'tr-TR', name: 'Turkish' },
  { code: 'pl-PL', name: 'Polish' },
  { code: 'vi-VN', name: 'Vietnamese' }
];


