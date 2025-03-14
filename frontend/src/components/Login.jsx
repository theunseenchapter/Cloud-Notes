import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebaseConfig";
import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import Spline from '@splinetool/react-spline';

function Login({ setUser }) {
  const [loading, setLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);
  const [hoverButton, setHoverButton] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
      }
      @keyframes twinkle {
        0% { opacity: 0.7; }
        50% { opacity: 1; }
        100% { opacity: 0.7; }
      }
      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
        100% { transform: translateY(0px); }
      }
      @keyframes gradientFlow {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @keyframes inkSpread {
        0% { box-shadow: 0 0 5px rgba(100, 150, 255, 0.3); }
        50% { box-shadow: 0 0 20px rgba(100, 150, 255, 0.5); }
        100% { box-shadow: 0 0 5px rgba(100, 150, 255, 0.3); }
      }
    `;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

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
    <div style={{
      ...styles.container,
      opacity: fadeIn ? 1 : 0,
      transition: "opacity 0.8s ease-in-out"
    }}>
      <div style={styles.splineContainer}>
        <Spline 
          scene="https://prod.spline.design/bxTyObsQI3sPWKFk/scene.splinecode" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'contain',
            transform: 'scale(1.2)',
            transformOrigin: 'center center'
          }}
        />
        <div style={styles.watermarkOverlay}>
          <div style={styles.quoteAttribution}>~Vincent Van Gogh</div>
        </div>
      </div>
      
      <div style={{
        ...styles.card,
        transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
      }}>
        <div style={styles.logoContainer}>
          <div style={{
            ...styles.logo,
            animation: "float 6s infinite ease-in-out, inkSpread 4s infinite ease-in-out"
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                fill="white" 
                style={{animation: "twinkle 2s infinite ease-in-out"}}
              />
            </svg>
          </div>
        </div>
        <h1 style={styles.title}>Cloud Notes</h1>
        <div style={styles.inkUnderline}></div>
        <p style={styles.subtitle}>Securely store and access your notes anytime.</p>
        
        <button 
          style={{
            ...styles.button,
            backgroundColor: loading ? "#2a4580" : hoverButton ? "#5a7bc7" : "#4a6baf",
            transform: loading ? "scale(0.98)" : hoverButton ? "scale(1.03)" : "scale(1)",
            boxShadow: hoverButton ? "0 6px 12px rgba(0, 0, 0, 0.3), 0 0 15px rgba(100, 150, 255, 0.5)" : styles.button.boxShadow
          }} 
          onClick={handleLogin} 
          disabled={loading}
          onMouseEnter={() => setHoverButton(true)}
          onMouseLeave={() => setHoverButton(false)}
        >
          <FcGoogle size={24} style={{ marginRight: "10px" }} />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>
        <div style={styles.paperTexture}></div>
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
    backgroundColor: "#000000",
    overflow: "hidden",
    position: "relative",
  },
  splineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermarkOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '180px',
    height: '40px',
    backgroundColor: '#000000',
    zIndex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteAttribution: {
    color: 'white',
    fontSize: '12px',
    fontStyle: 'italic',
    textAlign: 'right',
  },
  card: {
    backgroundColor: "rgba(20, 30, 60, 0.65)",
    padding: "35px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5), 0 0 30px rgba(100, 150, 255, 0.3)",
    backdropFilter: "blur(10px)",
    textAlign: "center",
    color: "white",
    width: "90%",
    maxWidth: "360px",
    border: "1px solid rgba(100, 150, 255, 0.2)",
    transition: "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    zIndex: 2,
    position: "relative",
    animation: "pulse 3s infinite ease-in-out",
    overflow: "hidden",
  },
  paperTexture: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1IiBoZWlnaHQ9IjUiPgo8cmVjdCB3aWR0aD0iNSIgaGVpZ2h0PSI1IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiPjwvcmVjdD4KPHBhdGggZD0iTTAgNUw1IDBaTTYgNEw0IDZaTS0xIDFMMSAtMVoiIHN0cm9rZT0iIzIxMiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSI+PC9wYXRoPgo8L3N2Zz4=')",
    opacity: 0.05,
    zIndex: -1,
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "15px",
  },
  logo: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4a6baf, #8baafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.3rem",
    fontWeight: "bold",
    color: "white",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3), 0 0 15px rgba(100, 150, 255, 0.5)",
    transition: "all 0.3s ease",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "5px",
    background: "linear-gradient(45deg, #4a6baf, #8baafe, #4a6baf)",
    backgroundSize: "200% 200%",
    animation: "gradientFlow 6s ease infinite",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 10px rgba(100, 150, 255, 0.3)",
    letterSpacing: "1px",
  },
  inkUnderline: {
    height: "2px",
    width: "60%",
    margin: "0 auto 15px auto",
    background: "linear-gradient(90deg, transparent, rgba(100, 150, 255, 0.7), transparent)",
    borderRadius: "2px",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#b8c6e6",
    marginBottom: "25px",
    lineHeight: "1.5",
    fontWeight: "300",
    letterSpacing: "0.3px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4a6baf",
    color: "white",
    padding: "14px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
    transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
    width: "100%",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.2), 0 0 10px rgba(100, 150, 255, 0.3)",
    letterSpacing: "0.5px",
  },
};

export default Login;