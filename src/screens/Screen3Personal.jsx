import React, { useState } from "react";
import { useApp } from "../store.jsx";
import { Header } from "../components/Header.jsx";
import { Stepper } from "../components/Stepper.jsx";
import { createError, formatError } from "../validation.js";
import {
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  HomeIcon,
  MapPinIcon,
  Chevron,
  ShieldIcon,
  ArrowLeft,
  ArrowRight,
} from "../icons.jsx";
import { COMMUNITY, GENDERS, STATES, TN_DISTRICTS } from "../data.js";

export function Screen3Personal() {
  const { t, user, updateUserData, setStep, lang } = useApp();

  // Controlled form values initialized from persistent store
  const [fullName, setFullName] = useState(user.fullName || "");
  const [dob, setDob] = useState(user.dob || "");
  const [gender, setGender] = useState(user.gender || "");
  const [community, setCommunity] = useState(user.community || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [state, setState] = useState(user.state || "Tamil Nadu");
  const [district, setDistrict] = useState(user.district || "");
  const [nativePlace, setNativePlace] = useState(user.nativePlace || "");
  const [address, setAddress] = useState(user.address || "");
  const [declared, setDeclared] = useState(user.personalDeclared ?? true);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = createError("val.fullNameRequired");
    }
    if (!dob) {
      errs.dob = createError("val.dobRequired");
    }
    if (!gender) {
      errs.gender = createError("val.genderRequired");
    }
    if (!community) {
      errs.community = createError("val.communityRequired");
    }
    if (!mobile.trim()) {
      errs.mobile = createError("val.mobileRequired");
    } else if (!/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
      errs.mobile = createError("val.mobileInvalid");
    }
    if (!state) {
      errs.state = createError("val.stateRequired");
    }
    if (!district) {
      errs.district = createError("val.districtRequired");
    }
    if (!nativePlace.trim()) {
      errs.nativePlace = createError("val.nativePlaceRequired");
    }
    if (!address.trim()) {
      errs.address = createError("val.addressRequired");
    }
    if (!declared) {
      errs.declared = createError("val.declarationRequired");
    }
    return errs;
  };

  const handleNext = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setTouched({
      fullName: true,
      dob: true,
      gender: true,
      community: true,
      mobile: true,
      state: true,
      district: true,
      nativePlace: true,
      address: true,
      declared: true,
    });

    if (Object.keys(validationErrors).length === 0) {
      // Save data
      updateUserData({
        fullName,
        dob,
        gender,
        community,
        mobile,
        state,
        district,
        nativePlace,
        address,
        personalDeclared: declared,
        isPersonalComplete: true,
      });
      // Move to Screen 4 (Academic)
      setStep(3);
    }
  };

  const handleBack = () => {
    // Preserve current entered form values before moving back
    updateUserData({
      fullName,
      dob,
      gender,
      community,
      mobile,
      state,
      district,
      nativePlace,
      address,
      personalDeclared: declared,
    });
    setStep(1);
  };

  return (
    <div className="flow-screen-wrap">
      <Header subtitle={t("app.guideSubtitle")} />

      <main className="flow-content-grid">
        {/* Left Column: Vertical Stepper */}
        <Stepper activeStep={2} />

        {/* Center Column: Form Card */}
        <section className="flow-form-card" aria-labelledby="personal-heading">
          <div className="form-card-header">
            <div className="form-card-badge-icon bg-blue-subtle">
              <UserIcon size={24} color="#1d4ed8" />
            </div>
            <div className="form-card-title-group">
              <span className="step-tag-pill">{t("personal.badge")}</span>
              <h2 id="personal-heading" className="form-card-title">
                {t("personal.title")}
              </h2>
              <p className="form-card-subtitle">{t("personal.subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleNext} noValidate className="form-sections-wrap">
            {/* 1. Personal Details */}
            <div className="form-section-block">
              <div className="section-title-row">
                <UserIcon size={16} color="#1d4ed8" />
                <h3 className="section-heading">{t("personal.secPersonal")}</h3>
              </div>

              <div className="form-grid two-col">
                {/* Full Name */}
                <div className="form-group">
                  <label className="form-label" htmlFor="fullName">
                    {t("personal.fullName")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.fullName ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <UserIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="fullName"
                      type="text"
                      className="form-input"
                      placeholder={t("personal.fullNamePlaceholder")}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors((p) => ({ ...p, fullName: null }));
                      }}
                    />
                  </div>
                  {errors.fullName && <div className="field-error-msg" role="alert">{formatError(errors.fullName, t)}</div>}
                </div>

                {/* Date of Birth */}
                <div className="form-group">
                  <label className="form-label" htmlFor="dob">
                    {t("personal.dob")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.dob ? "has-error" : ""}`}>
                    <input
                      id="dob"
                      type="date"
                      className="form-input"
                      value={dob}
                      onChange={(e) => {
                        setDob(e.target.value);
                        if (errors.dob) setErrors((p) => ({ ...p, dob: null }));
                      }}
                    />
                    <span className="input-suffix-icon">
                      <CalendarIcon size={16} color="#64748b" />
                    </span>
                  </div>
                  {errors.dob && <div className="field-error-msg" role="alert">{formatError(errors.dob, t)}</div>}
                </div>
              </div>

              <div className="form-grid two-col">
                {/* Gender */}
                <div className="form-group">
                  <label className="form-label" htmlFor="gender">
                    {t("personal.gender")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.gender ? "has-error" : ""}`}>
                    <select
                      id="gender"
                      className="form-select"
                      value={gender}
                      onChange={(e) => {
                        setGender(e.target.value);
                        if (errors.gender) setErrors((p) => ({ ...p, gender: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("personal.selectGender")}
                      </option>
                      {GENDERS.map((g) => (
                        <option key={g.value} value={g.value}>
                          {lang === "ta" ? g.labelTa : g.labelEn}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.gender && <div className="field-error-msg" role="alert">{formatError(errors.gender, t)}</div>}
                </div>

                {/* Community */}
                <div className="form-group">
                  <label className="form-label" htmlFor="community">
                    {t("personal.community")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.community ? "has-error" : ""}`}>
                    <select
                      id="community"
                      className="form-select"
                      value={community}
                      onChange={(e) => {
                        setCommunity(e.target.value);
                        if (errors.community) setErrors((p) => ({ ...p, community: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("personal.selectCommunity")}
                      </option>
                      {COMMUNITY.map((c) => (
                        <option key={c} value={c.split(" ")[0]}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.community && <div className="field-error-msg" role="alert">{formatError(errors.community, t)}</div>}
                </div>
              </div>

              {/* Mobile Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="mobile">
                  {t("personal.mobile")} <span className="req">*</span>
                </label>
                <div className={`input-field-wrap prefix-phone ${errors.mobile ? "has-error" : ""}`}>
                  <span className="phone-country-tag">
                    <PhoneIcon size={14} color="#64748b" />
                    <span>+91</span>
                  </span>
                  <input
                    id="mobile"
                    type="tel"
                    maxLength={10}
                    className="form-input"
                    placeholder={t("personal.mobilePlaceholder")}
                    value={mobile}
                    onChange={(e) => {
                      setMobile(e.target.value);
                      if (errors.mobile) setErrors((p) => ({ ...p, mobile: null }));
                    }}
                  />
                </div>
                {errors.mobile && <div className="field-error-msg" role="alert">{formatError(errors.mobile, t)}</div>}
              </div>
            </div>

            {/* 2. Nativity Details */}
            <div className="form-section-block">
              <div className="section-title-row">
                <MapPinIcon size={16} color="#1d4ed8" />
                <h3 className="section-heading">{t("personal.secNativity")}</h3>
              </div>

              <div className="form-grid two-col">
                {/* State */}
                <div className="form-group">
                  <label className="form-label" htmlFor="state">
                    {t("personal.state")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.state ? "has-error" : ""}`}>
                    <select
                      id="state"
                      className="form-select"
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value);
                        if (errors.state) setErrors((p) => ({ ...p, state: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("personal.selectState")}
                      </option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.state && <div className="field-error-msg" role="alert">{formatError(errors.state, t)}</div>}
                </div>

                {/* District */}
                <div className="form-group">
                  <label className="form-label" htmlFor="district">
                    {t("personal.district")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.district ? "has-error" : ""}`}>
                    <select
                      id="district"
                      className="form-select"
                      value={district}
                      onChange={(e) => {
                        setDistrict(e.target.value);
                        if (errors.district) setErrors((p) => ({ ...p, district: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("personal.selectDistrict")}
                      </option>
                      {TN_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.district && <div className="field-error-msg" role="alert">{formatError(errors.district, t)}</div>}
                </div>
              </div>

              <div className="form-grid two-col">
                {/* Native Place */}
                <div className="form-group">
                  <label className="form-label" htmlFor="nativePlace">
                    {t("personal.nativePlace")} <span className="req">*</span>
                  </label>
                  <div className={`input-field-wrap ${errors.nativePlace ? "has-error" : ""}`}>
                    <span className="input-prefix-icon">
                      <HomeIcon size={16} color="#94a3b8" />
                    </span>
                    <input
                      id="nativePlace"
                      type="text"
                      className="form-input"
                      placeholder={t("personal.nativePlacePlaceholder")}
                      value={nativePlace}
                      onChange={(e) => {
                        setNativePlace(e.target.value);
                        if (errors.nativePlace) setErrors((p) => ({ ...p, nativePlace: null }));
                      }}
                    />
                  </div>
                  {errors.nativePlace && <div className="field-error-msg" role="alert">{formatError(errors.nativePlace, t)}</div>}
                </div>

                {/* Full Address */}
                <div className="form-group">
                  <label className="form-label" htmlFor="address">
                    {t("personal.address")} <span className="req">*</span>
                  </label>
                  <div className={`textarea-field-wrap ${errors.address ? "has-error" : ""}`}>
                    <span className="textarea-prefix-icon">
                      <MapPinIcon size={16} color="#94a3b8" />
                    </span>
                    <textarea
                      id="address"
                      rows={2}
                      className="form-textarea"
                      placeholder={t("personal.addressPlaceholder")}
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors((p) => ({ ...p, address: null }));
                      }}
                    />
                  </div>
                  {errors.address && <div className="field-error-msg" role="alert">{formatError(errors.address, t)}</div>}
                </div>
              </div>
            </div>

            {/* Declaration Card */}
            <div className="declaration-card-box">
              <div className="declaration-header">
                <ShieldIcon size={18} color="#1d4ed8" />
                <span className="declaration-title">Declaration</span>
              </div>
              <label className="declaration-check-label">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={(e) => {
                    setDeclared(e.target.checked);
                    if (errors.declared) setErrors((p) => ({ ...p, declared: null }));
                  }}
                />
                <span className="declaration-text">
                  {t("personal.declarationText")} <span className="req">*</span>
                </span>
              </label>
              {errors.declared && <div className="field-error-msg" role="alert">{formatError(errors.declared, t)}</div>}
            </div>

            {/* Action Buttons */}
            <div className="form-nav-actions">
              <button
                type="button"
                className="btn-outline-back"
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{t("common.back")}</span>
              </button>

              <button type="submit" className="btn-primary-blue-pill">
                <span>{t("common.next")}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </section>

        {/* Right Column: Quick Tips Sidebar */}
        <aside className="quick-tips-sidebar" aria-label="Quick Tips and guidelines">
          {/* Card Graphic */}
          <div className="tips-graphic-card">
            <svg viewBox="0 0 240 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="tips-svg-art">
              <rect width="240" height="140" rx="12" fill="#F0F9FF" />
              {/* ID Card Graphic */}
              <rect x="35" y="25" width="170" height="95" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="2" />
              <rect x="50" y="40" width="36" height="44" rx="4" fill="#DBEAFE" />
              <circle cx="68" cy="54" r="8" fill="#3B82F6" />
              <path d="M56 74 C56 66, 80 66, 80 74 Z" fill="#3B82F6" />
              <rect x="98" y="42" width="85" height="8" rx="4" fill="#93C5FD" />
              <rect x="98" y="58" width="65" height="6" rx="3" fill="#E2E8F0" />
              <rect x="98" y="70" width="75" height="6" rx="3" fill="#E2E8F0" />
              <rect x="98" y="82" width="40" height="6" rx="3" fill="#38BDF8" />
              {/* Location pin tag */}
              <circle cx="180" cy="75" r="7" fill="#2563EB" />
              <circle cx="180" cy="75" r="3" fill="#FFFFFF" />
            </svg>
          </div>

          {/* Quick Tips Box */}
          <div className="quick-tips-card">
            <h4 className="tips-heading">{t("personal.quickTips")}</h4>
            <ul className="tips-list">
              <li className="tip-item">
                <span className="tip-bullet">1</span>
                <span>{t("personal.tip1")}</span>
              </li>
              <li className="tip-item">
                <span className="tip-bullet">2</span>
                <span>{t("personal.tip2")}</span>
              </li>
              <li className="tip-item">
                <span className="tip-bullet">3</span>
                <span>{t("personal.tip3")}</span>
              </li>
              <li className="tip-item">
                <span className="tip-bullet">4</span>
                <span>{t("personal.tip4")}</span>
              </li>
            </ul>
          </div>

          <div className="slogan-script-note">
            <p>"{t("personal.slogan")}"</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
