import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./context/Navbar";

import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import SignUp from "./pages/Auth/SignUp";
import Login from "./pages/Auth/loginIn";

/** Guard that redirects guests to /login */
function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        <Route
          path="/analyzer"
          element={
            <PrivateRoute>
              <ResumeAnalyzer />
            </PrivateRoute>
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        {/* fallback: root → analyzer */}
        <Route path="*" element={<Navigate to="/analyzer" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
