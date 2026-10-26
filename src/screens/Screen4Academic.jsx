import React, { useState } from "react";
import { useApp } from "../store.jsx";
import { Header } from "../components/Header.jsx";
import { Stepper } from "../components/Stepper.jsx";
import {
  GraduationCap,
  Chevron,
  ShieldIcon,
  ArrowLeft,
  CheckIcon,
} from "../icons.jsx";
import { BOARDS, PASSING_YEARS, COMMUNITY } from "../data.js";
import {
  calculateTneaCutoff,
  calculateAveragePercentage,
  checkMinimumEligibility,
  formatCutoff,
  getCutoffFormulaBreakdown,
} from "../cutoff.js";

export function Screen4Academic() {
  const { t, user, updateUserData, setStep } = useApp();

  // Controlled form states
  const [board, setBoard] = useState(user.board || "Tamil Nadu State Board");
  const [passingYear, setPassingYear] = useState(user.passingYear || "2026");
  const [schoolName, setSchoolName] = useState(user.schoolName || "");
  const [hasTneaReg, setHasTneaReg] = useState(user.hasTneaReg || "no");
  const [regNumber, setRegNumber] = useState(user.regNumber || "");

  // Marks
  const [maths, setMaths] = useState(user.maths || "90");
  const [physics, setPhysics] = useState(user.physics || "85");
  const [chemistry, setChemistry] = useState(user.chemistry || "95");
  const [maxMaths, setMaxMaths] = useState(user.maxMaths || "100");
  const [maxPhysics, setMaxPhysics] = useState(user.maxPhysics || "100");
  const [maxChemistry, setMaxChemistry] = useState(user.maxChemistry || "100");

  // Eligibility & quotas
  const [community, setCommunity] = useState(user.community || "BC");
  const [studiedGovtSchool, setStudiedGovtSchool] = useState(user.studiedGovtSchool || "no");
  const [firstGraduate, setFirstGraduate] = useState(user.firstGraduate || "yes");
  const [specialReservations, setSpecialReservations] = useState(user.specialReservations || []);
  const [declared, setDeclared] = useState(user.academicDeclared ?? true);

  const [errors, setErrors] = useState({});

  // Dynamic live calculations
  const liveCutoff = calculateTneaCutoff(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
  const liveAvg = calculateAveragePercentage(maths, physics, chemistry, maxMaths, maxPhysics, maxChemistry);
  const liveElig = checkMinimumEligibility(liveAvg, community);
  const formulaStr = getCutoffFormulaBreakdown(maths, physics, chemistry);

  const toggleSpecialRes = (key) => {
    setSpecialReservations((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const validateSubjectMark = (val, maxVal, nameKey) => {
    if (val === "" || val === null || val === undefined) {
      return t(`val.${nameKey}Required`);
    }
    const num = parseFloat(val);
    const maxNum = parseFloat(maxVal);
    if (isNaN(num)) return t("val.marksInvalid");
    if (num < 0) return t("val.marksNegative");
    if (num > maxNum) return t("val.marksExceed", { max: maxNum });
    return null;
  };

  const validate = () => {
    const errs = {};
    if (!board) errs.board = t("val.boardRequired");
    if (!passingYear) errs.passingYear = t("val.passingYearRequired");
    if (!schoolName.trim()) errs.schoolName = t("val.schoolNameRequired");

    const mErr = validateSubjectMark(maths, maxMaths, "maths");
    if (mErr) errs.maths = mErr;

    const pErr = validateSubjectMark(physics, maxPhysics, "physics");
    if (pErr) errs.physics = pErr;

    const cErr = validateSubjectMark(chemistry, maxChemistry, "chemistry");
    if (cErr) errs.chemistry = cErr;

    if (!declared) errs.declared = t("val.declarationRequired");

    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Save all details
      updateUserData({
        board,
        passingYear,
        schoolName,
        hasTneaReg,
        regNumber,
        maths,
        physics,
        chemistry,
        maxMaths,
        maxPhysics,
        maxChemistry,
        community,
        studiedGovtSchool,
        firstGraduate,
        specialReservations,
        academicDeclared: declared,
        isProfileComplete: true,
      });

      // Move to Screen 5: Main Dashboard
      setStep(4);
    }
  };

  const handleBack = () => {
    // Preserve current entered values
    updateUserData({
      board,
      passingYear,
      schoolName,
      hasTneaReg,
      regNumber,
      maths,
      physics,
      chemistry,
      maxMaths,
      maxPhysics,
      maxChemistry,
      community,
      studiedGovtSchool,
      firstGraduate,
      specialReservations,
      academicDeclared: declared,
    });
    setStep(2);
  };

  return (
    <div className="flow-screen-wrap">
      <Header subtitle={t("app.guideSubtitle")} />

      <main className="flow-content-grid">
        {/* Left Column: Vertical Stepper */}
        <Stepper activeStep={3} />

        {/* Center Column: Academic Form Card */}
        <section className="flow-form-card" aria-labelledby="academic-heading">
          <div className="form-card-header">
            <div className="form-card-badge-icon bg-blue-subtle">
              <GraduationCap size={24} color="#1d4ed8" />
            </div>
            <div className="form-card-title-group">
              <span className="step-tag-pill">{t("academic.badge")}</span>
              <h2 id="academic-heading" className="form-card-title">
                {t("academic.title")}
              </h2>
              <p className="form-card-subtitle">{t("academic.subtitle")}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="form-sections-wrap">
            {/* 1. Academic Details */}
            <div className="form-section-block">
              <div className="section-title-row">
                <GraduationCap size={16} color="#1d4ed8" />
                <h3 className="section-heading">{t("academic.secAcademic")}</h3>
              </div>

              <div className="form-grid two-col">
                {/* Board of Study */}
                <div className="form-group">
                  <label className="form-label" htmlFor="board">
                    {t("academic.board")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.board ? "has-error" : ""}`}>
                    <select
                      id="board"
                      className="form-select"
                      value={board}
                      onChange={(e) => {
                        setBoard(e.target.value);
                        if (errors.board) setErrors((p) => ({ ...p, board: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("academic.selectBoard")}
                      </option>
                      {BOARDS.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.board && <div className="field-error-msg">{errors.board}</div>}
                </div>

                {/* Year of Passing */}
                <div className="form-group">
                  <label className="form-label" htmlFor="passingYear">
                    {t("academic.passingYear")} <span className="req">*</span>
                  </label>
                  <div className={`select-field-wrap ${errors.passingYear ? "has-error" : ""}`}>
                    <select
                      id="passingYear"
                      className="form-select"
                      value={passingYear}
                      onChange={(e) => {
                        setPassingYear(e.target.value);
                        if (errors.passingYear) setErrors((p) => ({ ...p, passingYear: null }));
                      }}
                    >
                      <option value="" disabled>
                        {t("academic.selectYear")}
                      </option>
                      {PASSING_YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <Chevron size={14} color="#64748b" />
                  </div>
                  {errors.passingYear && <div className="field-error-msg">{errors.passingYear}</div>}
                </div>
              </div>

              {/* School Name */}
              <div className="form-group">
                <label className="form-label" htmlFor="schoolName">
                  {t("academic.schoolName")} <span className="req">*</span>
                </label>
                <div className={`input-field-wrap ${errors.schoolName ? "has-error" : ""}`}>
                  <input
                    id="schoolName"
                    type="text"
                    className="form-input"
                    placeholder={t("academic.schoolNamePlaceholder")}
                    value={schoolName}
                    onChange={(e) => {
                      setSchoolName(e.target.value);
                      if (errors.schoolName) setErrors((p) => ({ ...p, schoolName: null }));
                    }}
                  />
                </div>
                {errors.schoolName && <div className="field-error-msg">{errors.schoolName}</div>}
              </div>

              {/* Have you registered for TNEA 2026? */}
              <div className="form-group">
                <label className="form-label">{t("academic.regQuestion")}</label>
                <div className="toggle-pill-row">
                  <button
                    type="button"
                    className={`segmented-pill-btn ${hasTneaReg === "yes" ? "active" : ""}`}
                    onClick={() => setHasTneaReg("yes")}
                  >
                    {t("academic.registeredYes")}
                  </button>
                  <button
                    type="button"
                    className={`segmented-pill-btn ${hasTneaReg === "no" ? "active" : ""}`}
                    onClick={() => setHasTneaReg("no")}
                  >
                    {t("academic.registeredNotYet")}
                  </button>
                </div>
                {hasTneaReg === "no" ? (
                  <p className="field-helper-note">{t("academic.regNote")}</p>
                ) : (
                  <div className="input-field-wrap mt-2">
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t("academic.regNumberPlaceholder")}
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 2. Class 12 Marks */}
            <div className="form-section-block">
              <div className="section-title-row">
                <h3 className="section-heading">{t("academic.secMarks")}</h3>
              </div>
              <p className="section-sub-info">{t("academic.marksNote")}</p>

              <div className="marks-entry-table">
                <div className="table-row table-header">
                  <div className="col-subject">{t("academic.thSubject")}</div>
                  <div className="col-obtained">{t("academic.thMarksObtained")}</div>
                  <div className="col-max">{t("academic.thMaxMarks")}</div>
                </div>

                {/* Mathematics */}
                <div className="table-row">
                  <div className="col-subject subject-name">{t("academic.subMaths")}</div>
                  <div className="col-obtained">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={maxMaths}
                      className={`marks-input ${errors.maths ? "has-error" : ""}`}
                      value={maths}
                      onChange={(e) => {
                        setMaths(e.target.value);
                        if (errors.maths) setErrors((p) => ({ ...p, maths: null }));
                      }}
                    />
                    {errors.maths && <div className="field-error-msg">{errors.maths}</div>}
                  </div>
                  <div className="col-max">
                    <input
                      type="number"
                      className="marks-input-max"
                      value={maxMaths}
                      onChange={(e) => setMaxMaths(e.target.value)}
                    />
                  </div>
                </div>

                {/* Physics */}
                <div className="table-row">
                  <div className="col-subject subject-name">{t("academic.subPhysics")}</div>
                  <div className="col-obtained">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={maxPhysics}
                      className={`marks-input ${errors.physics ? "has-error" : ""}`}
                      value={physics}
                      onChange={(e) => {
                        setPhysics(e.target.value);
                        if (errors.physics) setErrors((p) => ({ ...p, physics: null }));
                      }}
                    />
                    {errors.physics && <div className="field-error-msg">{errors.physics}</div>}
                  </div>
                  <div className="col-max">
                    <input
                      type="number"
                      className="marks-input-max"
                      value={maxPhysics}
                      onChange={(e) => setMaxPhysics(e.target.value)}
                    />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="table-row">
                  <div className="col-subject subject-name">{t("academic.subChemistry")}</div>
                  <div className="col-obtained">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      max={maxChemistry}
                      className={`marks-input ${errors.chemistry ? "has-error" : ""}`}
                      value={chemistry}
                      onChange={(e) => {
                        setChemistry(e.target.value);
                        if (errors.chemistry) setErrors((p) => ({ ...p, chemistry: null }));
                      }}
                    />
                    {errors.chemistry && <div className="field-error-msg">{errors.chemistry}</div>}
                  </div>
                  <div className="col-max">
                    <input
                      type="number"
                      className="marks-input-max"
                      value={maxChemistry}
                      onChange={(e) => setMaxChemistry(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Eligibility & Additional Information */}
            <div className="form-section-block">
              <div className="section-title-row">
                <ShieldIcon size={16} color="#1d4ed8" />
                <h3 className="section-heading">{t("academic.secEligibility")}</h3>
              </div>

              {/* Community */}
              <div className="form-group">
                <label className="form-label" htmlFor="acad-community">
                  {t("personal.community")} <span className="req">*</span>
                </label>
                <div className="select-field-wrap">
                  <select
                    id="acad-community"
                    className="form-select"
                    value={community}
                    onChange={(e) => setCommunity(e.target.value)}
                  >
                    {COMMUNITY.map((c) => (
                      <option key={c} value={c.split(" ")[0]}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <Chevron size={14} color="#64748b" />
                </div>
                <p className="field-helper-note">{t("academic.communityNote")}</p>
              </div>

              {/* Govt School & First Graduate */}
              <div className="form-grid two-col">
                <div className="form-group">
                  <label className="form-label">{t("academic.govtSchoolQuestion")}</label>
                  <div className="toggle-pill-row">
                    <button
                      type="button"
                      className={`segmented-pill-btn ${studiedGovtSchool === "yes" ? "active" : ""}`}
                      onClick={() => setStudiedGovtSchool("yes")}
                    >
                      {t("academic.yes")}
                    </button>
                    <button
                      type="button"
                      className={`segmented-pill-btn ${studiedGovtSchool === "no" ? "active" : ""}`}
                      onClick={() => setStudiedGovtSchool("no")}
                    >
                      {t("academic.no")}
                    </button>
                  </div>
                  <p className="field-helper-note">{t("academic.govtSchoolNote")}</p>
                </div>

                <div className="form-group">
                  <label className="form-label">{t("academic.firstGraduateQuestion")}</label>
                  <div className="toggle-pill-row">
                    <button
                      type="button"
                      className={`segmented-pill-btn ${firstGraduate === "yes" ? "active" : ""}`}
                      onClick={() => setFirstGraduate("yes")}
                    >
                      {t("academic.yes")}
                    </button>
                    <button
                      type="button"
                      className={`segmented-pill-btn ${firstGraduate === "no" ? "active" : ""}`}
                      onClick={() => setFirstGraduate("no")}
                    >
                      {t("academic.no")}
                    </button>
                    <button
                      type="button"
                      className={`segmented-pill-btn ${firstGraduate === "not_sure" ? "active" : ""}`}
                      onClick={() => setFirstGraduate("not_sure")}
                    >
                      {t("academic.notSure")}
                    </button>
                  </div>
                  <p className="field-helper-note">{t("academic.firstGraduateNote")}</p>
                </div>
              </div>

              {/* Special reservations */}
              <div className="form-group">
                <label className="form-label">{t("academic.specialReservations")}</label>
                <div className="special-checks-grid">
                  <label className="checkbox-tile">
                    <input
                      type="checkbox"
                      checked={specialReservations.includes("disabled")}
                      onChange={() => toggleSpecialRes("disabled")}
                    />
                    <span>{t("academic.resDisabled")}</span>
                  </label>
                  <label className="checkbox-tile">
                    <input
                      type="checkbox"
                      checked={specialReservations.includes("ex_service")}
                      onChange={() => toggleSpecialRes("ex_service")}
                    />
                    <span>{t("academic.resExService")}</span>
                  </label>
                  <label className="checkbox-tile">
                    <input
                      type="checkbox"
                      checked={specialReservations.includes("sports")}
                      onChange={() => toggleSpecialRes("sports")}
                    />
                    <span>{t("academic.resSports")}</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Declaration Card */}
            <div className="declaration-card-box">
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
                  {t("academic.declarationText")} <span className="req">*</span>
                </span>
              </label>
              {errors.declared && <div className="field-error-msg">{errors.declared}</div>}
            </div>

            {/* Form Footer Actions */}
            <div className="form-nav-actions">
              <button
                type="button"
                className="btn-outline-back"
                onClick={handleBack}
              >
                <ArrowLeft size={16} />
                <span>{t("common.back")}</span>
              </button>

              <div className="submit-with-note">
                <button type="submit" className="btn-primary-blue-pill">
                  <span>{t("academic.completeProfile")}</span>
                  <CheckIcon size={16} color="#FFFFFF" />
                </button>
                <span className="footer-action-note">{t("academic.completeHelper")}</span>
              </div>
            </div>
          </form>
        </section>

        {/* Right Column: Live Cutoff Sidebar */}
        <aside className="cutoff-sidebar" aria-label="Live Cutoff Calculation and Rules">
          {/* 1. Main Cutoff Score Card */}
          <div className="cutoff-main-card">
            <div className="cutoff-card-head">
              <span className="cutoff-card-icon">🖩</span>
              <span className="cutoff-card-title">{t("academic.sidebarCutoffTitle")}</span>
            </div>

            <div className="cutoff-score-display">
              <span className="score-number">{formatCutoff(liveCutoff)}</span>
              <span className="score-max">/ 200</span>
            </div>

            <div className="cutoff-formula-tag">
              <code>{formulaStr}</code>
            </div>

            <div className="cutoff-average-row">
              <span className="avg-label">{t("academic.sidebarAvg")}</span>
              <span className="avg-val">
                {liveAvg !== null ? `${liveAvg.toFixed(2)}%` : "0.00%"}
              </span>
            </div>
          </div>

          {/* 2. Minimum Eligibility Card */}
          <div className={`cutoff-status-card ${liveElig.eligible ? "status-success" : "status-warning"}`}>
            <div className="status-badge-row">
              <span className="status-badge-icon">
                <CheckIcon size={16} color="#16a34a" />
              </span>
              <h4 className="status-badge-title">
                {liveElig.eligible
                  ? t("academic.sidebarEligibleTitle")
                  : t("academic.sidebarNotEligibleTitle")}
              </h4>
            </div>

            <p className="status-card-desc">
              {t("academic.sidebarEligibleDesc", {
                avg: liveAvg !== null ? liveAvg.toFixed(2) : "0.00",
                community,
                minRequired: liveElig.minRequired,
              })}
            </p>

            <div className="status-disclaimer-box">
              <span className="info-icon-circle">ℹ</span>
              <p>{t("academic.sidebarDisclaimer")}</p>
            </div>
          </div>

          {/* 3. How this works Card */}
          <div className="how-it-works-card">
            <h4 className="how-heading">{t("academic.howThisWorks")}</h4>
            <ol className="how-rules-list">
              <li>
                <span className="rule-num">1</span>
                <span>{t("academic.rule1")}</span>
              </li>
              <li>
                <span className="rule-num">2</span>
                <span>{t("academic.rule2")}</span>
              </li>
              <li>
                <span className="rule-num">3</span>
                <span>{t("academic.rule3")}</span>
              </li>
              <li>
                <span className="rule-num">4</span>
                <span>{t("academic.rule4")}</span>
              </li>
            </ol>
          </div>
        </aside>
      </main>
    </div>
  );
}
