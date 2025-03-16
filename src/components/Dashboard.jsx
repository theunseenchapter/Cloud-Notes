import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { signOut } from "firebase/auth";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig"; // Combined import
import { doc, deleteDoc, updateDoc } from "firebase/firestore"; // Combined firestore imports
// Pastel color palette for notes
const pastelColors = [
  '#fff8e1', '#f3e5f5', '#e1f5fe', '#e8f5e9', '#fff3e0', 
  '#e0f7fa', '#f1f8e9', '#fce4ec', '#f9fbe7', '#e8eaf6'
];

const Dashboard= () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [_attachment,setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  // Add state for mobile sidebar
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Toggle mobile sidebar
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };
  
  // Categories
  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Archive'];

  // Dark mode toggle
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  // Load notes from localStorage on initial render
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(collection(db, "notes"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const fetchedNotes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(fetchedNotes);
      } else {
        setNotes([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
}, []); // Separated concerns

  
  // Save notes to localStorage when notes change
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  
  // Save theme preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Handle file attachment
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAttachment(file);
    
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setAttachmentPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };


const handleLogout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

// Create a utility function to safely format dates
const formatDate = (timestamp) => {
  if (!timestamp) return "";
  
  // If it's a Firestore timestamp with seconds
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  
  // If it's a regular Date object
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString();
  }
  
  // Try to parse it as a regular timestamp
  try {
    return new Date(timestamp).toLocaleDateString();
  } catch (e) {
    return e; // Return empty string if all else fails
  }
};

// Update your saveNote function
const saveNote = async () => {
  if (!noteTitle.trim() && !noteContent.trim() && !attachmentPreview) return;

  // Use the current active category or "Uncategorized" if on "All"
  const noteCategory = activeCategory === 'All' ? 'Uncategorized' : activeCategory;

  const newNote = {
    title: noteTitle.trim(),
    content: noteContent.trim(),
    attachment: attachmentPreview,
    category: noteCategory, // Set the category based on active selection
    color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
    createdAt: serverTimestamp(),
    userId: auth.currentUser?.uid,
    isPinned: false
  };

  try {
    const docRef = await addDoc(collection(db, "notes"), newNote);
    console.log("Document written with ID: ", docRef.id);
    
    // Add the note with a JavaScript Date for immediate display
    setNotes(prevNotes => [{ 
      ...newNote, 
      id: docRef.id,
      createdAt: { seconds: Math.floor(Date.now() / 1000) } 
    }, ...prevNotes]);
    
    resetForm();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
  
  // Reset form after saving
  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setAttachment(null);
    setAttachmentPreview(null);
    // Keep the form expanded after saving
    // setIsExpanded(false); - Remove this line
  };
  
  // Delete note
  const deleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, "notes", id));
      setNotes(notes.filter(note => note.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };
  
  // Toggle pin status
  const togglePin = async (id) => {
    const note = notes.find(note => note.id === id);
    if (!note) return;
  
    try {
      await updateDoc(doc(db, "notes", id), { isPinned: !note.isPinned });
      setNotes(notes.map(note => note.id === id ? { ...note, isPinned: !note.isPinned } : note));
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };
  
  // Handle note drag and drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(notes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setNotes(items);
  };
  
  // Filter notes based on search and category
  const filteredNotes = notes.filter(note => 
    (note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     note.content.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (activeCategory === 'All' || note.category === activeCategory)
  );
  
  // Separate pinned and unpinned notes
  const pinnedNotes = filteredNotes.filter(note => note.isPinned);
  const unpinnedNotes = filteredNotes.filter(note => !note.isPinned);

  return (
    <>
     
      
      <div className={`app ${darkMode ? 'dark' : ''}`}>
        <header className="header">
          {/* Add mobile sidebar toggle button */}
          <button 
            className="mobile-sidebar-toggle" 
            onClick={toggleMobileSidebar}
            aria-label="Toggle sidebar"
            style={{ 
              display: 'none', // Hidden by default, shown in media query
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginRight: '8px',
              padding: '0'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          
          <div className="app-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
            </svg>
            Notes
          </div>
          
          <input
            type="text"
            placeholder="Search notes..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Toggle dark mode">
            {darkMode ? "🌙" : "☀️"}
          </button>
          
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </header>
        
        {/* Add overlay for mobile sidebar */}
        <div 
          className="sidebar-overlay"
          onClick={() => setIsMobileSidebarOpen(false)}
          style={{ 
            display: isMobileSidebarOpen ? 'block' : 'none',
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 90
          }}
        ></div>
        
        <div className="container">
          <aside className="sidebar" style={{
            left: isMobileSidebarOpen ? '0' : '-250px', // Only for mobile
            '@media (max-width: 768px)': {
              position: 'fixed',
              width: '250px',
              height: 'calc(100vh - 64px)',
              zIndex: 100,
              transition: 'left 0.3s ease',
              boxShadow: 'var(--shadow-md)',
              backgroundColor: 'var(--light-bg)'
            }
          }}>
            <div className="sidebar-items">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`sidebar-item ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => {
                    setActiveCategory(category);
                    setIsMobileSidebarOpen(false); // Close sidebar after selection on mobile
                  }}
                >
                  {category === 'All' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                      <path d="M21 15V6m0 0H2v15h18M21 6l-9 4.5L2 6"></path>
                    </svg>
                  )}
                  {category === 'Work' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                    </svg>
                  )}
                  {category === 'Personal' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {category === 'Ideas' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                      <path d="M9.663 17h4.673M12 3v1M3.343 7.343l.707.707M21.657 7.343l-.707.707M5.5 12H4M20 12h-1.5M12 22v-3M8 14a4 4 0 1 1 8 0v1H8v-1z"></path>
                    </svg>
                  )}
                  {category === 'Archive' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '12px'}}>
                      <polyline points="21 8 21 21 3 21 3 8"></polyline>
                      <rect x="1" y="3" width="22" height="5"></rect>
                      <line x1="10" y1="12" x2="14" y2="12"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                  )}
                  {category}
                </div>
              ))}
            </div>
          </aside>

          <main className="main">
            <div className={`note-form ${isExpanded ? 'expanded' : ''}`} onClick={() => !isExpanded && setIsExpanded(true)}>
              {/* Always show the title input */}
              <input
                type="text"
                placeholder="Title"
                className="note-title"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              
              <div className="quill-container">
                <ReactQuill
                  value={noteContent}
                  onChange={setNoteContent}
                  placeholder="Take a note..."
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['link']
                    ]
                  }}
                />
              </div>
              
              {attachmentPreview && (
                <img src={attachmentPreview} alt="Attachment Preview" className="attachment-preview" />
              )}
              
              <div className="form-actions">
                <div className="file-input-container">
                  <input 
                    type="file" 
                    id="file-input" 
                    className="file-input" 
                    onChange={handleFileChange} 
                    accept="image/*"
                  />
                  <label htmlFor="file-input" className="file-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </label>
                </div>
                <button className="save-button" onClick={saveNote}>
                  Save
                </button>
              </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              {pinnedNotes.length > 0 && (
                <>
                  <h2 className="section-title">PINNED</h2>
                  <Droppable droppableId="pinned-notes" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="notes-grid" 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {pinnedNotes.map((note, index) => (
                          <Draggable key={note.id} draggableId={note.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="note-card"
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: note.color
                                }}
                              >
                                <div className="note-card-header">
                                  {note.title && <h3 className="note-card-title">{note.title}</h3>}
                                </div>
                                <div 
                                  className="note-card-content"
                                  dangerouslySetInnerHTML={{ __html: note.content }}
                                />
                                {note.attachment && <img src={note.attachment} alt="Note attachment" />}
                                <div className="note-card-footer">
                                  <span>{formatDate(note.createdAt)}</span>
                                  <div className="note-card-actions">
                                    <button 
                                      className={`note-action-btn pin-btn ${note.isPinned ? 'active' : ''}`}
                                      onClick={() => togglePin(note.id)}
                                      aria-label="Pin note"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={note.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l.642 1.348a8 8 0 0 0 4.01 4.01L18 8l-1.348.642a8 8 0 0 0-4.01 4.01L12 14l-.642-1.348a8 8 0 0 0-4.01-4.01L6 8l1.348-.642a8 8 0 0 0 4.01-4.01L12 2z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="note-action-btn delete-btn"
                                      onClick={() => deleteNote(note.id)}
                                      aria-label="Delete note"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </>
              )}

              {unpinnedNotes.length > 0 && (
                <>
                  {pinnedNotes.length > 0 && <h2 className="section-title">OTHERS</h2>}
                  <Droppable droppableId="unpinned-notes" direction="horizontal">
                    {(provided) => (
                      <div 
                        className="notes-grid" 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {unpinnedNotes.map((note, index) => (
                          <Draggable key={note.id} draggableId={note.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="note-card"
                                style={{
                                  ...provided.draggableProps.style,
                                  backgroundColor: note.color
                                }}
                              >
                                <div className="note-card-header">
                                  {note.title && <h3 className="note-card-title">{note.title}</h3>}
                                </div>
                                <div 
                                  className="note-card-content"
                                  dangerouslySetInnerHTML={{ __html: note.content }}
                                />
                                {note.attachment && <img src={note.attachment} alt="Note attachment" />}
                                <div className="note-card-footer">
                                  <span>{formatDate(note.createdAt)}</span>
                                  <div className="note-card-actions">
                                    <button 
                                      className={`note-action-btn pin-btn ${note.isPinned ? 'active' : ''}`}
                                      onClick={() => togglePin(note.id)}
                                      aria-label="Pin note"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={note.isPinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2l.642 1.348a8 8 0 0 0 4.01 4.01L18 8l-1.348.642a8 8 0 0 0-4.01 4.01L12 14l-.642-1.348a8 8 0 0 0-4.01-4.01L6 8l1.348-.642a8 8 0 0 0 4.01-4.01L12 2z" />
                                      </svg>
                                    </button>
                                    <button 
                                      className="note-action-btn delete-btn"
                                      onClick={() => deleteNote(note.id)}
                                      aria-label="Delete note"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </>
              )}

              {filteredNotes.length === 0 && (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                  </div>
                  <p className="empty-state-text">No notes found</p>
                  <p className="empty-state-subtext">
                    {searchQuery 
                      ? "Try a different search term" 
                      : "Click on 'Take a note...' to create a new note"}
                  </p>
                </div>
              )}
            </DragDropContext>
          </main>
        </div>
      </div>
    </>
  );
};

export default Dashboard;