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

app.post('/api/init-doc', async (req, res) => {
  try {
    const { projectId, type = 'README' } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Project ID is required' });

    const { data: docData, error } = await supabase
      .from('docs')
      .insert({ project_id: projectId, type: type, content: { markdown: "" } })
      .select().single();

    if (error) throw error;
    res.json({ success: true, docId: docData.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stream-doc/:docId', async (req, res) => {
  const { docId } = req.params;
  const { complexity = '1' } = req.query; // <-- Catches the slider value!

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

    if (codeContext.length > 800000) {
      codeContext = codeContext.substring(0, 800000) + "\n\n...[WARNING: CODEBASE TRUNCATED DUE TO AI LIMITS]...";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let typeInstructions = "Generate a highly professional, production-ready README.md.";
    if (doc.type === 'API_DOCS') typeInstructions = "Generate detailed API Documentation focusing on endpoints and payloads.";
    else if (doc.type === 'ARCHITECTURE') typeInstructions = "Generate a System Architecture Document explaining component relationships.";

    // 🔥 THE COMPLEXITY ENGINE
    let complexityInstruction = "";
    switch(complexity) {
      case '1': complexityInstruction = "CRITICAL: Keep the output extremely simple, concise, and high-level. Summarize heavily. Keep it very short. Do not include excessive code blocks."; break;
      case '2': complexityInstruction = "Keep the output brief but cover the main points cleanly."; break;
      case '3': complexityInstruction = "Provide standard documentation with a balance of brevity and technical detail."; break;
      case '4': complexityInstruction = "Provide comprehensive, detailed technical specs including edge cases."; break;
      case '5': complexityInstruction = "CRITICAL: Provide a highly exhaustive, lengthy Staff-Engineer level deep dive. Explain every minor detail, configuration, and underlying mechanism. Output as much detail as possible."; break;
      default: complexityInstruction = "Keep the output extremely simple, concise, and high-level.";
    }

    const systemPrompt = `You are an elite Staff Software Engineer and Technical Writer.
    ${typeInstructions}
    
    COMPLEXITY & LENGTH REQUIREMENT:
    ${complexityInstruction}
    
    Project Map:
    ${projectMap}
    
    Review the source code carefully. Return ONLY valid markdown.`;

    const result = await model.generateContentStream([systemPrompt, codeContext]);

    let fullText = "";
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    await supabase.from('docs').update({ content: { markdown: fullText } }).eq('id', docId);

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    let errorMessage = "An error occurred while generating documentation.";
    if (error.status === 429) errorMessage = "\n\n**⚠️ AI Rate Limit Exceeded:** Please wait 1 minute and try again.";
    
    res.write(`data: ${JSON.stringify({ text: errorMessage })}\n\n`);
    res.write(`data: [DONE]\n\n`);
    res.end();
  }
});
// ENDPOINT 3: The Codebase Co-Pilot Chat!
app.post('/api/chat-doc', async (req, res) => {
  const { docId, message, history = [] } = req.body;
  
  // Set headers for raw native fetch streaming
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const { data: doc } = await supabase.from('docs').select('*').eq('id', docId).single();
    if (!doc) throw new Error("Document not found");

    const { data: files } = await supabase.from('files').select('*').eq('project_id', doc.project_id);
    const projectMap = generateFileTree(files);
    
    let codeContext = "";
    files.forEach(f => {
      codeContext += `\n\n--- FILE: ${f.filename} ---\n\`\`\`${f.language}\n${f.content}\n\`\`\``;
    });

    if (codeContext.length > 800000) {
      codeContext = codeContext.substring(0, 800000) + "\n\n...[TRUNCATED]...";
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Format previous messages for Gemini
    const geminiHistory = history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    // Start a chat session, injecting the codebase into the very first "invisible" message
    const chat = model.startChat({
      history: [
        { 
          role: "user", 
          parts: [{ text: `You are an elite Senior Developer Co-Pilot. Here is the codebase I am working on:\n${projectMap}\n${codeContext}` }] 
        },
        { 
          role: "model", 
          parts: [{ text: "I have analyzed the codebase. I am ready to answer any questions, explain logic, or write code snippets based on this architecture." }] 
        },
        ...geminiHistory
      ]
    });

    // Stream the new message!
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      res.write(chunk.text());
    }
    res.end();

  } catch (error) {
    console.error('Chat Error:', error);
    res.write(`\n\n**System Error:** ${error.message}`);
    res.end();
  }
});

// ENDPOINT 4: The Enterprise GitHub Integration
app.post('/api/push-github', async (req, res) => {
  const { token, owner, repo, path, content, message } = req.body;
  
  if (!token || !owner || !repo || !path || !content) {
    return res.status(400).json({ error: "Missing required GitHub configuration parameters." });
  }

  try {
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
    
    // 1. Check if the file already exists (We need its SHA to update it)
    const getResponse = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    let sha = undefined;
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
    }

    // 2. Base64 encode the markdown content (GitHub API requirement)
    const base64Content = Buffer.from(content).toString('base64');
    
    const body = {
      message: message || `docs: update ${path} via Docurion AI`,
      content: base64Content,
      ...(sha && { sha }) // Inject SHA if we are overwriting an existing file
    };

    // 3. Push the commit!
    const putResponse = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const putData = await putResponse.json();

    if (!putResponse.ok) {
      throw new Error(putData.message || "Failed to push to GitHub.");
    }

    // Return the URL to the newly committed file
    res.json({ success: true, url: putData.content.html_url });
  } catch (error) {
    console.error('GitHub Push Error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Docurion Stream Engine running on http://localhost:${PORT}`);
});