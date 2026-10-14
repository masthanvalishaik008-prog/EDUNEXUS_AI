import React, { useState } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import { UserRole } from '../../types/student';

import heroImg from '../../assets/images/edunexus_hero_analytics_1791794129538.jpg';
import {
  GraduationCap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  UserCheck,
  Layers,
  Lock,
  Compass,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  BookOpen,
  Award,
  CheckCircle2,
  Building,
  KeyRound,
  Mail,
  Activity,
  Zap,
  Info,
  SlidersHorizontal,
  Radar,
  TrendingUp,
  BrainCircuit,
  MessageSquareCode,
  Users
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (studentId?: string, userType?: 'staff' | 'student') => void;
}

type PortalMode = 'student' | 'staff';
type StaffTab = 'roles' | 'credentials' | 'sso';
type StudentTab = 'roster' | 'pin';
type SpotlightTab = 'telemetry' | 'radar' | 'ai' | 'whatif';
type BranchKey = 'ECE' | 'CSE' | 'IT' | 'EEE' | 'MECH';
type LoginTab = 'roles' | 'credentials' | 'student' | 'sso';

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { signInWithGoogle, loginAsGuest } = useAuth();
  const [activeTab, setActiveTab] = useState<LoginTab>('student');
  const [portalMode, setPortalMode] = useState<PortalMode>('student');
  const [staffTab, setStaffTab] = useState<StaffTab>('roles');
  const [studentTab, setStudentTab] = useState<StudentTab>('roster');
  const [spotlightTab, setSpotlightTab] = useState<SpotlightTab>('telemetry');
  const [selectedBranch, setSelectedBranch] = useState<BranchKey>('ECE');

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Demo Persona state
  const [selectedDemoRole, setSelectedDemoRole] = useState<UserRole>('Faculty Advisor');
  const [demoName, setDemoName] = useState<string>('Dr. Ramesh Sundaram');

  // Student portal credentials state
  const [studentIdInput, setStudentIdInput] = useState<string>('ENX-2024-101');
  const [studentPinInput, setStudentPinInput] = useState<string>('2026');
  const [studentAuthError, setStudentAuthError] = useState<string | null>(null);

  // Institutional credentials form state
  const [emailInput, setEmailInput] = useState<string>('ramesh.sundaram@edunexus.edu');
  const [passwordInput, setPasswordInput] = useState<string>('Edunexus@2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [customRole, setCustomRole] = useState<UserRole>('Faculty Advisor');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loginToast, setLoginToast] = useState<string | null>(null);

  const demoPersonas: {
    role: UserRole;
    name: string;
    dept: string;
    desc: string;
    icon: any;
    color: string;
    bgGlow: string;
    permissions: string[];
    sampleStat: string;
  }[] = [
    {
      role: 'Faculty Advisor',
      name: 'Dr. Ramesh Sundaram',
      dept: 'ECE / Core Engineering',
      desc: 'Monitor 64 advisees, review automated early radar triggers, and schedule remedial intervention sessions.',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-600',
      bgGlow: 'border-blue-500/80 bg-blue-950/40',
      permissions: ['Early Support Radar', 'Intervention Tracker', 'Student 360° Profile', 'Growth Navigator'],
      sampleStat: '4 Pending Early Alerts · 92% Remedial Clearance',
    },
    {
      role: 'Dean of Academics',
      name: 'Dr. K. V. Ramanathan',
      dept: 'Office of Academic Affairs',
      desc: 'Institutional cohort KPIs, cross-department performance benchmarks, and governance audit trails.',
      icon: Award,
      color: 'from-purple-500 to-indigo-600',
      bgGlow: 'border-purple-500/80 bg-purple-950/40',
      permissions: ['Executive Dashboard', 'Audit Logs & Governance', 'Cohort Analytics', 'Policy What-If Sim'],
      sampleStat: '5 Branches Monitored · 82.4 Institutional Success Score',
    },
    {
      role: 'Placement Officer',
      name: 'Prof. Ananya Iyer',
      dept: 'Career & Industry Relations',
      desc: 'Domain career tracks, coding benchmark screening, mock interviews, and industry project roadmaps.',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      bgGlow: 'border-emerald-500/80 bg-emerald-950/40',
      permissions: ['Placement Intelligence', 'Domain Career Pathways', 'Skill Gap Analysis', 'Mock Interviews'],
      sampleStat: '88% Job-Ready Rate · 4 Specialized Industry Pathways',
    },
    {
      role: 'Department Head',
      name: 'Prof. Harish Chandra',
      dept: 'Mechanical & Automation Eng',
      desc: 'Branch-level performance distributions, faculty mentoring logs, and attendance compliance.',
      icon: Building,
      color: 'from-amber-500 to-orange-600',
      bgGlow: 'border-amber-500/80 bg-amber-950/40',
      permissions: ['Department Analytics', 'Attendance Telemetry', 'Remedial Reviews', 'Faculty Feedback'],
      sampleStat: '86% Attendance Compliance · 18 Active Mentoring Logs',
    },
  ];

  const studentPersonas = [
    {
      id: 'ENX-2024-101',
      name: 'Aarav Patel',
      dept: 'Electronics & Comm (ECE)',
      gpa: 8.4,
      attendance: '91%',
      risk: 'On Track',
      careerTrack: 'Embedded Systems & IoT',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      highlightSkill: 'FreeRTOS & ESP32'
    },
    {
      id: 'ENX-2024-102',
      name: 'Sneha Reddy',
      dept: 'Computer Science (CSE)',
      gpa: 9.3,
      attendance: '96%',
      risk: 'High Potential',
      careerTrack: 'Software Development & AI',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      highlightSkill: 'Full-Stack & PyTorch'
    },
    {
      id: 'ENX-2024-103',
      name: 'Karan Verma',
      dept: 'Electronics & Comm (ECE)',
      gpa: 5.8,
      attendance: '64%',
      risk: 'High Support Needed',
      careerTrack: 'Electronics Testing',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      highlightSkill: 'Circuits & Multisim'
    },
    {
      id: 'ENX-2024-104',
      name: 'Sneha Kulkarni',
      dept: 'Information Tech (IT)',
      gpa: 8.1,
      attendance: '88%',
      risk: 'Moderate Attention',
      careerTrack: 'Data Analytics',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      highlightSkill: 'Python & Power BI'
    },
  ];

  const branchData: Record<BranchKey, { name: string; students: number; avgGpa: number; alerts: number; topSkill: string; track: string }> = {
    ECE: { name: 'Electronics & Comm (ECE)', students: 124, avgGpa: 8.1, alerts: 3, topSkill: 'Embedded C / VLSI', track: 'Embedded Systems & IoT' },
    CSE: { name: 'Computer Science (CSE)', students: 180, avgGpa: 8.6, alerts: 2, topSkill: 'Data Structures / Cloud', track: 'Full-Stack Software' },
    IT: { name: 'Information Tech (IT)', students: 110, avgGpa: 7.4, alerts: 5, topSkill: 'Big Data / SQL', track: 'Data Analytics & BI' },
    EEE: { name: 'Electrical & Electronics', students: 96, avgGpa: 7.8, alerts: 2, topSkill: 'Power Systems / IoT', track: 'Smart Grid & Automation' },
    MECH: { name: 'Mechanical Engineering', students: 105, avgGpa: 7.2, alerts: 4, topSkill: 'CAD / Mechatronics', track: 'Robotics & Industrial IoT' },
  };

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setGoogleError(null);
    try {
      await signInWithGoogle();
      onLoginSuccess(undefined, 'staff');
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      setGoogleError(err?.message || 'Google sign-in was canceled or encountered an issue.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    const persona = demoPersonas.find((p) => p.role === selectedDemoRole);
    const assignedDept = persona?.dept || 'ECE / Core Engineering';
    setLoginToast(`Launching workspace for ${demoName} (${selectedDemoRole})...`);
    setTimeout(() => {
      loginAsGuest(demoName, selectedDemoRole, 'staff', undefined, assignedDept);
      onLoginSuccess(undefined, 'staff');
    }, 400);
  };

  const handleInstitutionalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Please enter a valid institutional email address.');
      return;
    }
    setIsSubmitting(true);
    setLoginToast('Authenticating with Institutional Directory...');
    setTimeout(() => {
      setIsSubmitting(false);
      const extractedName = emailInput
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (l) => l.toUpperCase());
      const branchInfo = branchData[selectedBranch]?.name || 'ECE / Core Engineering';
      loginAsGuest(extractedName || 'Academic Faculty', customRole, 'staff', undefined, branchInfo);
      onLoginSuccess(undefined, 'staff');
    }, 600);
  };

  const handleStudentPortalSubmit = (student: typeof studentPersonas[0]) => {
    setLoginToast(`Entering Student 360° Portal for ${student.name}...`);
    setTimeout(() => {
      loginAsGuest(student.name, 'Student', 'student', student.id, student.dept);
      onLoginSuccess(student.id, 'student');
    }, 400);
  };

  const handleStudentPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentAuthError(null);
    const found = studentPersonas.find(
      (s) => s.id.toLowerCase() === studentIdInput.trim().toLowerCase()
    ) || studentPersonas[0];
    setLoginToast(`Signing into Student Portal for ${found.name} (${found.id})...`);
    setTimeout(() => {
      loginAsGuest(found.name, 'Student', 'student', found.id, found.dept);
      onLoginSuccess(found.id, 'student');
    }, 400);
  };

  const handleFillDemoCredentials = (role: UserRole) => {
    setCustomRole(role);
    if (role === 'Faculty Advisor') {
      setEmailInput('ramesh.sundaram@edunexus.edu');
    } else if (role === 'Dean of Academics') {
      setEmailInput('dean.academics@edunexus.edu');
    } else if (role === 'Placement Officer') {
      setEmailInput('placement.officer@edunexus.edu');
    } else {
      setEmailInput('hod.mechanical@edunexus.edu');
    }
    setPasswordInput('Edunexus@2026');
  };

  const passwordStrength =
    passwordInput.length >= 10 && /[A-Z]/.test(passwordInput) && /[0-9]/.test(passwordInput)
      ? 'Strong Institutional Password'
      : passwordInput.length >= 6
      ? 'Moderate Password'
      : 'Weak Password';

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#071322] flex flex-col justify-between text-slate-800 dark:text-slate-100 selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors duration-200">
      {/* Background ambient lighting glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-emerald-600/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Bar Wordmark */}
      <header className="p-4 md:px-10 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#06101d]/85 backdrop-blur-md sticky top-0 z-30 shadow-xs dark:shadow-md transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-400/40">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight leading-tight flex items-center gap-2">
              <span className="bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-700 dark:from-white dark:via-blue-100 dark:to-blue-300 bg-clip-text text-transparent">
                EduNexus AI
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/70 dark:text-blue-300 dark:border-blue-700/60 shadow-xs">
                KPMG Challenge
              </span>
            </div>
            <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
              Student Success Analytics & Placement Intelligence
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-900/90 px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            <span className="font-medium">Continuous Student Success Action Loop</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Selector Button */}


            <button
              type="button"
              onClick={() => {
                loginAsGuest('Aarav Patel', 'Student', 'student', 'ENX-2024-101');
                onLoginSuccess('ENX-2024-101', 'student');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all duration-300 shadow-md shadow-blue-600/20 hover:scale-[1.03] cursor-pointer"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Student Demo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                loginAsGuest('Dr. Ramesh Sundaram', 'Faculty Advisor', 'staff');
                onLoginSuccess(undefined, 'staff');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-lg transition-all duration-300 shadow-md shadow-purple-600/20 hover:scale-[1.03] cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Staff Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Interactive Login Stage */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 max-w-7xl mx-auto w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Column: Mission, Interactive Spotlight & Live Department Telemetry */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-300 bg-blue-950/90 px-3.5 py-1.5 rounded-full border border-blue-800/80 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Enterprise Institutional Intelligence · 7 Telemetry Pillars</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Holistic Analytics, Proactive Care & Career Velocity
            </h1>

            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl">
              Integrating <strong className="text-blue-300">Academic, Attendance, LMS, Engagement, Placement, Skills, and Feedback</strong> into an explainable, human-governed support system.
            </p>

            {/* Interactive Campus Department Explorer Bar */}
            <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Campus Telemetry: Explore 5 Engineering Branches</span>
                </span>
                <span className="text-[11px] text-blue-400 font-mono">Live 2026 Cohort</span>
              </div>

              {/* Department Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {(['ECE', 'CSE', 'IT', 'EEE', 'MECH'] as BranchKey[]).map((br) => {
                  const isSelected = selectedBranch === br;
                  return (
                    <button
                      key={br}
                      type="button"
                      onClick={() => setSelectedBranch(br)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-1 ring-blue-400'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {br}
                    </button>
                  );
                })}
              </div>

              {/* Selected Branch Active Micro-Dashboard */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Enrollment</div>
                  <div className="font-bold text-white text-sm font-mono mt-0.5">
                    {branchData[selectedBranch].students} Scholars
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Average CGPA</div>
                  <div className="font-bold text-emerald-400 text-sm font-mono mt-0.5">
                    {branchData[selectedBranch].avgGpa} / 10
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Early Alerts</div>
                  <div className="font-bold text-amber-400 text-sm font-mono mt-0.5">
                    {branchData[selectedBranch].alerts} In Review
                  </div>
                </div>
                <div className="col-span-3 pt-1 text-[11px] text-slate-300 text-left border-t border-slate-850 flex items-center justify-between">
                  <span>
                    Focus Track: <strong className="text-blue-300">{branchData[selectedBranch].track}</strong>
                  </span>
                  <span className="text-[10px] text-purple-300 font-mono bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800/50">
                    {branchData[selectedBranch].topSkill}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Feature Spotlight Tabs */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Interactive Feature Spotlight:</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSpotlightTab('telemetry')}
                  className={`p-2 rounded-xl text-center font-medium border transition-all cursor-pointer ${
                    spotlightTab === 'telemetry'
                      ? 'bg-blue-900/50 border-blue-500 text-blue-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Layers className="w-4 h-4 mx-auto mb-1 text-blue-400" />
                  <span>7 Pillars</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('radar')}
                  className={`p-2 rounded-xl text-center font-medium border transition-all cursor-pointer ${
                    spotlightTab === 'radar'
                      ? 'bg-amber-900/50 border-amber-500 text-amber-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Radar className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <span>Support Radar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('ai')}
                  className={`p-2 rounded-xl text-center font-medium border transition-all cursor-pointer ${
                    spotlightTab === 'ai'
                      ? 'bg-purple-900/50 border-purple-500 text-purple-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BrainCircuit className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span>Gemini AI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSpotlightTab('whatif')}
                  className={`p-2 rounded-xl text-center font-medium border transition-all cursor-pointer ${
                    spotlightTab === 'whatif'
                      ? 'bg-emerald-900/50 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span>What-If Sim</span>
                </button>
              </div>

              {/* Spotlight description card */}
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300">
                {spotlightTab === 'telemetry' && (
                  <p>
                    <strong className="text-white">7 Telemetry Categories:</strong> Academic CGPA, Attendance compliance, LMS module completion, Hackathon engagement, Placement readiness, Skills rating, and Pulse feedback merged in real-time.
                  </p>
                )}
                {spotlightTab === 'radar' && (
                  <p>
                    <strong className="text-white">Ethical Proactive Radar:</strong> Identifies compound risk indicators (e.g. attendance dips prior to exam backlogs) with transparent evidence attribution, never automatically punishing students.
                  </p>
                )}
                {spotlightTab === 'ai' && (
                  <p>
                    <strong className="text-white">Gemini 3.8 Flash Advisory Suite:</strong> Features an AI Chatbot with 4 counseling personas plus automated textual diagnostic insight reports saved directly to Firestore.
                  </p>
                )}
                {spotlightTab === 'whatif' && (
                  <p>
                    <strong className="text-white">What-If Policy Simulation:</strong> Move sliders for hypothetical attendance and coding practice gains to observe modeled composite score shifts before scheduling interventions.
                  </p>
                )}
              </div>
            </div>

            {/* Ethical Guard Info */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>FERPA Compliant · Firebase Authentication · Cloud Firestore RBAC.</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Portal */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="bg-white dark:bg-[#0b1a2e]/95 backdrop-blur-xl border border-slate-200 dark:border-slate-700/90 rounded-2xl p-6 sm:p-8 shadow-xl dark:shadow-2xl shadow-slate-200/50 dark:shadow-blue-950/50 w-full max-w-lg space-y-6 relative transition-colors duration-200">
              {/* Toast Feedback popup if active */}
              {loginToast && (
                <div className="absolute top-3 left-4 right-4 bg-blue-600 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-lg flex items-center justify-between animate-fade-in z-20">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>{loginToast}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Sign In to EduNexus AI
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Choose your access pathway or explore with live presets.
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                    Institutional
                  </span>

                </div>
              </div>

              {/* Interactive Tab Switcher */}
              <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('roles')}
                  className={`py-2 px-1 text-center font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab === 'roles'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Staff Roles
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`py-2 px-1 text-center font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab === 'credentials'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Email / PW
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('student')}
                  className={`py-2 px-1 text-center font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab === 'student'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('sso')}
                  className={`py-2 px-1 text-center font-medium rounded-lg transition-all cursor-pointer ${
                    activeTab === 'sso'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Google SSO
                </button>
              </div>

              {/* TAB 1: Academic Roles Selector */}
              {activeTab === 'roles' && (
                <form onSubmit={handleDemoSignIn} className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Select Institutional Persona:</span>
                    <span className="text-[11px] text-blue-400 font-medium">1-Click Instant Access</span>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {demoPersonas.map((persona) => {
                      const isSelected = selectedDemoRole === persona.role;
                      const Icon = persona.icon;
                      return (
                        <div
                          key={persona.role}
                          onClick={() => {
                            setSelectedDemoRole(persona.role);
                            setDemoName(persona.name);
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? `${persona.bgGlow} ring-1 ring-blue-500/60 text-white shadow-md`
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-sm ${
                              isSelected
                                ? `bg-gradient-to-tr ${persona.color} text-white`
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>{persona.role}</span>
                              <span className="text-[10px] font-mono text-blue-400">{persona.dept}</span>
                            </div>
                            <div className="text-[11px] text-slate-200 font-medium mt-0.5">{persona.name}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{persona.desc}</div>

                            {isSelected && (
                              <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5">
                                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                  <span>{persona.sampleStat}</span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {persona.permissions.map((p, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[9px] bg-slate-950/90 text-blue-300 px-1.5 py-0.5 rounded border border-blue-900/60"
                                    >
                                      ✓ {p}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs md:text-sm rounded-xl transition-all duration-300 ease-out shadow-lg shadow-blue-600/30 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer active:scale-98"
                  >
                    <span>Launch Portal as {selectedDemoRole}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 2: Institutional Email & Password Credentials */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleInstitutionalSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Institutional Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type="email"
                          value={emailInput}
                          onChange={(e) => setEmailInput(e.target.value)}
                          placeholder="e.g. professor@institution.edu"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-300">
                          Access Password / PIN
                        </label>
                        <span className="text-[10px] text-emerald-400 font-mono">{passwordStrength}</span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter academic credentials"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Password strength mini indicator */}
                      <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden flex">
                        <div
                          className={`h-full transition-all ${
                            passwordStrength.includes('Strong')
                              ? 'w-full bg-emerald-500'
                              : passwordStrength.includes('Moderate')
                              ? 'w-2/3 bg-amber-500'
                              : 'w-1/3 bg-rose-500'
                          }`}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Assigned Role
                        </label>
                        <select
                          value={customRole}
                          onChange={(e) => setCustomRole(e.target.value as UserRole)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Faculty Advisor">Faculty Advisor</option>
                          <option value="Dean of Academics">Dean of Academics</option>
                          <option value="Placement Officer">Placement Officer</option>
                          <option value="Department Head">Department Head</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-5">
                        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="accent-blue-600 rounded"
                          />
                          <span>Remember device</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Pre-fill Quick Presets */}
                  <div className="pt-1">
                    <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                      <span>Quick Demo Presets:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFillDemoCredentials('Faculty Advisor')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 cursor-pointer"
                      >
                        Advisor Ramesh
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCredentials('Dean of Academics')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 cursor-pointer"
                      >
                        Dean Ramanathan
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillDemoCredentials('Placement Officer')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-800 hover:border-slate-700 cursor-pointer"
                      >
                        Placement Iyer
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="p-3 bg-red-950/60 border border-red-800 rounded-xl text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{authError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs md:text-sm rounded-xl transition-all duration-300 ease-out shadow-md shadow-blue-600/25 hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/40 cursor-pointer disabled:opacity-60 active:scale-98"
                  >
                    <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Institutional ID'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* TAB 3: Student Portal Self-Service */}
              {activeTab === 'student' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">Student Self-Service Viewpoint</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Experience the platform from a student's perspective with their 360° telemetry profile and career readiness roadmap.
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {studentPersonas.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleStudentPortalSubmit(st)}
                        className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 hover:border-blue-500/60 cursor-pointer transition-all duration-300 ease-out hover:scale-[1.015] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-between group shadow-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600/30 to-purple-600/30 border border-blue-500/40 text-blue-200 flex items-center justify-center font-bold text-xs">
                            {st.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs flex items-center gap-2">
                              <span>{st.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({st.id})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {st.dept} · GPA: <span className="text-white font-semibold">{st.gpa}</span> · Att: {st.attendance}
                            </div>
                            <div className="text-[10px] text-blue-300 mt-0.5 flex items-center gap-1">
                              <span>Focus: {st.careerTrack}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${st.badgeColor}`}>
                            {st.risk}
                          </span>
                          <span className="text-[11px] text-blue-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            <span>Open</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-blue-950/40 border border-blue-900/60 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      Logging in as a student loads their 360° telemetry profile, career roadmap recommendations, and weekly goal milestones.
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 4: Google SSO (Firebase Auth) */}
              {activeTab === 'sso' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-300">
                    <p className="font-semibold text-white">Google Workspace & Cloud Identity SSO</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Single Sign-On using your university-managed Google account. Data is securely synchronized via Firebase Firestore.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={loadingGoogle}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-900 font-semibold text-xs md:text-sm rounded-xl transition-all duration-300 ease-out shadow-md hover:scale-[1.02] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-white/20 group cursor-pointer disabled:opacity-60 active:scale-98"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{loadingGoogle ? 'Connecting to Google Identity...' : 'Sign In with Google Account'}</span>
                  </button>

                  {googleError && (
                    <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{googleError}</span>
                    </div>
                  )}

                  <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1">
                    <div className="font-semibold text-slate-300">Identity Provider Details:</div>
                    <div>
                      • Firebase Project: <span className="font-mono text-blue-400">ambient-interchange-kw1sf</span>
                    </div>
                    <div>
                      • Firestore Database: <span className="font-mono text-emerald-400">Active</span>
                    </div>
                    <div>• Protocol: OAuth 2.0 / OpenID Connect with popup authorization</div>
                  </div>
                </div>
              )}

              {/* Bottom Quick Bypass */}
              <div className="text-center pt-2 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    loginAsGuest('Dr. Ramesh Sundaram', 'Faculty Advisor');
                    onLoginSuccess('ENX-2024-101');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Skip Authentication & Launch Live Advisor Sandbox →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 md:px-12 border-t border-slate-800/80 bg-[#06101d]/60 text-center text-xs text-slate-500 z-10">
        <div>EduNexus AI — Enterprise Student Success Analytics & Placement Intelligence</div>
        <div className="text-[11px] text-slate-600 mt-1">
          Compliant with FERPA academic privacy standards · Transparent Rule Engine · Human-in-the-Loop Safeguards
        </div>
      </footer>
    </div>
  );
}
