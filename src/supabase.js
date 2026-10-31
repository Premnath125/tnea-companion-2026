// Supabase Client and Integration Helper for TNEA Companion 2026
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.startsWith("https://") &&
    supabaseUrl.includes(".supabase.co") &&
    !supabaseUrl.includes("your-project-ref") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 20 &&
    !supabaseAnonKey.startsWith("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")
  );
};

export const getSupabaseConfigStatus = () => {
  const isConfigured = isSupabaseConfigured();
  return {
    isConfigured,
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseAnonKey),
    urlSnippet: supabaseUrl ? supabaseUrl.replace(/https?:\/\/([^.]+).*/, "$1") : "none",
  };
};

export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Check URL for OAuth errors (e.g. from Google OAuth callback) and clean URL
 */
export function checkUrlForAuthError() {
  if (typeof window === "undefined") return null;

  try {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;
    const hash = url.hash.startsWith("#") ? url.hash.substring(1) : url.hash;
    const hashParams = new URLSearchParams(hash);

    const error = searchParams.get("error") || hashParams.get("error");
    const errorDescription =
      searchParams.get("error_description") || hashParams.get("error_description");

    if (error || errorDescription) {
      // Clean query and hash without reloading page
      window.history.replaceState({}, document.title, window.location.pathname);
      return {
        error: error || "oauth_error",
        description: errorDescription ? decodeURIComponent(errorDescription.replace(/\+/g, " ")) : "Authentication failed",
      };
    }
  } catch (e) {
    // Ignore URL parsing errors
  }
  return null;
}

/**
 * Fetch complete user profile & academic details from Supabase tables
 */
export async function fetchUserDataFromSupabase(userId) {
  if (!supabase || !userId) return null;

  try {
    const [profileRes, academicRes, prefRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("academic_details").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    if (profileRes.error) {
      console.warn("Error fetching profiles:", profileRes.error.message);
    }
    if (academicRes.error) {
      console.warn("Error fetching academic_details:", academicRes.error.message);
    }

    return {
      profile: profileRes.data || null,
      academic: academicRes.data || null,
      preferences: prefRes.data || null,
    };
  } catch (err) {
    console.error("fetchUserDataFromSupabase error:", err);
    return null;
  }
}

/**
 * Upsert user profile data to Supabase
 */
export async function syncProfileToSupabase(userId, email, profileData) {
  if (!supabase || !userId) return;

  const payload = {
    id: userId,
    email: email,
    full_name: profileData.fullName || "",
    dob: profileData.dob || null,
    gender: profileData.gender || "",
    community: profileData.community || "",
    mobile: profileData.mobile || "",
    state: profileData.state || "Tamil Nadu",
    district: profileData.district || "",
    native_place: profileData.nativePlace || "",
    address: profileData.address || "",
    is_personal_complete: Boolean(profileData.isPersonalComplete),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(payload);
  if (error) console.error("syncProfileToSupabase error:", error.message);
}

/**
 * Upsert academic details to Supabase
 */
export async function syncAcademicToSupabase(userId, academicData, cutoff, avg, isProfileComplete) {
  if (!supabase || !userId) return;

  const payload = {
    user_id: userId,
    board: academicData.board || "",
    passing_year: academicData.passingYear || "2026",
    school_name: academicData.schoolName || "",
    has_tnea_reg: academicData.hasTneaReg || "no",
    reg_number: academicData.regNumber || "",
    maths: academicData.maths !== "" ? Number(academicData.maths) : null,
    physics: academicData.physics !== "" ? Number(academicData.physics) : null,
    chemistry: academicData.chemistry !== "" ? Number(academicData.chemistry) : null,
    max_maths: Number(academicData.maxMaths || 100),
    max_physics: Number(academicData.maxPhysics || 100),
    max_chemistry: Number(academicData.maxChemistry || 100),
    studied_govt_school: academicData.studiedGovtSchool || "no",
    first_graduate: academicData.firstGraduate || "no",
    special_reservations: academicData.specialReservations || [],
    cutoff: cutoff !== null ? Number(cutoff) : null,
    average_percentage: avg !== null ? Number(avg) : null,
    academic_submitted: Boolean(academicData.academicSubmitted),
    is_profile_complete: Boolean(isProfileComplete),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("academic_details").upsert(payload, { onConflict: "user_id" });
  if (error) console.error("syncAcademicToSupabase error:", error.message);
}

/**
 * Upsert user preferences (saved colleges, choice list, checklist) to Supabase
 */
export async function syncPreferencesToSupabase(userId, savedColleges, choiceList, checklist) {
  if (!supabase || !userId) return;

  const payload = {
    user_id: userId,
    saved_colleges: savedColleges || [],
    choice_list: choiceList || [],
    checklist: checklist || [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_preferences").upsert(payload, { onConflict: "user_id" });
  if (error) console.error("syncPreferencesToSupabase error:", error.message);
}
