import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const NoteEditor = ({ onSave }) => {
  const [content, setContent] = useState("");

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <ReactQuill theme="snow" value={content} onChange={setContent} />
      <button
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        onClick={() => onSave(content)}
      >
        Save Note
      </button>
    </div>
  );
};

export default NoteEditor;
