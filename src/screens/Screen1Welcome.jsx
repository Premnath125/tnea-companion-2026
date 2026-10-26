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
  HeadsetIcon,
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

          {/* Right Column: College & Student Illustration */}
          <div className="welcome-hero-art" aria-hidden="true">
            <svg
              className="welcome-svg-scene"
              viewBox="0 0 600 440"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="400" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#E0F2FE" />
                  <stop offset="0.6" stopColor="#F0F9FF" />
                  <stop offset="1" stopColor="#FFFFFF" />
                </linearGradient>
                <linearGradient id="bldgGrad" x1="0" y1="0" x2="0" y2="250" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F8FAFC" />
                  <stop offset="1" stopColor="#E2E8F0" />
                </linearGradient>
                <linearGradient id="pathGrad" x1="300" y1="260" x2="300" y2="440" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FEF3C7" stopOpacity="0.8" />
                  <stop offset="1" stopColor="#FDE68A" />
                </linearGradient>
              </defs>

              {/* Sky & Clouds */}
              <rect width="600" height="440" rx="16" fill="url(#skyGrad)" />
              <path d="M70 70 Q90 50 120 60 Q150 40 180 65 Q200 65 210 80 Q100 85 70 70Z" fill="#FFFFFF" opacity="0.8" />
              <path d="M420 50 Q440 30 470 40 Q500 20 530 45 Q550 45 560 60 Q450 65 420 50Z" fill="#FFFFFF" opacity="0.8" />

              {/* Distant trees */}
              <circle cx="80" cy="240" r="45" fill="#86EFAC" opacity="0.7" />
              <circle cx="130" cy="230" r="50" fill="#4ADE80" opacity="0.8" />
              <circle cx="480" cy="230" r="50" fill="#4ADE80" opacity="0.8" />
              <circle cx="530" cy="240" r="45" fill="#86EFAC" opacity="0.7" />

              {/* College Main Building */}
              <g transform="translate(180, 110)">
                {/* Portico / Pillars */}
                <rect x="30" y="80" width="180" height="90" fill="#FEF9C3" rx="4" />
                <polygon points="120,40 10,85 230,85" fill="#FDE047" stroke="#EAB308" strokeWidth="2" />
                <rect x="85" y="10" width="70" height="25" fill="#1E3A8A" rx="3" />
                <text x="120" y="27" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" letterSpacing="1">ENGINEERING</text>
                
                {/* Flagpole */}
                <line x1="120" y1="10" x2="120" y2="-12" stroke="#64748B" strokeWidth="2" />
                <polygon points="120,-12 145,-4 120,4" fill="#3B82F6" />

                {/* Pillars */}
                <rect x="45" y="85" width="10" height="85" fill="#FFFFFF" stroke="#CBD5E1" />
                <rect x="75" y="85" width="10" height="85" fill="#FFFFFF" stroke="#CBD5E1" />
                <rect x="155" y="85" width="10" height="85" fill="#FFFFFF" stroke="#CBD5E1" />
                <rect x="185" y="85" width="10" height="85" fill="#FFFFFF" stroke="#CBD5E1" />

                {/* Windows & Main Arch Door */}
                <rect x="100" y="105" width="40" height="65" rx="20" fill="#1E293B" />
                <rect x="108" y="113" width="24" height="57" fill="#60A5FA" opacity="0.4" />
                
                {/* Left & Right Wings */}
                <rect x="-60" y="95" width="90" height="75" fill="#F8FAFC" stroke="#E2E8F0" />
                <rect x="210" y="95" width="90" height="75" fill="#F8FAFC" stroke="#E2E8F0" />
                {/* Wing windows */}
                <rect x="-48" y="105" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="-18" y="105" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="-48" y="138" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="-18" y="138" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="222" y="105" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="252" y="105" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="222" y="138" width="20" height="24" rx="2" fill="#93C5FD" />
                <rect x="252" y="138" width="20" height="24" rx="2" fill="#93C5FD" />
              </g>

              {/* Lush Front Lawn */}
              <ellipse cx="300" cy="380" rx="260" ry="110" fill="#22C55E" opacity="0.25" />
              <ellipse cx="300" cy="390" rx="240" ry="90" fill="#16A34A" opacity="0.3" />

              {/* Pathway to college */}
              <path d="M260 280 L340 280 L440 440 L160 440 Z" fill="url(#pathGrad)" />

              {/* Foreground Green Bushes */}
              <circle cx="160" cy="330" r="30" fill="#22C55E" />
              <circle cx="190" cy="345" r="24" fill="#16A34A" />
              <circle cx="440" cy="330" r="30" fill="#22C55E" />
              <circle cx="410" cy="345" r="24" fill="#16A34A" />

              {/* Student Figure (Back view with blue backpack) */}
              <g transform="translate(290, 210)">
                {/* Head with dark wavy hair */}
                <ellipse cx="60" cy="40" rx="22" ry="24" fill="#1E293B" />
                <ellipse cx="60" cy="45" rx="16" ry="17" fill="#FDBA74" />
                <path d="M42 35 C42 18, 78 18, 78 35 C74 44, 46 44, 42 35 Z" fill="#0F172A" />

                {/* Neck & Shirt Collar */}
                <rect x="52" y="60" width="16" height="12" fill="#FDBA74" />
                <path d="M40 70 L80 70 L95 160 L25 160 Z" fill="#E2E8F0" />
                <path d="M52 68 L60 80 L68 68" fill="#CBD5E1" />

                {/* Big Blue Student Backpack */}
                <rect x="35" y="82" width="52" height="66" rx="16" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="2" />
                <rect x="42" y="96" width="38" height="36" rx="8" fill="#2563EB" />
                <line x1="45" y1="112" x2="77" y2="112" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" />
                {/* Backpack straps */}
                <path d="M38 85 C30 100, 30 130, 36 145" fill="none" stroke="#1E3A8A" strokeWidth="4" />
                <path d="M84 85 C92 100, 92 130, 86 145" fill="none" stroke="#1E3A8A" strokeWidth="4" />

                {/* Folder/Book held in arm */}
                <rect x="80" y="110" width="16" height="26" rx="2" fill="#F59E0B" transform="rotate(15 80 110)" />
                <rect x="84" y="112" width="10" height="24" rx="2" fill="#3B82F6" transform="rotate(15 84 112)" />

                {/* Pants */}
                <path d="M38 160 L57 160 L55 230 L35 230 Z" fill="#1E293B" />
                <path d="M63 160 L82 160 L85 230 L65 230 Z" fill="#1E293B" />
              </g>

              {/* Side framing trees */}
              <circle cx="20" cy="180" r="60" fill="#22C55E" opacity="0.9" />
              <circle cx="580" cy="160" r="70" fill="#22C55E" opacity="0.9" />
              <circle cx="610" cy="220" r="50" fill="#15803D" />
            </svg>
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
              <HeadsetIcon size={24} color="#0d9488" />
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
