// backend/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Define Note Schema
const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  userId: String, // Firebase Auth user ID
  createdAt: { type: Date, default: Date.now }
});
const Note = mongoose.model('Note', noteSchema);

// Routes
app.get('/', (req, res) => res.send('Cloud Notes API is running'));

// Create Note
app.post('/notes', async (req, res) => {
  const { title, content, userId } = req.body;
  const note = new Note({ title, content, userId });
  await note.save();
  res.json(note);
});

// Get Notes by User ID
app.get('/notes/:userId', async (req, res) => {
  const notes = await Note.find({ userId: req.params.userId });
  res.json(notes);
});

// Delete Note
app.delete('/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: 'Note deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
