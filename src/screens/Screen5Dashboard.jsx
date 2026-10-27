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
import { SAMPLE_COLLEGES } from "../data.js";

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

  // Active view or modal: "dashboard" | "search_colleges" | "cutoff_analysis" | "choice_list" | "queries" | "profile" | "checklist" | "settings"
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showNotifications, setShowNotifications] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState("all");

  const filteredColleges = SAMPLE_COLLEGES.filter((col) => {
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
        {/* Top Header Bar (No audio buttons) */}
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
                  <div className="overview-card-head">
                    <div className="overview-icon-box bg-purple-subtle">
                      <ClipboardIcon size={22} color="#9333ea" />
                    </div>
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
                  const isAddedChoice = choiceList.includes(col.id);
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
                        <span className="prev-cutoff-tag">2025 Cutoff: <b>{col.cutoff2025}</b></span>
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
                                updateChoiceList(choiceList.filter((id) => id !== col.id));
                              } else {
                                updateChoiceList([...choiceList, col.id]);
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
                      ✏️ Edit Marks in Academic Details
                    </button>
                  </div>
                </div>

                <div className="analysis-breakdown-card">
                  <h3>Subject Marks Breakdown</h3>
                  <div className="marks-analysis-row">
                    <div className="subject-box">
                      <span>Mathematics</span>
                      <b>{user.maths || "—"} / {user.maxMaths || 100}</b>
                      <small>Full Weightage (100)</small>
                    </div>
                    <div className="subject-box">
                      <span>Physics</span>
                      <b>{user.physics || "—"} / {user.maxPhysics || 100}</b>
                      <small>Half Weightage (50)</small>
                    </div>
                    <div className="subject-box">
                      <span>Chemistry</span>
                      <b>{user.chemistry || "—"} / {user.maxChemistry || 100}</b>
                      <small>Half Weightage (50)</small>
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

          {/* My Choice List Subview */}
          {activeTab === "choice_list" && (
            <div className="subview-container">
              <div className="subview-header">
                <div>
                  <h2>{t("choice.title")}</h2>
                  <p className="subview-desc">{t("choice.subtitle")}</p>
                </div>
                <div className="choice-count-badge">
                  {t("choice.itemCount", { count: choiceList.length })}
                </div>
              </div>

              {choiceList.length === 0 ? (
                <div className="empty-state-card">
                  <p>{t("choice.empty")}</p>
                  <button
                    type="button"
                    className="btn-primary-blue-pill"
                    onClick={() => setActiveTab("search_colleges")}
                  >
                    <span>{t("dash.cardCollegesAction")}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="choice-ordered-list">
                  {choiceList.map((colId, index) => {
                    const col = SAMPLE_COLLEGES.find((c) => c.id === colId);
                    if (!col) return null;
                    return (
                      <div key={col.id} className="choice-row-item">
                        <div className="choice-rank-num">#{index + 1}</div>
                        <div className="choice-col-info">
                          <h4>{col.name}</h4>
                          <p>📍 {col.city} | 🎓 {col.branch} | Cutoff: {col.cutoff2025}</p>
                        </div>
                        <div className="choice-reorder-actions">
                          {index > 0 && (
                            <button
                              type="button"
                              className="order-btn"
                              title="Move up"
                              onClick={() => {
                                const next = [...choiceList];
                                const tmp = next[index - 1];
                                next[index - 1] = next[index];
                                next[index] = tmp;
                                updateChoiceList(next);
                              }}
                            >
                              ▲
                            </button>
                          )}
                          {index < choiceList.length - 1 && (
                            <button
                              type="button"
                              className="order-btn"
                              title="Move down"
                              onClick={() => {
                                const next = [...choiceList];
                                const tmp = next[index + 1];
                                next[index + 1] = next[index];
                                next[index] = tmp;
                                updateChoiceList(next);
                              }}
                            >
                              ▼
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-remove-choice"
                            onClick={() => updateChoiceList(choiceList.filter((id) => id !== col.id))}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  <h4>Personal & Nativity Information</h4>
                  <p><b>Name:</b> {user.fullName || "—"}</p>
                  <p><b>Email:</b> {user.email || "—"}</p>
                  <p><b>Mobile:</b> {user.mobile ? `+91 ${user.mobile}` : "—"}</p>
                  <p><b>DOB:</b> {user.dob || "—"}</p>
                  <p><b>Gender:</b> {user.gender || "—"}</p>
                  <p><b>Community:</b> {user.community || "—"}</p>
                  <p><b>State:</b> {user.state || "—"}</p>
                  <p><b>District:</b> {user.district || "—"}</p>
                  <p><b>Native Place:</b> {user.nativePlace || "—"}</p>
                  <p><b>Address:</b> {user.address || "—"}</p>
                </div>

                <div className="profile-detail-card">
                  <h4>Academic Details</h4>
                  <p><b>Board:</b> {user.board || "—"}</p>
                  <p><b>Passing Year:</b> {user.passingYear || "—"}</p>
                  <p><b>School:</b> {user.schoolName || "—"}</p>
                  <p><b>Mathematics:</b> {user.maths !== "" ? `${user.maths} / ${user.maxMaths}` : "—"}</p>
                  <p><b>Physics:</b> {user.physics !== "" ? `${user.physics} / ${user.maxPhysics}` : "—"}</p>
                  <p><b>Chemistry:</b> {user.chemistry !== "" ? `${user.chemistry} / ${user.maxChemistry}` : "—"}</p>
                  <p><b>Calculated Cutoff:</b> {formatCutoff(cutoff)} / 200</p>
                  <p><b>Average:</b> {averagePercentage !== null ? `${averagePercentage.toFixed(2)}%` : "N/A"}</p>
                  <p><b>7.5% Govt School Quota:</b> {user.studiedGovtSchool === "yes" ? "Yes" : "No"}</p>
                  <p><b>First Graduate:</b> {user.firstGraduate === "yes" ? "Yes" : "No"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Queries & Solutions Subview */}
          {activeTab === "queries" && (
            <div className="subview-container">
              <h2>{t("dash.navQueries")}</h2>
              <div className="faq-list">
                <div className="faq-item">
                  <h4>Q: How is the TNEA engineering cutoff calculated?</h4>
                  <p>Cutoff is out of 200 marks, computed as: Mathematics + (Physics + Chemistry) / 2.</p>
                </div>
                <div className="faq-item">
                  <h4>Q: What is the 7.5% Government School Quota?</h4>
                  <p>Students who studied from 6th to 12th standard continuously in Tamil Nadu Government Schools are eligible for a 7.5% preferential horizontal reservation.</p>
                </div>
                <div className="faq-item">
                  <h4>Q: How does online choice filling work?</h4>
                  <p>Eligible candidates can add, reorder, and lock any number of college branches during their designated counselling round.</p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Subview */}
          {activeTab === "settings" && (
            <div className="subview-container">
              <h2>{t("dash.navSettings")}</h2>
              <div className="profile-detail-card">
                <h4>Language & Accessibility Settings</h4>
                <div className="setting-row mt-3">
                  <span>Selected Interface Language:</span>
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
                      className={`lang-opt ${lang === "ta" ? "active" : ""}`}
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
