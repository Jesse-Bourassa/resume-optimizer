import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkSubscription = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (!sessionId) {
        return navigate("/analyzer");
      }

      try {
        const res = await fetch(`http://localhost:5000/api/stripe/check-subscription?session_id=${sessionId}`);
        const data = await res.json();

        if (data.success) {
          // Optional: Refresh Firebase user to reflect updated subscription status
          const auth = getAuth();
          await auth.currentUser.reload();
          // Save subscription flag locally
          localStorage.setItem("isSubscribed", "true");
          navigate("/analyzer");
        } else {
          alert("Subscription not confirmed. Please contact support.");
          navigate("/");
        }
      } catch (err) {
        console.error("Error verifying subscription:", err);
        alert("Something went wrong. Try again.");
        navigate("/");
      }
    };

    checkSubscription();
  }, [navigate]);

  return <div style={{ color: "white", padding: "2rem" }}>Verifying your subscription...</div>;
};

export default CheckoutSuccess;