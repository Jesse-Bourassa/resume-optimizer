import { useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import SubscriptionModal from "../context/paywall";
// Centralised inline‑style map – keeps JSX tidy
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    minHeight: "100vh",
    background: "#0d0d0d",
    color: "#f0f0f0",
    fontFamily: "Inter, sans-serif",
    padding: "2rem",
  },
  card: {
    background: "#1a1a1a",
    padding: "2rem",
    borderRadius: "12px",
    width: "100%",
    maxWidth: "700px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "1.5rem",
    textAlign: "center",
    color: "#00ffe7",
    textShadow: "0 0 8px #00ffe7",
    display: "flex",
    gap: "0.5rem",
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    padding: "0.75rem",
    border: "1px solid #333",
    borderRadius: "6px",
    background: "#2a2a2a",
    color: "#f0f0f0",
    marginBottom: "1rem",
    width: "100%",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#00d26a",
    color: "#fff",
    fontWeight: 600,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonDisabled: {
    background: "#555",
    cursor: "not-allowed",
  },
  scoreWrapper: { marginTop: "2rem", textAlign: "center" },
  progressWrapper: { width: 150, margin: "1rem auto" },
  resultBox: {
    marginTop: "2rem",
    background: "#1b1b1b",
    padding: "1.5rem",
    borderRadius: "12px",
    whiteSpace: "pre-wrap",
    overflowX: "auto",
    fontSize: "0.95rem",
    lineHeight: 1.6,
    border: "1px solid #00ffe7",
    boxShadow: "0 0 15px rgba(0,255,231,0.3)",
    animation: "fadeInUp 0.8s ease 0.3s both",
  },
};
  

const Spinner = () => (
    <div style={{ textAlign: "center", marginTop: "1rem" }}>
      <div
        style={{
          width: "32px",
          height: "32px",
          border: "4px solid #00ffe7",
          borderTop: "4px solid transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          margin: "auto",
        }}
      />
    </div>
  );
  

function ResumeAnalyzer() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);

  console.log("user:", currentUser);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const extractScore = (text) => {
    const match = text.match(/Score:?\s*(\d{1,3})/i);
    return match ? parseInt(match[1]) : null;
  };
  
  const getScoreColor = (score) => {
    if (score >= 81) return "#00ff88";     // green
    if (score >= 61) return "#ffcc00";     // yellow
    return "#ff5555";                      // red
  };

  const [score, setScore] = useState(null);

  const handleUpload = async () => {
    if (!currentUser) {
      alert("User not loaded. Try again shortly.");
      return;
    }

    if (!file) {
      alert("Please select a resume file.");
      return;
    }

    if (!currentUser?.isSubscribed && !localStorage.getItem("isSubscribed")) {
      try {
        const res = await fetch(`http://localhost:5000/api/stripe/check-subscription?email=${currentUser.email}`);
        const data = await res.json();
        if (data.success) {
          localStorage.setItem("isSubscribed", "true");
        } else {
          console.log("triggering modal");
          setShowSubscribeModal(true);
          return;  
        }
      } catch (err) {
        console.error("Subscription check failed:", err);
        setShowSubscribeModal(true);
        return;
      }
    }

    const formData = new FormData();
    formData.append("resume", file);

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setResult(data.result || "Something went wrong.");
      const extracted = extractScore(data.result);
      setScore(0); // reset to 0 first

      setTimeout(() => {
        setScore(extracted); // allow smooth animation after a tick
      }, 100);
    } catch (err) {
      console.error(err);
      setResult("Server error.");
    }

    setLoading(false);
  };

  return (
    <div
  style={styles.page}
>
      <div style={styles.card}>
      <h1
  style={styles.title}
>
  📄 Resume Optimizer
</h1>
  
        <div>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={styles.input}
          />
  
          <button
            onClick={handleUpload}
            disabled={loading}
            style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
          {loading && <Spinner />}

        </div>
  
        {result && (
  <div
    style={styles.scoreWrapper}
  >
    <h2 style={{ textAlign: "center" }}>Resume Score</h2>
    <div style={styles.progressWrapper}>
      <CircularProgressbar
        value={score || 0}
        maxValue={100}
        text={`${score || 0}`}
        styles={buildStyles({
          textColor: getScoreColor(score),
          pathColor: getScoreColor(score),
          trailColor: "#333",
          textSize: "20px",
        })}
      />
    </div>
  </div>
)}

{result && (
  <div
    style={styles.resultBox}
  >
    {result}
  </div>
)}

      </div>
      {/* Subscribe Modal */}
      <SubscriptionModal
        open={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
        onSubscribe={() => {
          setShowSubscribeModal(false);
          // Optional: redirect or trigger purchase logic
        }}
      />
    </div>
  );
}

export default ResumeAnalyzer;
console.log("Subscription modal loaded?", !!SubscriptionModal);
