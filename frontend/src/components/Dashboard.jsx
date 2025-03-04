import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();

  // Handle authentication state
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (!user) navigate("/login");
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Fetch notes from Firestore
  useEffect(() => {
    if (!user) return;

    const notesRef = collection(db, "notes");
    const q = query(notesRef, orderBy("createdAt", "desc"));

    const unsubscribeNotes = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribeNotes();
  }, [user]);

  // Save a note
  const handleSaveNote = async () => {
    if (!title.trim() || !note.trim()) return;
    if (!user) {
      console.error("User is not logged in. Cannot save note.");
      return;
    }

    await addDoc(collection(db, "notes"), {
      title: title,
      text: note,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    });

    setTitle("");
    setNote("");
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  // Logout function
  const handleLogout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <div style={styles.container}>
      <button style={styles.logoutButton} onClick={handleLogout}>Logout</button>

      <div style={styles.card}>
        <h1>Welcome, {user?.displayName || "Guest"}!</h1>

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
          style={styles.input}
        />

        {/* Note Input */}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your note here..."
          rows="4"
          style={styles.textarea}
        />

        <button style={styles.button} onClick={handleSaveNote}>Save Note</button>

        {/* Notes Display */}
        <h2>Your Notes</h2>
        <div style={styles.notesContainer}>
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id} style={styles.note}>
                <h3>{note.title}</h3>
                <p>{note.text}</p>
                <p style={{ fontSize: "0.8rem", color: "#bbb" }}>
                  {new Date(note.createdAt).toLocaleString()}
                </p>
                <button style={styles.deleteButton} onClick={() => handleDeleteNote(note.id)}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p style={{ color: "#ccc" }}>No notes found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Styles
const styles = {
  container: {
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e1e2e",
    position: "relative",
    padding: "20px",
  },
  card: {
    backgroundColor: "#282A36",
    padding: "30px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    textAlign: "center",
    color: "white",
    width: "90%",
    maxWidth: "500px",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "white",
    marginBottom: "10px",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #555",
    backgroundColor: "#333",
    color: "white",
    resize: "none",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ff79c6",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  deleteButton: {
    marginTop: "10px",
    padding: "5px 10px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ff5555",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  logoutButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#ff5555",
    color: "white",
    cursor: "pointer",
    fontWeight: "bold",
  },
  notesContainer: {
    marginTop: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "10px",
  },
  note: {
    backgroundColor: "#44475a",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "2px 2px 10px rgba(0, 0, 0, 0.2)",
    textAlign: "left",
  },
};

export default Dashboard;
