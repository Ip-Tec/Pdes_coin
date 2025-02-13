import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

declare global {
  interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  }
}

// Register Service Worker
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("../public/sw.js")
      .then((registration) => {
        console.log("Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

// Detect PWA Install Prompt
const InstallWrapper: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const beforeInstallHandler = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setInstallPrompt(installEvent);
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        setInstallPrompt(null);
      } else {
        console.log("User dismissed the install prompt");
      }
    }
  };

  return <App installPrompt={installPrompt} isInstalled={isInstalled} onInstall={handleInstall} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <InstallWrapper />
  </StrictMode>
);
