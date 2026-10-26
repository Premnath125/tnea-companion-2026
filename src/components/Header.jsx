import React from "react";
import { useApp } from "../store.jsx";
import { GraduationCap, SpeakerIcon, StopSquareIcon } from "../icons.jsx";

export function Header({ subtitle = null }) {
  const { lang, setLang, t, isAudioPlaying, handleToggleAudio, handleStopAudio, step } = useApp();

  const getAudioTextForCurrentStep = () => {
    switch (step) {
      case 0:
        return t("welcome.speechText");
      case 1:
        return t("auth.speechText");
      case 2:
        return t("personal.speechText");
      case 3:
        return t("academic.speechText");
      case 4:
        return t("dash.speechText");
      default:
        return t("welcome.speechText");
    }
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <div className="brand-group">
          <div className="cap-icon-box" onClick={() => window.location.hash = ""} style={{ cursor: "pointer" }}>
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

          <button
            type="button"
            className={`audio-btn ${isAudioPlaying ? "playing" : ""}`}
            onClick={() => handleToggleAudio(getAudioTextForCurrentStep())}
            aria-label={t("app.voiceAria")}
            title={isAudioPlaying ? t("app.voicePlaying") : t("app.voiceAria")}
          >
            <SpeakerIcon size={18} color="#0284c7" />
          </button>

          <button
            type="button"
            className="audio-stop-btn"
            onClick={handleStopAudio}
            aria-label={t("app.stopAudio")}
            title={t("app.stopAudio")}
          >
            <StopSquareIcon size={16} color="#0284c7" />
          </button>
        </div>
      </div>
    </header>
  );
}
