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
  ArrowLeft,
  GoogleLogo,
  ShieldIcon,
  GraduationCap,
  PeopleIcon,
} from "../icons.jsx";

export function Screen2SignIn() {
  const { t, setStep, registerUser, authenticateUser } = useApp();

  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [emailOrReg, setEmailOrReg] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        if (tab === "signup") {
          const res = await registerUser(fullName, emailOrReg, password);
          if (!res.success) {
            setAuthError(createError(res.errorKey));
          }
          // On success, registerUser sets session and navigates to Step 2 (Personal Details)
        } else {
          const res = await authenticateUser(emailOrReg, password);
          if (!res.success) {
            setAuthError(createError(res.errorKey));
          }
          // On success, authenticateUser sets session and navigates to Step 4 (Dashboard) if profile complete, or step 2/3
        }
      } catch (err) {
        setAuthError(createError("val.authInvalid"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleGoogleAuth = async () => {
    // Development simulated Google sign-in with verified account registration
    setIsSubmitting(true);
    try {
      const demoEmail = "student.tnea2026@gmail.com";
      const demoName = fullName.trim() || "Tamil Nadu Student";
      const res = await registerUser(demoName, demoEmail, "google_oauth_mock_2026");
      if (!res.success) {
        // If already exists, authenticate directly
        await authenticateUser(demoEmail, "google_oauth_mock_2026");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-screen-wrap">
      <Header />

      <main className="auth-main-container">
        {/* Visible Back to Welcome Link */}
        <div className="auth-back-nav-bar">
          <button
            type="button"
            className="btn-back-to-welcome"
            onClick={() => setStep(0)}
          >
            <ArrowLeft size={16} />
            <span>{t("auth.backToWelcome")}</span>
          </button>
        </div>

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
          {/* Left Hero Pane with High-Resolution Collaborative Laboratory Photo */}
          <div className="auth-split-left">
            <div className="auth-left-text">
              <span className="journey-main">{t("auth.journeyHero")}</span>
              <span className="journey-script">{t("auth.journeyHeroScript")}</span>
            </div>

            <div className="auth-photo-wrapper">
              <img
                src="/images/students-lab-hero.jpg"
                alt="Indian Engineering Students Collaborating in Modern Lab"
                className="auth-lab-photo"
                loading="eager"
              />
              <div className="auth-photo-overlay-tag">
                <PeopleIcon size={16} color="#ffffff" />
                <span>Modern Engineering Facilities</span>
              </div>
            </div>
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
                  setAuthError(null);
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
                  setAuthError(null);
                }}
              >
                <UserIcon size={16} color={tab === "signup" ? "#1d4ed8" : "#64748b"} />
                <span>{t("auth.tabSignUp")}</span>
              </button>
            </div>

            {/* General Authentication Error Banner */}
            {authError && (
              <div className="auth-error-banner" role="alert">
                <ShieldIcon size={16} color="#dc2626" />
                <span>{formatError(authError, t)}</span>
              </div>
            )}

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
                      if (authError) setAuthError(null);
                    }}
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
                      if (authError) setAuthError(null);
                    }}
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
                    onClick={() => alert("Password reset instructions will be sent to your registered email.")}
                  >
                    <LockIcon size={13} color="#1d4ed8" />
                    <span>{t("auth.forgotPassword")}</span>
                  </button>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="btn-primary-blue-wide"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? t("common.loading")
                    : tab === "signin"
                    ? t("auth.signInBtn")
                    : t("auth.signUpBtn")}
                </span>
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
                disabled={isSubmitting}
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
                      onClick={() => {
                        setTab("signup");
                        setAuthError(null);
                        setErrors({});
                      }}
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
                      onClick={() => {
                        setTab("signin");
                        setAuthError(null);
                        setErrors({});
                      }}
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
              <PeopleIcon size={20} color="#0d9488" />
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
