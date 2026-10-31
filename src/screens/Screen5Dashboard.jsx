import React, { useState, useEffect } from "react";
import { useApp } from "../store.jsx";
import {
  GraduationCap,
  BellIcon,
  CalculatorIcon,
  BookmarkIcon,
  CalendarIcon,
  ClipboardIcon,
  MegaphoneIcon,
  SearchIcon,
  BarChartIcon,
  ListOrderedIcon,
  HelpCircleIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  ArrowRight,
  CheckIcon,
} from "../icons.jsx";
import { formatCutoff } from "../cutoff.js";
import {
  TNEA_COLLEGE_CATALOG,
  BRANCH_PREFERENCES,
} from "../data.js";
import {
  generateChoiceRecommendations,
  printChoiceListPdf,
  extractCommunityCode,
} from "../choiceEngine.js";

export function Screen5Dashboard() {
  const {
    t,
    lang,
    setLang,
    user,
    isAuthenticated,
    cutoff,
    averagePercentage,
    eligibility,
    savedColleges,
    toggleSaveCollege,
    choiceList,
    updateChoiceList,
    checklist,
    toggleChecklistItem,
    signOut,
    setStep,
  } = useApp();

  // Guard: User must be authenticated to view dashboard
  useEffect(() => {
    if (!isAuthenticated) {
      setStep(0);
    }
  }, [isAuthenticated]);

  // Active view: "dashboard" | "search_colleges" | "cutoff_analysis" | "choice_list" | "queries" | "profile" | "checklist" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");

  // Choice List state
  const [selectedBranches, setSelectedBranches] = useState(["CSE", "IT", "AIML", "ECE"]);
  const [isGeneratingChoices, setIsGeneratingChoices] = useState(false);
  const [customCollegeId, setCustomCollegeId] = useState("");

  const toggleBranch = (branchId) => {
    setSelectedBranches((prev) =>
      prev.includes(branchId)
        ? prev.filter((b) => b !== branchId)
        : [...prev, branchId]
    );
  };

  // Convert choiceList IDs to rich item objects (or use custom choices if stored as objects)
  const detailedChoices = choiceList.map((item, idx) => {
    if (typeof item === "object" && item !== null && item.code) {
      return { ...item, order: idx + 1 };
    }
    const found = TNEA_COLLEGE_CATALOG.find((c) => c.id === item);
    if (found) {
      const commCode = extractCommunityCode(user.community);
      const isGovt = user.studiedGovtSchool === "yes";
      let prevCutoff = found.cutoffs?.[commCode] || found.cutoff2025;
      if (isGovt && found.cutoffGovt7_5) prevCutoff = found.cutoffGovt7_5;

      const numCutoff = parseFloat(cutoff) || 160;
      let category = "Moderate";
      if (prevCutoff > numCutoff) category = "Ambitious";
      else if (prevCutoff < numCutoff - 3.5) category = "Safer";

      return {
        id: found.id,
        code: found.code,
        name: found.name,
        branch: found.branch,
        branchCode: found.branchCode,
        prevCutoff,
        category,
        order: idx + 1,
      };
    }
    return {
      id: item,
      code: "0000",
      name: `Option #${item}`,
      branch: "Engineering",
      prevCutoff: "—",
      category: "Moderate",
      order: idx + 1,
    };
  });

  const handleGenerateChoices = () => {
    setIsGeneratingChoices(true);
    setTimeout(() => {
      const recommended = generateChoiceRecommendations({
        cutoff,
        community: user.community || "BC",
        studiedGovtSchool: user.studiedGovtSchool || "no",
        selectedBranches,
      });

      updateChoiceList(recommended);
      setIsGeneratingChoices(false);
    }, 300);
  };

  const handleMoveChoice = (index, direction) => {
    const next = [...detailedChoices];
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= next.length) return;

    const tmp = next[targetIdx];
    next[targetIdx] = next[index];
    next[index] = tmp;

    const reordered = next.map((c, i) => ({ ...c, order: i + 1 }));
    updateChoiceList(reordered);
  };

  const handleRemoveChoice = (index) => {
    const filtered = detailedChoices.filter((_, i) => i !== index);
    const reordered = filtered.map((c, i) => ({ ...c, order: i + 1 }));
    updateChoiceList(reordered);
  };

  const handleAddCustomCollege = () => {
    if (!customCollegeId) return;
    const found = TNEA_COLLEGE_CATALOG.find((c) => c.id === Number(customCollegeId));
    if (!found) return;

    const commCode = extractCommunityCode(user.community);
    const isGovt = user.studiedGovtSchool === "yes";
    let prevCutoff = found.cutoffs?.[commCode] || found.cutoff2025;
    if (isGovt && found.cutoffGovt7_5) prevCutoff = found.cutoffGovt7_5;

    const numCutoff = parseFloat(cutoff) || 160;
    let category = "Moderate";
    if (prevCutoff > numCutoff) category = "Ambitious";
    else if (prevCutoff < numCutoff - 3.5) category = "Safer";

    const newItem = {
      id: found.id,
      code: found.code,
      name: found.name,
      branch: found.branch,
      branchCode: found.branchCode,
      prevCutoff,
      category,
      order: detailedChoices.length + 1,
    };

    updateChoiceList([...detailedChoices, newItem]);
    setCustomCollegeId("");
  };

  const handleDownloadPdf = () => {
    printChoiceListPdf({
      candidate: user,
      cutoff,
      choices: detailedChoices,
      lang,
      t,
    });
  };

  const filteredColleges = TNEA_COLLEGE_CATALOG.filter((col) => {
    const matchesSearch =
      col.name.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
      col.city.toLowerCase().includes(collegeSearchQuery.toLowerCase()) ||
      col.code.includes(collegeSearchQuery) ||
      col.branch.toLowerCase().includes(collegeSearchQuery.toLowerCase());
    const matchesDistrict =
      selectedDistrictFilter === "all" || col.district === selectedDistrictFilter;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="dashboard-container">
      {/* 1. Left Sidebar Navigation */}
      <aside className="dash-sidebar" aria-label="Main Navigation">
        <div className="dash-sidebar-brand" onClick={() => setActiveTab("dashboard")}>
          <div className="dash-brand-cap">
            <GraduationCap size={28} color="#1d4ed8" />
          </div>
          <div className="dash-brand-texts">
            <h1 className="dash-brand-title">{t("app.title")}</h1>
            <p className="dash-brand-sub">{t("app.subtitle")}</p>
          </div>
        </div>

        {/* Main Navigation Items */}
        <nav className="dash-nav-list">
          <button
            type="button"
            className={`dash-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="nav-icon-indicator">
              <CheckIcon size={16} color={activeTab === "dashboard" ? "#16a34a" : "#64748b"} />
            </div>
            <span>{t("dash.navDashboard")}</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "search_colleges" ? "active" : ""}`}
            onClick={() => setActiveTab("search_colleges")}
          >
            <SearchIcon size={18} />
            <span>{t("dash.navSearchColleges")}</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "cutoff_analysis" ? "active" : ""}`}
            onClick={() => setActiveTab("cutoff_analysis")}
          >
            <BarChartIcon size={18} />
            <span>{t("dash.navCutoffAnalysis")}</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "choice_list" ? "active" : ""}`}
            onClick={() => setActiveTab("choice_list")}
          >
            <ListOrderedIcon size={18} />
            <span>{t("dash.navChoiceList")}</span>
            {choiceList.length > 0 && (
              <span className="nav-badge-count">{choiceList.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "queries" ? "active" : ""}`}
            onClick={() => setActiveTab("queries")}
          >
            <HelpCircleIcon size={18} />
            <span>{t("dash.navQueries")}</span>
          </button>
        </nav>

        {/* Bottom Account Items */}
        <div className="dash-bottom-nav">
          <button
            type="button"
            className={`dash-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <UserIcon size={18} />
            <span>{t("dash.navMyProfile")}</span>
          </button>

          <button
            type="button"
            className={`dash-nav-item ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <SettingsIcon size={18} />
            <span>{t("dash.navSettings")}</span>
          </button>

          <button
            type="button"
            className="dash-nav-item text-danger"
            onClick={signOut}
          >
            <LogOutIcon size={18} color="#dc2626" />
            <span>{t("dash.navSignOut")}</span>
          </button>
        </div>
      </aside>

      {/* 2. Main View Area */}
      <div className="dash-main-area">
        {/* Top Header Bar */}
        <header className="dash-top-header">
          <div className="dash-header-left">
            <span className="dash-page-crumb">
              {activeTab === "dashboard"
                ? t("dash.navDashboard")
                : activeTab === "search_colleges"
                ? t("dash.navSearchColleges")
                : activeTab === "cutoff_analysis"
                ? t("dash.navCutoffAnalysis")
                : activeTab === "choice_list"
                ? t("dash.navChoiceList")
                : activeTab === "queries"
                ? t("dash.navQueries")
                : activeTab === "profile"
                ? t("dash.navMyProfile")
                : t("dash.navSettings")}
            </span>
          </div>

          <div className="dash-header-controls">
            {/* Language Selector */}
            <div className="lang-pill" role="group" aria-label="Language selector">
              <button
                type="button"
                className={`lang-opt ${lang === "en" ? "active" : ""}`}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <span className="lang-sep">/</span>
              <button
                type="button"
                className={`lang-opt ta-font ${lang === "ta" ? "active" : ""}`}
                onClick={() => setLang("ta")}
              >
                தமிழ்
              </button>
            </div>

            {/* Notification Bell */}
            <div className="notification-bell-wrap">
              <button
                type="button"
                className="bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
              >
                <BellIcon size={20} color="#64748b" />
                <span className="notification-red-dot" />
              </button>

              {showNotifications && (
                <div className="notifications-popover">
                  <div className="notif-header">
                    <h4>{t("dash.cardUpdatesTitle")}</h4>
                    <button type="button" onClick={() => setShowNotifications(false)}>✕</button>
                  </div>
                  <ul className="notif-list">
                    <li className="notif-item">
                      <strong>{t("dash.sampleUpdate1Title")}</strong>
                      <p>{t("dash.sampleUpdate1Desc")}</p>
                    </li>
                    <li className="notif-item">
                      <strong>{t("dash.sampleUpdate2Title")}</strong>
                      <p>{t("dash.sampleUpdate2Desc")}</p>
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* User Profile Avatar */}
            <div
              className="user-avatar-pill"
              onClick={() => setActiveTab("profile")}
              role="button"
              tabIndex={0}
              title={user.fullName || "Student Profile"}
            >
              <div className="avatar-circle">
                {(user.fullName || user.email || "S").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="dash-body-content">
          {activeTab === "dashboard" && (
            <>
              {/* Greetings */}
              <div className="dash-welcome-banner">
                <h2 className="dash-greeting-title">{t("dash.welcomeBack")}</h2>
                <p className="dash-greeting-sub">{t("dash.overview")}</p>
              </div>

              {/* 4 Summary Cards (2x2 Grid) */}
              <section className="dash-cards-grid" aria-label="Overview Summary Cards">
                {/* Card 1: Your Cutoff */}
                <div className="summary-overview-card">
                  <div className="overview-card-head">
                    <div className="overview-icon-box bg-blue-subtle">
                      <CalculatorIcon size={22} color="#0284c7" />
                    </div>
                  </div>
                  <div className="overview-card-body">
                    <h3 className="overview-card-title">{t("dash.cardCutoffTitle")}</h3>
                    <div className="overview-card-stat">
                      <span className="stat-big-val">{formatCutoff(cutoff)}</span>
                      <span className="stat-unit"> / 200</span>
                    </div>
                  </div>
                  <div className="overview-card-foot">
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => setActiveTab("cutoff_analysis")}
                    >
                      <span>{t("dash.cardCutoffAction")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 2: Saved Colleges */}
                <div className="summary-overview-card">
                  <div className="overview-card-head">
                    <div className="overview-icon-box bg-blue-subtle">
                      <BookmarkIcon size={22} color="#0284c7" />
                    </div>
                  </div>
                  <div className="overview-card-body">
                    <h3 className="overview-card-title">{t("dash.cardCollegesTitle")}</h3>
                    <div className="overview-card-stat">
                      <span className="stat-text-val">
                        {t("dash.cardCollegesCount", { count: savedColleges.length })}
                      </span>
                    </div>
                  </div>
                  <div className="overview-card-foot">
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => setActiveTab("search_colleges")}
                    >
                      <span>{t("dash.cardCollegesAction")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 3: Admission Updates */}
                <div className="summary-overview-card">
                  <div className="overview-card-head">
                    <div className="overview-icon-box bg-green-subtle">
                      <CalendarIcon size={22} color="#16a34a" />
                    </div>
                  </div>
                  <div className="overview-card-body">
                    <h3 className="overview-card-title">{t("dash.cardUpdatesTitle")}</h3>
                    <div className="overview-card-stat">
                      <span className="stat-sub-text">{t("dash.cardUpdatesSub")}</span>
                    </div>
                  </div>
                  <div className="overview-card-foot">
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => {
                        const el = document.getElementById("important-updates-sec");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      <span>{t("dash.cardUpdatesAction")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Card 4: Admission Checklist */}
                <div className="summary-overview-card">
                  <div className="overview-icon-box bg-purple-subtle">
                    <ClipboardIcon size={22} color="#9333ea" />
                  </div>
                  <div className="overview-card-body">
                    <h3 className="overview-card-title">{t("dash.cardChecklistTitle")}</h3>
                    <div className="overview-card-stat">
                      <span className="stat-sub-text">{t("dash.cardChecklistSub")}</span>
                    </div>
                  </div>
                  <div className="overview-card-foot">
                    <button
                      type="button"
                      className="card-action-link"
                      onClick={() => setActiveTab("checklist")}
                    >
                      <span>{t("dash.cardChecklistAction")}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </section>

              {/* Important Updates Full Width Section */}
              <section id="important-updates-sec" className="important-updates-card">
                <div className="updates-card-header">
                  <div className="updates-title-group">
                    <div className="updates-icon-circle">
                      <MegaphoneIcon size={20} color="#0284c7" />
                    </div>
                    <div>
                      <h3 className="updates-heading">{t("dash.importantUpdatesTitle")}</h3>
                      <p className="updates-desc">{t("dash.importantUpdatesDesc")}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="view-all-link"
                    onClick={() => setShowNotifications(true)}
                  >
                    {t("dash.viewAllUpdates")}
                  </button>
                </div>

                <div className="updates-list-table">
                  <div className="update-row-item">
                    <div className="update-item-text">
                      <h4 className="update-item-title">{t("dash.sampleUpdate1Title")}</h4>
                      <p className="update-item-desc">{t("dash.sampleUpdate1Desc")}</p>
                    </div>
                    <div className="update-item-date">{t("dash.sampleUpdate1Date")}</div>
                  </div>

                  <div className="update-row-item">
                    <div className="update-item-text">
                      <h4 className="update-item-title">{t("dash.sampleUpdate2Title")}</h4>
                      <p className="update-item-desc">{t("dash.sampleUpdate2Desc")}</p>
                    </div>
                    <div className="update-item-date">{t("dash.sampleUpdate2Date")}</div>
                  </div>

                  <div className="update-row-item">
                    <div className="update-item-text">
                      <h4 className="update-item-title">{t("dash.sampleUpdate3Title")}</h4>
                      <p className="update-item-desc">{t("dash.sampleUpdate3Desc")}</p>
                    </div>
                    <div className="update-item-date">{t("dash.sampleUpdate3Date")}</div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* AI-Assisted Choice List Subview (Requirement 4) */}
          {activeTab === "choice_list" && (
            <div className="subview-container">
              <div className="choice-page-header">
                <div>
                  <h2 className="choice-header-title">{t("choice.title")}</h2>
                  <p className="subview-desc">{t("choice.subtitle")}</p>
                </div>
                {detailedChoices.length > 0 && (
                  <button
                    type="button"
                    className="btn-download-pdf-pill"
                    onClick={handleDownloadPdf}
                  >
                    <span>📄 {t("choice.downloadPdf")}</span>
                  </button>
                )}
              </div>

              {/* Automatic Candidate Profile Retrieval Box */}
              <div className="choice-candidate-card">
                <div className="candidate-card-header">
                  <span className="card-badge-icon">👤</span>
                  <h4>{t("choice.candidateSummary")}</h4>
                </div>
                <div className="candidate-summary-pills">
                  <div className="summary-pill">
                    <span className="pill-lbl">{t("choice.storedCutoff")}</span>
                    <strong className="pill-val cutoff-val">{formatCutoff(cutoff)} / 200</strong>
                  </div>
                  <div className="summary-pill">
                    <span className="pill-lbl">{t("choice.storedCommunity")}</span>
                    <strong className="pill-val">{user.community || "BC"}</strong>
                  </div>
                  <div className="summary-pill">
                    <span className="pill-lbl">{t("choice.storedGovtQuota")}</span>
                    <strong className="pill-val">
                      {user.studiedGovtSchool === "yes" ? t("choice.yesEligible") : t("choice.notApplicable")}
                    </strong>
                  </div>
                  <div className="summary-pill">
                    <span className="pill-lbl">{t("choice.itemCount", { count: detailedChoices.length })}</span>
                  </div>
                </div>
              </div>

              {/* Branch Preference Selection */}
              <div className="branch-selection-card">
                <h4 className="branch-card-heading">{t("choice.selectBranches")}</h4>
                <div className="branch-chips-grid">
                  {BRANCH_PREFERENCES.map((b) => {
                    const isSelected = selectedBranches.includes(b.id);
                    return (
                      <button
                        key={b.id}
                        type="button"
                        className={`branch-chip-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => toggleBranch(b.id)}
                      >
                        <span className="chip-check">{isSelected ? "✓" : "+"}</span>
                        <span>{lang === "ta" ? b.nameTa : b.nameEn}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="generate-cta-row">
                  <button
                    type="button"
                    className="btn-generate-choices"
                    onClick={handleGenerateChoices}
                    disabled={isGeneratingChoices}
                  >
                    <span>{isGeneratingChoices ? t("choice.generating") : "✨ " + t("choice.generateBtn")}</span>
                  </button>
                </div>
              </div>

              {/* Indicative Cutoff Alert */}
              <div className="choice-indicative-alert">
                <span>ℹ️</span>
                <p>{t("choice.indicativeDisclaimer")}</p>
              </div>

              {/* Structured Choice List Table */}
              {detailedChoices.length === 0 ? (
                <div className="empty-state-card">
                  <p>{t("choice.empty")}</p>
                </div>
              ) : (
                <div className="choice-table-wrap">
                  <table className="choice-structured-table">
                    <thead>
                      <tr>
                        <th style={{ width: "80px", textAlign: "center" }}>{t("choice.thOrder")}</th>
                        <th style={{ width: "95px", textAlign: "center" }}>{t("choice.thCode")}</th>
                        <th>{t("choice.thCollege")}</th>
                        <th>{t("choice.thBranch")}</th>
                        <th style={{ width: "120px", textAlign: "center" }}>{t("choice.thCutoff")}</th>
                        <th style={{ width: "135px", textAlign: "center" }}>{t("choice.thCategory")}</th>
                        <th style={{ width: "130px", textAlign: "center" }}>{t("choice.thActions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedChoices.map((choice, index) => {
                        const catKey =
                          choice.category === "Ambitious"
                            ? "choice.catAmbitious"
                            : choice.category === "Safer"
                            ? "choice.catSafer"
                            : "choice.catModerate";

                        return (
                          <tr key={`${choice.id}-${index}`} className="choice-table-row">
                            <td className="cell-order">
                              <span className="order-circle">#{index + 1}</span>
                            </td>
                            <td className="cell-code">
                              <span className="college-code-tag">{choice.code}</span>
                            </td>
                            <td className="cell-name">
                              <strong>{choice.name}</strong>
                              <div className="cell-sub">{choice.city ? `📍 ${choice.city}` : ""}</div>
                            </td>
                            <td className="cell-branch">{choice.branch}</td>
                            <td className="cell-cutoff">
                              <strong>
                                {typeof choice.prevCutoff === "number"
                                  ? choice.prevCutoff.toFixed(2)
                                  : choice.prevCutoff || "—"}
                              </strong>
                            </td>
                            <td className="cell-category">
                              <span className={`category-pill pill-${(choice.category || "moderate").toLowerCase()}`}>
                                {t(catKey)}
                              </span>
                            </td>
                            <td className="cell-actions">
                              <div className="table-actions-group">
                                {index > 0 && (
                                  <button
                                    type="button"
                                    className="btn-order-move"
                                    title={t("choice.moveUp")}
                                    onClick={() => handleMoveChoice(index, -1)}
                                  >
                                    ▲
                                  </button>
                                )}
                                {index < detailedChoices.length - 1 && (
                                  <button
                                    type="button"
                                    className="btn-order-move"
                                    title={t("choice.moveDown")}
                                    onClick={() => handleMoveChoice(index, 1)}
                                  >
                                    ▼
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-order-delete"
                                  title={t("choice.remove")}
                                  onClick={() => handleRemoveChoice(index)}
                                >
                                  ✕
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Add Custom College / Branch Manually */}
              <div className="add-custom-choice-card">
                <h4>{t("choice.addCustomTitle")}</h4>
                <div className="add-custom-row">
                  <div className="select-field-wrap">
                    <select
                      className="form-select"
                      value={customCollegeId}
                      onChange={(e) => setCustomCollegeId(e.target.value)}
                    >
                      <option value="">-- {t("choice.selectCollege")} --</option>
                      {TNEA_COLLEGE_CATALOG.map((c) => (
                        <option key={c.id} value={c.id}>
                          [{c.code}] {c.name} — {c.branch} (Cutoff: {c.cutoff2025})
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    className="btn-primary-blue-pill"
                    onClick={handleAddCustomCollege}
                    disabled={!customCollegeId}
                  >
                    {t("choice.addCustomBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Colleges Subview */}
          {activeTab === "search_colleges" && (
            <div className="subview-container">
              <div className="subview-header">
                <h2>{t("colleges.title")}</h2>
                <div className="subview-search-controls">
                  <div className="input-field-wrap">
                    <SearchIcon size={16} />
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t("colleges.searchPlaceholder")}
                      value={collegeSearchQuery}
                      onChange={(e) => setCollegeSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="colleges-grid-list">
                {filteredColleges.map((col) => {
                  const isSaved = savedColleges.includes(col.id);
                  const isAddedChoice = detailedChoices.some((c) => c.id === col.id);
                  return (
                    <div key={col.id} className="college-card-item">
                      <div className="college-card-top">
                        <span className="college-code-badge">Code: {col.code}</span>
                        <span className="college-type-tag">{col.type}</span>
                      </div>
                      <h3 className="college-name">{col.name}</h3>
                      <div className="college-details-line">
                        <span>📍 {col.city}, {col.district}</span>
                        <span>🎓 {col.branch}</span>
                      </div>
                      <div className="college-cutoff-row">
                        <span className="prev-cutoff-tag">{t("choice.thCutoff")}: <b>{col.cutoff2025}</b></span>
                        <div className="college-actions-btn-group">
                          <button
                            type="button"
                            className={`btn-save-college ${isSaved ? "saved" : ""}`}
                            onClick={() => toggleSaveCollege(col.id)}
                          >
                            <BookmarkIcon size={14} color={isSaved ? "#2563eb" : "#64748b"} />
                            <span>{isSaved ? t("colleges.saved") : t("colleges.save")}</span>
                          </button>
                          <button
                            type="button"
                            className={`btn-choice-add ${isAddedChoice ? "added" : ""}`}
                            onClick={() => {
                              if (isAddedChoice) {
                                updateChoiceList(detailedChoices.filter((c) => c.id !== col.id));
                              } else {
                                updateChoiceList([...detailedChoices, {
                                  id: col.id,
                                  code: col.code,
                                  name: col.name,
                                  branch: col.branch,
                                  branchCode: col.branchCode,
                                  prevCutoff: col.cutoff2025,
                                  category: "Moderate",
                                  order: detailedChoices.length + 1,
                                }]);
                              }
                            }}
                          >
                            {isAddedChoice ? "✓ In Choices" : "+ Add Choice"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cutoff Analysis Subview */}
          {activeTab === "cutoff_analysis" && (
            <div className="subview-container">
              <div className="cutoff-analysis-layout">
                <div className="cutoff-main-card">
                  <div className="cutoff-card-head">
                    <span className="cutoff-card-icon">🖩</span>
                    <span className="cutoff-card-title">{t("academic.sidebarCutoffTitle")}</span>
                  </div>
                  <div className="cutoff-score-display">
                    <span className="score-number">{formatCutoff(cutoff)}</span>
                    <span className="score-max">/ 200</span>
                  </div>
                  <div className="cutoff-average-row">
                    <span>{t("academic.sidebarAvg")}:</span>
                    <b>{averagePercentage !== null ? `${averagePercentage.toFixed(2)}%` : "N/A"}</b>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      className="btn-outline-back"
                      onClick={() => setStep(3)}
                    >
                      {t("analysis.editMarks")}
                    </button>
                  </div>
                </div>

                <div className="analysis-breakdown-card">
                  <h3>{t("analysis.breakdownTitle")}</h3>
                  <div className="marks-analysis-row">
                    <div className="subject-box">
                      <span>{t("academic.subMaths")}</span>
                      <b>{user.maths || "—"} / {user.maxMaths || 100}</b>
                      <small>{t("analysis.fullWeightage")}</small>
                    </div>
                    <div className="subject-box">
                      <span>{t("academic.subPhysics")}</span>
                      <b>{user.physics || "—"} / {user.maxPhysics || 100}</b>
                      <small>{t("analysis.halfWeightage")}</small>
                    </div>
                    <div className="subject-box">
                      <span>{t("academic.subChemistry")}</span>
                      <b>{user.chemistry || "—"} / {user.maxChemistry || 100}</b>
                      <small>{t("analysis.halfWeightage")}</small>
                    </div>
                  </div>
                  <div className={`cutoff-status-card mt-4 ${eligibility.eligible ? "status-success" : "status-warning"}`}>
                    <h4>{eligibility.eligible ? t("academic.sidebarEligibleTitle") : t("academic.sidebarNotEligibleTitle")}</h4>
                    <p>{t("academic.sidebarEligibleDesc", {
                      avg: averagePercentage !== null ? averagePercentage.toFixed(2) : "0",
                      community: user.community || "BC",
                      minRequired: eligibility.minRequired
                    })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Admission Checklist Subview */}
          {activeTab === "checklist" && (
            <div className="subview-container">
              <h2>{t("dash.cardChecklistTitle")}</h2>
              <div className="checklist-items-wrap">
                {checklist.map((item) => (
                  <label key={item.id} className="checklist-task-row">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id)}
                    />
                    <span className={`task-title ${item.completed ? "task-done" : ""}`}>
                      {lang === "ta" ? item.titleTa : item.titleEn}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Student Profile Subview */}
          {activeTab === "profile" && (
            <div className="subview-container">
              <div className="subview-header">
                <h2>{t("profile.title")}</h2>
                <button
                  type="button"
                  className="btn-primary-blue-pill"
                  onClick={() => setStep(2)}
                >
                  <span>{t("profile.edit")}</span>
                </button>
              </div>

              <div className="profile-details-grid">
                <div className="profile-detail-card">
                  <h4>{t("profile.personalSec")}</h4>
                  <p><b>{t("profile.name")}</b> {user.fullName || "—"}</p>
                  <p><b>{t("profile.email")}</b> {user.email || "—"}</p>
                  <p><b>{t("profile.mobile")}</b> {user.mobile ? `+91 ${user.mobile}` : "—"}</p>
                  <p><b>{t("profile.dob")}</b> {user.dob || "—"}</p>
                  <p><b>{t("profile.gender")}</b> {user.gender || "—"}</p>
                  <p><b>{t("profile.community")}</b> {user.community || "—"}</p>
                  <p><b>{t("profile.state")}</b> {user.state || "—"}</p>
                  <p><b>{t("profile.district")}</b> {user.district || "—"}</p>
                  <p><b>{t("profile.nativePlace")}</b> {user.nativePlace || "—"}</p>
                  <p><b>{t("profile.address")}</b> {user.address || "—"}</p>
                </div>

                <div className="profile-detail-card">
                  <h4>{t("profile.academicSec")}</h4>
                  <p><b>{t("profile.board")}</b> {user.board || "—"}</p>
                  <p><b>{t("profile.passingYear")}</b> {user.passingYear || "—"}</p>
                  <p><b>{t("profile.school")}</b> {user.schoolName || "—"}</p>
                  <p><b>{t("profile.maths")}</b> {user.maths !== "" ? `${user.maths} / ${user.maxMaths}` : "—"}</p>
                  <p><b>{t("profile.physics")}</b> {user.physics !== "" ? `${user.physics} / ${user.maxPhysics}` : "—"}</p>
                  <p><b>{t("profile.chemistry")}</b> {user.chemistry !== "" ? `${user.chemistry} / ${user.maxChemistry}` : "—"}</p>
                  <p><b>{t("profile.cutoff")}</b> {formatCutoff(cutoff)} / 200</p>
                  <p><b>{t("profile.average")}</b> {averagePercentage !== null ? `${averagePercentage.toFixed(2)}%` : "N/A"}</p>
                  <p><b>{t("profile.govtQuota")}</b> {user.studiedGovtSchool === "yes" ? t("choice.yesEligible") : t("choice.notApplicable")}</p>
                  <p><b>{t("profile.firstGraduate")}</b> {user.firstGraduate === "yes" ? t("academic.yes") : t("academic.no")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Queries & Solutions Subview (100% Bilingual FAQs) */}
          {activeTab === "queries" && (
            <div className="subview-container">
              <h2>{t("queries.title")}</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <h4>Q: {t("queries.q1")}</h4>
                  <p>{t("queries.a1")}</p>
                </div>
                <div className="faq-item">
                  <h4>Q: {t("queries.q2")}</h4>
                  <p>{t("queries.a2")}</p>
                </div>
                <div className="faq-item">
                  <h4>Q: {t("queries.q3")}</h4>
                  <p>{t("queries.a3")}</p>
                </div>
                <div className="faq-item">
                  <h4>Q: {t("queries.q4")}</h4>
                  <p>{t("queries.a4")}</p>
                </div>
                <div className="faq-item">
                  <h4>Q: {t("queries.q5")}</h4>
                  <p>{t("queries.a5")}</p>
                </div>
                <div className="faq-item">
                  <h4>Q: {t("queries.q6")}</h4>
                  <p>{t("queries.a6")}</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Subview */}
          {activeTab === "settings" && (
            <div className="subview-container">
              <h2>{t("settings.title")}</h2>
              <div className="profile-detail-card">
                <h4>{t("settings.langLabel")}</h4>
                <div className="setting-row mt-3">
                  <div className="lang-pill ml-3">
                    <button
                      type="button"
                      className={`lang-opt ${lang === "en" ? "active" : ""}`}
                      onClick={() => setLang("en")}
                    >
                      EN (English)
                    </button>
                    <button
                      type="button"
                      className={`lang-opt ta-font ${lang === "ta" ? "active" : ""}`}
                      onClick={() => setLang("ta")}
                    >
                      தமிழ் (Tamil)
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
