import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Dynamic scrollbar hue: shifts from purple (270) through magenta to pink as you scroll
const updateScrollHue = () => {
  const scrollFraction = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
  const hue = 270 + scrollFraction * 60; // 270 (purple) → 330 (pink)
  document.documentElement.style.setProperty("--scroll-hue", String(Math.round(hue)));
};
window.addEventListener("scroll", updateScrollHue, { passive: true });

createRoot(document.getElementById("root")!).render(<App />);
