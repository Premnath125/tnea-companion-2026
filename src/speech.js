// Web Speech API helper for Accessible Audio Guidance (English & Tamil)

let activeUtterance = null;

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  activeUtterance = null;
}

export function speakText(text, lang = "en", onEnd = () => {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    console.warn("Speech synthesis not supported in this browser environment.");
    onEnd();
    return false;
  }

  stopSpeaking();

  if (!text) {
    onEnd();
    return false;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;

  // Language configuration
  utterance.lang = lang === "ta" ? "ta-IN" : "en-IN";
  utterance.rate = lang === "ta" ? 0.95 : 1.0;
  utterance.pitch = 1.0;

  // Find preferred voice if available
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const targetPrefix = lang === "ta" ? "ta" : "en";
    const matchedVoice = voices.find((v) => v.lang.toLowerCase().startsWith(targetPrefix));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  utterance.onend = () => {
    activeUtterance = null;
    onEnd();
  };

  utterance.onerror = () => {
    activeUtterance = null;
    onEnd();
  };

  try {
    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("Speech synthesis error:", err);
    activeUtterance = null;
    onEnd();
    return false;
  }
}
