// Supabase Client and Integration Helper for TNEA Companion 2026
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = () => {
  return (
    typeof supabaseUrl === "string" &&
    supabaseUrl.startsWith("https://") &&
    supabaseUrl.includes(".supabase.co") &&
    typeof supabaseAnonKey === "string" &&
    supabaseAnonKey.length > 20
  );
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
