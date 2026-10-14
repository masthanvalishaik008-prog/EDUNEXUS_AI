# EduNexus AI — Local Windows 11 & VS Code Setup Guide

EduNexus AI is an enterprise-grade Student Success Analytics & Placement Intelligence platform designed for the KPMG Case Challenge. It integrates 7 categories of student data:
1. Academic
2. Attendance
3. LMS Platform Activity
4. Campus Engagement
5. Placement Readiness
6. Domain Technical Skills
7. Qualitative & Pulse Feedback

## Requirements
- Windows 11 PC (Intel i5 or compatible, 8 GB RAM)
- VS Code installed
- Python 3.10, 3.11, or 3.12 (from python.org or Microsoft Store)
- No paid APIs required (runs completely local with open-source stack)

## Step-by-Step Setup

### Step 1: Open Terminal in VS Code
Open VS Code, press `Ctrl + \`` to open the integrated terminal.

### Step 2: Create and Activate Virtual Environment
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```
*(If PowerShell restricts scripts, run `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` first)*

### Step 3: Install Required Dependencies
```powershell
pip install -r requirements.txt
```

### Step 4: Run the Streamlit Application
```powershell
streamlit run app.py
```

### Step 5: Open Browser
The application will launch automatically at:
`http://localhost:8501`

## SQLite Persistence
Interventions and mentoring notes are persisted in `edunexus.db` automatically in the same folder.
