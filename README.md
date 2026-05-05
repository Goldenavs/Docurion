# 🧾 Docurion

**AI-Powered Code Documentation Generator**

Docurion is a web-based application that automatically generates structured, production-ready documentation from raw source code using AI. It helps developers save time, improve clarity, and maintain consistent documentation across projects.

---

## 🚀 Overview

In modern development, documentation is often neglected, outdated, or inconsistent. Docurion solves this by transforming unstructured code into clean, readable documentation such as:

- README files  
- API documentation  
- Function-level explanations  

By combining AI with a structured backend system, Docurion provides a fast and reliable way to document codebases.

---

## 🎯 Problem

Developers commonly face:

- ⏱️ Lack of time to write documentation  
- 🔄 Documentation becoming outdated  
- 🤯 Difficulty understanding unfamiliar codebases  
- 📉 Poor onboarding experience for new contributors  

---

## 💡 Solution

Docurion automates documentation by:

- Analyzing uploaded source code  
- Detecting project structure and components  
- Generating structured documentation using AI  
- Storing and versioning outputs for future use  

---

## ✨ Features

### 📁 Project-Based Workspace
- Create and manage multiple projects  
- Organize files and generated documentation  

---

### 📂 Code Upload
- Upload multiple files or paste code directly  
- Supports common formats (`.js`, `.ts`, `.json`, etc.)  

---

### 🤖 AI Documentation Generation
Generate:

- **README Documentation**
  - Project overview  
  - Features  
  - Tech stack  
  - Setup instructions  

- **API Documentation**
  - Endpoints  
  - Request/response formats  
  - Descriptions  

- **Function Explanations** *(optional)*  

---

### 📘 Structured Documentation Viewer
- Clean, readable UI  
- Organized sections  
- Easy navigation  

---

### 🔁 Version Control for Docs
- Save multiple versions of generated docs  
- Track changes over time  
- Revisit previous outputs  

---

### 📤 Export & Copy
- Copy documentation instantly  
- Export for use in projects  

---

## 🧠 AI Integration

Docurion uses AI as a **structured documentation engine**, not just a chatbot:

- Converts code into organized documentation formats  
- Outputs structured JSON for consistent rendering  
- Detects relationships between files (e.g., routes and controllers)  
- Generates professional, production-level descriptions  

---

## 🏗️ Tech Stack

### Frontend
- React + Vite  
- TypeScript  
- Tailwind CSS  

### Backend
- Node.js  
- Express  

### Database
- PostgreSQL (Supabase / Neon)  

### Deployment
- Frontend: Vercel  
- Backend: Render  

---

## 🗄️ Database Design

Core entities:

- **Users**  
- **Projects**  
- **Files**  
- **Documents**  
- **Document Versions**  

---

## 🔌 API Endpoints

```bash
POST   /projects          # Create project
POST   /upload-files      # Upload source files
POST   /generate-docs     # Generate documentation (AI)
GET    /docs/:projectId   # Retrieve generated docs