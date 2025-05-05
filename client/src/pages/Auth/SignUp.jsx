import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// Centralised inline styles so the sign‑up page matches the dark neon theme
const styles = {
  page: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#0d0d0d",
    color: "#f0f0f0",
    fontFamily: "Inter, sans-serif",
    padding: "2rem",
  },
  card: {
    width: "100%",
    maxWidth: "430px",
    background: "#1a1a1a",
    padding: "2.5rem 2rem",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.4)",
  },
  title: {
    marginBottom: "1.8rem",
    fontSize: "1.6rem",
    textAlign: "center",
    color: "#00ffe7",
    textShadow: "0 0 8px #00ffe7",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    border: "1px solid #333",
    borderRadius: "6px",
    background: "#2a2a2a",
    color: "#f0f0f0",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    border: "none",
    borderRadius: "6px",
    background: "#00d26a",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.3s",
  },
  buttonDisabled: {
    background: "#555",
    cursor: "not-allowed",
  },
  error: { marginTop: "0.8rem", color: "#ff6767", fontSize: "0.9rem" },
  switch: { marginTop: "1.2rem", fontSize: "0.9rem", textAlign: "center" },
  link: { color: "#00ffe7", textDecoration: "underline" },
};

/**
 * Sign‑up page — simple email / password form.
 * After successful registration the user is sent to /analyzer.
 */
export default function SignUp() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (pw !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (pw.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const userCredential = await signup(email, pw);
      const user = userCredential.user;

      // Save additional user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        isSubscribed: false,
        createdAt: new Date()
      });
      nav("/analyzer");
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Create account</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          style={styles.input}
        />

        <button
          disabled={loading}
          style={loading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
        >
          {loading ? "Creating…" : "Sign up"}
        </button>

        {error && <p style={styles.error}>{error}</p>}

        <p style={styles.switch}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </form>
    </div>
  );
}