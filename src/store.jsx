import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "./i18n.js";
import { calculateTneaCutoff, calculateAveragePercentage, checkMinimumEligibility } from "./cutoff.js";
import { SAMPLE_COLLEGES, INITIAL_CHECKLIST } from "./data.js";
import { hashPassword } from "./auth.js";

const AppContext = createContext(null);

const ACCOUNTS_STORAGE_KEY = "tnea_registered_accounts_v2";
const SESSION_STORAGE_KEY = "tnea_current_session_v2";
const LANG_STORAGE_KEY = "tnea_lang_pref_2026";

export const emptyUserProfile = {
  fullName: "",
  email: "",
  registeredTnea: false,
  regNumber: "",
  dob: "",
  gender: "",
  community: "",
  mobile: "",
  state: "Tamil Nadu",
  district: "",
  nativePlace: "",
  address: "",
  personalDeclared: false,

  // Academic
  board: "",
  passingYear: "2026",
  schoolName: "",
  hasTneaReg: "no",
  maths: "",
  physics: "",
  chemistry: "",
  maxMaths: "100",
  maxPhysics: "100",
  maxChemistry: "100",
  studiedGovtSchool: "no",
  firstGraduate: "no",
  specialReservations: [],
  academicDeclared: false,

  // Status
  isAuthenticated: false,
  isPersonalComplete: false,
  isProfileComplete: false,
  academicSubmitted: false,
};

function getStoredAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to read accounts from storage:", e);
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error("Failed to save accounts to storage:", e);
  }
}

function getActiveSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function setActiveSession(session) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Failed to update session storage:", e);
  }
}

export function AppProvider({ children }) {
  // Language initialization
  const [lang, setLangState] = useState(() => {
    try {
      return localStorage.getItem(LANG_STORAGE_KEY) || "en";
    } catch (e) {
      return "en";
    }
  });

  // Step and user session initialization
  // A new or unauthenticated visitor must ALWAYS start on Screen 0 (Welcome)
  const [sessionData, setSessionData] = useState(() => {
    const session = getActiveSession();
    const accounts = getStoredAccounts();

    if (session && session.email && accounts[session.email.toLowerCase()]) {
      const account = accounts[session.email.toLowerCase()];
      const user = { ...emptyUserProfile, ...account.user, isAuthenticated: true };

      // Determine step based on completion
      let initialStep = 2; // Incomplete: resume at Personal
      if (user.isProfileComplete) {
        initialStep = 4; // Completed profile: go directly to Dashboard
      } else if (user.isPersonalComplete) {
        initialStep = 3; // Personal done: resume at Academic
      }

      return {
        step: initialStep,
        currentUser: user,
        savedColleges: account.savedColleges || [1, 3],
        choiceList: account.choiceList || [1, 3],
        checklist: account.checklist || INITIAL_CHECKLIST,
      };
    }

    // Unauthenticated: Screen 0 (Welcome)
    return {
      step: 0,
      currentUser: emptyUserProfile,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    };
  });

  const { step, currentUser, savedColleges, choiceList, checklist } = sessionData;

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch (e) {}
  };

  const setStep = (newStep) => {
    setSessionData((prev) => ({ ...prev, step: newStep }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Synchronize active user state with their account record in accounts storage
  const syncAccount = (updatedUser, updatedSaved, updatedChoices, updatedChecklist) => {
    if (!updatedUser.email) return;
    const accounts = getStoredAccounts();
    const key = updatedUser.email.toLowerCase();
    if (accounts[key]) {
      accounts[key] = {
        ...accounts[key],
        user: { ...accounts[key].user, ...updatedUser },
        savedColleges: updatedSaved !== undefined ? updatedSaved : accounts[key].savedColleges,
        choiceList: updatedChoices !== undefined ? updatedChoices : accounts[key].choiceList,
        checklist: updatedChecklist !== undefined ? updatedChecklist : accounts[key].checklist,
      };
      saveAccounts(accounts);
    }
  };

  const updateUserData = (partial) => {
    setSessionData((prev) => {
      const nextUser = {
        ...prev.currentUser,
        ...partial,
      };
      syncAccount(nextUser, prev.savedColleges, prev.choiceList, prev.checklist);
      return {
        ...prev,
        currentUser: nextUser,
      };
    });
  };

  const toggleSaveCollege = (id) => {
    setSessionData((prev) => {
      const exists = prev.savedColleges.includes(id);
      const nextSaved = exists
        ? prev.savedColleges.filter((cId) => cId !== id)
        : [...prev.savedColleges, id];
      syncAccount(prev.currentUser, nextSaved, prev.choiceList, prev.checklist);
      return { ...prev, savedColleges: nextSaved };
    });
  };

  const updateChoiceList = (list) => {
    setSessionData((prev) => {
      syncAccount(prev.currentUser, prev.savedColleges, list, prev.checklist);
      return { ...prev, choiceList: list };
    });
  };

  const toggleChecklistItem = (id) => {
    setSessionData((prev) => {
      const nextChecklist = prev.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );
      syncAccount(prev.currentUser, prev.savedColleges, prev.choiceList, nextChecklist);
      return { ...prev, checklist: nextChecklist };
    });
  };

  // Real Credential Authentication
  const registerUser = async (fullName, email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const accounts = getStoredAccounts();

    if (accounts[cleanEmail]) {
      return { success: false, errorKey: "val.accountExists" };
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      ...emptyUserProfile,
      fullName: fullName.trim(),
      email: cleanEmail,
      isAuthenticated: true,
      isPersonalComplete: false,
      isProfileComplete: false,
      academicSubmitted: false,
    };

    accounts[cleanEmail] = {
      id: "usr_" + Date.now(),
      email: cleanEmail,
      passwordHash,
      createdAt: new Date().toISOString(),
      user: newUser,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    };

    saveAccounts(accounts);
    setActiveSession({ email: cleanEmail });

    setSessionData({
      step: 2, // New user advances to Step 2 (Personal & Nativity Details)
      currentUser: newUser,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    });

    return { success: true };
  };

  const authenticateUser = async (emailOrReg, password) => {
    const cleanQuery = emailOrReg.trim().toLowerCase();
    const accounts = getStoredAccounts();

    // Find account by email or regNumber
    let foundKey = null;
    for (const key of Object.keys(accounts)) {
      const acc = accounts[key];
      if (
        key === cleanQuery ||
        (acc.user && acc.user.regNumber && acc.user.regNumber.toLowerCase() === cleanQuery)
      ) {
        foundKey = key;
        break;
      }
    }

    if (!foundKey) {
      return { success: false, errorKey: "val.accountNotFound" };
    }

    const account = accounts[foundKey];
    const passwordHash = await hashPassword(password);

    if (account.passwordHash !== passwordHash) {
      return { success: false, errorKey: "val.authInvalid" };
    }

    // Valid credentials verified
    setActiveSession({ email: foundKey });
    const user = { ...emptyUserProfile, ...account.user, isAuthenticated: true };

    let nextStep = 2;
    if (user.isProfileComplete) {
      nextStep = 4; // Returning user with complete profile goes to Dashboard
    } else if (user.isPersonalComplete) {
      nextStep = 3; // Personal details already done: resume at Academic
    }

    setSessionData({
      step: nextStep,
      currentUser: user,
      savedColleges: account.savedColleges || [],
      choiceList: account.choiceList || [],
      checklist: account.checklist || INITIAL_CHECKLIST,
    });

    return { success: true, isProfileComplete: user.isProfileComplete };
  };

  const signOut = () => {
    setActiveSession(null);
    setSessionData({
      step: 0, // Sign Out returns to Welcome Screen
      currentUser: emptyUserProfile,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    });
  };

  // Translation helper
  const t = (key, params) => getTranslation(lang, key, params);

  // Derived cutoff & eligibility values ONLY when academic details are explicitly submitted and valid
  const { maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry, community, academicSubmitted } = currentUser;

  let cutoff = null;
  let averagePercentage = null;
  let eligibility = { eligible: false, minRequired: 40, average: 0 };

  if (academicSubmitted && maths !== "" && physics !== "" && chemistry !== "") {
    cutoff = calculateTneaCutoff(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
    averagePercentage = calculateAveragePercentage(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
    eligibility = checkMinimumEligibility(averagePercentage, community);
  }

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        step,
        setStep,
        user: currentUser,
        isAuthenticated: currentUser.isAuthenticated,
        updateUserData,
        registerUser,
        authenticateUser,
        signOut,
        savedColleges,
        toggleSaveCollege,
        choiceList,
        updateChoiceList,
        checklist,
        toggleChecklistItem,
        t,
        cutoff,
        averagePercentage,
        eligibility,
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
