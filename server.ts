import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Route for Gemini Student Insight Synthesis
app.post('/api/gemini/student-insight', async (req, res) => {
  try {
    const { student, weights } = req.body;

    if (!student) {
      return res.status(400).json({ error: 'Student data is required.' });
    }

    const prompt = `You are an expert Chief Academic Advisor and Placement Intelligence Director at an enterprise engineering university, analyzing student progress as part of the KPMG Student Success framework.

Analyze the comprehensive multi-pillar data for the following student and generate a rigorous, explainable, and empathetic diagnostic insight report:

STUDENT PROFILE:
- Name: ${student.name} (${student.id})
- Department: ${student.department}
- Semester: ${student.semester} (Batch ${student.batch})
- Assigned Mentor: ${student.mentorName}
- Current Composite Success Score: ${student.compositeScore}/100 (Tier: ${student.riskLevel})

PILLAR 1: ACADEMIC DATA
- Current GPA: ${student.academic.gpa} / 10.0 (Previous Semester: ${student.academic.previousSemesterGpa})
- Internal Assessment Average: ${student.academic.internalAssessmentScore}%
- Backlog Deficit: ${student.academic.backlogsCount} subjects
- Total Credits Completed: ${student.academic.totalCreditsCompleted}
- Core Subject Average: ${student.academic.coreSubjectAverage}%

PILLAR 2: ATTENDANCE TELEMETRY
- Overall Semester Attendance: ${student.attendance.overallPercentage}% (Mandatory regulatory baseline: 75%)
- Theory Lectures: ${student.attendance.theoryPercentage}%
- Practical Laboratory Sessions: ${student.attendance.practicalPercentage}%
- Consecutive Missed Sessions: ${student.attendance.consecutiveAbsences} days

PILLAR 3: DIGITAL LMS ENGAGEMENT
- Portal Logins per Week: ${student.lms.portalLoginsPerWeek}
- Module Completion Rate: ${student.lms.moduleCompletionRate}%
- Quiz Benchmark Score: ${student.lms.quizAverageScore}%
- Assignment On-Time Submission: ${student.lms.assignmentOnTimeRate}%

PILLAR 4: PLACEMENT & APTITUDE INTELLIGENCE
- Target Career Pathway: ${student.placement.preferredDomain}
- Placement Coding Score: ${student.placement.codingScore}/100
- Quantitative & Logical Aptitude: ${student.placement.aptitudeScore}%
- Mock Interview Evaluation: ${student.placement.mockInterviewRating}/10
- Readiness Verdict: ${student.placement.readinessLevel}

PILLAR 5: DOMAIN SKILLS & PORTFOLIO
- Technical Skill Rating: ${student.skills.technicalSkillRating}/100
- Soft Skills & Communication: ${student.skills.softSkillRating}/100
- Primary Technologies: ${(student.skills.primaryTechnologies || []).join(', ')}
- Verified Certifications: ${(student.skills.verifiedCertifications || []).join(', ') || 'None logged yet'}
- Active GitHub Repositories: ${student.skills.gitHubProjectsCount}

PILLAR 6 & 7: CAMPUS ENGAGEMENT & FEEDBACK
- Hackathons Attended: ${student.engagement.hackathonsAttended}
- Forum Contribution Posts: ${student.engagement.forumPostsAndAnswers}
- Faculty Rating: ${student.feedback.facultyRating} / 5.0
- Student Pulse Satisfaction: ${student.feedback.satisfactionLevel}
- Stated Student Concern: "${student.feedback.primaryConcernArea}"
- Advisor Observation: "${student.feedback.advisorObservationNotes}"

INSTRUCTIONS FOR THE REPORT:
Produce a structured, professional markdown report with clear headings and bullet points containing:
1. ### Executive Diagnostic Summary: A 2-3 sentence high-level overview of the student's status, learning trajectory, and immediate risk/opportunity balance.
2. ### Multi-Pillar Correlation Analysis: Explain the direct cause-and-effect relationship between their Attendance, LMS habits, and Academic performance (explain why the success score is at ${student.compositeScore}/100).
3. ### Placement & Career Track Competitiveness: Detailed analysis of their preparedness for '${student.placement.preferredDomain}', identifying specific technical/aptitude gaps.
4. ### Identified Strengths & Protective Anchors: What natural competencies or positive habits can be leveraged?
5. ### Prescriptive 4-Week Action Plan: Concrete, weekly measurable milestones for the faculty mentor and student (Remedial clinics, coding practice targets, attendance recovery benchmarks).
6. ### Ethical Safeguard & Human Next Step: Recommended discussion talking points for the upcoming 1-on-1 advisor mentoring session.

Tone: Objective, supportive, constructive, and actionable. Avoid punitive language.`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let generatedText: string | null = null;
    let modelUsed = 'gemini-3.8-flash';
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
        });
        if (response.text && response.text.trim().length > 0) {
          generatedText = response.text;
          modelUsed = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} unavailable (${err?.status || err?.message}), attempting next option...`);
      }
    }

    if (!generatedText) {
      // Deterministic expert diagnostic synthesis fallback when external cloud AI endpoints undergo transient 503 high-demand spikes
      console.warn('All external Gemini models temporarily busy. Generating deterministic multi-pillar diagnostic report.');
      const attendanceRisk =
        student.attendance.overallPercentage < 75
          ? 'CRITICAL (<75% statutory compliance requirement)'
          : student.attendance.overallPercentage < 82
          ? 'MODERATE (Approaching warning threshold)'
          : 'HEALTHY (Compliant with campus norms)';

      const backlogText =
        student.academic.backlogsCount > 0
          ? `${student.academic.backlogsCount} active backlog course(s) flagged for faculty remediation`
          : 'Zero backlogs, continuous academic standing';

      generatedText = `### Executive Diagnostic Summary
${student.name} (${student.id}) in ${student.department} (Semester ${student.semester}, Batch ${student.batch}) maintains a Composite Success Score of **${student.compositeScore}/100** categorized under the **${student.riskLevel}** performance tier. Academic CGPA is currently **${student.academic.gpa.toFixed(1)} / 10.0** with ${backlogText}. Attendance compliance is registered at **${student.attendance.overallPercentage}%** (${attendanceRisk}) under mentor **${student.mentorName}**.

---

### Multi-Pillar Correlation Analysis
1. **Academic Standing & Course Mastery**:
   - Internal Assessment Average: **${student.academic.internalAssessmentScore}%** | Core Subject Average: **${student.academic.coreSubjectAverage}%**
   - Previous Semester CGPA: **${student.academic.previousSemesterGpa.toFixed(1)}** vs Current CGPA: **${student.academic.gpa.toFixed(1)}** (${student.academic.gpa >= student.academic.previousSemesterGpa ? 'Positive growth trajectory' : 'Requires mentor review'}).
   - Credits Completed: **${student.academic.totalCreditsCompleted} credits**.

2. **Attendance Telemetry & LMS Engagement**:
   - Theory Lecture Attendance: **${student.attendance.theoryPercentage}%** | Laboratory Session Attendance: **${student.attendance.practicalPercentage}%**
   - Consecutive Absences Recorded: **${student.attendance.consecutiveAbsences} days** ${student.attendance.consecutiveAbsences >= 3 ? '(Flagged for intervention call)' : '(Normal continuity)'}.
   - Digital Learning LMS: **${student.lms.portalLoginsPerWeek} logins/week**, Module Completion Rate: **${student.lms.moduleCompletionRate}%**, and On-Time Assignment Rate: **${student.lms.assignmentOnTimeRate}%**.

3. **Composite Driver Diagnosis**:
   - The primary driver of the ${student.compositeScore}/100 score is the direct correlation between practical attendance (${student.attendance.practicalPercentage}%) and technical domain competency (${student.skills.technicalSkillRating}/100).
   ${student.academic.backlogsCount > 0 ? `- **Alert**: ${student.academic.backlogsCount} backlog(s) impact academic index; prioritize upcoming remediation clinics.` : `- **Stability**: Clean academic record reinforces exam resilience.`}

---

### Placement & Career Track Competitiveness
- **Target Career Pathway**: **${student.placement.preferredDomain}**
- **Coding Benchmark Rating**: **${student.placement.codingScore}/100**
- **Quantitative & Logical Aptitude**: **${student.placement.aptitudeScore}%**
- **Mock Interview Performance**: **${student.placement.mockInterviewRating}/10.0**
- **Placement Readiness Verdict**: **${student.placement.readinessLevel}**
- **Primary Technical Stack**: ${(student.skills.primaryTechnologies || []).join(', ') || 'Core Engineering Fundamentals'}
- **Active Repositories & Certifications**: **${student.skills.gitHubProjectsCount} GitHub repos** | Certifications: ${(student.skills.verifiedCertifications || []).join(', ') || 'In progress'}

---

### Identified Strengths & Protective Anchors
${(student.strengths || []).map((s: string) => `- **Core Strength**: ${s}`).join('\n') || '- Disciplined laboratory participation and consistent attendance record.'}
- **Faculty Mentorship Rating**: Evaluated at **${student.feedback.facultyRating} / 5.0**.
- **Student Sentiment**: Expressed satisfaction level: **${student.feedback.satisfactionLevel}**, noted focus: *"${student.feedback.primaryConcernArea}"*.

---

### Prescriptive 4-Week Action Plan
- **Week 1 (Diagnostic & Mentor Check-In)**:
  - Faculty Mentor (${student.mentorName}) conducts a structured 20-minute discussion regarding *"${student.feedback.primaryConcernArea}"*.
  - Student completes timed baseline assessment for ${student.placement.preferredDomain}.
- **Week 2 (Targeted Skill Remediation)**:
  - Dedicate 5 hours/week to coding drills in ${(student.skills.primaryTechnologies || []).slice(0, 2).join(' & ') || 'core languages'}.
  - Target 100% submission rate across all open LMS modules (currently at ${student.lms.moduleCompletionRate}%).
- **Week 3 (Mock Interview & Remedial Clinic)**:
  - Complete peer-reviewed mock interview simulation to elevate score from ${student.placement.mockInterviewRating}/10.
  ${student.academic.backlogsCount > 0 ? `- Attend departmental remedial clinic for ${student.academic.backlogsCount} pending backlog(s).` : `- Push capstone code milestones to GitHub (currently ${student.skills.gitHubProjectsCount} repos).`}
- **Week 4 (Institutional Review & Certification)**:
  - Re-evaluate composite attendance compliance (sustain ≥ ${Math.max(80, student.attendance.overallPercentage)}%).
  - Finalize placement portfolio and resume review with the Department Career Officer.

---

### Ethical Safeguard & Human Next Step
- **Advisor Mentoring Note**: *"${student.feedback.advisorObservationNotes}"*
- **Algorithmic Accountability**: This report is an advisory decision-support instrument under FERPA standards. All remedial recommendations require human confirmation between student and faculty advisor.`;
      modelUsed = 'edunexus-diagnostic-engine (fallback)';
    }

    res.json({
      summary: generatedText,
      model: modelUsed,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate AI insight report from Gemini API.',
    });
  }
});

// --- INSTITUTIONAL BACKEND DATABASE STORE (Staff Only Access) ---
interface StaffRecord {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  role: string;
  cabin: string;
  phone: string;
  officeHours: string;
  coursesTaught: string[];
  specialization: string;
  assignedStudentsCount: number;
  experienceYears: number;
}

const BACKEND_STAFF_DATABASE: StaffRecord[] = [
  {
    id: 'STF-ECE-01',
    name: 'Dr. Ramesh Sundaram',
    email: 'ramesh.sundaram@edunexus.edu',
    department: 'Electronics & Comm (ECE)',
    designation: 'Senior Professor & HOD',
    role: 'Faculty Advisor',
    cabin: 'Room E-304, Tech Tower',
    phone: '+91 98401 23450',
    officeHours: 'Mon & Wed 2:00 PM - 4:30 PM',
    coursesTaught: ['Embedded Systems & IoT', 'Microcontrollers & Architecture', 'Digital Signal Processing'],
    specialization: 'ARM Cortex, FreeRTOS Firmware, Sensor Networks',
    assignedStudentsCount: 38,
    experienceYears: 18,
  },
  {
    id: 'STF-CSE-02',
    name: 'Prof. Ananya Iyer',
    email: 'ananya.iyer@edunexus.edu',
    department: 'Computer Science (CSE)',
    designation: 'Associate Professor',
    role: 'Faculty Advisor',
    cabin: 'Room C-212, Alan Turing Hall',
    phone: '+91 98401 23451',
    officeHours: 'Tue & Thu 10:00 AM - 12:30 PM',
    coursesTaught: ['Design & Analysis of Algorithms', 'Artificial Intelligence', 'Operating Systems'],
    specialization: 'Deep Learning, Graph Algorithms, Explainable AI',
    assignedStudentsCount: 42,
    experienceYears: 12,
  },
  {
    id: 'STF-PLC-03',
    name: 'Dr. Rajesh Khanna',
    email: 'rajesh.khanna@edunexus.edu',
    department: 'Career & Placement Cell',
    designation: 'Chief Placement Officer & Professor',
    role: 'Career Placement Officer',
    cabin: 'Room P-101, Placement Corporate Block',
    phone: '+91 98401 23452',
    officeHours: 'Mon to Fri 3:00 PM - 5:00 PM',
    coursesTaught: ['Campus Recruitment Training', 'System Design & DSA Benchmark', 'Technical Interview Prep'],
    specialization: 'Tier-1 Tech Placements, Quantitative Aptitude Benchmarking',
    assignedStudentsCount: 156,
    experienceYears: 20,
  },
  {
    id: 'STF-IT-04',
    name: 'Dr. Shalini Mukherjee',
    email: 'shalini.mukherjee@edunexus.edu',
    department: 'Information Tech (IT)',
    designation: 'Associate Professor & IT Coordinator',
    role: 'Faculty Advisor',
    cabin: 'Room I-108, Software Center',
    phone: '+91 98401 23453',
    officeHours: 'Wed & Fri 11:00 AM - 1:00 PM',
    coursesTaught: ['Database Management Systems', 'Cloud Computing & DevOps', 'Distributed Systems'],
    specialization: 'PostgreSQL, Distributed Cache Architecture, Kubernetes',
    assignedStudentsCount: 35,
    experienceYears: 14,
  },
  {
    id: 'STF-MEC-05',
    name: 'Prof. Vikramaditya Rao',
    email: 'vikram.rao@edunexus.edu',
    department: 'Mechanical Engineering',
    designation: 'Assistant Professor & Robotics Lead',
    role: 'Faculty Advisor',
    cabin: 'Room M-205, Innovation Lab',
    phone: '+91 98401 23454',
    officeHours: 'Mon & Thu 1:30 PM - 3:30 PM',
    coursesTaught: ['Robotics & Mechatronics', 'Finite Element Analysis', 'CAD/CAM SolidWorks'],
    specialization: 'Kinematics, Autonomous Mobile Robots, Industrial IoT',
    assignedStudentsCount: 29,
    experienceYears: 9,
  },
  {
    id: 'STF-ADM-06',
    name: 'Dr. Meenakshi Sundaram',
    email: 'meenakshi.sundaram@edunexus.edu',
    department: 'Deanery of Academic Affairs',
    designation: 'Academic Dean & Remediation Director',
    role: 'Academic Dean',
    cabin: 'Admin Block, Room A-102',
    phone: '+91 98401 23455',
    officeHours: 'Daily 4:00 PM - 5:30 PM',
    coursesTaught: ['Engineering Mathematics IV', 'Remedial Calculus Clinic'],
    specialization: 'Academic Quality Assurance, Curriculum Remediation, NEP Standards',
    assignedStudentsCount: 210,
    experienceYears: 24,
  },
  {
    id: 'STF-WEL-07',
    name: 'Dr. Priya Venkataraman',
    email: 'priya.venkat@edunexus.edu',
    department: 'Student Affairs & Mentorship',
    designation: 'Senior Student Wellbeing Counselor',
    role: 'Counselor',
    cabin: 'Student Wellness Pavilion, Room W-10',
    phone: '+91 98401 23456',
    officeHours: 'Mon to Sat 9:00 AM - 4:00 PM',
    coursesTaught: ['Life Skills & Mental Resilience', 'Stress Mitigation Workshops'],
    specialization: 'Cognitive Behavioral Support, Exam Stress Intervention',
    assignedStudentsCount: 180,
    experienceYears: 15,
  },
];

const BACKEND_STUDENTS_DATABASE = [
  {
    id: 'ENX-2024-101',
    name: 'Aarav Patel',
    email: 'aarav.patel@edunexus.edu',
    gender: 'Male',
    department: 'Electronics & Comm (ECE)',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Dr. Ramesh Sundaram',
    compositeScore: 84,
    riskLevel: 'Low Support Need (Stable)',
    gpa: 8.4,
    attendance: 91,
    backlogs: 0,
    preferredDomain: 'Embedded Systems & IoT',
    placementReadiness: 'Job Ready',
    codingScore: 78,
    phone: '+91 98765 43210',
    primaryTechnologies: ['Embedded C', 'FreeRTOS', 'ESP32', 'I2C/SPI Protocols'],
  },
  {
    id: 'ENX-2024-102',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@edunexus.edu',
    gender: 'Female',
    department: 'Computer Science (CSE)',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Prof. Ananya Iyer',
    compositeScore: 94,
    riskLevel: 'Low Support Need (Stable)',
    gpa: 9.3,
    attendance: 96,
    backlogs: 0,
    preferredDomain: 'Software Development & Algorithms',
    placementReadiness: 'Job Ready',
    codingScore: 92,
    phone: '+91 98765 43211',
    primaryTechnologies: ['Java', 'Python', 'C++', 'DSA', 'Spring Boot', 'PostgreSQL'],
  },
  {
    id: 'ENX-2024-103',
    name: 'Karan Verma',
    email: 'karan.verma@edunexus.edu',
    gender: 'Male',
    department: 'Electronics & Comm (ECE)',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Dr. Ramesh Sundaram',
    compositeScore: 56,
    riskLevel: 'Moderate Attention Required',
    gpa: 6.2,
    attendance: 68,
    backlogs: 2,
    preferredDomain: 'Electronics Testing & Hardware QA',
    placementReadiness: 'Early Preparation',
    codingScore: 48,
    phone: '+91 98765 43212',
    primaryTechnologies: ['MATLAB', 'Digital Electronics', 'Multisim', 'Verilog Basics'],
  },
  {
    id: 'ENX-2024-104',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@edunexus.edu',
    gender: 'Female',
    department: 'Information Tech (IT)',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Dr. Shalini Mukherjee',
    compositeScore: 76,
    riskLevel: 'Low Support Need (Stable)',
    gpa: 7.8,
    attendance: 84,
    backlogs: 0,
    preferredDomain: 'Data Analytics & Cloud Systems',
    placementReadiness: 'Placement Progressing',
    codingScore: 72,
    phone: '+91 98765 43213',
    primaryTechnologies: ['Python', 'SQL', 'Tableau', 'AWS Essentials', 'Docker'],
  },
  {
    id: 'ENX-2024-105',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@edunexus.edu',
    gender: 'Male',
    department: 'Mechanical Engineering',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Prof. Vikramaditya Rao',
    compositeScore: 45,
    riskLevel: 'High Risk / Escalation Flagged',
    gpa: 5.7,
    attendance: 62,
    backlogs: 3,
    preferredDomain: 'Mechatronics & Automation',
    placementReadiness: 'Critical Remediation Required',
    codingScore: 35,
    phone: '+91 98765 43214',
    primaryTechnologies: ['AutoCAD', 'SolidWorks', 'ANSYS Basics'],
  },
  {
    id: 'ENX-2024-106',
    name: 'Deepika Nair',
    email: 'deepika.nair@edunexus.edu',
    gender: 'Female',
    department: 'Computer Science (CSE)',
    batch: '2022-2026',
    semester: 6,
    mentorName: 'Prof. Ananya Iyer',
    compositeScore: 89,
    riskLevel: 'Low Support Need (Stable)',
    gpa: 8.9,
    attendance: 94,
    backlogs: 0,
    preferredDomain: 'AI / Machine Learning Engineering',
    placementReadiness: 'Job Ready',
    codingScore: 88,
    phone: '+91 98765 43215',
    primaryTechnologies: ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'FastAPI', 'Pandas'],
  },
];

// Backend Database API: Get Students
app.get('/api/database/students', (req, res) => {
  try {
    const { q, department, semester, riskLevel } = req.query;
    let list = [...BACKEND_STUDENTS_DATABASE];

    if (department && department !== 'All') {
      list = list.filter((s) => s.department.toLowerCase().includes(String(department).toLowerCase()));
    }

    if (riskLevel && riskLevel !== 'All') {
      list = list.filter((s) => s.riskLevel.toLowerCase().includes(String(riskLevel).toLowerCase()));
    }

    if (semester && semester !== 'All') {
      list = list.filter((s) => s.semester === Number(semester));
    }

    if (q) {
      const term = String(q).toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          s.id.toLowerCase().includes(term) ||
          s.email.toLowerCase().includes(term) ||
          s.mentorName.toLowerCase().includes(term) ||
          s.department.toLowerCase().includes(term) ||
          s.preferredDomain.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      students: list,
      total: list.length,
      allTotal: BACKEND_STUDENTS_DATABASE.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch student database records' });
  }
});

// Backend Database API: Get Staff
app.get('/api/database/staff', (req, res) => {
  try {
    const { q, department, role } = req.query;
    let list = [...BACKEND_STAFF_DATABASE];

    if (department && department !== 'All') {
      list = list.filter((st) => st.department.toLowerCase().includes(String(department).toLowerCase()));
    }

    if (role && role !== 'All') {
      list = list.filter((st) => st.role.toLowerCase().includes(String(role).toLowerCase()) || st.designation.toLowerCase().includes(String(role).toLowerCase()));
    }

    if (q) {
      const term = String(q).toLowerCase().trim();
      list = list.filter(
        (st) =>
          st.name.toLowerCase().includes(term) ||
          st.id.toLowerCase().includes(term) ||
          st.email.toLowerCase().includes(term) ||
          st.department.toLowerCase().includes(term) ||
          st.designation.toLowerCase().includes(term) ||
          st.specialization.toLowerCase().includes(term)
      );
    }

    res.json({
      success: true,
      staff: list,
      total: list.length,
      allTotal: BACKEND_STAFF_DATABASE.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch staff database records' });
  }
});

// Backend Database API: Add Student
app.post('/api/database/students', (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.department) {
      return res.status(400).json({ error: 'Name and department are required' });
    }
    const newStudent = {
      id: data.id || `ENX-2024-${BACKEND_STUDENTS_DATABASE.length + 101}`,
      name: data.name,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@edunexus.edu`,
      gender: data.gender || 'Not Specified',
      department: data.department,
      batch: data.batch || '2022-2026',
      semester: Number(data.semester) || 6,
      mentorName: data.mentorName || 'Dr. Ramesh Sundaram',
      compositeScore: Number(data.compositeScore) || 75,
      riskLevel: data.riskLevel || 'Low Support Need (Stable)',
      gpa: Number(data.gpa) || 7.5,
      attendance: Number(data.attendance) || 85,
      backlogs: Number(data.backlogs) || 0,
      preferredDomain: data.preferredDomain || 'Core Engineering Track',
      placementReadiness: data.placementReadiness || 'Placement Progressing',
      codingScore: Number(data.codingScore) || 60,
      phone: data.phone || '+91 98000 00000',
      primaryTechnologies: data.primaryTechnologies || ['Python', 'SQL'],
    };
    BACKEND_STUDENTS_DATABASE.push(newStudent);
    res.status(201).json({ success: true, student: newStudent });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add student to database' });
  }
});

// Backend Database API: Add Staff
app.post('/api/database/staff', (req, res) => {
  try {
    const data = req.body;
    if (!data.name || !data.department || !data.designation) {
      return res.status(400).json({ error: 'Name, department, and designation are required' });
    }
    const newStaff: StaffRecord = {
      id: data.id || `STF-GEN-0${BACKEND_STAFF_DATABASE.length + 1}`,
      name: data.name,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@edunexus.edu`,
      department: data.department,
      designation: data.designation,
      role: data.role || 'Faculty Advisor',
      cabin: data.cabin || 'Faculty Block Room 101',
      phone: data.phone || '+91 98401 00000',
      officeHours: data.officeHours || 'Mon - Fri 2:00 PM - 4:00 PM',
      coursesTaught: data.coursesTaught || ['Engineering Fundamentals'],
      specialization: data.specialization || 'Academic Research & Teaching',
      assignedStudentsCount: Number(data.assignedStudentsCount) || 30,
      experienceYears: Number(data.experienceYears) || 5,
    };
    BACKEND_STAFF_DATABASE.push(newStaff);
    res.status(201).json({ success: true, staff: newStaff });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add staff to database' });
  }
});

// Backend Database API: Database Stats
app.get('/api/database/stats', (_req, res) => {
  const totalStudents = BACKEND_STUDENTS_DATABASE.length;
  const totalStaff = BACKEND_STAFF_DATABASE.length;
  const avgGpa = (
    BACKEND_STUDENTS_DATABASE.reduce((acc, s) => acc + s.gpa, 0) / (totalStudents || 1)
  ).toFixed(2);
  const avgAttendance = Math.round(
    BACKEND_STUDENTS_DATABASE.reduce((acc, s) => acc + s.attendance, 0) / (totalStudents || 1)
  );
  const backlogsTotal = BACKEND_STUDENTS_DATABASE.reduce((acc, s) => acc + s.backlogs, 0);

  res.json({
    totalStudents,
    totalStaff,
    avgGpa,
    avgAttendance,
    backlogsTotal,
    departmentCount: 4,
    serverUptime: process.uptime(),
  });
});

// --- BACKEND DATABASE STORE: STUDENT ENGAGEMENT & ACTIVITIES (Staff Accessible) ---
interface BackendStudentActivity {
  id: string;
  studentId: string;
  studentName: string;
  department: string;
  title: string;
  category: 'Academic Booster' | 'Knowledge Refresher' | 'Hands-on Project' | 'Skill & Certification' | 'Peer Study & Seminar' | 'Interactive Quiz';
  description: string;
  status: 'Planned' | 'In Progress' | 'Completed';
  progressPct: number;
  hoursSpent: number;
  dateLogged: string;
  dateCompleted?: string;
  verifiedByStaff: boolean;
  staffFeedback?: string;
  verifiedByStaffName?: string;
  verifiedAt?: string;
  learningOutcomes?: string;
  semesterSubject?: string;
  mentorName?: string;
  score?: number;
}

const BACKEND_STUDENT_ACTIVITIES: BackendStudentActivity[] = [
  {
    id: 'ACT-1001',
    studentId: 'ENX-2024-101',
    studentName: 'Aarav Patel',
    department: 'Electronics & Comm (ECE)',
    title: 'FreeRTOS Task Scheduling & Mutex Synchronization',
    category: 'Hands-on Project',
    description: 'Designed non-blocking sensor acquisition loops with queue communication, task priorities, and mutexes on ESP32 microcontroller.',
    status: 'Completed',
    progressPct: 100,
    hoursSpent: 10,
    dateLogged: '2026-10-10',
    dateCompleted: '2026-10-13',
    verifiedByStaff: true,
    staffFeedback: 'Outstanding firmware implementation. Verified timing waveforms and thread safety in hardware lab.',
    verifiedByStaffName: 'Dr. Ramesh Sundaram',
    verifiedAt: '2026-10-13T14:30:00Z',
    learningOutcomes: 'Mastered priority inversion mitigation and RTOS inter-task communication.',
    semesterSubject: 'Embedded Systems & IoT',
    mentorName: 'Dr. Ramesh Sundaram',
  },
  {
    id: 'ACT-1002',
    studentId: 'ENX-2024-101',
    studentName: 'Aarav Patel',
    department: 'Electronics & Comm (ECE)',
    title: 'Digital Signal Processing: Bilinear Transform & Filter Design',
    category: 'Academic Booster',
    description: 'Computed pole-zero placements for 4th-order Butterworth filter and simulated frequency responses.',
    status: 'In Progress',
    progressPct: 65,
    hoursSpent: 6,
    dateLogged: '2026-10-12',
    verifiedByStaff: false,
    staffFeedback: '',
    learningOutcomes: 'Continuous-to-discrete time IIR filter transformation equations.',
    semesterSubject: 'Digital Signal Processing',
    mentorName: 'Dr. Ramesh Sundaram',
  },
  {
    id: 'ACT-1003',
    studentId: 'ENX-2024-101',
    studentName: 'Aarav Patel',
    department: 'Electronics & Comm (ECE)',
    title: 'Embedded Firmware & RTOS Mini-Quiz Assessment',
    category: 'Interactive Quiz',
    description: 'Student successfully completed FreeRTOS interrupt priority masking and semaphore arbitration quiz (+10 XP).',
    status: 'Completed',
    progressPct: 100,
    hoursSpent: 1,
    dateLogged: '2026-10-14',
    dateCompleted: '2026-10-14',
    verifiedByStaff: true,
    staffFeedback: 'Automated assessment passed with full precision. Points accredited to student profile.',
    verifiedByStaffName: 'System Evaluation Agent',
    verifiedAt: '2026-10-14T02:00:00Z',
    learningOutcomes: '100% precision on RTOS concepts and interrupt latency.',
    semesterSubject: 'Embedded Systems & IoT',
    mentorName: 'Dr. Ramesh Sundaram',
    score: 10,
  },
  {
    id: 'ACT-1004',
    studentId: 'ENX-2024-102',
    studentName: 'Sneha Reddy',
    department: 'Computer Science (CSE)',
    title: 'Data Structures & Algorithms Placement Sprint',
    category: 'Skill & Certification',
    description: 'Solved 25 LeetCode Medium/Hard DP & Graph problems, implemented Dijkstra and Topological Sort from scratch.',
    status: 'Completed',
    progressPct: 100,
    hoursSpent: 16,
    dateLogged: '2026-10-08',
    dateCompleted: '2026-10-12',
    verifiedByStaff: true,
    staffFeedback: 'Impressive code readability and optimal time complexity benchmarks. Recommended for top-tier placement pool.',
    verifiedByStaffName: 'Prof. Ananya Iyer',
    verifiedAt: '2026-10-12T17:00:00Z',
    learningOutcomes: 'Mastery over state machine dynamic programming and complex graph algorithms.',
    semesterSubject: 'Design & Analysis of Algorithms',
    mentorName: 'Prof. Ananya Iyer',
  },
  {
    id: 'ACT-1005',
    studentId: 'ENX-2024-102',
    studentName: 'Sneha Reddy',
    department: 'Computer Science (CSE)',
    title: 'Relational Database Concurrency & Query Optimization',
    category: 'Academic Booster',
    description: 'Investigating MVCC, phantom read anomalies, and query execution plans in PostgreSQL.',
    status: 'In Progress',
    progressPct: 50,
    hoursSpent: 8,
    dateLogged: '2026-10-13',
    verifiedByStaff: false,
    staffFeedback: '',
    learningOutcomes: 'ACID isolation levels and compound index tuning.',
    semesterSubject: 'Database Management Systems',
    mentorName: 'Prof. Ananya Iyer',
  },
  {
    id: 'ACT-1006',
    studentId: 'ENX-2024-103',
    studentName: 'Karan Verma',
    department: 'Electronics & Comm (ECE)',
    title: 'Analog Circuit Simulation in Multisim & Signal Analysis',
    category: 'Academic Booster',
    description: 'Simulating op-amp negative feedback loops and active low-pass filtering circuits.',
    status: 'In Progress',
    progressPct: 40,
    hoursSpent: 4,
    dateLogged: '2026-10-13',
    verifiedByStaff: false,
    staffFeedback: '',
    learningOutcomes: 'Bode plot analysis and 3dB cutoff frequency calculations.',
    semesterSubject: 'Analog Integrated Circuits',
    mentorName: 'Dr. Ramesh Sundaram',
  },
  {
    id: 'ACT-1007',
    studentId: 'ENX-2024-104',
    studentName: 'Sneha Kulkarni',
    department: 'Information Tech (IT)',
    title: 'Data Engineering ETL Pipeline with Python & SQL',
    category: 'Hands-on Project',
    description: 'Ingested multi-source JSON/CSV datasets, performed automated schema validation and loaded into PostgreSQL.',
    status: 'Completed',
    progressPct: 100,
    hoursSpent: 12,
    dateLogged: '2026-10-09',
    dateCompleted: '2026-10-13',
    verifiedByStaff: true,
    staffFeedback: 'Well-structured ETL scripts with proper exception handling. Data quality assertions passed.',
    verifiedByStaffName: 'Dr. Shalini Mukherjee',
    verifiedAt: '2026-10-13T11:15:00Z',
    learningOutcomes: 'Automated data cleansing and relational schema loading.',
    semesterSubject: 'Big Data & Cloud Analytics',
    mentorName: 'Dr. Shalini Mukherjee',
  },
  {
    id: 'ACT-1008',
    studentId: 'ENX-2024-105',
    studentName: 'Rohan Sharma',
    department: 'Mechanical Engineering',
    title: 'Thermodynamics & Heat Transfer Problem Clinic',
    category: 'Academic Booster',
    description: 'Working through Rankine cycle and reheat calculations to prepare for mid-semester remedial exam.',
    status: 'In Progress',
    progressPct: 35,
    hoursSpent: 5,
    dateLogged: '2026-10-11',
    verifiedByStaff: false,
    staffFeedback: '',
    learningOutcomes: 'Enthalpy and entropy balance equations for steam power turbines.',
    semesterSubject: 'Applied Thermodynamics',
    mentorName: 'Prof. Vikramaditya Rao',
  },
  {
    id: 'ACT-1009',
    studentId: 'ENX-2024-106',
    studentName: 'Deepika Nair',
    department: 'Computer Science (CSE)',
    title: 'Deep Learning Convolutional Neural Network for Medical Imaging',
    category: 'Hands-on Project',
    description: 'Trained ResNet-50 backbone on chest X-ray dataset with learning rate warm-up and data augmentation.',
    status: 'Completed',
    progressPct: 100,
    hoursSpent: 14,
    dateLogged: '2026-10-07',
    dateCompleted: '2026-10-11',
    verifiedByStaff: true,
    staffFeedback: 'Solid ROC-AUC performance (0.94) and clean validation methodology. Nominated for departmental research showcase.',
    verifiedByStaffName: 'Prof. Ananya Iyer',
    verifiedAt: '2026-10-11T16:20:00Z',
    learningOutcomes: 'PyTorch model fine-tuning, cross-entropy loss, and gradient clipping.',
    semesterSubject: 'Machine Learning',
    mentorName: 'Prof. Ananya Iyer',
  },
];

// Backend API: GET Student Engagement Activities (with rich filtering for staff)
app.get('/api/student-engagement/activities', (req, res) => {
  try {
    const { studentId, department, category, status, verified, mentorName, q } = req.query;
    let list = [...BACKEND_STUDENT_ACTIVITIES];

    if (studentId && studentId !== 'All') {
      list = list.filter((a) => a.studentId.toLowerCase() === String(studentId).toLowerCase());
    }

    if (department && department !== 'All') {
      list = list.filter((a) => a.department.toLowerCase().includes(String(department).toLowerCase()));
    }

    if (category && category !== 'All') {
      list = list.filter((a) => a.category.toLowerCase() === String(category).toLowerCase());
    }

    if (status && status !== 'All') {
      list = list.filter((a) => a.status.toLowerCase() === String(status).toLowerCase());
    }

    if (verified === 'true') {
      list = list.filter((a) => a.verifiedByStaff === true);
    } else if (verified === 'false') {
      list = list.filter((a) => !a.verifiedByStaff);
    }

    if (mentorName && mentorName !== 'All') {
      list = list.filter((a) => a.mentorName && a.mentorName.toLowerCase().includes(String(mentorName).toLowerCase()));
    }

    if (q) {
      const term = String(q).toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(term) ||
          a.studentName.toLowerCase().includes(term) ||
          a.studentId.toLowerCase().includes(term) ||
          a.description.toLowerCase().includes(term) ||
          (a.semesterSubject && a.semesterSubject.toLowerCase().includes(term)) ||
          (a.learningOutcomes && a.learningOutcomes.toLowerCase().includes(term))
      );
    }

    // Compute aggregated metrics
    const totalActivities = list.length;
    const completed = list.filter((a) => a.status === 'Completed').length;
    const inProgress = list.filter((a) => a.status === 'In Progress').length;
    const planned = list.filter((a) => a.status === 'Planned').length;
    const verifiedCount = list.filter((a) => a.verifiedByStaff).length;
    const pendingVerification = list.filter((a) => !a.verifiedByStaff).length;
    const totalHours = list.reduce((sum, a) => sum + (a.hoursSpent || 0), 0);

    res.json({
      success: true,
      activities: list,
      total: totalActivities,
      stats: {
        totalActivities,
        completed,
        inProgress,
        planned,
        verifiedCount,
        pendingVerification,
        totalHours,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch student activities' });
  }
});

// Backend API: POST/Record Student Engagement Activity (Stores student actions into backend DB)
app.post('/api/student-engagement/activities', (req, res) => {
  try {
    const data = req.body;
    if (!data.studentId || !data.title) {
      return res.status(400).json({ error: 'studentId and title are required' });
    }

    const existingIndex = BACKEND_STUDENT_ACTIVITIES.findIndex((a) => a.id === data.id);
    if (existingIndex >= 0) {
      // Update existing record
      BACKEND_STUDENT_ACTIVITIES[existingIndex] = {
        ...BACKEND_STUDENT_ACTIVITIES[existingIndex],
        ...data,
      };
      return res.json({
        success: true,
        activity: BACKEND_STUDENT_ACTIVITIES[existingIndex],
        message: 'Student activity updated in backend database',
      });
    }

    // Generate new activity ID if missing
    const newActivity: BackendStudentActivity = {
      id: data.id || `ACT-${Date.now().toString().slice(-4)}`,
      studentId: data.studentId,
      studentName: data.studentName || 'Student',
      department: data.department || 'General Engineering',
      title: data.title,
      category: data.category || 'Academic Booster',
      description: data.description || 'Academic activity logged by student.',
      status: data.status || 'In Progress',
      progressPct: typeof data.progressPct === 'number' ? data.progressPct : 30,
      hoursSpent: Number(data.hoursSpent) || 4,
      dateLogged: data.dateLogged || new Date().toISOString().split('T')[0],
      dateCompleted: data.dateCompleted || (data.status === 'Completed' ? new Date().toISOString().split('T')[0] : undefined),
      verifiedByStaff: Boolean(data.verifiedByStaff),
      staffFeedback: data.staffFeedback || '',
      verifiedByStaffName: data.verifiedByStaffName,
      verifiedAt: data.verifiedAt,
      learningOutcomes: data.learningOutcomes || 'Active learning milestone.',
      semesterSubject: data.semesterSubject || 'Engineering Coursework',
      mentorName: data.mentorName || 'Faculty Advisor',
      score: data.score,
    };

    BACKEND_STUDENT_ACTIVITIES.unshift(newActivity);

    res.status(201).json({
      success: true,
      activity: newActivity,
      message: 'Student activity successfully stored in backend database and routed to faculty mentor.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save student activity to backend database' });
  }
});

// Backend API: Staff Verification of Student Engagement Activity
app.put('/api/student-engagement/activities/:id/verify', (req, res) => {
  try {
    const { id } = req.params;
    const { staffFeedback, verifiedByStaffName } = req.body;

    const activity = BACKEND_STUDENT_ACTIVITIES.find((a) => a.id === id);
    if (!activity) {
      return res.status(404).json({ error: `Activity ${id} not found in backend database` });
    }

    activity.verifiedByStaff = true;
    activity.staffFeedback = staffFeedback || 'Verified and approved by faculty advisor. High academic diligence commended.';
    activity.verifiedByStaffName = verifiedByStaffName || 'Faculty Advisor';
    activity.verifiedAt = new Date().toISOString();

    res.json({
      success: true,
      activity,
      message: `Activity ${id} verified by staff in backend database.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to verify student activity' });
  }
});

// Backend API: Record Quiz Attempt / Interactive Activity
app.post('/api/student-engagement/quiz-attempt', (req, res) => {
  try {
    const { studentId, studentName, department, subject, questionText, isCorrect, explanation, pointsEarned } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId is required' });
    }

    const activityId = `QUIZ-${Date.now().toString().slice(-4)}`;
    const quizActivity: BackendStudentActivity = {
      id: activityId,
      studentId,
      studentName: studentName || 'Student',
      department: department || 'Engineering',
      title: `Branch Quiz: ${subject || 'Department Knowledge'}`,
      category: 'Interactive Quiz',
      description: `Completed branch knowledge mini-game question: "${String(questionText || '').slice(0, 75)}...". Result: ${isCorrect ? 'Correct (+10 XP)' : 'Incorrect'}.`,
      status: 'Completed',
      progressPct: 100,
      hoursSpent: 0.5,
      dateLogged: new Date().toISOString().split('T')[0],
      dateCompleted: new Date().toISOString().split('T')[0],
      verifiedByStaff: true,
      staffFeedback: isCorrect
        ? 'Automated quiz validation passed: +10 XP accredited to student profile.'
        : 'Quiz attempted. Review explanation for conceptual reinforcement.',
      verifiedByStaffName: 'Automated Evaluation Agent',
      verifiedAt: new Date().toISOString(),
      learningOutcomes: explanation || 'Subject concept revision and self-assessment.',
      semesterSubject: subject || 'Branch Core',
      score: isCorrect ? 10 : 0,
    };

    BACKEND_STUDENT_ACTIVITIES.unshift(quizActivity);

    // Update student's points in backend students database if found
    const student = BACKEND_STUDENTS_DATABASE.find((s) => s.id === studentId);
    if (student && isCorrect) {
      (student as any).points = ((student as any).points || 0) + (pointsEarned || 10);
    }

    res.status(201).json({
      success: true,
      activity: quizActivity,
      pointsEarned: isCorrect ? (pointsEarned || 10) : 0,
      message: 'Quiz activity successfully stored in backend database for staff inspection.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record quiz attempt' });
  }
});

// Backend API: Student Engagement Summary Telemetry for Staff Dashboard
app.get('/api/student-engagement/summary', (_req, res) => {
  try {
    const total = BACKEND_STUDENT_ACTIVITIES.length;
    const verified = BACKEND_STUDENT_ACTIVITIES.filter((a) => a.verifiedByStaff).length;
    const pending = total - verified;
    const totalHours = BACKEND_STUDENT_ACTIVITIES.reduce((sum, a) => sum + (a.hoursSpent || 0), 0);
    const quizAttempts = BACKEND_STUDENT_ACTIVITIES.filter((a) => a.category === 'Interactive Quiz').length;

    // Group activities count by student
    const studentCounts: Record<string, { count: number; name: string; hours: number }> = {};
    for (const a of BACKEND_STUDENT_ACTIVITIES) {
      if (!studentCounts[a.studentId]) {
        studentCounts[a.studentId] = { count: 0, name: a.studentName, hours: 0 };
      }
      studentCounts[a.studentId].count += 1;
      studentCounts[a.studentId].hours += a.hoursSpent || 0;
    }

    res.json({
      success: true,
      totalActivities: total,
      verifiedActivities: verified,
      pendingVerification: pending,
      totalHoursLogged: totalHours,
      quizAttemptsCount: quizAttempts,
      studentEngagementRoster: studentCounts,
      recentFeed: BACKEND_STUDENT_ACTIVITIES.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch engagement summary' });
  }
});

// --- STRUCTURED GROWTH ROADMAP BACKEND STORE ---
export interface GrowthMilestone {
  id: string;
  phaseId: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  phaseTitle: string;
  category: 'Subject Revision' | 'Coding Practice' | 'Aptitude Drill' | 'Mock Interview' | 'Capstone Project' | 'Certification' | 'Lab Mastery' | 'Backlog Remediation';
  title: string;
  deadline: string;
  estimatedHours: number;
  completed: boolean;
  completedAt?: string;
  resourceLink: string;
  learningOutcome?: string;
  verifiedByMentor?: boolean;
}

export interface StudentGrowthRoadmap {
  studentId: string;
  studentName: string;
  department: string;
  mentorName: string;
  targetDomain: string;
  currentPhase: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
  mentorEndorsementNotes?: string;
  mentorEndorsedAt?: string;
  phases: {
    id: 'phase-1' | 'phase-2' | 'phase-3' | 'phase-4';
    title: string;
    weeksRange: string;
    focusDescription: string;
    status: 'Completed' | 'In Progress' | 'Upcoming';
  }[];
  milestones: GrowthMilestone[];
}

const BACKEND_GROWTH_ROADMAPS: Record<string, StudentGrowthRoadmap> = {
  'ENX-2024-101': {
    studentId: 'ENX-2024-101',
    studentName: 'Aarav Sharma',
    department: 'Electronics & Comm (ECE)',
    mentorName: 'Dr. Ramesh Sundaram',
    targetDomain: 'Embedded Systems & IoT',
    currentPhase: 'phase-2',
    mentorEndorsementNotes: 'Aarav has shown solid progress in hardware diagnostics. Focus next on RTOS task synchronization and attendance stability.',
    mentorEndorsedAt: new Date().toISOString(),
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Academic Foundation & Remediation',
        weeksRange: 'Weeks 1 - 4',
        focusDescription: 'Clear fundamental circuit prerequisites, recover attendance above statutory 75%, and submit pending lab reports.',
        status: 'Completed',
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Core Engineering & Lab Competency',
        weeksRange: 'Weeks 5 - 8',
        focusDescription: 'Master ARM Cortex-M architecture, configure FreeRTOS tasks with mutexes, and simulate DSP IIR filters.',
        status: 'In Progress',
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Industry Skills & Certifications',
        weeksRange: 'Weeks 9 - 12',
        focusDescription: 'Complete ARM Microcontroller / Embedded C certification and practice timed quantitative aptitude drills.',
        status: 'Upcoming',
      },
      {
        id: 'phase-4',
        title: 'Phase 4: Capstone, Placement & Career Launch',
        weeksRange: 'Weeks 13 - 16',
        focusDescription: 'Publish firmware codebase on GitHub, complete 1-on-1 technical mock interview, and finalize placement portfolio.',
        status: 'Upcoming',
      },
    ],
    milestones: [
      {
        id: 'm1-1',
        phaseId: 'phase-1',
        phaseTitle: 'Phase 1: Academic Foundation',
        category: 'Subject Revision',
        title: 'Review Core Fundamentals in ECE: Kirchoff Laws & Semiconductor Physics',
        deadline: 'Week 1 · Friday',
        estimatedHours: 4,
        completed: true,
        completedAt: '2026-09-08',
        resourceLink: 'ECE Faculty Revision Notes & Solved Problem Sets',
        learningOutcome: 'Reinforced baseline network theorem proofs and diode equation derivations.',
      },
      {
        id: 'm1-2',
        phaseId: 'phase-1',
        phaseTitle: 'Phase 1: Academic Foundation',
        category: 'Lab Mastery',
        title: 'Attendance Recovery: Attend all remedial lab hours (Target ≥ 75%)',
        deadline: 'Week 2 · Monday',
        estimatedHours: 6,
        completed: true,
        completedAt: '2026-09-15',
        resourceLink: 'Department Remedial Clinic Attendance Log',
        learningOutcome: 'Stabilized attendance and cleared pending DSP lab oscilloscope exercises.',
      },
      {
        id: 'm2-1',
        phaseId: 'phase-2',
        phaseTitle: 'Phase 2: Core Engineering',
        category: 'Coding Practice',
        title: 'Implement FreeRTOS Task Scheduling & Mutex Synchronization on STM32',
        deadline: 'Week 5 · Wednesday',
        estimatedHours: 8,
        completed: true,
        completedAt: '2026-09-28',
        resourceLink: 'Embedded Systems Laboratory Exercise 4',
        learningOutcome: 'Prevented priority inversion using binary semaphore and recursive mutex locks.',
      },
      {
        id: 'm2-2',
        phaseId: 'phase-2',
        phaseTitle: 'Phase 2: Core Engineering',
        category: 'Subject Revision',
        title: 'DSP Bilinear Transformation & 4th-Order Butterworth Filter Design',
        deadline: 'Week 7 · Friday',
        estimatedHours: 6,
        completed: false,
        resourceLink: 'Digital Signal Processing Syllabus Chapter 5',
        learningOutcome: 'Calculate pole-zero placements and compute frequency warping coefficients.',
      },
      {
        id: 'm3-1',
        phaseId: 'phase-3',
        phaseTitle: 'Phase 3: Industry Skills',
        category: 'Aptitude Drill',
        title: 'Quantitative & Logical Reasoning Speed Test (Speed target: 60 sec/question)',
        deadline: 'Week 10 · Sunday',
        estimatedHours: 4,
        completed: false,
        resourceLink: 'Campus Placement Portal Aptitude Sprint 3',
        learningOutcome: 'Achieve ≥ 80% accuracy on permutations, probability, and data interpretation.',
      },
      {
        id: 'm3-2',
        phaseId: 'phase-3',
        phaseTitle: 'Phase 3: Industry Skills',
        category: 'Certification',
        title: 'Complete Module 3 Assessment for ARM University Program Certification',
        deadline: 'Week 12 · Tuesday',
        estimatedHours: 6,
        completed: false,
        resourceLink: 'Accredited Online Embedded Systems Coursework',
        learningOutcome: 'Demonstrate peripheral driver design and linker script section layout.',
      },
      {
        id: 'm4-1',
        phaseId: 'phase-4',
        phaseTitle: 'Phase 4: Placement & Career Launch',
        category: 'Capstone Project',
        title: 'GitHub Milestone: Smart Energy Meter IoT Node with MQTT & AES Encryption',
        deadline: 'Week 14 · Saturday',
        estimatedHours: 12,
        completed: false,
        resourceLink: 'Engineering Capstone Specification Sheet',
        learningOutcome: 'Production-ready firmware deployment with power budgeting documentation.',
      },
      {
        id: 'm4-2',
        phaseId: 'phase-4',
        phaseTitle: 'Phase 4: Placement & Career Launch',
        category: 'Mock Interview',
        title: '1-on-1 Faculty Mock Technical Screening with Dr. Ramesh Sundaram',
        deadline: 'Week 16 · Thursday',
        estimatedHours: 2,
        completed: false,
        resourceLink: 'Department Mock Interview Lab Booking',
        learningOutcome: 'Master whiteboarding of embedded firmware state machines and latency analysis.',
      },
    ],
  },
};

// Helper: Ensure a student has a tailored 4-phase growth roadmap
function getOrCreateStudentRoadmap(studentId: string): StudentGrowthRoadmap {
  if (BACKEND_GROWTH_ROADMAPS[studentId]) {
    return BACKEND_GROWTH_ROADMAPS[studentId];
  }

  const student = BACKEND_STUDENTS_DATABASE.find((s) => s.id === studentId) as any;
  const name = student?.name || 'Student';
  const dept = student?.department || 'Computer Science (CSE)';
  const mentor = student?.mentorName || 'Faculty Advisor';
  const domain = student?.preferredDomain || student?.placement?.preferredDomain || 'Software Engineering & Cloud';

  const isHighRisk = String(student?.riskLevel || '').includes('High');
  const hasBacklogs = (student?.backlogs || student?.academic?.backlogsCount || 0) > 0;

  const roadmap: StudentGrowthRoadmap = {
    studentId,
    studentName: name,
    department: dept,
    mentorName: mentor,
    targetDomain: domain,
    currentPhase: isHighRisk ? 'phase-1' : 'phase-2',
    mentorEndorsementNotes: `Personalized growth roadmap initialized for ${name}. Focus on structured milestone progression and weekly mentorship check-ins.`,
    phases: [
      {
        id: 'phase-1',
        title: 'Phase 1: Academic Foundation & Remediation',
        weeksRange: 'Weeks 1 - 4',
        focusDescription: hasBacklogs
          ? 'Remedial coursework clinics, clearing pending backlogs, and securing ≥ 75% attendance.'
          : 'Consolidating prerequisite theoretical foundations and 100% LMS assignment submission.',
        status: isHighRisk ? 'In Progress' : 'Completed',
      },
      {
        id: 'phase-2',
        title: 'Phase 2: Core Engineering & Lab Competency',
        weeksRange: 'Weeks 5 - 8',
        focusDescription: 'Branch core subjects, laboratory experiments, numerical problem sets, and mid-term exam review.',
        status: isHighRisk ? 'Upcoming' : 'In Progress',
      },
      {
        id: 'phase-3',
        title: 'Phase 3: Industry Skills & Certifications',
        weeksRange: 'Weeks 9 - 12',
        focusDescription: 'Industry credentials, domain algorithms/coding sprints, and speed aptitude conditioning.',
        status: 'Upcoming',
      },
      {
        id: 'phase-4',
        title: 'Phase 4: Capstone, Placement & Career Launch',
        weeksRange: 'Weeks 13 - 16',
        focusDescription: 'GitHub capstone repository release, technical mock interview simulations, and resume finalization.',
        status: 'Upcoming',
      },
    ],
    milestones: [
      {
        id: `m-${studentId}-1`,
        phaseId: 'phase-1',
        phaseTitle: 'Phase 1: Academic Foundation',
        category: 'Subject Revision',
        title: `Core Prerequisite Theory Review in ${dept.split(' ')[0]} Foundations`,
        deadline: 'Week 2 · Friday',
        estimatedHours: 6,
        completed: !isHighRisk,
        completedAt: !isHighRisk ? '2026-09-12' : undefined,
        resourceLink: 'Department LMS Revision Portal & Solved Question Papers',
        learningOutcome: 'Strengthen fundamental principles and resolve conceptual doubt areas.',
      },
      {
        id: `m-${studentId}-2`,
        phaseId: 'phase-1',
        phaseTitle: 'Phase 1: Academic Foundation',
        category: 'Lab Mastery',
        title: 'Lab & Attendance Compliance: Maintain continuous ≥ 75% presence',
        deadline: 'Week 4 · Monday',
        estimatedHours: 5,
        completed: ((typeof student?.attendance === 'number' ? student?.attendance : student?.attendance?.overallPercentage) || 0) >= 75,
        completedAt: ((typeof student?.attendance === 'number' ? student?.attendance : student?.attendance?.overallPercentage) || 0) >= 75 ? '2026-09-20' : undefined,
        resourceLink: 'Institutional Biometric & LMS Attendance Dashboard',
        learningOutcome: 'Satisfy statutory attendance eligibility for semester university examinations.',
      },
      {
        id: `m-${studentId}-3`,
        phaseId: 'phase-2',
        phaseTitle: 'Phase 2: Core Engineering',
        category: 'Coding Practice',
        title: `Solve 15 Target Problems in ${domain.includes('Embedded') ? 'Embedded C & RTOS' : 'Data Structures & Algorithms'}`,
        deadline: 'Week 6 · Wednesday',
        estimatedHours: 10,
        completed: (student?.codingScore || student?.placement?.codingScore || 0) > 75,
        completedAt: (student?.codingScore || student?.placement?.codingScore || 0) > 75 ? '2026-09-29' : undefined,
        resourceLink: 'Campus Placement Algorithm Practice Track',
        learningOutcome: 'Improve algorithmic time-space complexity optimization under timed conditions.',
      },
      {
        id: `m-${studentId}-4`,
        phaseId: 'phase-2',
        phaseTitle: 'Phase 2: Core Engineering',
        category: 'Subject Revision',
        title: `Mid-Semester Core Subject Deep Dive for ${dept}`,
        deadline: 'Week 8 · Friday',
        estimatedHours: 8,
        completed: false,
        resourceLink: 'University Department Lecture Notes & Problem Sets',
        learningOutcome: 'Target score ≥ 85% in continuous internal evaluation assessments.',
      },
      {
        id: `m-${studentId}-5`,
        phaseId: 'phase-3',
        phaseTitle: 'Phase 3: Industry Skills',
        category: 'Aptitude Drill',
        title: 'Quantitative & Logical Reasoning Timed Speed Sprint',
        deadline: 'Week 10 · Sunday',
        estimatedHours: 4,
        completed: (student?.aptitudeScore || student?.placement?.aptitudeScore || 75) > 80,
        completedAt: (student?.aptitudeScore || student?.placement?.aptitudeScore || 75) > 80 ? '2026-10-02' : undefined,
        resourceLink: 'Campus Placement Portal Aptitude Sprint',
        learningOutcome: 'Achieve speed target of < 60 seconds per quantitative aptitude question.',
      },
      {
        id: `m-${studentId}-6`,
        phaseId: 'phase-3',
        phaseTitle: 'Phase 3: Industry Skills',
        category: 'Certification',
        title: `Complete Recognized Industry Certification in ${domain}`,
        deadline: 'Week 12 · Tuesday',
        estimatedHours: 12,
        completed: false,
        resourceLink: 'Accredited NPTEL / Coursera / AWS Certification Pathway',
        learningOutcome: 'Validate industry competency with verified certificate credentials.',
      },
      {
        id: `m-${studentId}-7`,
        phaseId: 'phase-4',
        phaseTitle: 'Phase 4: Placement & Career Launch',
        category: 'Capstone Project',
        title: `GitHub Push: Milestone 2 & Technical Readme for ${domain} Project`,
        deadline: 'Week 14 · Saturday',
        estimatedHours: 14,
        completed: false,
        resourceLink: 'Engineering Capstone Specification & GitHub Repository',
        learningOutcome: 'Publish well-architected project repository with test coverage and CI/CD.',
      },
      {
        id: `m-${studentId}-8`,
        phaseId: 'phase-4',
        phaseTitle: 'Phase 4: Placement & Career Launch',
        category: 'Mock Interview',
        title: `Comprehensive 1-on-1 Technical Mock Screening with ${mentor}`,
        deadline: 'Week 16 · Thursday',
        estimatedHours: 3,
        completed: false,
        resourceLink: 'Department Career & Placement Mock Interview Slot',
        learningOutcome: 'Receive actionable faculty feedback on resume walkthrough and problem solving.',
      },
    ],
  };

  BACKEND_GROWTH_ROADMAPS[studentId] = roadmap;
  return roadmap;
}

// --- GROWTH ROADMAP API ENDPOINTS ---
// GET /api/growth-roadmap/:studentId
app.get('/api/growth-roadmap/:studentId', (req, res) => {
  try {
    const { studentId } = req.params;
    const roadmap = getOrCreateStudentRoadmap(studentId);

    const total = roadmap.milestones.length;
    const completed = roadmap.milestones.filter((m) => m.completed).length;
    const progressPct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const totalHours = roadmap.milestones.reduce((acc, m) => acc + (m.estimatedHours || 0), 0);
    const completedHours = roadmap.milestones
      .filter((m) => m.completed)
      .reduce((acc, m) => acc + (m.estimatedHours || 0), 0);

    res.json({
      success: true,
      roadmap,
      stats: {
        totalMilestones: total,
        completedMilestones: completed,
        progressPct,
        totalHours,
        completedHours,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch growth roadmap' });
  }
});

// POST /api/growth-roadmap/:studentId/milestone/:milestoneId/toggle
app.post('/api/growth-roadmap/:studentId/milestone/:milestoneId/toggle', (req, res) => {
  try {
    const { studentId, milestoneId } = req.params;
    const roadmap = getOrCreateStudentRoadmap(studentId);

    const milestone = roadmap.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      return res.status(404).json({ error: `Milestone ${milestoneId} not found` });
    }

    milestone.completed = !milestone.completed;
    milestone.completedAt = milestone.completed ? new Date().toISOString().split('T')[0] : undefined;

    // Check if phase is completed
    for (const phase of roadmap.phases) {
      const phaseMilestones = roadmap.milestones.filter((m) => m.phaseId === phase.id);
      if (phaseMilestones.length > 0 && phaseMilestones.every((m) => m.completed)) {
        phase.status = 'Completed';
      } else if (phaseMilestones.some((m) => m.completed)) {
        phase.status = 'In Progress';
      } else {
        phase.status = 'Upcoming';
      }
    }

    // Also register activity in BACKEND_STUDENT_ACTIVITIES so staff can review
    if (milestone.completed) {
      const actId = `ACT-GM-${Date.now().toString().slice(-4)}`;
      BACKEND_STUDENT_ACTIVITIES.unshift({
        id: actId,
        studentId: roadmap.studentId,
        studentName: roadmap.studentName,
        department: roadmap.department as any,
        title: `Roadmap Milestone: ${milestone.title}`,
        category: milestone.category === 'Coding Practice' ? 'Skill & Certification' : 'Academic Booster',
        description: `Completed milestone under ${milestone.phaseTitle}. Estimated study: ${milestone.estimatedHours} hrs.`,
        status: 'Completed',
        progressPct: 100,
        hoursSpent: milestone.estimatedHours,
        dateLogged: new Date().toISOString().split('T')[0],
        dateCompleted: new Date().toISOString().split('T')[0],
        learningOutcomes: milestone.learningOutcome || 'Mastered prescribed growth roadmap objective.',
        semesterSubject: roadmap.department.split(' ')[0],
        mentorName: roadmap.mentorName,
        verifiedByStaff: false,
      });
    }

    res.json({
      success: true,
      milestone,
      roadmap,
      message: `Milestone '${milestone.title}' status updated to ${milestone.completed ? 'Completed' : 'Pending'}.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to toggle milestone' });
  }
});

// POST /api/growth-roadmap/:studentId/custom-milestone
app.post('/api/growth-roadmap/:studentId/custom-milestone', (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, phaseId, category, estimatedHours, deadline, resourceLink, learningOutcome } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Milestone title is required' });
    }

    const roadmap = getOrCreateStudentRoadmap(studentId);
    const validPhaseId = phaseId || 'phase-2';
    const targetPhase = roadmap.phases.find((p) => p.id === validPhaseId) || roadmap.phases[1];

    const newMilestone: GrowthMilestone = {
      id: `m-cust-${Date.now()}`,
      phaseId: targetPhase.id,
      phaseTitle: targetPhase.title,
      category: category || 'Subject Revision',
      title: title.trim(),
      deadline: deadline || 'Next 2 Weeks',
      estimatedHours: parseInt(estimatedHours) || 4,
      completed: false,
      resourceLink: resourceLink || 'Course syllabus & recommended reading',
      learningOutcome: learningOutcome || 'Individualized academic improvement milestone.',
    };

    roadmap.milestones.push(newMilestone);

    res.status(201).json({
      success: true,
      milestone: newMilestone,
      roadmap,
      message: 'Custom growth milestone added to student roadmap in backend database.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add custom milestone' });
  }
});

// POST /api/growth-roadmap/:studentId/mentor-endorsement
app.post('/api/growth-roadmap/:studentId/mentor-endorsement', (req, res) => {
  try {
    const { studentId } = req.params;
    const { notes, mentorName } = req.body;

    const roadmap = getOrCreateStudentRoadmap(studentId);
    roadmap.mentorEndorsementNotes = notes || 'Progress verified by faculty advisor.';
    roadmap.mentorEndorsedAt = new Date().toISOString();
    if (mentorName) {
      roadmap.mentorName = mentorName;
    }

    res.json({
      success: true,
      roadmap,
      message: 'Faculty mentor endorsement recorded in backend database.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to endorse roadmap' });
  }
});

// --- BACKEND KNOWLEDGE MODULES & ACTIVITIES REPOSITORY ---
export interface BackendKnowledgeQuiz {
  id: string;
  department: string;
  subject: string;
  difficulty: 'Fundamental' | 'Intermediate' | 'Advanced';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  points: number;
}

export interface BackendFlashcard {
  id: string;
  department: string;
  subject: string;
  term: string;
  definition: string;
  formulaOrSyntax?: string;
  realWorldApplication: string;
}

export interface BackendKnowledgeChallenge {
  id: string;
  department: string;
  subject: string;
  title: string;
  scenario: string;
  tasks: string[];
  deliverable: string;
  xpReward: number;
}

const BACKEND_KNOWLEDGE_MODULES = {
  quizzes: [
    {
      id: 'qz-dsa-1',
      department: 'Computer Science (CSE)',
      subject: 'Data Structures & Algorithms',
      difficulty: 'Intermediate',
      question: 'What is the tight worst-case time complexity of finding the shortest path in a weighted DAG with V vertices and E edges?',
      options: ['O(V + E)', 'O(E log V)', 'O(V^2)', 'O(V * E)'],
      correctIndex: 0,
      explanation: 'In a Directed Acyclic Graph (DAG), topological sorting can be performed in O(V + E) time, after which single-source shortest paths can be relaxed in linear topological order in O(V + E) time.',
      points: 15,
    },
    {
      id: 'qz-dsa-2',
      department: 'Computer Science (CSE)',
      subject: 'Database Systems',
      difficulty: 'Advanced',
      question: 'Under Multi-Version Concurrency Control (MVCC) in PostgreSQL, which statement is TRUE regarding uncommitted transactions?',
      options: [
        'Concurrent transactions never block readers on SELECT statements',
        'Transactions acquire exclusive table-level locks for all row updates',
        'Deadlocks are mathematically impossible in MVCC',
        'Rollback physically deletes old row tuples immediately',
      ],
      correctIndex: 0,
      explanation: 'MVCC allows readers to never block writers, and writers never block readers. SELECT statements read a snapshot of data committed prior to query start.',
      points: 20,
    },
    {
      id: 'qz-ece-1',
      department: 'Electronics & Comm (ECE)',
      subject: 'Embedded Systems & IoT',
      difficulty: 'Intermediate',
      question: 'Which synchronization primitive must be utilized in FreeRTOS to prevent unbounded Priority Inversion between high and low priority tasks?',
      options: ['Binary Semaphore', 'Counting Semaphore', 'Mutex with Priority Inheritance', 'Volatile Flag'],
      correctIndex: 2,
      explanation: 'Priority Inheritance elevates the low-priority task holding the mutex to the priority level of the waiting high-priority task, preventing intermediate tasks from preemption.',
      points: 15,
    },
    {
      id: 'qz-ece-2',
      department: 'Electronics & Comm (ECE)',
      subject: 'Digital Signal Processing',
      difficulty: 'Advanced',
      question: 'Why is the Bilinear Transformation preferred over Impulse Invariance when designing digital high-pass and band-stop filters?',
      options: [
        'It eliminates aliasing by mapping the entire j-omega axis to the unit circle',
        'It produces linear phase characteristics automatically',
        'It requires no pre-warping of analog critical frequencies',
        'It converts IIR filters directly into FIR structures',
      ],
      correctIndex: 0,
      explanation: 'Bilinear transformation uses conformal mapping that uniquely maps the entire imaginary axis of the s-plane into one revolution of the unit circle in the z-plane, completely avoiding aliasing.',
      points: 20,
    },
    {
      id: 'qz-it-1',
      department: 'Information Tech (IT)',
      subject: 'Cloud & Networks',
      difficulty: 'Intermediate',
      question: 'During a TCP 3-way handshake, if the server receives a SYN packet, what flags are set in its initial response packet?',
      options: ['ACK only', 'SYN + ACK', 'FIN + ACK', 'RST + ACK'],
      correctIndex: 1,
      explanation: 'The server responds with SYN + ACK, confirming receipt of the client initial sequence number and specifying its own server sequence number.',
      points: 15,
    },
    {
      id: 'qz-eee-1',
      department: 'Electrical & Electronics (EEE)',
      subject: 'Power Systems',
      difficulty: 'Intermediate',
      question: 'Why are High Voltage Direct Current (HVDC) transmission lines preferred over HVAC for long-distance submarine cable interconnections?',
      options: [
        'DC has no continuous capacitive charging reactive current and no skin effect',
        'Transformers can directly step up DC voltages without converters',
        'DC circuit breakers are significantly cheaper than AC circuit breakers',
        'HVDC lines require fewer substation conversion stations',
      ],
      correctIndex: 0,
      explanation: 'Cables have high capacitance. In AC cables, reactive charging currents limit transmission distance to ~50 km. DC cables eliminate charging currents and skin effect, enabling unlimited distances.',
      points: 20,
    },
    {
      id: 'qz-mech-1',
      department: 'Mechanical Eng (MECH)',
      subject: 'Mechatronics & Robotics',
      difficulty: 'Intermediate',
      question: 'In robotic kinematics, which mathematical formulation maps joint velocity vectors to end-effector Cartesian velocities?',
      options: ['Jacobian Matrix', 'Inertia Tensor', 'Mohr Circle Transformation', 'Hooke Elasticity Tensor'],
      correctIndex: 0,
      explanation: 'The Jacobian matrix J(q) relates the joint rates (velocities) to the linear and angular velocities of the robotic manipulator end-effector in Cartesian task space.',
      points: 20,
    },
  ],
  flashcards: [
    {
      id: 'fc-1',
      department: 'Computer Science (CSE)',
      subject: 'Algorithms',
      term: 'B+ Tree Indexing',
      definition: 'A self-balancing search tree data structure where all actual data records or pointers reside strictly in the leaf nodes, which are linked in a sequential doubly-linked list for lightning-fast range queries.',
      formulaOrSyntax: 'Fan-out B = Block Size / (Key Size + Pointer Size)',
      realWorldApplication: 'PostgreSQL and MySQL InnoDB primary and secondary B-Tree indexing engines.',
    },
    {
      id: 'fc-2',
      department: 'Computer Science (CSE)',
      subject: 'Operating Systems',
      term: 'Page Replacement & Belady Anomaly',
      definition: 'Belady’s Anomaly is the counter-intuitive phenomenon where increasing the number of physical page frames allocated to a process results in MORE page faults when using First-In-First-Out (FIFO) replacement.',
      formulaOrSyntax: 'Optimal Strategy: Replace page referenced furthest in future (OPT / MIN algorithm)',
      realWorldApplication: 'Modern OS kernels use Clock / LRU approximations instead of naive FIFO to guarantee anomaly immunity.',
    },
    {
      id: 'fc-3',
      department: 'Electronics & Comm (ECE)',
      subject: 'Embedded Systems',
      term: 'Nested Vectored Interrupt Controller (NVIC)',
      definition: 'The hardware sub-system inside ARM Cortex-M processors responsible for ultra-low latency interrupt handling, deterministic priority preemption, and automatic register state saving (hardware stacking).',
      formulaOrSyntax: 'Latency: ~12 clock cycles for interrupt entry with tail-chaining in 6 cycles.',
      realWorldApplication: 'Autonomous drone motor ESC pulse width modulation (PWM) control and medical ventilator sensor sampling.',
    },
    {
      id: 'fc-4',
      department: 'Electronics & Comm (ECE)',
      subject: 'Signals & Communication',
      term: 'Nyquist-Shannon Sampling Theorem',
      definition: 'A continuous-time bandlimited signal can be perfectly reconstructed from its discrete samples if and only if the sampling frequency fs is strictly greater than twice the highest signal frequency component (2 * fmax).',
      formulaOrSyntax: 'fs > 2 * fmax (Nyquist Rate)',
      realWorldApplication: 'Standard audio CD sampling at 44.1 kHz to faithfully reproduce human audible range up to 20 kHz.',
    },
    {
      id: 'fc-5',
      department: 'Mechanical Eng (MECH)',
      subject: 'Thermodynamics & Heat Transfer',
      term: 'Second Law of Thermodynamics (Clausius & Kelvin-Planck)',
      definition: 'It is impossible for any device that operates on a cycle to receive heat from a single reservoir and produce a net amount of work without rejecting heat to a low-temperature sink.',
      formulaOrSyntax: 'Thermal Efficiency η_max = 1 - (T_cold / T_hot)',
      realWorldApplication: 'Carnot limit bounding the maximum theoretical efficiency of automotive engines and steam power plants.',
    },
    {
      id: 'fc-6',
      department: 'Electrical & Electronics (EEE)',
      subject: 'Power Electronics',
      term: 'Pulse Width Modulation (PWM) Inverters',
      definition: 'A technique of switching power semiconductor transistors (IGBTs or MOSFETs) at high carrier frequency to synthesize sinusoidal AC waveforms with minimal harmonic distortion from a DC bus.',
      formulaOrSyntax: 'Modulation Index m = V_control_peak / V_carrier_peak',
      realWorldApplication: 'Electric vehicle traction inverters (Tesla, Tata EV) and solar grid-tie micro-inverters.',
    },
  ],
  challenges: [
    {
      id: 'ch-1',
      department: 'Computer Science (CSE)',
      subject: 'Algorithms & Backend',
      title: 'Database Query Latency Optimization Challenge',
      scenario: 'A student enrollment query with nested loop joins over 50,000 records takes 3,420 ms. Optimize the query plan using EXPLAIN ANALYZE and compound indexing.',
      tasks: [
        'Identify sequential table scans on the foreign key column (student_id)',
        'Synthesize CREATE INDEX idx_student_enrollments ON enrollments(student_id, semester)',
        'Verify query execution plan converts from Seq Scan to Index Scan',
      ],
      deliverable: 'PostgreSQL compound index definition and cost reduction factor benchmark.',
      xpReward: 50,
    },
    {
      id: 'ch-2',
      department: 'Electronics & Comm (ECE)',
      subject: 'Embedded Systems',
      title: 'FreeRTOS Deadlock & Priority Inversion Debugging',
      scenario: 'An autonomous robot locks up intermittently when high-priority telemetry and low-priority sensor logging contend for an I2C bus resource.',
      tasks: [
        'Replace binary semaphore with xSemaphoreCreateMutex()',
        'Enable priority inheritance in FreeRTOSConfig.h (configUSE_MUTEXES = 1)',
        'Verify bounded execution time on telemetry interrupt callbacks',
      ],
      deliverable: 'FreeRTOS mutex task lock/unlock code block with timeout handling.',
      xpReward: 60,
    },
  ],
};

// GET /api/student-engagement/knowledge-modules
app.get('/api/student-engagement/knowledge-modules', (req, res) => {
  try {
    const { department, type } = req.query;
    let quizzes = BACKEND_KNOWLEDGE_MODULES.quizzes;
    let flashcards = BACKEND_KNOWLEDGE_MODULES.flashcards;
    let challenges = BACKEND_KNOWLEDGE_MODULES.challenges;

    if (department && department !== 'All') {
      const deptStr = String(department).toLowerCase();
      quizzes = quizzes.filter((q) => q.department.toLowerCase().includes(deptStr));
      flashcards = flashcards.filter((f) => f.department.toLowerCase().includes(deptStr));
      challenges = challenges.filter((c) => c.department.toLowerCase().includes(deptStr));
    }

    res.json({
      success: true,
      quizzes,
      flashcards,
      challenges,
      totalCount: quizzes.length + flashcards.length + challenges.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch knowledge modules' });
  }
});

// POST /api/student-engagement/submit-challenge
app.post('/api/student-engagement/submit-challenge', (req, res) => {
  try {
    const { studentId, studentName, department, challengeId, solutionNotes, hoursSpent } = req.body;

    if (!studentId || !challengeId) {
      return res.status(400).json({ error: 'studentId and challengeId are required' });
    }

    const challenge = BACKEND_KNOWLEDGE_MODULES.challenges.find((c) => c.id === challengeId);
    const title = challenge ? challenge.title : 'Technical Knowledge Challenge';
    const xp = challenge ? challenge.xpReward : 50;

    const actId = `ACT-CH-${Date.now().toString().slice(-4)}`;
    const newActivity: BackendStudentActivity = {
      id: actId,
      studentId,
      studentName: studentName || 'Student',
      department: department || 'Engineering',
      title: `Hands-on Challenge: ${title}`,
      category: 'Hands-on Project',
      description: `Completed engineering challenge: "${title}". Notes: ${String(solutionNotes || 'Completed prescribed architecture tasks').slice(0, 120)}.`,
      status: 'Completed',
      progressPct: 100,
      hoursSpent: parseFloat(hoursSpent) || 3.0,
      dateLogged: new Date().toISOString().split('T')[0],
      dateCompleted: new Date().toISOString().split('T')[0],
      verifiedByStaff: true,
      staffFeedback: `Challenge verified (+${xp} XP). Demonstrated sound analytical problem solving and technical implementation.`,
      verifiedByStaffName: 'Faculty Evaluator',
      verifiedAt: new Date().toISOString(),
      learningOutcomes: challenge ? challenge.deliverable : 'Practical engineering implementation & problem solving.',
      semesterSubject: challenge ? challenge.subject : 'Core Engineering',
      score: xp,
    };

    BACKEND_STUDENT_ACTIVITIES.unshift(newActivity);

    // Update student points in backend database
    const student = BACKEND_STUDENTS_DATABASE.find((s) => s.id === studentId);
    if (student) {
      (student as any).points = ((student as any).points || 0) + xp;
    }

    res.status(201).json({
      success: true,
      activity: newActivity,
      xpEarned: xp,
      message: `Challenge '${title}' completed and logged to backend database for staff review!`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit challenge' });
  }
});

// POST /api/student-engagement/flashcard-mastery
const BACKEND_FLASHCARD_MASTERY: Record<string, string[]> = {};
app.post('/api/student-engagement/flashcard-mastery', (req, res) => {
  try {
    const { studentId, flashcardId, mastered } = req.body;
    if (!studentId || !flashcardId) {
      return res.status(400).json({ error: 'studentId and flashcardId are required' });
    }

    if (!BACKEND_FLASHCARD_MASTERY[studentId]) {
      BACKEND_FLASHCARD_MASTERY[studentId] = [];
    }

    const currentList = BACKEND_FLASHCARD_MASTERY[studentId];
    if (mastered) {
      if (!currentList.includes(flashcardId)) {
        currentList.push(flashcardId);
      }
    } else {
      BACKEND_FLASHCARD_MASTERY[studentId] = currentList.filter((id) => id !== flashcardId);
    }

    res.json({
      success: true,
      masteredCardsCount: BACKEND_FLASHCARD_MASTERY[studentId].length,
      masteredCardIds: BACKEND_FLASHCARD_MASTERY[studentId],
      message: mastered ? 'Concept card marked as Mastered in backend.' : 'Card marked for Review.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update flashcard mastery' });
  }
});

// GET /api/student-engagement/student/:studentId/knowledge-profile
app.get('/api/student-engagement/student/:studentId/knowledge-profile', (req, res) => {
  try {
    const { studentId } = req.params;
    const student = BACKEND_STUDENTS_DATABASE.find((s) => s.id === studentId);
    const studentActs = BACKEND_STUDENT_ACTIVITIES.filter((a) => a.studentId === studentId);
    const quizCount = studentActs.filter((a) => a.category === 'Interactive Quiz').length;
    const challengeCount = studentActs.filter((a) => a.title.startsWith('Hands-on Challenge')).length;
    const masteredCards = BACKEND_FLASHCARD_MASTERY[studentId] || [];

    res.json({
      success: true,
      studentId,
      studentName: student?.name || 'Student',
      department: student?.department || 'Engineering',
      quizAttempts: quizCount,
      challengesSolved: challengeCount,
      masteredFlashcardsCount: masteredCards.length,
      totalKnowledgeScore: (student as any)?.points || (quizCount * 15 + challengeCount * 50),
      masteredCardIds: masteredCards,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch knowledge profile' });
  }
});

// --- ENHANCED DOMAIN EVALUATION FOR GEMINI CHATBOT ---
// Checks if a query is explicitly non-academic / off-topic
function isExplicitlyOffTopicQuery(query: string): boolean {
  const text = query.toLowerCase().trim();

  // Explicit off-topic regex patterns & keywords
  const offTopicPatterns = [
    // Culinary / Cooking / Food recipes
    /\b(recipe|cook|cooking|bake|baking|pizza|burger|pasta|biryani|chicken curry|fried rice|pancake|sandwich|taco|soup|cake|dessert|cocktail|smoothie|ingredients|delicious|taste good|dinner ideas|lunch recipe|breakfast recipe|cook food|chef)\b/,
    // Entertainment / Movies / Celebrity gossip / Pop culture
    /\b(movie|film|cinema|actor|actress|hollywood|bollywood|tollywood|celebrity|gossip|box office|netflix|disney|tv show|series|episode|taylor swift|bieber|kanye|drake|rap music|singer|song lyrics|pop song|dance video)\b/,
    // Romance / Dating / Flirting / Personal relationships
    /\b(girlfriend|boyfriend|dating|marry me|will you marry|love you|crush on|kiss me|breakup|romance|flirt|dating advice|relationship advice|tinder|bumble|love letter)\b/,
    // Sports fan banter / live match discussions (non-academic)
    /\b(cricket score|ipl score|football score|who won the match|world cup match|messi or ronaldo|virat kohli|ms dhoni|premier league|nba score|uefa|fifa world cup|manchester united|barcelona score)\b/,
    // Casual jokes / memes / small talk / horoscope
    /\b(tell me a joke|funny joke|make me laugh|tell a joke|meme|funny meme|horoscope|astrology|zodiac sign|tarot|fortune teller)\b/,
    // Lifestyle / Fashion / Shopping / Beauty
    /\b(buy shoes|fashion dress|haircut|hairstyle|lipstick|makeup tutorial|skincare routine|nail polish|shopping discount|amazon coupon|best phone to buy|best sneakers)\b/,
    // Video games / gambling
    /\b(play pubg|pubg mobile|fortnite|gta 5|gta v|cheat codes|free fire game|video game cheat|casino|roulette|betting odds|gambling|lottery numbers)\b/,
    // Personal small talk about chatbot's private life
    /\b(are you single|do you have a boyfriend|do you have a girlfriend|what are you wearing|tell me a secret)\b/,
  ];

  for (const pattern of offTopicPatterns) {
    if (pattern.test(text)) {
      // Exception: If the query explicitly asks for computer science / physics / engineering aspect
      const engineeringContext = /\b(algorithm|complexity|simulation|physics of|fluid dynamics|sensor|code|circuit|database|model|math)\b/.test(text);
      if (!engineeringContext) {
        return true;
      }
    }
  }

  return false;
}

// Checks if a query is within academic, subject, engineering, or educational knowledge domain
function isSubjectOrAcademicOrKnowledgeQuery(query: string): boolean {
  if (isExplicitlyOffTopicQuery(query)) {
    return false;
  }

  const text = query.toLowerCase().trim();

  // Academic / subject / knowledge indicator keywords & concepts
  const academicKeywords = [
    // University Curriculum & Academics
    'subject', 'academic', 'study', 'exam', 'semester', 'course', 'curriculum',
    'syllabus', 'gpa', 'cgpa', 'backlog', 'internal', 'assignment', 'project',
    'attendance', 'lecture', 'lab', 'practical', 'faculty', 'mentor', 'advisor',
    'placement', 'interview', 'coding', 'aptitude', 'dsa', 'algorithm', 'data structure',
    'thesis', 'dissertation', 'viva', 'credits', 'engineering', 'university', 'college',
    'how to prepare', 'how to clear', 'remedial', 'timetable', 'revision',
    // Computer Science & IT
    'binary tree', 'graph', 'sorting', 'time complexity', 'space complexity', 'big o',
    'python', 'java', 'c++', 'c programming', 'javascript', 'typescript', 'sql',
    'database', 'postgresql', 'mysql', 'normalization', 'acid', 'operating system', 'process',
    'thread', 'deadlock', 'paging', 'virtual memory', 'computer network', 'tcp', 'ip',
    'osi model', 'udp', 'dns', 'http', 'compiler', 'lexer', 'parser', 'trie', 'hashmap',
    'dynamic programming', 'recursion', 'greedy algorithm', 'dijkstra', 'breadth first',
    'depth first', 'git', 'docker', 'cloud', 'aws', 'rest api', 'cybersecurity', 'cryptography',
    // Electronics & Electrical
    'electronics', 'circuit', 'ohm', 'kirchhoff', 'resistor', 'capacitor', 'inductor',
    'microcontroller', 'arm cortex', 'freertos', 'embedded', 'iot', 'sensors', 'adc', 'dac',
    'fpga', 'verilog', 'vhdl', 'vlsi', 'signal processing', 'dsp', 'fourier', 'laplace',
    'butterworth', 'filter', 'semiconductor', 'diode', 'transistor', 'bjt', 'mosfet',
    'op-amp', 'power system', 'transformer', 'motor', 'generator', 'inverter', 'hvdc',
    'three phase', 'transmission line', 'ac circuit', 'dc circuit', 'electromagnetic',
    // Mechanical & Civil & Materials
    'mechanical', 'thermodynamics', 'fluid mechanics', 'heat transfer', 'carnot', 'entropy',
    'strength of materials', 'stress', 'strain', 'cad', 'solidworks', 'finite element',
    'mechatronics', 'robotics', 'kinematics', 'jacobian', 'plc', 'actuator', 'hydraulics',
    'pneumatics', 'combustion', 'civil engineering', 'structural analysis', 'concrete',
    // Science, Mathematics & General Educational Knowledge
    'physics', 'newton', 'maxwell', 'quantum', 'optics', 'mechanics', 'relativity',
    'chemistry', 'periodic table', 'organic chemistry', 'reaction', 'mole', 'acid base',
    'math', 'mathematics', 'calculus', 'integration', 'derivative', 'differential equation',
    'linear algebra', 'eigenvalue', 'eigenvector', 'matrix', 'probability', 'statistics',
    'discrete math', 'combinatorics', 'machine learning', 'deep learning', 'neural network',
    'artificial intelligence', 'linear regression', 'svm', 'decision tree',
    // General Knowledge & Educational Inquiries
    'formula', 'theorem', 'definition', 'explain', 'derivation', 'derive',
    'what is', 'how does', 'why does', 'difference between', 'principles of',
    'gate exam', 'gre exam', 'cat exam', 'scientific discovery', 'world geography',
    'world history', 'solar system', 'astronomy', 'biology', 'photosynthesis', 'genetics'
  ];

  for (const kw of academicKeywords) {
    if (text.includes(kw)) {
      return true;
    }
  }

  // Question inquiries about educational facts/concepts
  if (
    text.startsWith('what is ') ||
    text.startsWith('what are ') ||
    text.startsWith('how does ') ||
    text.startsWith('why is ') ||
    text.startsWith('why do ') ||
    text.startsWith('explain ') ||
    text.startsWith('define ') ||
    text.startsWith('derive ') ||
    text.startsWith('can you explain ') ||
    text.startsWith('how can i learn ') ||
    text.startsWith('how to solve ')
  ) {
    return true;
  }

  // If none of the academic keywords matched and it did not start with standard academic inquiry
  return false;
}

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { messages, rolePersona, studentContext, modelName } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages history is required.' });
    }

    // 1. Sanitize & build strict alternating history for @google/genai
    const cleanList = messages
      .filter((m: any) => m && (m.content || m.text))
      .map((m: any) => ({
        role: (m.role === 'assistant' || m.role === 'model' ? 'model' : 'user') as 'model' | 'user',
        text: String(m.content || m.text || '').trim(),
      }))
      .filter((m: any) => m.text.length > 0);

    const firstUserIdx = cleanList.findIndex((m: any) => m.role === 'user');
    const validTurnList = firstUserIdx >= 0 ? cleanList.slice(firstUserIdx) : [];

    const contents: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];
    for (const turn of validTurnList) {
      if (contents.length > 0 && contents[contents.length - 1].role === turn.role) {
        contents[contents.length - 1].parts[0].text += '\n' + turn.text;
      } else {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }],
        });
      }
    }

    if (contents.length === 0) {
      const fallbackPrompt = messages[messages.length - 1]?.content || 'Hello, I have an academic question.';
      contents.push({
        role: 'user',
        parts: [{ text: String(fallbackPrompt) }],
      });
    }

    const latestUserTurn = [...cleanList].reverse().find((m) => m.role === 'user');
    const latestQuery = latestUserTurn ? latestUserTurn.text : '';

    // Fast-path rule check: if query is outside of academic, subject, or educational knowledge domain
    const isDomainPermitted = isSubjectOrAcademicOrKnowledgeQuery(latestQuery);
    if (!isDomainPermitted) {
      return res.json({
        reply: 'This question is out of academics/subject. Please ask questions related to your university subjects, academic curriculum, exams, or educational knowledge.',
        isOutOfDomain: true,
        modelUsed: 'domain-policy-guardrail',
        timestamp: new Date().toISOString(),
      });
    }

    const selectedModel = modelName || 'gemini-3.8-flash';

    let systemInstruction = `You are the EduNexus AI Academic, Science & Subject Knowledge Advisor for university engineering students and faculty.
Your answers must be pedagogical, accurate, structured, and STRICTLY limited to:
1. University Engineering & Science Subjects: Computer Science, Information Technology, Electronics & Communication, Electrical Engineering, Mechanical Engineering, Civil Engineering, Physics, Chemistry, Engineering Mathematics, Database Systems, Operating Systems, Computer Networks, Artificial Intelligence, Digital Signal Processing, Embedded Systems, Microcontrollers, Thermodynamics, etc.
2. Academics & Higher Education: Semester exams, syllabus questions, CGPA calculations, backlog clearance strategies, laboratory experiments, project work, technical placement preparation, coding algorithms (DSA), quantitative aptitude, and gate/gre exams.
3. Educational Knowledge & Science: Scientific laws, engineering principles, mathematical derivations, historical inventions, and factual general educational knowledge.

CRITICAL MANDATORY DOMAIN GUARDRAIL:
You must strictly assess if the user query is about university subjects, academics, or educational knowledge.
If the query is OUTSIDE of subjects, academics, or educational knowledge (for example: cooking recipes, food preparation, celebrity news or gossip, movies/actors, dating or romance, sports fan debates, casual small talk, video game cheats, shopping recommendations, or horoscopes), you MUST respond with EXACTLY and ONLY this message:
"This question is out of academics/subject. Please ask questions related to your university subjects, academic curriculum, exams, or educational knowledge."
DO NOT answer or entertain any off-topic questions under any circumstances.

When answering valid academic questions:
- Use clear markdown with headers, bullet points, and code/math equations where helpful.
- Provide actionable explanations with real engineering context.`;

    if (rolePersona === 'academic-remediation') {
      systemInstruction += `\nYour specialized persona: ACADEMIC REMEDIATION & BACKLOG STRATEGIST. Focus on subject prerequisites, fundamental concepts, revision study timetables, and exam scoring methods.`;
    } else if (rolePersona === 'placement-mentor') {
      systemInstruction += `\nYour specialized persona: PLACEMENT & TECHNICAL INTERVIEW MENTOR. Focus on coding algorithms (DSA), technical interview problems, system design, and industry portfolio alignment.`;
    } else if (rolePersona === 'wellbeing-coach') {
      systemInstruction += `\nYour specialized persona: STUDENT WELLBEING & MOTIVATION COUNSELOR. Focus on study habit coaching, handling semester exam pressure, and constructive daily routines.`;
    }

    if (studentContext) {
      systemInstruction += `\n\nACTIVE STUDENT CONTEXT:
- Name: ${studentContext.name} (${studentContext.id})
- Department: ${studentContext.department}, Semester: ${studentContext.semester}
- GPA: ${studentContext.academic?.gpa || studentContext.gpa} / 10.0, Backlogs: ${studentContext.academic?.backlogsCount ?? studentContext.backlogs ?? 0}
- Attendance: ${studentContext.attendance?.overallPercentage || studentContext.attendance}%
- Target Domain: ${studentContext.placement?.preferredDomain || studentContext.preferredDomain}
- Coding Rating: ${studentContext.placement?.codingScore || studentContext.codingScore}/100
- Technical Skills: ${(studentContext.skills?.primaryTechnologies || studentContext.primaryTechnologies || []).join(', ')}`;
    }

    const candidateModels = [selectedModel, 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    let replyText: string | null = null;
    let actualModel = selectedModel;
    let isOutOfDomain = false;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response.text && response.text.trim().length > 0) {
          replyText = response.text;
          actualModel = model;
          break;
        }
      } catch (err: any) {
        console.warn(`Chat model ${model} temporarily unavailable:`, err?.status || err?.message);
      }
    }

    // High quality pedagogical fallback if external Gemini endpoint is momentarily busy
    if (!replyText) {
      const qLower = latestQuery.toLowerCase();
      if (!isSubjectOrAcademicOrKnowledgeQuery(latestQuery)) {
        replyText = 'This question is out of academics/subject. Please ask questions related to your university subjects, academic curriculum, exams, or educational knowledge.';
        actualModel = 'edunexus-domain-guardrail';
        isOutOfDomain = true;
      } else if (qLower.includes('algorithm') || qLower.includes('dsa') || qLower.includes('tree') || qLower.includes('graph') || qLower.includes('sort') || qLower.includes('search')) {
        replyText = `### Core Subject Explanation: Data Structures & Algorithms\n\nWhen mastering algorithmic concepts in Computer Science:\n- **Time & Space Complexity**: Evaluate Big-O bounds for Best, Average, and Worst cases ($O(1)$, $O(\\log N)$, $O(N)$, $O(N \\log N)$, $O(N^2)$).\n- **Key Patterns**: Two-Pointers, Sliding Window, Fast & Slow Pointers, Depth-First Search (DFS), Breadth-First Search (BFS), and Dynamic Programming with memoization.\n- **Recommended Study Cadence**: Solve 2 problems daily on platforms like LeetCode or HackerRank, focusing on space-time efficiency and edge conditions.`;
        actualModel = 'edunexus-academic-engine (subject fallback)';
      } else if (qLower.includes('backlog') || qLower.includes('remediation') || qLower.includes('exam') || qLower.includes('study')) {
        replyText = `### Academic Recovery & Study Strategy for ${studentContext?.name || 'Student'}\n\n1. **Diagnostic Audit**: Group pending subject topics into High Weightage (Core 60% exam marks) vs Conceptual Prerequisites.\n2. **4-Week Milestone Plan**:\n   - **Week 1-2**: Attend remedial clinics and solve past 5 years question papers for core theories.\n   - **Week 3**: Complete internal laboratory exercises and numerical problem sets.\n   - **Week 4**: Take 2 timed mock exams under real conditions.\n3. **Attendance Guardrail**: Maintain classroom attendance above the statutory 75% threshold.`;
        actualModel = 'edunexus-academic-engine (academic fallback)';
      } else if (qLower.includes('embedded') || qLower.includes('circuit') || qLower.includes('electronics') || qLower.includes('microcontroller') || qLower.includes('freertos')) {
        replyText = `### Subject Overview: Embedded Systems & Microcontrollers\n\n- **Microcontroller Architecture**: Understand register sets, Harvard vs Von Neumann memory organization, and NVIC priority handling in ARM Cortex-M.\n- **Real-Time Operating Systems (RTOS)**: Task scheduling (preemptive vs cooperative), semaphores, mutexes for shared resource locking, and message queues.\n- **Hardware Protocols**: Master timing diagrams and master-slave topologies for I2C (two-wire open drain), SPI (full-duplex high speed), and UART.`;
        actualModel = 'edunexus-academic-engine (subject fallback)';
      } else {
        replyText = `### Academic & Educational Advisory\n\nRegarding your academic inquiry:\n- **Curricular Focus**: Align this topic with your semester syllabus and university exam weightage.\n- **Recommended Actions**: Consult relevant textbooks, complete hands-on practical assignments, and participate in peer study groups.\n- **Faculty Consultation**: Check in with ${studentContext?.mentorName || 'your assigned mentor'} during designated office hours for personalized academic guidance.`;
        actualModel = 'edunexus-academic-engine (educational fallback)';
      }
    }

    // Standardize out-of-domain reply if triggered
    if (
      replyText.includes('out of academics/subject') ||
      replyText.includes('not relate to subject') ||
      replyText.includes('out off acadamics')
    ) {
      replyText = 'This question is out of academics/subject. Please ask questions related to your university subjects, academic curriculum, exams, or educational knowledge.';
      isOutOfDomain = true;
    }

    res.json({
      reply: replyText,
      modelUsed: actualModel,
      isOutOfDomain,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Gemini Chat API Error:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate chatbot response from Gemini API.',
    });
  }
});

// Production vs Development Server mounting
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, () => {
    console.log(`EduNexus AI Full-Stack Server running on port ${port}`);
  });
}

startServer();
