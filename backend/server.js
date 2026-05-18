// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function generateFileTree(files) {
  let treeString = "Project Directory Structure:\n";
  files.forEach(file => {
    treeString += `├── ${file.filename}\n`;
  });
  return treeString;
}

// ENDPOINT 1: Instantly create an empty document to route the user
app.post('/api/init-doc', async (req, res) => {
  try {
    const { projectId, type = 'README' } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const { data: docData, error } = await supabase
      .from('docs')
      .insert({
        project_id: projectId,
        type: type,
        content: { markdown: "" } 
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, docId: docData.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ENDPOINT 2: The ChatGPT-style Live Streamer (Server-Sent Events)
app.get('/api/stream-doc/:docId', async (req, res) => {
  const { docId } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const { data: doc } = await supabase.from('docs').select('*').eq('id', docId).single();
    if (!doc) throw new Error("Document not found");

    const { data: files } = await supabase.from('files').select('*').eq('project_id', doc.project_id);
    const projectMap = generateFileTree(files);
    
    let codeContext = "";
    files.forEach(f => {
      codeContext += `\n\n--- FILE: ${f.filename} ---\n\`\`\`${f.language}\n${f.content}\n\`\`\``;
    });

    // 🛡️ THE SAFEGUARD: 1 token is roughly 4 characters. 
    // 250k tokens = ~1,000,000 characters. We cap it at 800,000 to be perfectly safe.
    if (codeContext.length > 800000) {
      console.warn("⚠️ Codebase too large, truncating to prevent 429 Rate Limit...");
      codeContext = codeContext.substring(0, 800000) + "\n\n...[WARNING: CODEBASE TRUNCATED DUE TO AI FREE TIER LIMITS]...";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let typeInstructions = "Generate a highly professional, production-ready README.md.";
    if (doc.type === 'API_DOCS') {
       typeInstructions = "Generate detailed API Documentation focusing on endpoints, methods, parameters, and request/response payloads.";
    } else if (doc.type === 'ARCHITECTURE') {
       typeInstructions = "Generate a System Architecture Document explaining component relationships, data flow, and core design patterns.";
    }

    const systemPrompt = `You are an elite Staff Software Engineer and Technical Writer.
    ${typeInstructions}
    
    Project Map:
    ${projectMap}
    
    Review the source code carefully. Do not hallucinate features. Make it beautiful, structured, and easy to read. Return ONLY valid markdown.`;

    const result = await model.generateContentStream([systemPrompt, codeContext]);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    await supabase.from('docs').update({
      content: { markdown: fullText }
    }).eq('id', docId);

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming Error:', error);
    
    // 🛡️ GRACEFUL ERROR HANDLING: Send a friendly message to the UI instead of crashing
    let errorMessage = "An error occurred while generating documentation.";
    if (error.status === 429) {
      errorMessage = "\n\n**⚠️ AI Rate Limit Exceeded:** You are requesting too much code too quickly for the free tier! Please wait 1 minute and try again.";
    }
    
    res.write(`data: ${JSON.stringify({ text: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Docurion Stream Engine running on http://localhost:${PORT}`);
});