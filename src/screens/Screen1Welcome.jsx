import React from "react";
import { useApp } from "../store.jsx";
import { Header } from "../components/Header.jsx";
import {
  ArrowRight,
  ShieldIcon,
  PeopleIcon,
  CheckIcon,
  DocumentIcon,
  CertificateIcon,
  GraduationCap,
} from "../icons.jsx";

export function Screen1Welcome() {
  const { t, setStep } = useApp();

  return (
    <div className="welcome-screen-wrap">
      <Header />

      <main className="welcome-main">
        <section className="welcome-hero-container">
          {/* Left Column: Text & CTA */}
          <div className="welcome-hero-text">
            <div className="welcome-sub-badge">
              <span className="badge-line" />
              <span>{t("welcome.badge")}</span>
              <span className="badge-line" />
            </div>

            <h1 className="welcome-heading">
              <span className="welcome-heading-dark">{t("welcome.title")}</span>
              <br />
              <span className="welcome-heading-blue">{t("welcome.titleHighlight")}</span>
            </h1>

            <p className="welcome-description">
              {t("welcome.description")}
            </p>

            <div className="welcome-badges-row">
              <div className="pill-badge pill-green">
                <span className="pill-icon-circle green">
                  <CheckIcon size={13} color="#16a34a" />
                </span>
                <span>{t("welcome.badgeSimple")}</span>
              </div>

              <span className="badge-dot">•</span>

              <div className="pill-badge pill-blue">
                <span className="pill-icon-circle blue">
                  <ShieldIcon size={13} color="#2563eb" />
                </span>
                <span>{t("welcome.badgeSecure")}</span>
              </div>

              <span className="badge-dot">•</span>

              <div className="pill-badge pill-purple">
                <span className="pill-icon-circle purple">
                  <PeopleIcon size={14} color="#7c3aed" />
                </span>
                <span>{t("welcome.badgeStudent")}</span>
              </div>
            </div>

            <div className="welcome-cta-group">
              <button
                type="button"
                className="btn-primary-pill"
                onClick={() => setStep(1)}
              >
                <span>{t("welcome.getStarted")}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Column: High-Resolution Engineering College Campus Photograph */}
          <div className="welcome-hero-art">
            <div className="hero-photo-frame">
              <img
                src="/images/tnea-campus-hero.jpg"
                alt="Modern Tamil Nadu Engineering College Campus"
                className="hero-photo-img"
                loading="eager"
              />
              <div className="hero-photo-badge">
                <GraduationCap size={18} color="#1d4ed8" />
                <span>Anna University & Affiliated Colleges</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom Feature Cards Row */}
        <section className="welcome-cards-grid" aria-label="Key features">
          <div className="feature-card">
            <div className="feature-icon-box bg-blue-subtle">
              <DocumentIcon size={24} color="#2563eb" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">{t("welcome.card1Title")}</h3>
              <p className="feature-card-desc">{t("welcome.card1Desc")}</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-green-subtle">
              <ShieldIcon size={24} color="#16a34a" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">{t("welcome.card2Title")}</h3>
              <p className="feature-card-desc">{t("welcome.card2Desc")}</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-purple-subtle">
              <CertificateIcon size={24} color="#9333ea" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">{t("welcome.card3Title")}</h3>
              <p className="feature-card-desc">{t("welcome.card3Desc")}</p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box bg-teal-subtle">
              <GraduationCap size={24} color="#0d9488" />
            </div>
            <div className="feature-card-content">
              <h3 className="feature-card-title">{t("welcome.card4Title")}</h3>
              <p className="feature-card-desc">{t("welcome.card4Desc")}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
