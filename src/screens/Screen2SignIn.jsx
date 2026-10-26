import React, { useState } from "react";
import { useApp } from "../store.jsx";
import { Header } from "../components/Header.jsx";
import { createError, formatError } from "../validation.js";
import {
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  ArrowRight,
  GoogleLogo,
  ShieldIcon,
  GraduationCap,
  HeadsetIcon,
} from "../icons.jsx";

export function Screen2SignIn() {
  const { t, setStep, updateUserData, user } = useApp();

  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(user.fullName || "");
  const [emailOrReg, setEmailOrReg] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const errs = {};
    if (tab === "signup") {
      if (!fullName.trim()) {
        errs.fullName = createError("val.fullNameRequired");
      } else if (fullName.trim().length < 2) {
        errs.fullName = createError("val.fullNameMin");
      }
    }

    if (!emailOrReg.trim()) {
      errs.emailOrReg = createError("val.emailRequired");
    } else if (
      tab === "signup" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrReg.trim())
    ) {
      errs.emailOrReg = createError("val.emailInvalid");
    }

    if (!password) {
      errs.password = createError("val.passwordRequired");
    } else if (password.length < 6) {
      errs.password = createError("val.passwordMin");
    }

    if (tab === "signup") {
      if (!confirmPassword) {
        errs.confirmPassword = createError("val.required");
      } else if (confirmPassword !== password) {
        errs.confirmPassword = createError("val.passwordMismatch");
      }
    }

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      fullName: true,
      emailOrReg: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      // Successful sign in / sign up
      updateUserData({
        fullName: tab === "signup" ? fullName : (user.fullName || fullName),
        email: emailOrReg,
        isAuthenticated: true,
      });

      // If user profile is already completed, returning user goes directly to Dashboard (Screen 5 = step 4)
      if (user.isProfileComplete) {
        setStep(4);
      } else {
        // New user or incomplete profile proceeds to Screen 3 (step 2)
        setStep(2);
      }
    }
  };

  const handleGoogleAuth = () => {
    // Development simulated Google sign-in
    updateUserData({
      fullName: fullName || "Google Student",
      email: emailOrReg || "student@gmail.com",
      isAuthenticated: true,
    });
    if (user.isProfileComplete) {
      setStep(4);
    } else {
      setStep(2);
    }
  };

  return (
    <div className="auth-screen-wrap">
      <Header />

      <main className="auth-main-container">
        <div className="auth-top-headings">
          <div className="welcome-sub-badge">
            <span className="badge-line" />
            <span>{t("auth.badge")}</span>
            <span className="badge-line" />
          </div>

          <h1 className="auth-title">
            {tab === "signin" ? (
              <>
                <span className="heading-navy">{t("auth.welcomeBack")}</span>{" "}
                <span className="heading-blue">{t("auth.backHighlight")}</span>
              </>
            ) : (
              <>
                <span className="heading-navy">{t("auth.createAccount")}</span>{" "}
                <span className="heading-blue">{t("auth.accountHighlight")}</span>
              </>
            )}
          </h1>

          <p className="auth-subtitle">
            {tab === "signin"
              ? t("auth.subtitleSignIn")
              : t("auth.subtitleSignUp")}
          </p>
        </div>

        {/* Central Split Authentication Card */}
        <div className="auth-card-split">
          {/* Left Hero Pane */}
          <div className="auth-split-left" aria-hidden="true">
            <div className="auth-left-text">
              <span className="journey-main">{t("auth.journeyHero")}</span>
              <span className="journey-script">{t("auth.journeyHeroScript")}</span>
            </div>

            <svg
              className="auth-split-svg"
              viewBox="0 0 320 380"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="authSky" x1="0" y1="0" x2="0" y2="380" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#EFF6FF" />
                  <stop offset="1" stopColor="#DBEAFE" />
                </linearGradient>
              </defs>
              <rect width="320" height="380" rx="12" fill="url(#authSky)" />
              {/* Campus Silhouette */}
              <path d="M40 240 L80 200 L120 200 L120 280 L40 280 Z" fill="#BFDBFE" />
              <polygon points="160,170 100,210 220,210" fill="#93C5FD" />
              <rect x="110" y="210" width="100" height="70" fill="#BFDBFE" />
              <rect x="125" y="220" width="12" height="60" fill="#DBEAFE" />
              <rect x="150" y="220" width="20" height="60" rx="10" fill="#1E3A8A" opacity="0.3" />
              <rect x="183" y="220" width="12" height="60" fill="#DBEAFE" />
              <path d="M200 220 L240 190 L280 220 L280 280 L200 280 Z" fill="#BFDBFE" />

              {/* Student Looking Ahead */}
              <g transform="translate(100, 150)">
                <ellipse cx="60" cy="50" rx="20" ry="22" fill="#0F172A" />
                <ellipse cx="60" cy="54" rx="14" ry="15" fill="#FDBA74" />
                <path d="M44 45 C44 30, 76 30, 76 45 C72 52, 48 52, 44 45 Z" fill="#0F172A" />
                <rect x="53" y="68" width="14" height="12" fill="#FDBA74" />
                <path d="M38 78 L82 78 L96 160 L24 160 Z" fill="#FFFFFF" />
                {/* Backpack */}
                <rect x="36" y="88" width="48" height="64" rx="14" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="2" />
                <rect x="42" y="100" width="36" height="34" rx="6" fill="#2563EB" />
                {/* Book */}
                <rect x="80" y="112" width="14" height="24" rx="2" fill="#F59E0B" transform="rotate(15 80 112)" />
              </g>

              {/* Foreground Lawn */}
              <ellipse cx="160" cy="350" rx="180" ry="70" fill="#86EFAC" opacity="0.5" />
            </svg>
          </div>

          {/* Right Form Pane */}
          <div className="auth-split-right">
            {/* Tabs */}
            <div className="auth-tabs-row" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signin"}
                className={`auth-tab-btn ${tab === "signin" ? "active" : ""}`}
                onClick={() => {
                  setTab("signin");
                  setErrors({});
                }}
              >
                <UserIcon size={16} color={tab === "signin" ? "#1d4ed8" : "#64748b"} />
                <span>{t("auth.tabSignIn")}</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={tab === "signup"}
                className={`auth-tab-btn ${tab === "signup" ? "active" : ""}`}
                onClick={() => {
                  setTab("signup");
                  setErrors({});
                }}
              >
                <UserIcon size={16} color={tab === "signup" ? "#1d4ed8" : "#64748b"} />
                <span>{t("auth.tabSignUp")}</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="auth-inner-form">
              {/* Full Name if Sign Up */}
              {tab === "signup" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-fullName">
                    {t("auth.fullName")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.fullName ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <UserIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="auth-fullName"
                      type="text"
                      className="form-input"
                      placeholder={t("auth.fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) {
                          setErrors((prev) => ({ ...prev, fullName: null }));
                        }
                      }}
                      onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
                    />
                  </div>
                  {errors.fullName && (
                    <div className="field-error-msg" role="alert">{formatError(errors.fullName, t)}</div>
                  )}
                </div>
              )}

              {/* Email / Register Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-email">
                  {t("auth.emailOrReg")} <span className="req">*</span>
                </label>
                <div className={`input-field-wrap ${errors.emailOrReg ? "has-error" : ""}`}>
                  <span className="input-prefix-icon">
                    <MailIcon size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="auth-email"
                    type={tab === "signup" ? "email" : "text"}
                    className="form-input"
                    placeholder={t("auth.emailOrRegPlaceholder")}
                    value={emailOrReg}
                    onChange={(e) => {
                      setEmailOrReg(e.target.value);
                      if (errors.emailOrReg) {
                        setErrors((prev) => ({ ...prev, emailOrReg: null }));
                      }
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, emailOrReg: true }))}
                  />
                </div>
                {errors.emailOrReg && (
                  <div className="field-error-msg" role="alert">{formatError(errors.emailOrReg, t)}</div>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label" htmlFor="auth-password">
                  {t("auth.password")} <span className="req">*</span>
                </label>
                <div className={`input-field-wrap ${errors.password ? "has-error" : ""}`}>
                  <span className="input-prefix-icon">
                    <LockIcon size={16} color="#94a3b8" />
                  </span>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input"
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        setErrors((prev) => ({ ...prev, password: null }));
                      }
                    }}
                    onBlur={() => setTouched((p) => ({ ...p, password: true }))}
                  />
                  <button
                    type="button"
                    className="input-suffix-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="field-error-msg" role="alert">{formatError(errors.password, t)}</div>
                )}
              </div>

              {/* Confirm Password if Sign Up */}
              {tab === "signup" && (
                <div className="form-group">
                  <label className="form-label" htmlFor="auth-confirmPassword">
                    {t("auth.confirmPassword")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.confirmPassword ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <LockIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="auth-confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-input"
                      placeholder={t("auth.confirmPasswordPlaceholder")}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) {
                          setErrors((prev) => ({ ...prev, confirmPassword: null }));
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="input-suffix-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <div className="field-error-msg" role="alert">{formatError(errors.confirmPassword, t)}</div>
                  )}
                </div>
              )}

              {/* Options row: Remember Me & Forgot Password */}
              <div className="auth-options-row">
                <label className="checkbox-label-simple">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{t("auth.rememberMe")}</span>
                </label>

                {tab === "signin" && (
                  <button
                    type="button"
                    className="forgot-pass-btn"
                    onClick={() => alert("Password reset link will be sent to your verified registered email.")}
                  >
                    <LockIcon size={13} color="#1d4ed8" />
                    <span>{t("auth.forgotPassword")}</span>
                  </button>
                )}
              </div>

              {/* Submit CTA */}
              <button type="submit" className="btn-primary-blue-wide">
                <span>{tab === "signin" ? t("auth.signInBtn") : t("auth.signUpBtn")}</span>
                <ArrowRight size={18} />
              </button>

              {/* Divider */}
              <div className="auth-or-divider">
                <span>{t("auth.or")}</span>
              </div>

              {/* Google Button */}
              <button
                type="button"
                className="btn-google-auth"
                onClick={handleGoogleAuth}
              >
                <GoogleLogo size={18} />
                <span>{t("auth.continueGoogle")}</span>
              </button>

              {/* Toggle Tab Footer */}
              <div className="auth-footer-switch">
                {tab === "signin" ? (
                  <>
                    <span>{t("auth.noAccount")}</span>{" "}
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => setTab("signup")}
                    >
                      {t("auth.tabSignUp")}
                    </button>
                  </>
                ) : (
                  <>
                    <span>{t("auth.haveAccount")}</span>{" "}
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={() => setTab("signin")}
                    >
                      {t("auth.tabSignIn")}
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Bottom 3 Feature Cards */}
        <section className="auth-bottom-cards" aria-label="Security & Information badges">
          <div className="auth-feature-pill">
            <div className="pill-icon-square bg-blue-subtle">
              <ShieldIcon size={20} color="#2563eb" />
            </div>
            <div className="pill-text-col">
              <h4>{t("auth.card1Title")}</h4>
              <p>{t("auth.card1Desc")}</p>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div className="pill-icon-square bg-purple-subtle">
              <GraduationCap size={20} color="#7c3aed" />
            </div>
            <div className="pill-text-col">
              <h4>{t("auth.card2Title")}</h4>
              <p>{t("auth.card2Desc")}</p>
            </div>
          </div>

          <div className="auth-feature-pill">
            <div className="pill-icon-square bg-teal-subtle">
              <HeadsetIcon size={20} color="#0d9488" />
            </div>
            <div className="pill-text-col">
              <h4>{t("auth.card3Title")}</h4>
              <p>{t("auth.card3Desc")}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
