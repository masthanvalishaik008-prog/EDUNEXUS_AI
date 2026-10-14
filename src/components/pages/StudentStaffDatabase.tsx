import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../firebase/AuthContext';
import {
  Users,
  Search,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  Server,
  RefreshCw,
  Plus,
  Download,
  Filter,
  Eye,
  X,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ArrowUpDown,
  Clock,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Gamepad2,
  FileCheck,
  Check,
  ChevronRight
} from 'lucide-react';

interface BackendStudent {
  id: string;
  name: string;
  email: string;
  gender: string;
  department: string;
  batch: string;
  semester: number;
  mentorName: string;
  compositeScore: number;
  riskLevel: string;
  gpa: number;
  attendance: number;
  backlogs: number;
  preferredDomain: string;
  placementReadiness: string;
  codingScore: number;
  phone: string;
  primaryTechnologies: string[];
}

interface BackendStaff {
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

interface BackendActivity {
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

interface DatabaseStats {
  totalStudents: number;
  totalStaff: number;
  avgGpa: string;
  avgAttendance: number;
  backlogsTotal: number;
  departmentCount: number;
}

export function StudentStaffDatabase() {
  const { userType, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'students' | 'staff' | 'engagement'>('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');

  // Engagement filters
  const [activityCategoryFilter, setActivityCategoryFilter] = useState('All');
  const [activityStatusFilter, setActivityStatusFilter] = useState('All');
  const [activityVerifiedFilter, setActivityVerifiedFilter] = useState('All');

  // Backend state
  const [students, setStudents] = useState<BackendStudent[]>([]);
  const [staffList, setStaffList] = useState<BackendStaff[]>([]);
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [activityStats, setActivityStats] = useState<{
    totalActivities: number;
    completed: number;
    inProgress: number;
    planned: number;
    verifiedCount: number;
    pendingVerification: number;
    totalHours: number;
  } | null>(null);

  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'error' | 'loading'>('loading');

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<BackendStudent | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<BackendStaff | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<BackendActivity | null>(null);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);

  // Review modal / Inline feedback state
  const [reviewNote, setReviewNote] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // New record forms state
  const [newStudentData, setNewStudentData] = useState({
    name: '',
    email: '',
    department: 'Electronics & Comm (ECE)',
    semester: 6,
    batch: '2022-2026',
    mentorName: 'Dr. Ramesh Sundaram',
    gpa: 8.0,
    attendance: 88,
    preferredDomain: 'Embedded Systems & IoT',
  });

  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    department: 'Computer Science (CSE)',
    designation: 'Assistant Professor',
    cabin: 'Room C-201',
    phone: '+91 98401 99999',
    specialization: 'Software Systems',
  });

  // Fetch data from backend API
  const fetchStudents = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (departmentFilter !== 'All') params.set('department', departmentFilter);
      if (riskFilter !== 'All') params.set('riskLevel', riskFilter);
      if (semesterFilter !== 'All') params.set('semester', semesterFilter);

      const res = await fetch(`/api/database/students?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load students from backend API');
      const data = await res.json();
      setStudents(data.students || []);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching students:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter, riskFilter, semesterFilter]);

  const fetchStaff = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (departmentFilter !== 'All') params.set('department', departmentFilter);

      const res = await fetch(`/api/database/staff?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load staff from backend API');
      const data = await res.json();
      setStaffList(data.staff || []);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter]);

  const fetchActivities = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.set('q', searchTerm);
      if (departmentFilter !== 'All') params.set('department', departmentFilter);
      if (activityCategoryFilter !== 'All') params.set('category', activityCategoryFilter);
      if (activityStatusFilter !== 'All') params.set('status', activityStatusFilter);
      if (activityVerifiedFilter === 'Verified') params.set('verified', 'true');
      if (activityVerifiedFilter === 'Pending') params.set('verified', 'false');

      const res = await fetch(`/api/student-engagement/activities?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load student engagement from backend API');
      const data = await res.json();
      setActivities(data.activities || []);
      if (data.stats) setActivityStats(data.stats);
      setBackendStatus('connected');
    } catch (err: any) {
      console.error('Error fetching activities:', err);
      setError(err.message);
      setBackendStatus('error');
    }
  }, [searchTerm, departmentFilter, activityCategoryFilter, activityStatusFilter, activityVerifiedFilter]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/database/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.warn('Could not load database stats:', err);
    }
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchStudents(), fetchStaff(), fetchActivities(), fetchStats()]);
    setLoading(false);
  }, [fetchStudents, fetchStaff, fetchActivities]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Handle Add Student
  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/database/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudentData),
      });
      if (!res.ok) throw new Error('Failed to create student on backend');
      setIsAddStudentOpen(false);
      showToast('New student record created in backend database.');
      fetchStudents();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Error saving student');
    }
  };

  // Handle Add Staff
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/database/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffData),
      });
      if (!res.ok) throw new Error('Failed to register staff on backend');
      setIsAddStaffOpen(false);
      showToast('Staff profile registered in backend database.');
      fetchStaff();
      fetchStats();
    } catch (err: any) {
      alert(err.message || 'Error saving staff');
    }
  };

  // Handle Staff Verification of Activity
  const handleVerifyActivity = async (activityId: string, customFeedback?: string) => {
    try {
      const res = await fetch(`/api/student-engagement/activities/${activityId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          staffFeedback: customFeedback || 'Verified and approved by faculty advisor. High academic diligence commended.',
          verifiedByStaffName: role || 'Faculty Advisor',
        }),
      });
      if (!res.ok) throw new Error('Failed to verify activity on backend');
      const data = await res.json();
      setActivities((prev) => prev.map((a) => (a.id === activityId ? data.activity : a)));
      showToast(`Activity ${activityId} successfully verified! Advisor review saved.`);
      setVerifyingId(null);
      setReviewNote('');
      fetchActivities();
    } catch (err: any) {
      alert(err.message || 'Error verifying activity');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (activeTab === 'students') {
      const headers = ['ID', 'Name', 'Email', 'Department', 'Semester', 'GPA', 'Attendance', 'Risk Level', 'Mentor'];
      const rows = students.map((s) => [s.id, s.name, s.email, s.department, s.semester, s.gpa, `${s.attendance}%`, s.riskLevel, s.mentorName]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_students_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    } else if (activeTab === 'staff') {
      const headers = ['ID', 'Name', 'Email', 'Department', 'Designation', 'Cabin', 'Assigned Students'];
      const rows = staffList.map((st) => [st.id, st.name, st.email, st.department, st.designation, st.cabin, st.assignedStudentsCount]);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_staff_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    } else {
      const headers = ['ID', 'StudentID', 'StudentName', 'Department', 'Title', 'Category', 'Subject', 'Hours', 'Status', 'Verified', 'Advisor'];
      const rows = activities.map((a) => [a.id, a.studentId, a.studentName, a.department, a.title, a.category, a.semesterSubject || '', a.hoursSpent, a.status, a.verifiedByStaff ? 'Yes' : 'No', a.mentorName || '']);
      const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      downloadFile(csv, `edunexus_engagement_telemetry_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
    }
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Staff Security Guard: If not staff, show access denied
  if (userType !== 'staff') {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-500/10 border border-red-500/30 rounded-3xl p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Staff-Only Institutional Database</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Access to the centralized student and staff backend repository is restricted to authorized faculty members, academic advisors, and institutional deans.
          </p>
          <div className="text-xs font-mono text-slate-500">Security Policy: ROLE_STAFF_DATABASE_PRIVILEGE_REQUIRED</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-slate-900 text-white rounded-2xl shadow-2xl border border-blue-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium leading-relaxed">{toastMessage}</span>
        </div>
      )}

      {/* Database Header & Server Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                <Server className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                Backend Institutional Database Store (Staff Authorized)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Location: Node.js Express REST Backend</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Student, Staff & Engagement Database Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Authoritative repository storing student dossiers, faculty advisor rosters, and real-time student engagement activity logs submitted from coursework, quizzes, and learning plans.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono">
              <div
                className={`w-2 h-2 rounded-full ${
                  backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                }`}
              />
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {backendStatus === 'connected' ? 'REST API: Online (200 OK)' : 'API: Reconnecting...'}
              </span>
            </div>

            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Refresh database records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Live Backend Telemetry Strip */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Students Enrolled</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalStudents}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Faculty & Advisors</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalStaff}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Engagement Activities</span>
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-0.5">{activities.length}</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Average GPA</span>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{stats.avgGpa} / 10</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Avg Attendance</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.avgAttendance}%</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pending Verifications</span>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                {activities.filter((a) => !a.verifiedByStaff).length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Segmented View Switcher */}
          <div className="flex flex-wrap bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 gap-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Students Directory ({students.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Faculty & Staff Directory ({staffList.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('engagement')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                activeTab === 'engagement'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Award className="w-4 h-4 text-purple-500" />
              <span>Student Engagement Telemetry ({activities.length})</span>
            </button>
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="All">All Departments</option>
              <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
              <option value="Computer Science (CSE)">Computer Science (CSE)</option>
              <option value="Information Tech (IT)">Information Tech (IT)</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Secondary Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder={
                activeTab === 'students'
                  ? 'Search by student name, ID, roll number, or domain...'
                  : activeTab === 'staff'
                  ? 'Search staff name, cabin, designation, courses...'
                  : 'Search activities by title, student name, subject, or outcomes...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none text-slate-900 dark:text-white"
            />
          </div>

          {activeTab === 'students' && (
            <>
              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Risk Tiers</option>
                <option value="Low Support Need">Low Support Need (Stable)</option>
                <option value="Moderate Attention">Moderate Attention</option>
                <option value="High Risk">High Risk / Flagged</option>
              </select>

              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Student Record</span>
              </button>
            </>
          )}

          {activeTab === 'staff' && (
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Profile</span>
            </button>
          )}

          {activeTab === 'engagement' && (
            <>
              <select
                value={activityCategoryFilter}
                onChange={(e) => setActivityCategoryFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Categories</option>
                <option value="Interactive Quiz">Interactive Quizzes</option>
                <option value="Hands-on Project">Hands-on Projects</option>
                <option value="Academic Booster">Academic Boosters</option>
                <option value="Skill & Certification">Skill & Certification</option>
                <option value="Knowledge Refresher">Knowledge Refreshers</option>
              </select>

              <select
                value={activityVerifiedFilter}
                onChange={(e) => setActivityVerifiedFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Review Statuses</option>
                <option value="Pending">Pending Staff Review</option>
                <option value="Verified">Verified by Advisor</option>
              </select>

              <select
                value={activityStatusFilter}
                onChange={(e) => setActivityStatusFilter(e.target.value)}
                className="p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                <option value="All">All Progress</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Planned">Planned</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between text-xs text-red-700 dark:text-red-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span>{error}</span>
          </div>
          <button onClick={loadAllData} className="font-bold underline cursor-pointer">
            Retry Connection
          </button>
        </div>
      )}

      {/* VIEW 1: STUDENTS DIRECTORY */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">No student records match the active criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Student Dossier</th>
                    <th className="p-4">Department & Batch</th>
                    <th className="p-4">Academic CGPA</th>
                    <th className="p-4">Attendance</th>
                    <th className="p-4">Risk Category</th>
                    <th className="p-4">Advisor</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{student.id} · {student.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200">{student.department}</div>
                        <div className="text-[11px] text-slate-400">Semester {student.semester} · Batch {student.batch}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span className={student.gpa >= 8.5 ? 'text-emerald-600' : student.gpa < 7.0 ? 'text-amber-600' : 'text-blue-600'}>
                          {student.gpa.toFixed(1)} / 10
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal">{student.backlogs} backlogs</div>
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <span className={student.attendance >= 85 ? 'text-emerald-600' : 'text-rose-500'}>
                          {student.attendance}%
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            student.riskLevel.includes('High')
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : student.riskLevel.includes('Moderate')
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-medium">
                        {student.mentorName}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedStudent(student);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Dossier
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FACULTY & STAFF DIRECTORY */}
      {activeTab === 'staff' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((st) => (
            <div
              key={st.id}
              onClick={() => setSelectedStaff(st)}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-blue-400 dark:hover:border-blue-600 transition-all cursor-pointer shadow-xs flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50">
                    {st.role}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{st.id}</span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors">
                    {st.name}
                  </h3>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">{st.designation}</div>
                  <div className="text-xs text-slate-400">{st.department}</div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.cabin}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{st.phone}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Assigned: <strong className="text-slate-800 dark:text-slate-200">{st.assignedStudentsCount} students</strong></span>
                <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">Details →</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: STUDENT ENGAGEMENT TELEMETRY (Staff View) */}
      {activeTab === 'engagement' && (
        <div className="space-y-4">
          {/* Telemetry Summary Cards */}
          {activityStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Total Logged Activities</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{activityStats.totalActivities}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Across all branches</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Completed Milestones</span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{activityStats.completed}</div>
                <div className="text-[10px] text-emerald-500/80 mt-0.5">100% progress verified</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Dedicated Study Hours</span>
                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{activityStats.totalHours} hrs</div>
                <div className="text-[10px] text-blue-500/80 mt-0.5">Coursework & lab practice</div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Pending Advisor Reviews</span>
                <div className="text-2xl font-black text-amber-500 mt-1">{activityStats.pendingVerification}</div>
                <div className="text-[10px] text-amber-600/80 mt-0.5">Awaiting staff endorsement</div>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
            {activities.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Student Activities Found</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No engagement records match the selected filter. Students log activities when completing coursework plans, project milestones, or interactive quizzes.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.map((act, index) => (
                  <div
                    key={act.id}
                    style={{ animationDelay: `${index * 60}ms` }}
                    className="p-5 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all duration-300 space-y-3 animate-in fade-in slide-in-from-bottom-2 transform hover:scale-[1.002] border-l-4 border-transparent hover:border-blue-500"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                            {act.studentName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {act.studentId}
                          </span>
                          <span className="text-[10px] text-slate-500">· {act.department}</span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              act.category === 'Interactive Quiz'
                                ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300'
                                : act.category === 'Hands-on Project'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300'
                            }`}
                          >
                            {act.category}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              act.status === 'Completed'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : act.status === 'In Progress'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            {act.status} ({act.progressPct}%)
                          </span>

                          {act.verifiedByStaff ? (
                            <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Verified by Advisor</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                              Pending Advisor Review
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight pt-0.5">
                          {act.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span>Subject: <strong className="text-slate-700 dark:text-slate-300">{act.semesterSubject || 'General Core'}</strong></span>
                          <span>·</span>
                          <span>Time Spent: <strong className="text-slate-700 dark:text-slate-300">{act.hoursSpent} hrs</strong></span>
                          <span>·</span>
                          <span>Logged: <strong className="text-slate-700 dark:text-slate-300">{act.dateLogged}</strong></span>
                          {act.mentorName && (
                            <>
                              <span>·</span>
                              <span>Advisor: <strong className="text-slate-700 dark:text-slate-300">{act.mentorName}</strong></span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Staff Verification Button */}
                      <div className="shrink-0 flex items-center gap-2">
                        {!act.verifiedByStaff && (
                          <button
                            onClick={() => {
                              setVerifyingId(act.id);
                              setReviewNote('');
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Verify & Endorse</span>
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedActivity(act)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Inspect Log
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                      {act.description}
                    </p>

                    {act.learningOutcomes && (
                      <div className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">Student Reflection & Learnings:</span>
                        <span className="italic">{act.learningOutcomes}</span>
                      </div>
                    )}

                    {act.verifiedByStaff && act.staffFeedback && (
                      <div className="p-3 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-2xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Faculty Advisor Endorsement ({act.verifiedByStaffName || act.mentorName || 'Advisor'}):</span>{' '}
                          <span>{act.staffFeedback}</span>
                          {act.verifiedAt && (
                            <span className="block text-[10px] text-purple-600/70 dark:text-purple-400/70 mt-0.5">
                              Verified on: {new Date(act.verifiedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Inline Verification Form */}
                    {verifyingId === act.id && (
                      <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 rounded-2xl space-y-3 animate-in fade-in">
                        <div className="font-bold text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                          <span>Submit Advisor Verification for {act.studentName}</span>
                          <button
                            onClick={() => setVerifyingId(null)}
                            className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                          >
                            ✕
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Provide commendation, feedback, or advisory guidance on this coursework milestone..."
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="w-full p-2.5 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setVerifyingId(null)}
                            className="px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-lg"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleVerifyActivity(act.id, reviewNote)}
                            className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm"
                          >
                            Save Verification & Award Endorsement
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STUDENT DOSSIER MODAL */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg flex items-center justify-center shadow-md">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{selectedStudent.name}</h3>
                  <div className="text-xs font-mono text-slate-400">
                    {selectedStudent.id} · {selectedStudent.department} · Sem {selectedStudent.semester}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Current CGPA</span>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selectedStudent.gpa.toFixed(1)} / 10</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Attendance</span>
                <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selectedStudent.attendance}%</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Backlogs</span>
                <div className="text-lg font-bold text-amber-600 mt-0.5">{selectedStudent.backlogs} courses</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Coding Rating</span>
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-0.5">{selectedStudent.codingScore} / 100</div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5">
                <div className="text-slate-500 font-semibold">Career & Placement Pathway:</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedStudent.preferredDomain}</div>
                <div className="text-slate-500">Readiness Tier: <strong className="text-slate-800 dark:text-slate-200">{selectedStudent.placementReadiness}</strong></div>
              </div>

              <div>
                <div className="text-slate-500 font-semibold mb-1">Primary Skill Technologies:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStudent.primaryTechnologies.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono text-[11px] border border-blue-200 dark:border-blue-800">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Student's Logged Activities from Backend DB */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="text-slate-700 dark:text-slate-300 font-bold mb-2 flex items-center justify-between">
                  <span>Logged Activities & Quizzes in Backend:</span>
                  <span className="text-[11px] font-mono text-purple-600 font-semibold">
                    {activities.filter((a) => a.studentId === selectedStudent.id).length} recorded
                  </span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activities.filter((a) => a.studentId === selectedStudent.id).length === 0 ? (
                    <div className="text-slate-400 text-xs italic">No activities logged yet for this student.</div>
                  ) : (
                    activities
                      .filter((a) => a.studentId === selectedStudent.id)
                      .map((act) => (
                        <div key={act.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{act.status}</span>
                          </div>
                          <div className="text-slate-500 text-[11px]">Category: {act.category} · {act.hoursSpent} hrs · Logged: {act.dateLogged}</div>
                          {act.verifiedByStaff && (
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified by Advisor
                            </div>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF DETAIL MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedStaff.name}</h3>
                <div className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{selectedStaff.designation}</div>
              </div>
              <button onClick={() => setSelectedStaff(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <div>Department: <strong className="text-slate-900 dark:text-white">{selectedStaff.department}</strong></div>
                <div>Cabin Location: <strong className="text-slate-900 dark:text-white">{selectedStaff.cabin}</strong></div>
                <div>Email: <strong className="text-slate-900 dark:text-white">{selectedStaff.email}</strong></div>
                <div>Office Hours: <strong className="text-slate-900 dark:text-white">{selectedStaff.officeHours}</strong></div>
                <div>Experience: <strong className="text-slate-900 dark:text-white">{selectedStaff.experienceYears} years</strong></div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Courses Taught:</div>
                <div className="flex flex-wrap gap-1">
                  {selectedStaff.coursesTaught.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Specialization:</div>
                <p className="text-slate-500 leading-relaxed">{selectedStaff.specialization}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ACTIVITY INSPECTION MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{selectedActivity.title}</h3>
                <div className="text-xs text-slate-400">
                  Logged by {selectedActivity.studentName} ({selectedActivity.studentId})
                </div>
              </div>
              <button onClick={() => setSelectedActivity(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                <div>Category: <strong className="text-slate-900 dark:text-white">{selectedActivity.category}</strong></div>
                <div>Status: <strong className="text-slate-900 dark:text-white">{selectedActivity.status}</strong></div>
                <div>Hours: <strong className="text-slate-900 dark:text-white">{selectedActivity.hoursSpent} hrs</strong></div>
                <div>Subject: <strong className="text-slate-900 dark:text-white">{selectedActivity.semesterSubject || 'Core'}</strong></div>
              </div>

              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Description:</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                  {selectedActivity.description}
                </p>
              </div>

              {selectedActivity.learningOutcomes && (
                <div>
                  <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">Key Outcomes & Reflections:</div>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-blue-50/50 dark:bg-blue-950/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/40">
                    {selectedActivity.learningOutcomes}
                  </p>
                </div>
              )}

              {selectedActivity.staffFeedback && (
                <div>
                  <div className="font-bold text-purple-700 dark:text-purple-300 mb-1">Advisor Review Remarks:</div>
                  <p className="text-purple-900 dark:text-purple-200 bg-purple-50/70 dark:bg-purple-950/40 p-3 rounded-xl border border-purple-200 dark:border-purple-800">
                    {selectedActivity.staffFeedback}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStudent}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Student to Backend Database</h3>
              <button type="button" onClick={() => setIsAddStudentOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStudentData.name}
                  onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <select
                  value={newStudentData.department}
                  onChange={(e) => setNewStudentData({ ...newStudentData, department: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                  <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                  <option value="Information Tech (IT)">Information Tech (IT)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">GPA (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={newStudentData.gpa}
                    onChange={(e) => setNewStudentData({ ...newStudentData, gpa: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Attendance %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newStudentData.attendance}
                    onChange={(e) => setNewStudentData({ ...newStudentData, attendance: parseInt(e.target.value) || 0 })}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Assigned Faculty Mentor</label>
                <input
                  type="text"
                  value={newStudentData.mentorName}
                  onChange={(e) => setNewStudentData({ ...newStudentData, mentorName: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Add Staff to Backend Database</h3>
              <button type="button" onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name & Title</label>
                <input
                  type="text"
                  required
                  value={newStaffData.name}
                  onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
                  placeholder="e.g. Dr. Kavita Sharma"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Designation</label>
                <input
                  type="text"
                  required
                  value={newStaffData.designation}
                  onChange={(e) => setNewStaffData({ ...newStaffData, designation: e.target.value })}
                  placeholder="e.g. Associate Professor & Lab Head"
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Department</label>
                <select
                  value={newStaffData.department}
                  onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                >
                  <option value="Computer Science (CSE)">Computer Science (CSE)</option>
                  <option value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</option>
                  <option value="Information Tech (IT)">Information Tech (IT)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Cabin Location</label>
                <input
                  type="text"
                  value={newStaffData.cabin}
                  onChange={(e) => setNewStaffData({ ...newStaffData, cabin: e.target.value })}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddStaffOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
              >
                Register Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
