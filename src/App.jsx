import React, { useState } from "react";
import { Welcome, SignIn, Personal, Academic, Summary } from "./screens.jsx";

export default function App() {
  const [step, setStep] = useState(0);
  const go = (n) => { setStep(n); window.scrollTo(0, 0); };
  const next = () => go(Math.min(step + 1, 4));
  const back = () => go(Math.max(step - 1, 0));

  const screens = [
    <Welcome onNext={next} />,
    <SignIn onNext={next} />,
    <Personal onBack={back} onNext={next} />,
    <Academic onBack={back} onNext={next} />,
    <Summary onBack={back} onNext={() => alert("Main dashboard – coming next")} goTo={go} />,
  ];
  return <div className="app">{screens[step]}</div>;
}
