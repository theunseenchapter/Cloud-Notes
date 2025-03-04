import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Import this

const firebaseConfig = {
  apiKey: "AIzaSyAhvkw0Oq0F0M4oZy-F7tTrueMcj0258SQ",
  authDomain: "cloudnotes-983fd.firebaseapp.com",
  projectId: "cloudnotes-983fd",
  storageBucket: "cloudnotes-983fd.firebasestorage.app",
  messagingSenderId: "231152892532",
  appId: "1:231152892532:web:314ac2946c4b3ac02e2f21"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ client_id: "231152892532-qgg5h564q8m9v4mcgbd5ddb6tcgg4p4i.apps.googleusercontent.com" });

const db = getFirestore(app); // ✅ Ensure Firestore is properly initialized

export { auth, provider, db };
