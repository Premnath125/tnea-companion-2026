import React from "react";
import { AppProvider, useApp } from "./store.jsx";
import { Screen1Welcome } from "./screens/Screen1Welcome.jsx";
import { Screen2SignIn } from "./screens/Screen2SignIn.jsx";
import { Screen3Personal } from "./screens/Screen3Personal.jsx";
import { Screen4Academic } from "./screens/Screen4Academic.jsx";
import { Screen5Dashboard } from "./screens/Screen5Dashboard.jsx";

function AppContent() {
  const { step } = useApp();

  switch (step) {
    case 0:
      return <Screen1Welcome />;
    case 1:
      return <Screen2SignIn />;
    case 2:
      return <Screen3Personal />;
    case 3:
      return <Screen4Academic />;
    case 4:
      return <Screen5Dashboard />;
    default:
      return <Screen1Welcome />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="app-root">
        <AppContent />
      </div>
    </AppProvider>
  );
}
