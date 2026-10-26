import React from "react";
import { useApp } from "../store.jsx";
import { CheckIcon } from "../icons.jsx";

export function Stepper({ activeStep }) {
  const { t, setStep } = useApp();

  const steps = [
    {
      num: 1,
      stepIndex: 1,
      title: t("step1.title"),
      desc: activeStep > 1 ? t("step1.done") : t("step1.desc"),
    },
    {
      num: 2,
      stepIndex: 2,
      title: t("step2.title"),
      desc: activeStep > 2 ? t("step2.done") : t("step2.desc"),
    },
    {
      num: 3,
      stepIndex: 3,
      title: t("step3.title"),
      desc: t("step3.desc"),
    },
  ];

  return (
    <aside className="stepper-sidebar" aria-label="Progress Stepper">
      <div className="stepper-track">
        {steps.map((st, idx) => {
          const isDone = activeStep > st.num;
          const isActive = activeStep === st.num;

          return (
            <div
              key={st.num}
              className={`stepper-node ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            >
              <div
                className="stepper-circle"
                onClick={() => {
                  if (isDone || isActive) {
                    setStep(st.stepIndex);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`Step ${st.num}: ${st.title}`}
              >
                {isDone ? (
                  <CheckIcon size={16} color="#16a34a" />
                ) : (
                  <span>{st.num}</span>
                )}
              </div>
              <div className="stepper-info">
                <div className="stepper-name">{st.title}</div>
                <div className="stepper-desc">{st.desc}</div>
              </div>
              {idx < steps.length - 1 && <div className="stepper-line" />}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
