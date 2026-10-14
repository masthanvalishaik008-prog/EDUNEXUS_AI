/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Student, SupportAlert, InterventionRecord, AuditLogEntry, UserRole, StudentActivity } from './types/student';
import { INITIAL_STUDENTS, INITIAL_ALERTS, INITIAL_INTERVENTIONS, INITIAL_AUDIT_LOGS, INITIAL_STUDENT_ACTIVITIES } from './data/mockData';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomePage } from './components/pages/HomePage';
import { ExecutiveDashboard } from './components/pages/ExecutiveDashboard';
import { Student360Profile } from './components/pages/Student360Profile';
import { StudentEngagement } from './components/pages/StudentEngagement';
import { EarlySupportRadar } from './components/pages/EarlySupportRadar';
import { GrowthNavigator } from './components/pages/GrowthNavigator';
import { PlacementIntelligence } from './components/pages/PlacementIntelligence';
import { InterventionTracker } from './components/pages/InterventionTracker';
import { FeedbackInsights } from './components/pages/FeedbackInsights';
import { DataGovernance } from './components/pages/DataGovernance';
import { WhatIfSimulatorModal } from './components/modals/WhatIfSimulatorModal';
import { LocalDeploymentGuideModal } from './components/modals/LocalDeploymentGuideModal';
import { AiAssistantPage } from './components/pages/AiAssistantPage';
import { AiChatbotPage } from './components/pages/AiChatbotPage';
import { LoginPage } from './components/pages/LoginPage';
import { StudentStaffDatabase } from './components/pages/StudentStaffDatabase';
import { useAuth } from './firebase/AuthContext';
import { db } from './firebase/config';
import { collection, doc, setDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const { user, role: authRole, setRole: setAuthRole, isAuthenticated, loading: authLoading, userType, activeStudentId } = useAuth();

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [userRole, setUserRole] = useState<UserRole>('Faculty Advisor');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Sync authRole and userType
  useEffect(() => {
    if (authRole) {
      setUserRole(authRole);
    }
  }, [authRole]);

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    setAuthRole(newRole);
  };

  // Core Data State with localStorage persistence
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_students');
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        return parsed.map((s) => {
          if (s.id === 'ENX-2024-102') {
            return { ...s, name: 'Sneha Reddy', email: 'sneha.reddy@edunexus.edu' };
          }
          if (s.id === 'ENX-2024-103' && s.name === 'Rohan Verma') {
            return { ...s, name: 'Karan Verma', department: 'Electronics & Comm (ECE)' };
          }
          if (s.id === 'ENX-2024-104' && s.name === 'Priyansh Sharma') {
            return { ...s, name: 'Sneha Kulkarni', department: 'Information Tech (IT)' };
          }
          return s;
        });
      }
      return INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  });

  const [alerts, setAlerts] = useState<SupportAlert[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_alerts');
      if (saved) {
        const parsed: SupportAlert[] = JSON.parse(saved);
        const parsedIds = new Set(parsed.map((a) => a.id));
        const missing = INITIAL_ALERTS.filter((a) => !parsedIds.has(a.id));
        if (missing.length > 0) {
          const merged = [...parsed, ...missing];
          localStorage.setItem('edunexus_alerts', JSON.stringify(merged));
          return merged;
        }
        return parsed;
      }
      return INITIAL_ALERTS;
    } catch {
      return INITIAL_ALERTS;
    }
  });

  const [interventions, setInterventions] = useState<InterventionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_interventions');
      return saved ? JSON.parse(saved) : INITIAL_INTERVENTIONS;
    } catch {
      return INITIAL_INTERVENTIONS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_audit_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [studentActivities, setStudentActivities] = useState<StudentActivity[]>(() => {
    try {
      const saved = localStorage.getItem('edunexus_student_activities');
      if (saved) {
        const parsed: StudentActivity[] = JSON.parse(saved);
        return parsed.map((a) => {
          if (a.studentId === 'ENX-2024-102') {
            return { ...a, studentName: 'Sneha Reddy' };
          }
          return a;
        });
      }
      return INITIAL_STUDENT_ACTIVITIES;
    } catch {
      return INITIAL_STUDENT_ACTIVITIES;
    }
  });

  const [selectedStudentId, setSelectedStudentId] = useState<string>(() => {
    const cachedActive = localStorage.getItem('edunexus_active_student_id');
    const cachedType = localStorage.getItem('edunexus_user_type');
    if (cachedType === 'student' && cachedActive) {
      return cachedActive;
    }
    return 'ENX-2024-101';
  });

  // Enforce student profile isolation or staff redirection to student engagement
  useEffect(() => {
    if (userType === 'student') {
      const studentIdToLock = activeStudentId || 'ENX-2024-101';
      setSelectedStudentId(studentIdToLock);
      setUserRole('Student');

      const allowedTabs: NavTab[] = [
        'profile',
        'student-engagement',
        'placement',
        'navigator',
        'chatbot',
        'ai-assistant',
        'feedback',
      ];
      if (!allowedTabs.includes(currentTab)) {
        setCurrentTab('profile');
      }
    } else if (userType === 'staff' && currentTab === 'home') {
      setCurrentTab('student-engagement');
    }
  }, [userType, activeStudentId]);

  // Modals State
  const [isWhatIfOpen, setIsWhatIfOpen] = useState<boolean>(false);
  const [isDocsOpen, setIsDocsOpen] = useState<boolean>(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('edunexus_students', JSON.stringify(students));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_alerts', JSON.stringify(alerts));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_interventions', JSON.stringify(interventions));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [interventions]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_audit_logs', JSON.stringify(auditLogs));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem('edunexus_student_activities', JSON.stringify(studentActivities));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [studentActivities]);

  // Load activities from Backend Database on mount
  useEffect(() => {
    fetch('/api/student-engagement/activities')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.activities)) {
          setStudentActivities((prev) => {
            const map = new Map<string, StudentActivity>();
            // Seed from backend first
            data.activities.forEach((act: StudentActivity) => map.set(act.id, act));
            // Preserve any un-synced local state
            prev.forEach((p) => map.set(p.id, p));
            return Array.from(map.values());
          });
        }
      })
      .catch((err) => console.warn('Failed to load initial backend activities:', err));
  }, []);

  // Firestore Sync when user is authenticated
  useEffect(() => {
    if (!user) return;

    // Listen to interventions
    const unsubInterventions = onSnapshot(collection(db, 'interventions'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreRecords: InterventionRecord[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreRecords.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            type: d.type,
            facultyLead: d.facultyLead,
            dateScheduled: d.dateScheduled,
            dateCompleted: d.dateCompleted,
            status: d.status,
            initialScore: d.initialScore,
            postInterventionScore: d.postInterventionScore,
            initialMetricNote: d.initialMetricNote,
            measuredOutcomeNote: d.measuredOutcomeNote,
            studentFeedback: d.studentFeedback,
          });
        });

        setInterventions((prev) => {
          const map = new Map<string, InterventionRecord>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreRecords.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Interventions snapshot warning:', err);
    });

    // Listen to alerts
    const unsubAlerts = onSnapshot(collection(db, 'alerts'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreAlerts: SupportAlert[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreAlerts.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            title: d.title,
            triggerCategory: d.triggerCategory,
            priority: d.priority,
            status: d.status,
            detectedDate: d.detectedDate,
            evidence: d.evidence,
            suggestedAction: d.suggestedAction,
            assignedFaculty: d.assignedFaculty,
            facultyNotes: d.facultyNotes,
            outcomeMetric: d.outcomeMetric,
          });
        });

        setAlerts((prev) => {
          const map = new Map<string, SupportAlert>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreAlerts.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Alerts snapshot warning:', err);
    });

    // Listen to student_activities
    const unsubActivities = onSnapshot(collection(db, 'student_activities'), (snapshot) => {
      if (!snapshot.empty) {
        const firestoreActs: StudentActivity[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          firestoreActs.push({
            id: d.id || docSnap.id,
            studentId: d.studentId,
            studentName: d.studentName,
            department: d.department,
            title: d.title,
            category: d.category,
            description: d.description,
            status: d.status,
            progressPct: d.progressPct,
            hoursSpent: d.hoursSpent,
            dateLogged: d.dateLogged,
            dateCompleted: d.dateCompleted,
            verifiedByStaff: d.verifiedByStaff,
            staffFeedback: d.staffFeedback,
            learningOutcomes: d.learningOutcomes,
            semesterSubject: d.semesterSubject,
            mentorName: d.mentorName,
          });
        });

        setStudentActivities((prev) => {
          const map = new Map<string, StudentActivity>();
          prev.forEach((p) => map.set(p.id, p));
          firestoreActs.forEach((f) => map.set(f.id, f));
          return Array.from(map.values());
        });
      }
    }, (err) => {
      console.warn('Student activities snapshot warning:', err);
    });

    return () => {
      unsubInterventions();
      unsubAlerts();
      unsubActivities();
    };
  }, [user]);

  // Data update handlers
  const handleUpdateAlert = async (updated: SupportAlert) => {
    setAlerts(prev => prev.map(a => a.id === updated.id ? updated : a));
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userRole,
      role: userRole,
      action: 'Alert Status Transitioned',
      details: `Alert ${updated.id} (${updated.studentName}) marked as '${updated.status}'.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'alerts', updated.id), {
          ...updated,
          updatedAt: new Date().toISOString(),
          updatedByUid: user.uid,
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync alert to Firestore:', err);
      }
    }
  };

  const handleAddIntervention = async (record: InterventionRecord) => {
    setInterventions(prev => [record, ...prev]);
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userRole,
      role: userRole,
      action: 'Intervention Session Logged',
      details: `${record.type} scheduled for ${record.studentName} (${record.studentId}). Lead: ${record.facultyLead}.`,
    };
    setAuditLogs(prev => [newLog, ...prev]);

    // Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'interventions', record.id), {
          ...record,
          createdById: user.uid,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Could not sync intervention to Firestore:', err);
      }
    }
  };

  const handleUpdateIntervention = (record: InterventionRecord) => {
    setInterventions(prev => prev.map(i => i.id === record.id ? record : i));
  };

  const handleAddAuditLog = (log: AuditLogEntry) => {
    setAuditLogs(prev => [log, ...prev]);
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
  };

  // Student Activity Handlers
  const handleAddStudentActivity = async (activity: StudentActivity) => {
    setStudentActivities((prev) => [activity, ...prev]);
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: activity.studentName,
      role: 'Student',
      action: 'Academic Activity Planned / Logged',
      details: `${activity.studentName} (${activity.studentId}) logged: "${activity.title}" (${activity.category}) - ${activity.hoursSpent} hrs. Mentor notified: ${activity.mentorName}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    }).catch((err) => console.warn('Could not sync student activity to backend database:', err));

    // Persist to Firestore if signed in
    if (user) {
      try {
        await setDoc(doc(db, 'student_activities', activity.id), {
          ...activity,
          createdAt: new Date().toISOString(),
          createdById: user.uid,
        });
      } catch (err) {
        console.warn('Could not sync student activity to Firestore:', err);
      }
    }
  };

  const handleUpdateStudentActivity = async (updated: StudentActivity) => {
    setStudentActivities((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    const newLog: AuditLogEntry = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: userType === 'student' ? updated.studentName : userRole,
      role: userType === 'student' ? 'Student' : userRole,
      action: userType === 'student' ? 'Activity Progress Updated' : 'Staff Feedback Recorded',
      details: userType === 'student'
        ? `${updated.studentName} updated "${updated.title}" status to '${updated.status}' (${updated.progressPct}% complete). Notified staff.`
        : `Advisor recorded review for ${updated.studentName}'s "${updated.title}". Verified: ${updated.verifiedByStaff ? 'Yes' : 'Pending'}.`,
    };
    setAuditLogs((prev) => [newLog, ...prev]);

    // Persist to Backend REST Database
    fetch('/api/student-engagement/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch((err) => console.warn('Could not sync student activity update to backend database:', err));

    if (user) {
      try {
        await setDoc(doc(db, 'student_activities', updated.id), {
          ...updated,
          updatedAt: new Date().toISOString(),
          updatedByUid: user.uid,
        }, { merge: true });
      } catch (err) {
        console.warn('Could not sync student activity update to Firestore:', err);
      }
    }
  };

  const openAlertsCount = alerts.filter(a => a.status !== 'Resolved').length;
  const activeInterventionsCount = interventions.filter(i => i.status === 'Scheduled' || i.status === 'In Progress').length;

  if (!isAuthenticated && !authLoading) {
    return (
      <LoginPage
        onLoginSuccess={(studentId, type) => {
          if (type === 'student' || studentId) {
            const sid = studentId || 'ENX-2024-101';
            setSelectedStudentId(sid);
            setUserRole('Student');
            setCurrentTab('profile');
          } else {
            setCurrentTab('student-engagement');
          }
        }}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-[#070e1e] overflow-hidden text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Desktop Navy Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
          }}
          alertCount={openAlertsCount}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
        />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex flex-col w-64 bg-[#0a192f] text-slate-300">
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setMobileMenuOpen(false);
              }}
              alertCount={openAlertsCount}
              onOpenWhatIf={() => {
                setIsWhatIfOpen(true);
                setMobileMenuOpen(false);
              }}
              onOpenDocs={() => {
                setIsDocsOpen(true);
                setMobileMenuOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#f8fafc] dark:bg-[#091122] transition-colors duration-200">
        <Header
          currentTab={currentTab}
          userRole={userRole}
          onRoleChange={handleRoleChange}
          students={students}
          selectedStudentId={selectedStudentId}
          onSelectStudent={(id) => {
            if (userType === 'staff') {
              setSelectedStudentId(id);
            }
          }}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
          onOpenDocs={() => setIsDocsOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
          <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTab}
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.99 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              >
            {currentTab === 'home' && (
              <HomePage
                onNavigate={setCurrentTab}
                totalStudents={students.length}
                activeInterventionsCount={activeInterventionsCount}
                openAlertsCount={openAlertsCount}
              />
            )}

            {currentTab === 'dashboard' && (
              <ExecutiveDashboard
                students={students}
                alerts={alerts}
                interventions={interventions}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'profile' && (
              <Student360Profile
                students={students}
                currentStudentId={selectedStudentId}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onOpenWhatIf={() => setIsWhatIfOpen(true)}
                onNavigateToTab={setCurrentTab}
                userType={userType}
                alerts={alerts}
                studentActivities={studentActivities}
                onAddStudentActivity={handleAddStudentActivity}
                onUpdateStudentActivity={handleUpdateStudentActivity}
              />
            )}

            {currentTab === 'student-engagement' && (
              <StudentEngagement
                currentStudent={students.find((s) => s.id === selectedStudentId) || students[0]}
                allStudents={students}
                userType={userType}
                activities={studentActivities}
                onAddActivity={handleAddStudentActivity}
                onUpdateActivity={handleUpdateStudentActivity}
                onNavigateToTab={setCurrentTab}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
              />
            )}

            {currentTab === 'chatbot' && (
              <AiChatbotPage
                students={students}
                currentStudentId={selectedStudentId}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
              />
            )}

            {currentTab === 'ai-assistant' && (
              <AiAssistantPage
                students={students}
                currentStudentId={selectedStudentId}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'radar' && (
              <EarlySupportRadar
                alerts={alerts}
                onUpdateAlert={handleUpdateAlert}
                onSelectStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('profile');
                }}
                onNavigateToInterventionWithStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('interventions');
                }}
              />
            )}

            {currentTab === 'navigator' && (
              <GrowthNavigator
                students={students}
                currentStudentId={selectedStudentId}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
                userType={userType}
              />
            )}

            {currentTab === 'placement' && (
              <PlacementIntelligence
                students={students}
                currentStudentId={selectedStudentId}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
                onNavigateToTab={setCurrentTab}
              />
            )}

            {currentTab === 'interventions' && (
              <InterventionTracker
                interventions={interventions}
                students={students}
                onAddIntervention={handleAddIntervention}
                onUpdateIntervention={handleUpdateIntervention}
                onSelectStudent={(id) => {
                  setSelectedStudentId(id);
                  setCurrentTab('profile');
                }}
                initialSelectedStudentId={selectedStudentId}
              />
            )}

            {currentTab === 'feedback' && (
              <FeedbackInsights
                students={students}
                userRole={userRole}
                onSelectStudent={(id) => {
                  if (userType === 'staff') {
                    setSelectedStudentId(id);
                  }
                }}
              />
            )}

            {currentTab === 'governance' && (
              <DataGovernance
                students={students}
                auditLogs={auditLogs}
                userRole={userRole}
                onImportStudents={handleImportStudents}
                onAddAuditLog={handleAddAuditLog}
              />
            )}
            {currentTab === 'database' && (
              <StudentStaffDatabase />
            )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        students={students}
        currentStudentId={selectedStudentId}
        onSelectStudent={(id) => {
          if (userType === 'staff') {
            setSelectedStudentId(id);
          }
        }}
      />

      <LocalDeploymentGuideModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />
    </div>
  );
}
