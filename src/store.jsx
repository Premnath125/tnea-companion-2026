import React, { createContext, useContext, useState, useEffect } from "react";
import { getTranslation } from "./i18n.js";
import { calculateTneaCutoff, calculateAveragePercentage, checkMinimumEligibility } from "./cutoff.js";
import { SAMPLE_COLLEGES, INITIAL_CHECKLIST } from "./data.js";
import { hashPassword } from "./auth.js";
import {
  supabase,
  isSupabaseConfigured,
  fetchUserDataFromSupabase,
  syncProfileToSupabase,
  syncAcademicToSupabase,
  syncPreferencesToSupabase,
} from "./supabase.js";

const AppContext = createContext(null);

const ACCOUNTS_STORAGE_KEY = "tnea_registered_accounts_v2";
const SESSION_STORAGE_KEY = "tnea_current_session_v2";
const LANG_STORAGE_KEY = "tnea_lang_pref_2026";

export const emptyUserProfile = {
  id: null,
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
    return {};
  }
}

function saveAccounts(accounts) {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {}
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
  } catch (e) {}
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

  // Session state initialization
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

    // Unauthenticated visitor defaults to Screen 0 (Welcome)
    return {
      step: 0,
      currentUser: emptyUserProfile,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    };
  });

  const { step, currentUser, savedColleges, choiceList, checklist } = sessionData;

  // Supabase Auth Listener & Cloud Data Hydration
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    // Helper to hydrate state from Supabase
    const hydrateFromSupabase = async (authUser) => {
      if (!authUser) return;

      const data = await fetchUserDataFromSupabase(authUser.id);
      if (!isMounted) return;

      const profile = data?.profile;
      const academic = data?.academic;
      const preferences = data?.preferences;

      const isPersonalComplete = Boolean(profile?.is_personal_complete);
      const academicSubmitted = Boolean(academic?.academic_submitted);
      const isProfileComplete = Boolean(academic?.is_profile_complete && isPersonalComplete);

      const hydratedUser = {
        ...emptyUserProfile,
        id: authUser.id,
        email: authUser.email,
        fullName: profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || "",
        dob: profile?.dob || "",
        gender: profile?.gender || "",
        community: profile?.community || "",
        mobile: profile?.mobile || "",
        state: profile?.state || "Tamil Nadu",
        district: profile?.district || "",
        nativePlace: profile?.native_place || "",
        address: profile?.address || "",
        isPersonalComplete,

        // Academic details
        board: academic?.board || "",
        passingYear: academic?.passing_year || "2026",
        schoolName: academic?.school_name || "",
        hasTneaReg: academic?.has_tnea_reg || "no",
        regNumber: academic?.reg_number || "",
        maths: academic?.maths != null ? String(academic.maths) : "",
        physics: academic?.physics != null ? String(academic.physics) : "",
        chemistry: academic?.chemistry != null ? String(academic.chemistry) : "",
        maxMaths: String(academic?.max_maths || 100),
        maxPhysics: String(academic?.max_physics || 100),
        maxChemistry: String(academic?.max_chemistry || 100),
        studiedGovtSchool: academic?.studied_govt_school || "no",
        firstGraduate: academic?.first_graduate || "no",
        specialReservations: Array.isArray(academic?.special_reservations) ? academic.special_reservations : [],
        academicSubmitted,
        isProfileComplete,
        isAuthenticated: true,
      };

      // Correct returning-user routing:
      // If personal and academic details completed: Screen 5 (Dashboard) [step 4]
      // If personal details complete, academic incomplete: Screen 4 (Academic) [step 3]
      // If personal details incomplete: Screen 3 (Personal) [step 2]
      let nextStep = 2;
      if (isProfileComplete) {
        nextStep = 4;
      } else if (isPersonalComplete) {
        nextStep = 3;
      }

      setSessionData({
        step: nextStep,
        currentUser: hydratedUser,
        savedColleges: preferences?.saved_colleges || [],
        choiceList: preferences?.choice_list || [],
        checklist: preferences?.checklist || INITIAL_CHECKLIST,
      });

      setActiveSession({ email: authUser.email });
    };

    // 1. Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && isMounted) {
        hydrateFromSupabase(session.user);
      }
    });

    // 2. Auth state subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && isMounted) {
        await hydrateFromSupabase(session.user);
      } else if (event === "SIGNED_OUT" && isMounted) {
        setActiveSession(null);
        setSessionData({
          step: 0,
          currentUser: emptyUserProfile,
          savedColleges: [],
          choiceList: [],
          checklist: INITIAL_CHECKLIST,
        });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

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

  // Synchronize state with Supabase & local storage
  const syncAccount = (updatedUser, updatedSaved, updatedChoices, updatedChecklist) => {
    if (!updatedUser.email) return;

    // Local account sync
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

    // Cloud Supabase sync
    if (supabase && updatedUser.id) {
      syncProfileToSupabase(updatedUser.id, updatedUser.email, updatedUser);

      const m = updatedUser.maths;
      const p = updatedUser.physics;
      const c = updatedUser.chemistry;
      const cut = calculateTneaCutoff(m, p, c, updatedUser.maxMaths, updatedUser.maxPhysics, updatedUser.maxChemistry);
      const avg = calculateAveragePercentage(m, p, c, updatedUser.maxMaths, updatedUser.maxPhysics, updatedUser.maxChemistry);

      syncAcademicToSupabase(updatedUser.id, updatedUser, cut, avg, updatedUser.isProfileComplete);
      syncPreferencesToSupabase(updatedUser.id, updatedSaved, updatedChoices, updatedChecklist);
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

  // --- Authentication Methods ---

  // 1. Send OTP for Sign Up
  const sendSignUpOtp = async (firstName, email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              full_name: firstName.trim(),
            },
          },
        });

        if (error) {
          if (error.message.toLowerCase().includes("already registered")) {
            return { success: false, errorKey: "val.accountExists" };
          }
          return { success: false, message: error.message };
        }

        return { success: true, user: data?.user };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }

    // Local / fallback mode
    const accounts = getStoredAccounts();
    if (accounts[cleanEmail]) {
      return { success: false, errorKey: "val.accountExists" };
    }
    return { success: true };
  };

  // 2. Verify OTP for Sign Up
  const verifySignUpOtp = async (firstName, email, password, otpToken) => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email: cleanEmail,
          token: otpToken.trim(),
          type: "signup",
        });

        if (error) {
          return { success: false, errorKey: "val.otpInvalid", message: error.message };
        }

        // Account is verified in Supabase!
        // Immediately sign out to satisfy requirement: user must sign in with their email and password
        await supabase.auth.signOut();

        return { success: true };
      } catch (err) {
        return { success: false, errorKey: "val.otpInvalid", message: err.message };
      }
    }

    // Local / fallback mode
    const accounts = getStoredAccounts();
    const passwordHash = await hashPassword(password);
    const newUser = {
      ...emptyUserProfile,
      fullName: firstName.trim(),
      email: cleanEmail,
      isAuthenticated: false,
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
    return { success: true };
  };

  // 3. Resend OTP
  const resendSignUpOtp = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resend({
          type: "signup",
          email: cleanEmail,
        });
        if (error) return { success: false, message: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    return { success: true };
  };

  // 4. Sign In with Password
  const authenticateUser = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          return { success: false, errorKey: "val.authInvalid", message: error.message };
        }

        return { success: true, user: data?.user };
      } catch (err) {
        return { success: false, errorKey: "val.authInvalid", message: err.message };
      }
    }

    // Local / fallback verification
    const accounts = getStoredAccounts();
    const account = accounts[cleanEmail];
    if (!account) {
      return { success: false, errorKey: "val.accountNotFound" };
    }

    const passwordHash = await hashPassword(password);
    if (account.passwordHash !== passwordHash) {
      return { success: false, errorKey: "val.authInvalid" };
    }

    setActiveSession({ email: cleanEmail });
    const user = { ...emptyUserProfile, ...account.user, isAuthenticated: true };

    let nextStep = 2;
    if (user.isProfileComplete) {
      nextStep = 4;
    } else if (user.isPersonalComplete) {
      nextStep = 3;
    }

    setSessionData({
      step: nextStep,
      currentUser: user,
      savedColleges: account.savedColleges || [],
      choiceList: account.choiceList || [],
      checklist: account.checklist || INITIAL_CHECKLIST,
    });

    return { success: true };
  };

  // 5. Send Password Reset
  const resetPassword = async (email) => {
    const cleanEmail = email.trim().toLowerCase();
    if (supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
        });
        if (error) return { success: false, errorKey: "val.passwordResetError", message: error.message };
        return { success: true };
      } catch (err) {
        return { success: false, errorKey: "val.passwordResetError", message: err.message };
      }
    }
    return { success: true };
  };

  // 6. Sign In with Google
  const signInWithGoogle = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
          },
        });
        if (error) throw error;
        return { success: true, data };
      } catch (err) {
        console.error("Google OAuth error:", err);
        return { success: false, message: err.message };
      }
    }

    // Fallback demo account
    const demoEmail = "student.tnea2026@gmail.com";
    const accounts = getStoredAccounts();
    let account = accounts[demoEmail];
    if (!account) {
      const demoUser = {
        ...emptyUserProfile,
        fullName: "Tamil Nadu Student",
        email: demoEmail,
        isAuthenticated: true,
      };
      accounts[demoEmail] = {
        id: "usr_google_demo",
        email: demoEmail,
        user: demoUser,
        savedColleges: [1, 3],
        choiceList: [1, 3],
        checklist: INITIAL_CHECKLIST,
      };
      saveAccounts(accounts);
      account = accounts[demoEmail];
    }

    setActiveSession({ email: demoEmail });
    setSessionData({
      step: 2,
      currentUser: { ...account.user, isAuthenticated: true },
      savedColleges: account.savedColleges || [],
      choiceList: account.choiceList || [],
      checklist: account.checklist || INITIAL_CHECKLIST,
    });
    return { success: true };
  };

  // 7. Sign Out
  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    setActiveSession(null);
    setSessionData({
      step: 0, // Sign Out returns to Welcome Screen
      currentUser: emptyUserProfile,
      savedColleges: [],
      choiceList: [],
      checklist: INITIAL_CHECKLIST,
    });
  };

  // Legacy registerUser alias
  const registerUser = async (fullName, email, password) => {
    return sendSignUpOtp(fullName, email, password);
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
        sendSignUpOtp,
        verifySignUpOtp,
        resendSignUpOtp,
        authenticateUser,
        resetPassword,
        signInWithGoogle,
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
        isSupabaseConfigured: isSupabaseConfigured(),
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
