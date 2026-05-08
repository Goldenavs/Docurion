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

// Initialize Clients
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper: Generates a visual text-based file tree for the AI
function generateFileTree(files) {
  let treeString = "Project Directory Structure:\n";
  files.forEach(file => {
    treeString += `├── ${file.filename}\n`;
  });
  return treeString;
}

// Main Generation Endpoint
app.post('/api/generate-docs', async (req, res) => {
  try {
    const { projectId, type = 'README' } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    console.log(`[1/4] Fetching files for project ${projectId}...`);
    const { data: files, error: fetchError } = await supabase
      .from('files')
      .select('filename, content, language')
      .eq('project_id', projectId);

    if (fetchError || !files || files.length === 0) {
      throw new Error('No files found for this project.');
    }

    console.log(`[2/4] Building Project Map & Context for ${files.length} files...`);
    const projectMap = generateFileTree(files);
    
    // Concatenate the actual code for the AI to read
    let codeContext = "";
    files.forEach(f => {
      codeContext += `\n\n--- FILE: ${f.filename} ---\n\`\`\`${f.language}\n${f.content}\n\`\`\``;
    });

    console.log(`[3/4] Sending to Gemini AI Engine...`);
    // Using Gemini 1.5 Pro - Best for large codebases and complex reasoning
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemPrompt = `
      You are an elite Staff Software Engineer and Technical Writer. 
      Your task is to generate a highly professional, production-ready ${type} in Markdown format for the provided codebase.
      
      Here is the overall architecture map of the project:
      ${projectMap}
      
      Review the source code carefully to understand dependencies, endpoints, and component logic.
      Do not hallucinate features that do not exist in the code. Make it beautiful, structured, and easy to read.
    `;

    const result = await model.generateContent([systemPrompt, codeContext]);
    const generatedDocs = result.response.text();

    console.log(`[4/4] Saving generated docs to Supabase...`);
    // Save the result as JSONB (per your schema)
    const { data: docData, error: insertError } = await supabase
      .from('docs')
      .insert({
        project_id: projectId,
        type: type,
        content: { markdown: generatedDocs } // Wrapping in JSON to match your JSONB column
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({ success: true, docId: docData.id, message: 'Documentation generated successfully!' });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate docs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Docurion AI Backend running on http://localhost:${PORT}`);
});