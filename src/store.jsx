import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "./i18n.js";
import { calculateTneaCutoff, calculateAveragePercentage, checkMinimumEligibility } from "./cutoff.js";
import { SAMPLE_COLLEGES, INITIAL_CHECKLIST } from "./data.js";
import { speakText, stopSpeaking } from "./speech.js";

const AppContext = createContext(null);

const STORAGE_KEY = "tnea_companion_state_2026";

const defaultState = {
  lang: "en",
  step: 0, // 0: Welcome, 1: Auth, 2: Personal, 3: Academic, 4: Dashboard
  user: {
    fullName: "Premnath E",
    email: "premnath@example.com",
    registeredTnea: false,
    regNumber: "",
    dob: "2007-08-15",
    gender: "Male",
    community: "BC",
    mobile: "9876543210",
    state: "Tamil Nadu",
    district: "Chennai",
    nativePlace: "Chennai",
    address: "No. 42, Anna Nagar West, Chennai - 600040",
    personalDeclared: true,

    // Academic
    board: "Tamil Nadu State Board",
    passingYear: "2026",
    schoolName: "Government Model Higher Secondary School",
    hasTneaReg: "no",
    maths: "90",
    physics: "85",
    chemistry: "95",
    maxMaths: "100",
    maxPhysics: "100",
    maxChemistry: "100",
    studiedGovtSchool: "no",
    firstGraduate: "yes",
    specialReservations: [],
    academicDeclared: true,

    // Status
    isAuthenticated: false,
    isProfileComplete: false,
  },
  savedColleges: [1, 3], // CEG & PSG by default
  choiceList: [1, 3],
  checklist: INITIAL_CHECKLIST,
};

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          user: { ...defaultState.user, ...(parsed.user || {}) },
          savedColleges: parsed.savedColleges || defaultState.savedColleges,
          choiceList: parsed.choiceList || defaultState.choiceList,
          checklist: parsed.checklist || defaultState.checklist,
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage:", e);
    }
    return defaultState;
  });

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save state to localStorage:", e);
    }
  }, [state]);

  const setLang = (lang) => {
    setState((prev) => ({ ...prev, lang }));
  };

  const setStep = (step) => {
    stopSpeaking();
    setIsAudioPlaying(false);
    setState((prev) => ({ ...prev, step }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const updateUserData = (partial) => {
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        ...partial,
      },
    }));
  };

  const toggleSaveCollege = (id) => {
    setState((prev) => {
      const exists = prev.savedColleges.includes(id);
      const nextSaved = exists
        ? prev.savedColleges.filter((cId) => cId !== id)
        : [...prev.savedColleges, id];
      return { ...prev, savedColleges: nextSaved };
    });
  };

  const updateChoiceList = (list) => {
    setState((prev) => ({ ...prev, choiceList: list }));
  };

  const toggleChecklistItem = (id) => {
    setState((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    }));
  };

  // Translation helper
  const t = (key, params) => getTranslation(state.lang, key, params);

  // Derived cutoff & eligibility values
  const { maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry, community } = state.user;
  const cutoff = calculateTneaCutoff(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
  const averagePercentage = calculateAveragePercentage(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
  const eligibility = checkMinimumEligibility(averagePercentage, community);

  // Audio Guidance Handler
  const handleToggleAudio = (textToSpeak) => {
    if (isAudioPlaying) {
      stopSpeaking();
      setIsAudioPlaying(false);
    } else {
      setIsAudioPlaying(true);
      speakText(textToSpeak, state.lang, () => {
        setIsAudioPlaying(false);
      });
    }
  };

  const handleStopAudio = () => {
    stopSpeaking();
    setIsAudioPlaying(false);
  };

  const signOut = () => {
    stopSpeaking();
    setIsAudioPlaying(false);
    setState((prev) => ({
      ...prev,
      step: 1,
      user: {
        ...prev.user,
        isAuthenticated: false,
      },
    }));
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        setLang,
        setStep,
        updateUserData,
        toggleSaveCollege,
        updateChoiceList,
        toggleChecklistItem,
        t,
        cutoff,
        averagePercentage,
        eligibility,
        isAudioPlaying,
        handleToggleAudio,
        handleStopAudio,
        signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within AppProvider");
  }
  return ctx;
}
