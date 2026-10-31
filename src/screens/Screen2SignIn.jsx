import React, { useState, useEffect } from "react";
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
  PeopleIcon,
  CheckIcon,
} from "../icons.jsx";

export function Screen2SignIn() {
  const {
    t,
    setStep,
    sendSignUpOtp,
    verifySignUpOtp,
    resendSignUpOtp,
    authenticateUser,
    resetPassword,
    signInWithGoogle,
    isSupabaseConfigured,
    oauthError,
    clearOauthError,
  } = useApp();

  const [tab, setTab] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // OTP states for Sign Up
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [authError, setAuthError] = useState(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Forgot Password Modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState("");
  const [resetStatus, setResetStatus] = useState(null);
  const [isResetting, setIsResetting] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Display OAuth callback errors if any
  useEffect(() => {
    if (oauthError) {
      setAuthError(oauthError);
      clearOauthError?.();
    }
  }, [oauthError]);

  // Cooldown timer effect
  useEffect(() => {
    let timer = null;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  const validate = () => {
    const errs = {};
    if (tab === "signup" && !otpStep) {
      if (!firstName.trim()) {
        errs.firstName = createError("val.firstNameRequired");
      } else if (firstName.trim().length < 2) {
        errs.firstName = createError("val.fullNameMin");
      }
    }

    if (!email.trim()) {
      errs.email = createError("val.emailOnlyRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = createError("val.emailInvalid");
    }

    if (!otpStep || tab === "signin") {
      if (!password) {
        errs.password = createError("val.passwordRequired");
      } else if (password.length < 6) {
        errs.password = createError("val.passwordMin");
      }
    }

    if (tab === "signup" && !otpStep) {
      if (!confirmPassword) {
        errs.confirmPassword = createError("val.required");
      } else if (confirmPassword !== password) {
        errs.confirmPassword = createError("val.passwordMismatch");
      }
    }

    if (tab === "signup" && otpStep) {
      if (!otp.trim()) {
        errs.otp = createError("val.otpRequired");
      }
    }

    return errs;
  };

  // Sign In submit handler
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const res = await authenticateUser(email, password);
        if (!res.success) {
          if (res.errorKey) {
            setAuthError(createError(res.errorKey));
          } else if (res.message) {
            setAuthError(res.message);
          } else {
            setAuthError(createError("val.authInvalid"));
          }
        }
      } catch (err) {
        setAuthError(createError("val.authInvalid"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Sign Up: Step 1 - Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const res = await sendSignUpOtp(firstName, email, password);
        if (res.success) {
          setOtpStep(true);
          setResendCooldown(60);
        } else {
          if (res.errorKey) {
            setAuthError(createError(res.errorKey));
          } else if (res.message) {
            setAuthError(res.message);
          } else {
            setAuthError(createError("val.authInvalid"));
          }
        }
      } catch (err) {
        setAuthError(createError("val.authInvalid"));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Sign Up: Step 2 - Verify OTP & Create Account
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!otp.trim()) {
      setErrors({ otp: createError("val.otpRequired") });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await verifySignUpOtp(firstName, email, password, otp);
      if (res.success) {
        // As requested: Show success message and navigate to Sign In screen
        setAuthSuccessMessage(t("auth.accountCreatedSuccess"));
        setTab("signin");
        setOtpStep(false);
        setOtp("");
        setPassword("");
        setConfirmPassword("");
        setErrors({});
      } else {
        if (res.errorKey) {
          setAuthError(createError(res.errorKey));
        } else if (res.message) {
          setAuthError(res.message);
        } else {
          setAuthError(createError("val.otpInvalid"));
        }
      }
    } catch (err) {
      setAuthError(createError("val.otpInvalid"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resend OTP handler with rate-limit cooldown
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await resendSignUpOtp(email);
      if (res.success) {
        setResendCooldown(60);
      } else {
        if (res.errorKey) {
          setAuthError(createError(res.errorKey));
        } else if (res.message) {
          setAuthError(res.message);
        } else {
          setAuthError(createError("val.authInvalid"));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Real Google OAuth Handler
  const handleGoogleAuth = async () => {
    setAuthError(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogle();
      if (res && !res.success) {
        if (res.errorKey) {
          setAuthError(createError(res.errorKey));
        } else if (res.message) {
          setAuthError(res.message);
        } else {
          setAuthError(createError("val.authInvalid"));
        }
      }
    } catch (err) {
      setAuthError(createError("val.authInvalid"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Forgot password submit handler
  const handleSendPasswordReset = async (e) => {
    e.preventDefault();
    setResetStatus(null);
    if (!resetEmailInput.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmailInput.trim())) {
      setResetStatus({ type: "error", message: t("val.emailInvalid") });
      return;
    }

    setIsResetting(true);
    try {
      const res = await resetPassword(resetEmailInput);
      if (res.success) {
        setResetStatus({ type: "success", message: t("auth.resetEmailSent") });
      } else {
        setResetStatus({ type: "error", message: t("val.passwordResetError") });
      }
    } finally {
      setIsResetting(false);
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

        {/* Backend Configuration Notice if not connected */}
        {!isSupabaseConfigured && (
          <div className="backend-notice-box">
            <div className="backend-notice-head">
              <ShieldIcon size={18} color="#d97706" />
              <strong>{t("auth.supabaseNotConfigured")}</strong>
            </div>
            <button
              type="button"
              className="backend-notice-toggle"
              onClick={() => setShowSetupGuide(!showSetupGuide)}
            >
              {showSetupGuide ? "Hide Setup Instructions ▲" : "View Supabase Configuration Instructions ▼"}
            </button>
            {showSetupGuide && (
              <div className="backend-setup-details">
                <ol>
                  <li>Create a free project at <b>app.supabase.com</b>.</li>
                  <li>Copy your <b>Project URL</b> and <b>anon public key</b> from Project Settings &gt; API.</li>
                  <li>Create a <code>.env</code> file in your project root with:<br />
                    <code>VITE_SUPABASE_URL=https://your-project.supabase.co</code><br />
                    <code>VITE_SUPABASE_ANON_KEY=eyJhbGciOi...</code>
                  </li>
                  <li>In Supabase Dashboard &gt; <b>SQL Editor</b>, run the script in <code>supabase/schema.sql</code>.</li>
                  <li><b>Custom SMTP:</b> In Auth &gt; SMTP Settings, configure custom SMTP (e.g. Gmail / Resend) to remove the 3 emails/hour rate limit so OTPs arrive instantly.</li>
                  <li><b>Google OAuth:</b> Enable Google in Auth &gt; Providers with your Google Cloud Client ID/Secret. Set redirect URI to <code>https://&lt;your-ref&gt;.supabase.co/auth/v1/callback</code>.</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {/* Central Split Authentication Card */}
        <div className="auth-card-split">
          {/* Left Hero Pane with Collaborative Laboratory Photo */}
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
                  setOtpStep(false);
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
                  setOtpStep(false);
                  setErrors({});
                  setAuthError(null);
                }}
              >
                <UserIcon size={16} color={tab === "signup" ? "#1d4ed8" : "#64748b"} />
                <span>{t("auth.tabSignUp")}</span>
              </button>
            </div>

            {/* Success Message Banner */}
            {authSuccessMessage && (
              <div className="auth-success-banner" role="alert">
                <CheckIcon size={18} color="#16a34a" />
                <span>{authSuccessMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {authError && (
              <div className="auth-error-banner" role="alert">
                <ShieldIcon size={16} color="#dc2626" />
                <span>{typeof authError === "string" ? authError : formatError(authError, t)}</span>
              </div>
            )}

            {/* --- TAB 1: SIGN IN FORM --- */}
            {tab === "signin" && (
              <form onSubmit={handleSignInSubmit} noValidate className="auth-inner-form">
                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signin-email">
                    {t("auth.emailOnly")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.email ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <MailIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signin-email"
                      type="email"
                      className="form-input"
                      placeholder={t("auth.emailOnlyPlaceholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                        if (authError) setAuthError(null);
                      }}
                    />
                  </div>
                  {errors.email && (
                    <div className="field-error-msg" role="alert">{formatError(errors.email, t)}</div>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signin-password">
                    {t("auth.password")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.password ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <LockIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
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

                  <button
                    type="button"
                    className="forgot-pass-btn"
                    onClick={() => {
                      setResetEmailInput(email);
                      setResetStatus(null);
                      setShowForgotPassword(true);
                    }}
                  >
                    <LockIcon size={13} color="#1d4ed8" />
                    <span>{t("auth.forgotPassword")}</span>
                  </button>
                </div>

                {/* Submit Sign In CTA */}
                <button
                  type="submit"
                  className="btn-primary-blue-wide"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? t("auth.signingIn") : t("auth.signInBtn")}</span>
                  <ArrowRight size={18} />
                </button>

                {/* Divider */}
                <div className="auth-or-divider">
                  <span>{t("auth.or")}</span>
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  className="btn-google-auth"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                >
                  <GoogleLogo size={18} />
                  <span>{isSubmitting ? t("auth.connectingGoogle") : t("auth.continueGoogle")}</span>
                </button>

                {/* Footer Switch */}
                <div className="auth-footer-switch">
                  <span>{t("auth.noAccount")}</span>{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setTab("signup");
                      setOtpStep(false);
                      setAuthError(null);
                      setErrors({});
                    }}
                  >
                    {t("auth.tabSignUp")}
                  </button>
                </div>
              </form>
            )}

            {/* --- TAB 2: SIGN UP FORM --- */}
            {tab === "signup" && !otpStep && (
              <form onSubmit={handleSendOtp} noValidate className="auth-inner-form">
                {/* First Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-firstName">
                    {t("auth.firstName")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.firstName ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <UserIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signup-firstName"
                      type="text"
                      className="form-input"
                      placeholder={t("auth.firstNamePlaceholder")}
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (errors.firstName) setErrors((prev) => ({ ...prev, firstName: null }));
                      }}
                    />
                  </div>
                  {errors.firstName && (
                    <div className="field-error-msg" role="alert">{formatError(errors.firstName, t)}</div>
                  )}
                </div>

                {/* Email Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-email">
                    {t("auth.emailOnly")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.email ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <MailIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signup-email"
                      type="email"
                      className="form-input"
                      placeholder={t("auth.emailOnlyPlaceholder")}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                        if (authError) setAuthError(null);
                      }}
                    />
                  </div>
                  {errors.email && (
                    <div className="field-error-msg" role="alert">{formatError(errors.email, t)}</div>
                  )}
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-password">
                    {t("auth.password")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.password ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <LockIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      className="form-input"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
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

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-confirmPassword">
                    {t("auth.confirmPassword")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.confirmPassword ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <LockIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signup-confirmPassword"
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

                {/* Send OTP CTA Button */}
                <button
                  type="submit"
                  className="btn-primary-blue-wide"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? t("auth.sendingOtp") : t("auth.sendOtpBtn")}</span>
                  <ArrowRight size={18} />
                </button>

                {/* Divider */}
                <div className="auth-or-divider">
                  <span>{t("auth.or")}</span>
                </div>

                {/* Google Sign Up */}
                <button
                  type="button"
                  className="btn-google-auth"
                  onClick={handleGoogleAuth}
                  disabled={isSubmitting}
                >
                  <GoogleLogo size={18} />
                  <span>{isSubmitting ? t("auth.connectingGoogle") : t("auth.continueGoogle")}</span>
                </button>

                {/* Footer Switch */}
                <div className="auth-footer-switch">
                  <span>{t("auth.haveAccount")}</span>{" "}
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setTab("signin");
                      setOtpStep(false);
                      setAuthError(null);
                      setErrors({});
                    }}
                  >
                    {t("auth.tabSignIn")}
                  </button>
                </div>
              </form>
            )}

            {/* --- TAB 2 STEP 2: OTP VERIFICATION --- */}
            {tab === "signup" && otpStep && (
              <form onSubmit={handleVerifyOtp} noValidate className="auth-inner-form">
                <div className="otp-info-card">
                  <p className="otp-info-text">
                    Verification code sent to <strong>{email}</strong>
                  </p>
                </div>

                {/* OTP Input Field */}
                <div className="form-group">
                  <label className="form-label" htmlFor="signup-otp">
                    {t("auth.otpLabel")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.otp ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <LockIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="signup-otp"
                      type="text"
                      className="form-input otp-digit-input"
                      placeholder={t("auth.otpPlaceholder")}
                      value={otp}
                      maxLength={8}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        if (errors.otp) setErrors((prev) => ({ ...prev, otp: null }));
                        if (authError) setAuthError(null);
                      }}
                      autoFocus
                    />
                  </div>
                  {errors.otp && (
                    <div className="field-error-msg" role="alert">{formatError(errors.otp, t)}</div>
                  )}
                </div>

                {/* Verify OTP Button */}
                <button
                  type="submit"
                  className="btn-primary-blue-wide"
                  disabled={isSubmitting}
                >
                  <span>{isSubmitting ? t("auth.verifyingOtp") : t("auth.verifyOtpBtn")}</span>
                  <CheckIcon size={18} color="#ffffff" />
                </button>

                {/* Resend OTP with Cooldown */}
                <div className="otp-resend-row">
                  {resendCooldown > 0 ? (
                    <span className="cooldown-text">
                      {t("auth.resendCooldown", { seconds: resendCooldown })}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-resend-otp"
                      onClick={handleResendOtp}
                      disabled={isSubmitting}
                    >
                      {t("auth.resendOtpBtn")}
                    </button>
                  )}
                </div>

                {/* Back to Edit Details */}
                <div className="auth-footer-switch">
                  <button
                    type="button"
                    className="auth-link-btn"
                    onClick={() => {
                      setOtpStep(false);
                      setAuthError(null);
                      setErrors({});
                    }}
                  >
                    ← Edit Details
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="modal-backdrop" role="dialog" aria-modal="true">
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">{t("auth.resetPasswordTitle")}</h3>
                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setShowForgotPassword(false)}
                >
                  ✕
                </button>
              </div>

              <p className="modal-desc">{t("auth.resetPasswordDesc")}</p>

              {resetStatus && (
                <div className={`reset-status-banner ${resetStatus.type}`}>
                  <span>{resetStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleSendPasswordReset} className="modal-form">
                <div className="form-group">
                  <label className="form-label" htmlFor="reset-email">
                    {t("auth.emailOnly")} <span className="req">*</span>
                  </label>
                  <div className="input-field-wrap">
                    <span className="input-prefix-icon">
                      <MailIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="reset-email"
                      type="email"
                      className="form-input"
                      value={resetEmailInput}
                      onChange={(e) => setResetEmailInput(e.target.value)}
                      placeholder={t("auth.emailOnlyPlaceholder")}
                      required
                    />
                  </div>
                </div>

                <div className="modal-actions-row">
                  <button
                    type="button"
                    className="btn-outline-back"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-blue-pill"
                    disabled={isResetting}
                  >
                    {isResetting ? t("common.loading") : t("auth.sendResetLinkBtn")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
