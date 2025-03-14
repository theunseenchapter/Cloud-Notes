import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

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
  const [setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Categories
  const categories = ['All', 'Work', 'Personal', 'Ideas', 'Archive'];

  // Dark mode toggle
  const toggleDarkMode = () => setDarkMode(prev => !prev);
  
  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      setDarkMode(JSON.parse(savedTheme));
    }
  }, []);
  
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

  // Save note
  const saveNote = () => {
    if (!noteTitle.trim() && !noteContent.trim() && !attachmentPreview) return;
    
    const newNote = {
      id: Date.now().toString(),
      title: noteTitle.trim(),
      content: noteContent.trim(),
      attachment: attachmentPreview,
      category: activeCategory === 'All' ? 'Uncategorized' : activeCategory,
      color: pastelColors[Math.floor(Math.random() * pastelColors.length)],
      createdAt: new Date().toISOString(),
      isPinned: false
    };
    
    setNotes([newNote, ...notes]);
    resetForm();
  };
  
  // Reset form after saving
  const resetForm = () => {
    setNoteTitle('');
    setNoteContent('');
    setAttachment(null);
    setAttachmentPreview(null);
    setIsExpanded(false);
  };
  
  // Delete note
  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
  };
  
  // Toggle pin status
  const togglePin = (id) => {
    setNotes(notes.map(note => 
      note.id === id ? {...note, isPinned: !note.isPinned} : note
    ));
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
      <style jsx>{`
        /* Base styles */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        :root {
          --primary: #fbbc04;
          --primary-light: #fff8e6;
          --dark-bg: #202124;
          --dark-card: #2d2e30;
          --dark-text: #e8eaed;
          --light-bg: #f5f5f5;
          --light-card: #ffffff;
          --light-text: #202124;
          --border-light: #dadce0;
          --border-dark: #5f6368;
          --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
          --shadow-md: 0 2px 6px rgba(0, 0, 0, 0.15);
          --shadow-lg: 0 4px 12px rgba(0, 0, 0, 0.2);
          --radius: 8px;
          --radius-lg: 12px;
          --transition: all 0.2s ease;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background-color: var(--light-bg);
          color: var(--light-text);
          margin: 0;
          padding: 0;
          transition: var(--transition);
        }
        
        .app {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        
        .app.dark {
          background-color: var(--dark-bg);
          color: var(--dark-text);
        }
        
        .app.dark .header,
        .app.dark .note-form,
        .app.dark .note-card {
          background-color: var(--dark-card);
          border-color: var(--border-dark);
        }
        
        /* Header */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 24px;
          background-color: var(--light-card);
          box-shadow: var(--shadow-sm);
          position: sticky;
          top: 0;
          z-index: 100;
          transition: var(--transition);
        }
        
        .app-title {
          font-size: 22px;
          font-weight: 600;
          margin-right:20px;

          color: var(--primary);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .search-input {
          flex: 1;
          max-width: 600px;
          padding: 12px 16px;
          border-radius: 8px;
          border: 1px solid var(--border-light);
          font-size: 14px;
          outline: none;
          transition: var(--transition);
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .app.dark .search-input {
          background-color: rgba(255, 255, 255, 0.05);
          border-color: var(--border-dark);
          color: var(--dark-text);
        }
        
        .search-input:focus {
          border-color: var(--primary);
          box-shadow: var(--shadow-sm);
        }
        
        .dark-mode-toggle {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--light-text);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          transition: var(--transition);
        }
        
        .app.dark .dark-mode-toggle {
          color: var(--dark-text);
        }
        
        .dark-mode-toggle:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .app.dark .dark-mode-toggle:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        /* Layout */
        .container {
          display: flex;
          flex-grow: 1;
        }
        
        /* Sidebar */
        .sidebar {
          width: 250px;
          padding: 20px 8px;
          height: calc(100vh - 64px);
          position: sticky;
          top: 64px;
          overflow-y: auto;
          transition: var(--transition);
        }
        
        .sidebar-item {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          border-radius: 0 24px 24px 0;
          margin-bottom: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition);
        }
        
        .sidebar-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .app.dark .sidebar-item:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .sidebar-item.active {
          background-color: var(--primary-light);
          color: var(--primary);
        }
        
        .app.dark .sidebar-item.active {
          background-color: rgba(251, 188, 4, 0.2);
          color: var(--primary);
        }
        
        /* Main content */
        .main {
          flex-grow: 1;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          overflow-y: auto;
        }
        
        /* Note form */
        .note-form {
          width: 100%;
          max-width: 600px;
          background: var(--light-card);
          border-radius: var(--radius);
          box-shadow: var(--shadow-md);
          overflow: hidden;
          transition: var(--transition);
          margin-bottom: 32px;
          border: 1px solid var(--border-light);
        }
        
        .note-form.expanded {
          box-shadow: var(--shadow-lg);
        }
        
        .note-title {
          width: 100%;
          padding: 16px;
          border: none;
          outline: none;
          font-size: 16px;
          font-weight: 500;
          background: transparent;
          color: inherit;
        }
        
        .note-title::placeholder {
          color: #9aa0a6;
        }
        
        .quill-container {
          padding: 0 16px;
        }
        
        .quill {
          border: none !important;
        }
        
        .quill .ql-toolbar {
          border: none !important;
          border-top: 1px solid var(--border-light) !important;
          border-bottom: 1px solid var(--border-light) !important;
        }
        
        .app.dark .quill .ql-toolbar {
          border-color: var(--border-dark) !important;
        }
        
        .quill .ql-container {
          border: none !important;
          font-family: 'Inter', sans-serif;
        }
        
        .attachment-preview {
          max-width: 100%;
          max-height: 200px;
          margin: 16px;
          border-radius: 4px;
        }
        
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          background-color: var(--light-card);
        }
        
        .file-input-container {
          position: relative;
          overflow: hidden;
          display: inline-block;
        }
        
        .file-input {
          position: absolute;
          left: 0;
          top: 0;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .file-label {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .file-label:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .app.dark .file-label:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .save-button {
          background-color: transparent;
          border: none;
          color: var(--primary);
          font-weight: 600;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition);
        }
        
        .save-button:hover {
          background-color: rgba(251, 188, 4, 0.1);
        }
        
        /* Note Grid */
        .section-title {
          width: 100%;
          max-width: 1200px;
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: 14px;
          color: #5f6368;
          font-weight: 500;
        }
        
        .app.dark .section-title {
          color: #9aa0a6;
        }
        
        .notes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          width: 100%;
          max-width: 1200px;
          margin-bottom: 32px;
        }
        
        .note-card {
          background-color: var(--light-card);
          border-radius: var(--radius);
          overflow: hidden;
          transition: var(--transition);
          box-shadow: var(--shadow-sm);
          border: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          break-inside: avoid;
        }
        
        .note-card:hover.note-card:hover {
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        
        .note-card-header {
          padding: 16px 16px 8px;
        }
        
        .note-card-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 8px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        
        .note-card-content {
          padding: 0 16px 16px;
          font-size: 14px;
          flex-grow: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
        }
        
        .note-card-content img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin-top: 8px;
        }
        
        .note-card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          border-top: 1px solid #f1f3f4;
          font-size: 12px;
          color: #80868b;
        }
        
        .app.dark .note-card-footer {
          border-color: var(--border-dark);
          color: #9aa0a6;
        }
        
        .note-card-actions {
          display: flex;
          gap: 8px;
        }
        
        .note-action-btn {
          background: transparent;
          border: none;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #80868b;
          transition: var(--transition);
          padding: 0;
        }
        
        .note-action-btn:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        
        .app.dark .note-action-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }
        
        .pin-btn.active {
          color: var(--primary);
        }
        
        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: #80868b;
        }
        
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          color: #dadce0;
        }
        
        .app.dark .empty-state-icon {
          color: #5f6368;
        }
        
        .empty-state-text {
          font-size: 16px;
          margin-bottom: 8px;
        }
        
        .empty-state-subtext {
          font-size: 14px;
          opacity: 0.8;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .container {
            flex-direction: column;
          }
          
          .sidebar {
            width: 100%;
            height: auto;
            position: static;
            padding: 8px;
          }
          
          .sidebar-items {
            display: flex;
            overflow-x: auto;
            padding-bottom: 8px;
          }
          
          .sidebar-item {
            border-radius: var(--radius);
            white-space: nowrap;
          }
          
          .notes-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
      `}</style>
      

      <div className={`app ${darkMode ? 'dark' : ''}`}>
        <header className="header">
          <div className="app-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z"></path>
            </svg>
            Notes
          </div>
          <input
            type="text"
            placeholder="Search notes..."
            style={{
              padding: '10px',
              fontSize: '16px',
              width: '250px',
              borderRadius: '10px',
              border: '1px solid #ddd',
              backgroundColor: '#f5f5f5',
              outline: 'none'
            }}
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          
          <button onClick={toggleDarkMode} className="dark-mode-toggle" aria-label="Toggle dark mode">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </header>

        <div className="container">
          <aside className="sidebar">
            <div className="sidebar-items">
              {categories.map((category) => (
                <div
                  key={category}
                  className={`sidebar-item ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
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
                    </svg>
                  )}
                  {category}
                </div>
              ))}
            </div>
          </aside>

          <main className="main">
            <div className={`note-form ${isExpanded ? 'expanded' : ''}`} onClick={() => !isExpanded && setIsExpanded(true)}>
              {isExpanded && (
                <input
                  type="text"
                  placeholder="Title"
                  className="note-title"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                />
              )}
              
              <div className="quill-container">
                <ReactQuill
                  value={noteContent}
                  onChange={setNoteContent}
                  placeholder="Take a note..."
                  modules={{
                    toolbar: isExpanded ? [
                      ['bold', 'italic', 'underline'],
                      [{'list': 'ordered'}, {'list': 'bullet'}],
                      ['link']
                    ] : false
                  }}
                />
              </div>
              
              {attachmentPreview && (
                <img src={attachmentPreview} alt="Attachment Preview" className="attachment-preview" />
              )}
              
              {isExpanded && (
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
              )}
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
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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
                                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
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