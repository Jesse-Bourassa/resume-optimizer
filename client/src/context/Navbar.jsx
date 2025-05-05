import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Simple top navigation bar.
 * Shows brand on the left and auth‑aware actions on the right.
 */
export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const nav = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      nav("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        Resume&nbsp;Optimizer
      </Link>

      <div style={styles.right}>
        {currentUser ? (
          <>
            <span style={styles.user}>{currentUser.email}</span>
            <button onClick={handleLogout} style={styles.btnOutline}>
              Log&nbsp;out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Log&nbsp;in
            </Link>
            <Link to="/signup" style={styles.btn}>
              Sign&nbsp;up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    background: "#0d0d0d",
    borderBottom: "1px solid #1f1f1f",
  },
  brand: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "#00ffe7",
    textDecoration: "none",
    textShadow: "0 0 6px #00ffe7",
  },
  right: { display: "flex", gap: "1rem", alignItems: "center" },
  user: { fontSize: "0.9rem", color: "#aaa" },
  link: {
    color: "#f0f0f0",
    textDecoration: "none",
    fontSize: "0.95rem",
  },
  btn: {
    padding: "0.4rem 0.9rem",
    background: "#00d26a",
    border: "none",
    borderRadius: "4px",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnOutline: {
    padding: "0.4rem 0.9rem",
    background: "transparent",
    border: "1px solid #00d26a",
    borderRadius: "4px",
    color: "#00d26a",
    fontWeight: 600,
    cursor: "pointer",
  },
};
