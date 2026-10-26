import React, { useState } from "react";
import {
  Chevron, CalendarIcon, EyeIcon, MailIcon, LockIcon, UserIcon, CheckIcon,
  ArrowLeft, ArrowRight, SpeakerIcon, PencilIcon, GoogleLogo,
} from "./icons.jsx";
import { COMMUNITY, SPECIAL, NATIVITY, BOARDS, GENDERS } from "./data.js";

function Header() {
  return (
    <header className="header">
      <div className="brand">TNEA Companion</div>
      <div className="header-right">
        <button className="voice-btn" aria-label="Voice assistance" title="Voice assistance"><SpeakerIcon /></button>
        <div className="lang"><span>[ Eng</span><i>|</i><span className="ta">தமிழ் ]</span></div>
      </div>
    </header>
  );
}

function Select({ placeholder, options }) {
  return (
    <div className="select">
      <select defaultValue="">
        <option value="" disabled>{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <Chevron />
    </div>
  );
}

function Nav({ onBack, onNext, nextLabel = "Continue" }) {
  return (
    <div className="nav">
      <button className="btn-back" onClick={onBack}><ArrowLeft /> Back</button>
      <button className="btn-green" onClick={onNext}>{nextLabel} <ArrowRight /></button>
    </div>
  );
}

/* Screen 1 */
export function Welcome({ onNext }) {
  return (
    <>
      <Header />
      <main className="page center">
        <div className="card welcome">
          <div className="grad-circle">🎓</div>
          <h1>Tamil Nadu Engineering Admissions</h1>
          <p className="sub">Accessibility-Driven Guidance Portal</p>
          <div className="voice-hint">🗣️ Tap <span className="spk">🔊</span> at the top for voice assistance</div>
          <button className="btn-green wide" onClick={onNext}>🚀 GET STARTED <ArrowRight /></button>
        </div>
      </main>
    </>
  );
}

/* Screen 2 */
export function SignIn({ onNext }) {
  const [tab, setTab] = useState("in");
  const [show, setShow] = useState(false);
  return (
    <>
      <Header />
      <main className="page center top">
        <div className="card auth">
          <div className="step-note">Step 1 of 3: Authentication</div>
          <h2>Sign In / Registration</h2>
          <div className="tabs">
            <button className={tab === "in" ? "tab active" : "tab"} onClick={() => setTab("in")}>SIGN IN</button>
            <button className={tab === "up" ? "tab active" : "tab"} onClick={() => setTab("up")}>SIGN UP</button>
          </div>
          <div className="auth-form">
            {tab === "up" && (
              <>
                <label>Full Name</label>
                <div className="input icon-left"><UserIcon /><input placeholder="Enter your full name" /></div>
              </>
            )}
            <label>Email Address</label>
            <div className="input icon-left"><MailIcon /><input type="email" placeholder="Enter your email address" /></div>
            <label>Password</label>
            <div className="input icon-left icon-right">
              <LockIcon />
              <input type={show ? "text" : "password"} placeholder="Enter your password" />
              <button className="eye" onClick={() => setShow(!show)} aria-label="Toggle password"><EyeIcon /></button>
            </div>
            {tab === "in" && <a className="forgot" href="#">Forgot Password?</a>}
            <button className="btn-green mid" onClick={onNext}>{tab === "in" ? "SIGN IN" : "SIGN UP"}</button>
            <div className="or"><span>OR</span></div>
            <button className="google"><GoogleLogo /> Continue with Google</button>
          </div>
        </div>
      </main>
    </>
  );
}

/* Screen 3 */
export function Personal({ onBack, onNext }) {
  return (
    <>
      <Header />
      <main className="page form">
        <div className="step-label">STEP 2 OF 3 — PERSONAL &amp; NATIVITY DETAILS</div>

        <section>
          <h3>1. PERSONAL INFORMATION</h3>
          <div className="grid">
            <div className="field">
              <label>Full Name</label>
              <div className="input"><input defaultValue="Premnath E" /><span className="auto">Auto-filled</span></div>
            </div>
          </div>
          <div className="grid two">
            <div className="field">
              <label>Date of Birth *</label>
              <div className="input"><input placeholder="DD / MM / YYYY" /><CalendarIcon /></div>
            </div>
            <div className="field">
              <label>Gender *</label>
              <Select placeholder="Select gender" options={GENDERS} />
            </div>
          </div>
        </section>

        <section>
          <h3>2. COMMUNITY &amp; RESERVATION</h3>
          <div className="grid two">
            <div className="field">
              <label>Community Category *</label>
              <Select placeholder="Select community category" options={COMMUNITY} />
            </div>
            <div className="field">
              <label>Caste / Community Name *</label>
              <div className="input"><input placeholder="Enter caste / community name" /></div>
            </div>
          </div>
          <div className="field full">
            <label>Special Reservations</label>
            <div className="checks">
              {SPECIAL.map((s) => (
                <label key={s} className="check"><input type="checkbox" /><span>{s}</span></label>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h3>3. NATIVITY &amp; SCHOOLING</h3>
          <div className="field full">
            <label>Nativity / Eligibility Status *</label>
            <div className="radios">
              {NATIVITY.map((n, i) => (
                <label key={n.title} className="radio">
                  <input type="radio" name="nativity" defaultChecked={i === 0} />
                  <span><b>{n.title}</b><small>{n.desc}</small></span>
                </label>
              ))}
            </div>
          </div>
        </section>

        <Nav onBack={onBack} onNext={onNext} />
      </main>
    </>
  );
}

/* Screen 4 */
export function Academic({ onBack, onNext }) {
  return (
    <>
      <Header />
      <main className="page form">
        <div className="step-label">STEP 3 OF 3 — ACADEMIC DETAILS &amp; ELIGIBILITY</div>
        <section>
          <h3>1. HSC / 12TH MARKS ENTRY</h3>
          <div className="grid two">
            <div className="field">
              <label>HSC Register No. *</label>
              <div className="input"><input placeholder="Enter 12th Register Number" /></div>
            </div>
            <div className="field">
              <label>Board Name *</label>
              <Select placeholder="Select Board (TN State / CBSE...)" options={BOARDS} />
            </div>
          </div>
          <div className="grid three">
            {["Mathematics", "Physics", "Chemistry"].map((s) => (
              <div className="field" key={s}>
                <label>{s} Mark *</label>
                <div className="input"><input placeholder="/ 100" /></div>
              </div>
            ))}
          </div>
        </section>

        <div className="eligible">
          <div className="tick"><CheckIcon /></div>
          <div className="elig-title">YOU ARE ELIGIBLE FOR TNEA COUNSELLING!</div>
          <div className="elig-text">
            Calculated TNEA Cutoff: 198.50 / 200<br />
            Your marks meet the required criteria to participate in TNEA counselling.
          </div>
        </div>

        <Nav onBack={onBack} onNext={onNext} />
      </main>
    </>
  );
}

/* Screen 5 */
function Row({ label, value }) {
  return <div className="srow"><b>{label}:</b> <span>{value}</span></div>;
}

export function Summary({ onBack, onNext, goTo }) {
  const Edit = ({ to }) => <button className="edit" onClick={() => goTo(to)}><PencilIcon /> EDIT</button>;
  return (
    <>
      <Header />
      <main className="page form">
        <div className="step-label">OVERALL APPLICATION SUMMARY</div>

        <section>
          <div className="sec-head"><h3>1. AUTHENTICATION &amp; CONTACT</h3><Edit to={1} /></div>
          <div className="sgrid one">
            <Row label="Mobile Number" value="+91 98765 43210" />
            <Row label="Registered Password" value="Set" />
          </div>
        </section>

        <section>
          <div className="sec-head"><h3>2. PERSONAL &amp; NATIVITY DETAILS</h3><Edit to={2} /></div>
          <div className="sgrid">
            <Row label="Date of Birth" value="15 / 08 / 2007" />
            <Row label="Gender" value="Male" />
            <Row label="Community Category" value="BC" />
            <Row label="Caste Name" value="Backward Class" />
            <Row label="Nativity Status" value="Tamil Nadu" />
            <Row label="Govt School Quota (7.5%)" value="Yes" />
          </div>
        </section>

        <section>
          <div className="sec-head"><h3>3. ACADEMIC DETAILS &amp; CUTOFF</h3><Edit to={3} /></div>
          <div className="sgrid">
            <Row label="HSC Register No." value="12345678" />
            <Row label="Board" value="TN State Board" />
          </div>
          <div className="marks">
            <span><b>Maths:</b> 98 / 100</span><i>|</i>
            <span><b>Physics:</b> 95 / 100</span><i>|</i>
            <span><b>Chemistry:</b> 94 / 100</span>
          </div>
          <div className="cutoff">🎯 <b>Verified TNEA Cutoff Score:</b> 191.00 / 200</div>
        </section>

        <Nav onBack={onBack} onNext={onNext} nextLabel="Proceed to Main Dashboard" />
      </main>
    </>
  );
}
