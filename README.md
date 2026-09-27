# ⚖️ LegalEase – AI-Powered Legal Document Generator

LegalEase is a responsive, client-side web application designed to help users generate standard legal documents, letters, notices, and agreements through guided forms, instant validation, plain-English AI breakdowns, and direct PDF downloads.

---

## 🌟 Key Features

1. **Focused First-Screen Login**:
   - Centered authentication card with LegalEase branding.
   - Email format validation, password check, and a **1-Click Demo Login** shortcut for instant evaluation.
   - Session preservation via `localStorage` and navbar logout.

2. **5 Standard Legal Document Generators**:
   - 🏠 **Rental Agreement**: Residential tenancy deed with rent, deposit, notice period, and utility covenants.
   - 📄 **Formal Leave Letter**: Institutional/employment leave application with duration and duty handover notes.
   - ⚠️ **Legal Notice**: Formal demand notice detailing breach of contract, claim amount, and 15-day compliance deadline.
   - 📝 **Simple Affidavit**: Sworn statement under oath with deponent identity, declarations, and notary verification jurat.
   - 📩 **Complaint Letter**: Consumer grievance letter for defective products or deficient services.

3. **Smart Pre-Flight Validation**:
   - Validates all mandatory inputs before document generation.
   - Highlights missing fields in red with inline error messages and summary banner.
   - Automatically scrolls to the first unfilled field and clears errors as the user types.

4. **Realistic Sample Data**:
   - Each document form includes a **"✨ Fill Sample Data"** button to allow 1-click testing without manual typing.

5. **Dual-Panel Output Studio**:
   - **Legal Paper Preview**: Formatted with authentic legal letterhead, numbered clauses, formal recitals, and signature blocks.
   - **Plain-English AI Breakdown**: Explains key clauses, dates, financial liabilities, and practical tips in everyday human language.

6. **Interactive Action Suite**:
   - **✏️ Live Edit Mode**: Makes the generated legal document directly editable inline (`contenteditable`) so users can customize specific clauses.
   - **📋 One-Click Copy**: Copies clean formatted text directly to clipboard with visual toast feedback.
   - **⬇️ Download PDF**: Generates high-quality A4 PDF documents via `html2pdf.js`, with print fallback.
   - **💾 My Documents Manager**: Saves generated documents to browser `localStorage`. View, re-open, download, and delete saved documents at any time.

7. **🤖 Interactive AI Legal Assistant**:
   - Guided Q&A widget with one-click suggestion prompts for common legal document questions and a free-form query input.

8. **Mandatory Educational Disclaimer**:
   > *"This website is an educational project. Generated documents are for general informational purposes only and are not legal advice."*

9. **Fully Responsive Design**:
   - Clean, legal-themed aesthetic with Deep Navy (`#0f2744`), Slate Blue (`#2b5278`), and Classical Legal Gold (`#c59a3f`).
   - Mobile navigation drawer, fluid grids, and touch-friendly controls.

---

## 🚀 How to Run Locally

Because LegalEase is built entirely with vanilla **HTML5**, **CSS3**, and **JavaScript** with zero build dependencies, you can run it immediately:

### Option 1: Direct File Open
- Open the project folder `legal Ease`.
- Double-click `index.html` to open it directly in any modern browser (Google Chrome, Microsoft Edge, Firefox, Safari).

### Option 2: Using VS Code Live Server / Python HTTP Server
If you prefer running through a local web server:
```bash
# Using Python 3
python -m http.server 8000

# Open in browser: http://localhost:8000
```

---

## 🌐 How to Deploy to GitHub Pages

Deploying LegalEase to GitHub Pages takes less than 2 minutes:

1. **Initialize Git & Commit**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of LegalEase website"
   ```

2. **Push to your GitHub repository**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Click **Settings** ➔ **Pages** (under the "Code and automation" sidebar).
   - Under **Build and deployment** ➔ **Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`, then click **Save**.
   - Your website will be live at `https://<your-username>.github.io/<your-repo-name>/`.

---

## 📂 Project Structure

```
legal Ease/
├── index.html     # Semantic single-page HTML5 structure
├── style.css      # Responsive legal design system & print styles
├── app.js         # Client-side controller, templates, validation & storage
└── README.md      # Documentation & deployment guide
```

---

## ⚖️ Legal Disclaimer

*This website is an educational project. Generated documents are for general informational purposes only and are not legal advice.*
