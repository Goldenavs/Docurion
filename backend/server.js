// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure Multer to store uploaded files in memory
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file (generous for text/code)
  }
});

// Health Check Route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Docurion Engine is online.' });
});

// File Upload Endpoint
// This expects an array of files under the field name 'sourceFiles'
app.post('/api/upload', upload.array('sourceFiles', 50), async (req, res) => {
  try {
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Process the files: Convert memory buffers back to readable text strings
    const processedFiles = files.map(file => {
      return {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        // Convert the buffer to a UTF-8 string so the AI can read it
        content: file.buffer.toString('utf-8') 
      };
    });

    console.log(`Successfully received ${processedFiles.length} files.`);
    
    // For now, let's just send the parsed data back to prove it works!
    // Later, this is where we will pass 'processedFiles' to the AI.
    res.json({ 
      message: 'Files successfully processed', 
      filesReceived: processedFiles.length,
      preview: processedFiles.map(f => ({ name: f.originalName, size: f.size }))
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Failed to process files' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Docurion Backend running on http://localhost:${PORT}`);
});