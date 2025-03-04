import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import { FcGoogle } from "react-icons/fc"; // Google icon
import { useState } from "react";

function Login({ setUser }) {
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
    } catch (error) {
      console.error("Login failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Cloud Notes</h1>
        <p style={styles.subtitle}>Securely store and access your notes anytime.</p>

        <button style={styles.button} onClick={handleLogin} disabled={loading}>
          <FcGoogle size={24} style={{ marginRight: "10px" }} />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e2e",
  },
  card: {
    backgroundColor: "#282A36",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "white",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#bbb",
    marginBottom: "20px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff79c6",
    color: "white",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    transition: "background 0.3s",
    width: "100%",
  },
};

export default Login;
