import { useState, useEffect, useRef } from "react";

const microCopy = [
  "Did you know? Morphology is the most commonly misread value in semen reports.",
  "Sperm parameters naturally fluctuate. One test is never the full picture.",
  "1 in 7 couples face fertility challenges. You are not alone.",
  "Your FM Code is being created. Save it to return to these results anytime.",
];

export default function ProcessingScreen({ onComplete }) {
  const [copyIndex, setCopyIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [showAlmost, setShowAlmost] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Rotate micro-copy every 3s
    const copyInterval = setInterval(() => {
      setCopyIndex((prev) => (prev + 1) % microCopy.length);
      setFadeKey((prev) => prev + 1);
    }, 3000);

    // Show "almost ready" at 12s
    const almostTimer = setTimeout(() => setShowAlmost(true), 12000);

    // Complete at 15s
    timerRef.current = setTimeout(() => {
      if (onComplete) onComplete();
    }, 15000);

    return () => {
      clearInterval(copyInterval);
      clearTimeout(almostTimer);
      clearTimeout(timerRef.current);
    };
  }, [onComplete]);

  return (
    <div style={styles.wrapper}>
      <style>{keyframes}</style>
      <div style={styles.container}>
        {/* Spinner */}
        <div style={styles.spinnerOuter}>
          <div style={styles.spinner} />
        </div>

        {/* Title */}
        <h2 style={styles.title}>Analyzing your report…</h2>

        {/* Rotating micro-copy */}
        <p key={fadeKey} style={styles.microCopy}>
          {microCopy[copyIndex]}
        </p>

        {/* Almost ready */}
        <p
          style={{
            ...styles.almostReady,
            opacity: showAlmost ? 1 : 0,
            transform: showAlmost ? "translateY(0)" : "translateY(8px)",
          }}
        >
          Almost ready — generating your personal report…
        </p>
      </div>
    </div>
  );
}

const keyframes = `
@keyframes fm-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes fm-fadeIn {
  0%   { opacity: 0; transform: translateY(6px); }
  100% { opacity: 1; transform: translateY(0); }
}
`;

const styles = {
  wrapper: {
    position: "fixed",
    inset: 0,
    background: "#FAF8F5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 420,
    padding: "0 24px",
    textAlign: "center",
  },
  spinnerOuter: {
    marginBottom: 32,
  },
  spinner: {
    width: 56,
    height: 56,
    border: "4px solid #e0e0e0",
    borderTopColor: "#0D6E6E",
    borderRadius: "50%",
    animation: "fm-spin 1s linear infinite",
  },
  title: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 20,
    fontWeight: 600,
    color: "#2D2D2D",
    margin: "0 0 16px",
  },
  microCopy: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 15,
    color: "#5A5A5A",
    lineHeight: 1.6,
    minHeight: 48,
    animation: "fm-fadeIn 0.5s ease",
    margin: "0 0 24px",
  },
  almostReady: {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    fontWeight: 500,
    color: "#0D6E6E",
    transition: "opacity 0.8s ease, transform 0.8s ease",
    margin: 0,
  },
};
