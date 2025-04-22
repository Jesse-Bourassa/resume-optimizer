import { useState } from "react";

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
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!file) return alert("Please select a resume file.");

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
      }, 100); // small delay to trigger CSS transition;

    } catch (err) {
      console.error(err);
      setResult("Server error.");
    }

    setLoading(false);
  };

  return (
    <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start", // change to "center" if you want vertical centering too
    minHeight: "100vh",
    background: "#0d0d0d",
    color: "#f0f0f0",
    fontFamily: "sans-serif",
    padding: "2rem",
  }}
>
      <div style={{ maxWidth: "700px", margin: "auto" }}>
      <h1
  style={{
    fontSize: "2rem",
    marginBottom: "1rem",
    textAlign: "center",
    color: "#00ffe7",
    textShadow: "0 0 10px #00ffe7, 0 0 20px #00ffe7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  }}
>
  📄 Resume Optimizer
</h1>
  
        <div style={{ background: "#1a1a1a", padding: "2rem", borderRadius: "12px" }}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{
              padding: "0.5rem",
              border: "1px solid #333",
              borderRadius: "6px",
              background: "#2a2a2a",
              color: "#f0f0f0",
              marginBottom: "1rem",
              width: "100%",
            }}
          />
  
          <button
            onClick={handleUpload}
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: loading ? "#555" : "#00d26a",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "6px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "0.3s",
            }}
          >
            {loading ? "Analyzing..." : "Upload & Analyze"}
          </button>
          {loading && <Spinner />}

        </div>
  
        {result && (
  <div
    style={{
      marginTop: "2rem",
      opacity: result ? 1 : 0,
      transform: result ? "translateY(0)" : "translateY(20px)",
      transition: "all 0.8s ease",
    }}
  >
    <h2 style={{ textAlign: "center" }}>Resume Score</h2>
    <div
      style={{
        background: "#333",
        height: "20px",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${score || 0}%`,
          height: "100%",
          background: getScoreColor(extractScore(result)),
          transition: "width 1.5s ease",
        }}
      />
    </div>
    <p
      style={{
        textAlign: "center",
        marginTop: "0.5rem",
        color: getScoreColor(extractScore(result)),
        transition: "opacity 1.5s ease",
        opacity: result ? 1 : 0,
      }}
    >
      {score}/100
    </p>
  </div>
)}

{result && (
  <div
    style={{
      marginTop: "2rem",
      background: "#1b1b1b",
      padding: "1.5rem",
      borderRadius: "12px",
      whiteSpace: "pre-wrap",
      overflowX: "auto",
      fontSize: "0.95rem",
      lineHeight: "1.6",
      border: "1px solid #00ffe7",
      boxShadow: "0 0 15px rgba(0, 255, 231, 0.3)",
      opacity: 1,
      transform: "translateY(0)",
      animation: "fadeInUp 1s ease 0.5s both",
    }}
  >
    {result}
  </div>
)}

      </div>
    </div>
  );
}

export default ResumeAnalyzer;
