import React from "react";
import { useApp } from "../store.jsx";
import { GraduationCap } from "../icons.jsx";

export function Header({ subtitle = null }) {
  const { lang, setLang, t, setStep, isAuthenticated } = useApp();

  return (
    <header className="site-header">
      <div className="header-inner">
        <div
          className="brand-group"
          onClick={() => {
            if (!isAuthenticated) {
              setStep(0);
            }
          }}
          style={{ cursor: !isAuthenticated ? "pointer" : "default" }}
        >
          <div className="cap-icon-box">
            <GraduationCap size={28} color="#1d4ed8" />
          </div>
          <div className="brand-titles">
            <span className="brand-main">{t("app.title")}</span>
            {subtitle ? (
              <span className="brand-sub-inline">| {subtitle}</span>
            ) : (
              <span className="brand-sub-badge">{t("app.subtitle")}</span>
            )}
          </div>
        </div>

        <div className="header-controls">
          <div className="lang-pill" role="group" aria-label="Language selector">
            <button
              type="button"
              className={`lang-opt ${lang === "en" ? "active" : ""}`}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <span className="lang-sep">/</span>
            <button
              type="button"
              className={`lang-opt ta-font ${lang === "ta" ? "active" : ""}`}
              onClick={() => setLang("ta")}
              aria-pressed={lang === "ta"}
            >
              தமிழ்
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
