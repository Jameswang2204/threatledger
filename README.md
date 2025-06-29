# ThreatLedger

> A simple risk-management web app built with React, Tailwind CSS, jsPDF, and Excel export utilities.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🚀 Features

- **Add / Edit / Delete Risks**  
- **Assessment History & Change Log** for each risk  
- **Control Mapping** against popular frameworks (NIST CSF, ISO 27001, CIS, PCI, HIPAA, GDPR, CMMC, COBIT, CSA CCM…)  
- **AI-powered mitigation suggestions** via OpenAI (optional)  
- **Export to** CSV, Excel, and PDF (with embedded charts & trend tables)  
- **Jira** ticket creation integration  

---

## 📦 Tech Stack

- React (v18+)  
- Tailwind CSS  
- `jspdf` + `jspdf-autotable`  
- `xlsx` (via our `exportRisksToExcel` helper)  
- Chart.js & react-chartjs-2  
- OpenAI (optional)  
- React Router v6  

---

## 💻 Getting Started

### Prerequisites

- Node.js ≥ 16.x  
- npm (or Yarn)  
- (Optional) A free [OpenAI API key](https://platform.openai.com/)  
- (Optional) Jira base URL & API credentials  

### Installation

1. **Clone** the repo  
   ```bash
   git clone https://github.com/your-org/threatledger.git
   cd threatledger
Copy & fill your environment template

bash
cp .env.example .env.local
Then open .env.local and set:

ini
REACT_APP_OPENAI_API_KEY=sk-…
REACT_APP_JIRA_BASE_URL=https://your-atlassian-site.atlassian.net
REACT_APP_JIRA_EMAIL=you@example.com
REACT_APP_JIRA_API_TOKEN=…

Install dependencies
bash
npm install
# or
yarn
Start the dev server

bash
npm start
# or
yarn start
App will run at http://localhost:3000.
