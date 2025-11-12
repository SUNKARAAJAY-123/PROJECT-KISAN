import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, TFunction } from '../types';
import { createChat, sendMessage, getMarketPrices } from '../services/geminiService';
import { Chat } from '@google/genai';
import { SendIcon, BotIcon, UserIcon, CloseIcon, MicrophoneIcon, StopCircleIcon } from './Icons';

interface KisanDostChatProps {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  t: TFunction;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export default function KisanDostChat({ isOpen, onClose, language, t }: KisanDostChatProps) {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // User-controlled speech synthesis
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  // Map language codes to BCP 47 language tags for speech synthesis
  const getLangCode = (lang: string): string => {
    const langMap: Record<string, string> = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'te': 'te-IN',
      'ta': 'ta-IN',
      'kn': 'kn-IN',
      'mr': 'mr-IN',
      'bn': 'bn-IN',
      'gu': 'gu-IN',
      'ml': 'ml-IN',
      'pa': 'pa-IN'
    };
    return langMap[lang] || 'en-US';
  };

  // Load voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        setVoicesLoaded(true);
      };
      
      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // For browsers that load voices synchronously
      if (window.speechSynthesis.getVoices().length > 0) {
        setVoicesLoaded(true);
      }
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  const speakText = (text: string, lang: string, index: number) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(text);
      const langCode = getLangCode(lang);
      utterance.lang = langCode;
      // Find the best matching voice for the selected language
      const voices = window.speechSynthesis.getVoices();
      let matchingVoice = voices.find(voice => voice.lang === langCode);
      if (!matchingVoice) {
        // Try partial match (e.g., 'te' for Telugu)
        matchingVoice = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
      }
      if (matchingVoice) {
        utterance.voice = matchingVoice;
        console.log(`Using voice: ${matchingVoice.name} for language: ${langCode}`);
      } else {
        // Fallback: use default voice and notify user if not available
        console.warn(`No matching voice found for language: ${langCode}. Using default voice.`);
        // Optionally, show a notification in UI (addNotification)
      }
      utterance.onend = () => setSpeakingIndex(null);
      setSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      // Pass language to create a new chat session with the correct instructions
      const newChat = createChat(language);
      setChat(newChat);
      setMessages([]); // Clear previous messages
      setIsLoading(true);
      try {
        const initialResponse = await sendMessage(newChat, "Hello");
        setMessages([{ role: 'model', content: initialResponse.text }]);
      } catch (error) {
        console.error("Error initializing chat:", error);
        setMessages([{ role: 'model', content: "Sorry, I'm having trouble connecting right now." }]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      // Re-initialize chat if language changes while open, or if it's the first time opening
      initializeChat();
    } else {
        // Reset chat when closed
        setChat(null);
        setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, language]);

  useEffect(() => {
    if (!isSpeechRecognitionSupported || !isOpen) {
      return;
    }
    
    // Create a new recognition instance when language changes
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = getLangCode(language);
    
    console.log(`Speech recognition language set to: ${getLangCode(language)}`);

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setUserInput(transcript);
    };

    return () => {
        recognition.stop();
    }
  }, [isOpen, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isMarketPriceQuery = (text: string) => {
    // Simple check for price queries (improve as needed)
    return /(price|rate|cost).*\b(in|at|of)\b.*\b(today|now|current)?/i.test(text) || /\bmandi\b/i.test(text);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chat || isLoading) return;

    if (isRecording) {
        recognitionRef.current?.stop();
    }

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      let modelMessage: ChatMessage;
      // Get language name based on language code
      const getLanguageName = (code: string): string => {
        const languageNames: Record<string, string> = {
          'en': 'English',
          'hi': 'Hindi',
          'te': 'Telugu',
          'ta': 'Tamil',
          'kn': 'Kannada',
          'mr': 'Marathi',
          'bn': 'Bengali',
          'gu': 'Gujarati',
          'ml': 'Malayalam',
          'pa': 'Punjabi'
        };
        return languageNames[code] || 'English';
      };
      
      const langPrefix = `Answer in ${getLanguageName(language)} only.`;
      
      if (isMarketPriceQuery(userMessage.content)) {
        // Use strict market price answer
        const text = await getMarketPrices(`${langPrefix} ${userMessage.content}`, language);
        modelMessage = { role: 'model', content: text };
      } else {
        // Use normal chat, but force short, language-specific answer
        const response = await sendMessage(chat, `${langPrefix} ${userMessage.content}`);
        modelMessage = { role: 'model', content: response.text };
      }
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: ChatMessage = { role: 'model', content: "Oops, something went wrong. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMicButtonClick = () => {
    if (isRecording) {
        recognitionRef.current?.stop();
    } else {
        setUserInput('');
        recognitionRef.current?.start();
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100%-2rem)] max-w-sm sm:w-96 h-full max-h-[70vh] sm:max-h-[600px] z-50">
      {/* Animated background shapes */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-72 h-72 bg-green-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -right-32 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-green-400/10 rounded-full blur-2xl animate-spin-slow" />
      </div>
      <div className="relative z-10 flex flex-col h-full bg-white/90 dark:bg-gray-800/90 rounded-2xl shadow-2xl border border-green-100 dark:border-green-900 backdrop-blur-md">
        <header className="flex items-center justify-between p-4 bg-gradient-to-r from-green-600 to-green-700 dark:from-green-700 dark:to-green-800 text-white rounded-t-2xl">
          <h3 className="font-bold text-lg drop-shadow">{t.chatTitle}</h3>
          <button onClick={onClose} className="p-1 rounded-full transition-colors duration-200 ease-in-out hover:bg-green-700 dark:hover:bg-green-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-green-50/50 dark:bg-gray-900 rounded-b-2xl">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'model' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>}
              <div className={`max-w-[80%] p-3 rounded-2xl transition-transform duration-200 ease-in-out hover:scale-[1.03] ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none'}`}>
                <p className="text-sm">{msg.content}</p>
                {/* Play/Pause mic button for bot answers */}
                {msg.role === 'model' && (
                  <button
                    className={`mt-2 flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold shadow hover:bg-blue-200 transition-all ${speakingIndex === index ? 'ring-2 ring-blue-400' : ''}`}
                    onClick={() => speakingIndex === index ? stopSpeaking() : speakText(msg.content, language, index)}
                    type="button"
                    aria-label={speakingIndex === index ? 'Stop voice' : 'Play voice'}
                  >
                    {speakingIndex === index ? <StopCircleIcon className="w-4 h-4" /> : <MicrophoneIcon className="w-4 h-4" />}
                    {speakingIndex === index ? 'Stop' : 'Listen'}
                  </button>
                )}
              </div>
              {msg.role === 'user' && <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white"><UserIcon className="w-5 h-5"/></div>}
            </div>
          ))}
          {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
             <div className="flex items-start gap-3">
                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white"><BotIcon className="w-5 h-5"/></div>
                 <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-bl-none">
                     <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
                    </div>
                 </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-b-2xl">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={isRecording ? t.listening : t.chatPlaceholder}
            className="flex-1 w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-gray-100 shadow-inner"
            disabled={isLoading}
          />
          {isSpeechRecognitionSupported && (
            <button
                type="button"
                onClick={handleMicButtonClick}
                className={`flex-shrink-0 p-3 text-white rounded-full transition-all duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transform hover:scale-110 ${
                    isRecording 
                    ? 'bg-red-500 hover:bg-red-600 focus-visible:ring-red-400 animate-pulse' 
                    : 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
                }`}
                aria-label={isRecording ? t.stopRecording : t.startRecording}
                disabled={isLoading}
            >
                {isRecording ? <StopCircleIcon className="w-5 h-5" /> : <MicrophoneIcon className="w-5 h-5" />}
            </button>
          )}
          <button type="submit" className="p-3 bg-green-600 text-white rounded-full transition-all duration-200 ease-in-out hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500" disabled={isLoading || !userInput.trim()}>
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}