import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Vite, environment variables need to be prefixed with VITE_
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Use environment variable for client ID or fallback to hardcoded value if needed
const clientId = import.meta.env.VITE_FIREBASE_CLIENT_ID || 
                "231152892532-qgg5h564q8m9v4mcgbd5ddb6tcgg4p4i.apps.googleusercontent.com";

provider.setCustomParameters({ client_id: clientId });

const db = getFirestore(app);

export { auth, provider, db };