import React, { useState } from 'react';
import { SupportAlert, AlertPriority, InterventionStatus } from '../../types/student';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  Filter,
  Info,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  FileText,
  Flame,
  Activity,
  Layers
} from 'lucide-react';

interface EarlySupportRadarProps {
  alerts: SupportAlert[];
  onUpdateAlert: (updated: SupportAlert) => void;
  onSelectStudent: (studentId: string) => void;
  onNavigateToInterventionWithStudent?: (studentId: string) => void;
}

export function EarlySupportRadar({
  alerts,
  onUpdateAlert,
  onSelectStudent,
  onNavigateToInterventionWithStudent,
}: EarlySupportRadarProps) {
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [activeReviewAlert, setActiveReviewAlert] = useState<SupportAlert | null>(null);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<InterventionStatus>('In Review');

  const openReviewModal = (alert: SupportAlert) => {
    setActiveReviewAlert(alert);
    setReviewNotes(alert.facultyNotes || '');
    setReviewStatus(alert.status);
  };

  const handleSaveReview = () => {
    if (!activeReviewAlert) return;
    const updated: SupportAlert = {
      ...activeReviewAlert,
      facultyNotes: reviewNotes,
      status: reviewStatus,
    };
    onUpdateAlert(updated);
    setActiveReviewAlert(null);
  };

  const filteredAlerts = alerts.filter((a) => {
    const matchPriority = priorityFilter === 'All' || a.priority === priorityFilter;
    const matchCategory = categoryFilter === 'All' || a.triggerCategory === categoryFilter;
    return matchPriority && matchCategory;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Ethical Safeguard Banner with Vibrant Blue Accent */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-blue-50/30 border border-blue-200/90 rounded-2xl p-5 flex items-start gap-3.5 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-blue-500/25">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs text-blue-900 leading-relaxed">
          <div className="font-extrabold flex items-center gap-2 text-sm text-blue-950">
            <span>Ethical Safeguard & Non-Punitive Early Radar Protocol</span>
            <span className="text-[10px] font-mono font-bold bg-blue-200/80 text-blue-900 px-2.5 py-0.5 rounded-full border border-blue-300">
              Human-in-the-Loop Verified
            </span>
          </div>
          <p className="mt-1 text-blue-800 text-xs leading-relaxed">
            EduNexus AI flags are formative diagnostic prompts designed to initiate mentorship, remedial coaching, and academic flexibility. <strong>Under no circumstances are these indicators used to automatically exclude, penalize, or de-register scholars.</strong> All support measures require faculty human review.
          </p>
        </div>
      </div>

      {/* Early Support Radar Summary KPI Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Total Flagged Members</span>
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {alerts.length} <span className="text-xs font-semibold text-slate-500">Members</span>
          </div>
          <div className="text-[11px] text-blue-700 font-medium mt-0.5">Active Monitored Signals</div>
        </div>

        <div className="bg-white border border-rose-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-rose-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Urgent Priority</span>
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-700">
            {alerts.filter(a => a.priority === 'Urgent').length} <span className="text-xs font-semibold text-rose-600">Member</span>
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-0.5">Immediate Academic Review</div>
        </div>

        <div className="bg-white border border-amber-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-amber-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">High Priority</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-amber-700">
            {alerts.filter(a => a.priority === 'High').length} <span className="text-xs font-semibold text-amber-600">Member</span>
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">Attendance Drift Advisory</div>
        </div>

        <div className="bg-white border border-indigo-200/90 rounded-2xl p-4 shadow-xs relative overflow-hidden bg-gradient-to-br from-white to-indigo-50/20">
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-800">Medium & Low</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-indigo-700">
            {alerts.filter(a => a.priority === 'Medium' || a.priority === 'Low').length} <span className="text-xs font-semibold text-indigo-600">Members</span>
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-0.5">Skills & LMS Booster</div>
        </div>
      </div>

      {/* Filter and Control Strip */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Filter Active Radar Signals:</span>
              <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                Showing {filteredAlerts.length} of {alerts.length} Flagged Members
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Filter by priority urgency or trigger domain</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Priorities ({alerts.length} Members)</option>
              <option value="Urgent">Urgent ({alerts.filter(a => a.priority === 'Urgent').length})</option>
              <option value="High">High ({alerts.filter(a => a.priority === 'High').length})</option>
              <option value="Medium">Medium ({alerts.filter(a => a.priority === 'Medium').length})</option>
              <option value="Low">Low ({alerts.filter(a => a.priority === 'Low').length})</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Domain:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="All">All Categories ({alerts.length})</option>
              <option value="Compound">Compound Multi-Pillar ({alerts.filter(a => a.triggerCategory === 'Compound').length})</option>
              <option value="Attendance">Attendance Drift ({alerts.filter(a => a.triggerCategory === 'Attendance').length})</option>
              <option value="Academic">Academic / Backlog ({alerts.filter(a => a.triggerCategory === 'Academic').length})</option>
              <option value="LMS">LMS Engagement ({alerts.filter(a => a.triggerCategory === 'LMS').length})</option>
              <option value="Placement">Placement Preparation ({alerts.filter(a => a.triggerCategory === 'Placement').length})</option>
            </select>
          </div>

          {(priorityFilter !== 'All' || categoryFilter !== 'All') && (
            <button
              onClick={() => {
                setPriorityFilter('All');
                setCategoryFilter('All');
              }}
              className="px-2.5 py-1 text-xs text-blue-600 hover:text-white hover:bg-blue-600 font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 text-xs shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-900 text-base">No Active Alerts In This View</div>
            <p className="mt-1 text-slate-500">All flagged students under this criteria have been addressed or resolved.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isUrgent = alert.priority === 'Urgent';
            const isHigh = alert.priority === 'High';
            const cardBorder = isUrgent
              ? 'border-rose-200 bg-white hover:border-rose-400'
              : isHigh
              ? 'border-amber-200 bg-white hover:border-amber-400'
              : 'border-slate-200 bg-white hover:border-blue-400';

            const topBar = isUrgent
              ? 'bg-rose-500'
              : isHigh
              ? 'bg-amber-500'
              : 'bg-blue-600';

            return (
              <div
                key={alert.id}
                className={`border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all relative overflow-hidden ${cardBorder}`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 ${topBar}`} />
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-xs ${
                          isUrgent
                            ? 'bg-rose-100 text-rose-800 border-rose-300'
                            : isHigh
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {alert.priority} Priority
                      </span>
                      <span className="text-xs font-mono text-slate-500 font-semibold">{alert.id}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded">
                        {alert.triggerCategory} Signal
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1.5 flex items-center gap-2">
                      <span>{alert.title}</span>
                      <span className="text-slate-400 font-normal">—</span>
                      <button
                        onClick={() => onSelectStudent(alert.studentId)}
                        className="text-blue-600 hover:text-blue-800 font-extrabold hover:underline cursor-pointer"
                      >
                        {alert.studentName} ({alert.studentId})
                      </button>
                    </h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {alert.department} · Lead Advisor: <strong className="text-slate-700">{alert.assignedFaculty}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold border ${
                        alert.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : alert.status === 'Session Scheduled' || alert.status === 'Action Plan Active'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}
                    >
                      {alert.status}
                    </span>

                    <button
                      onClick={() => openReviewModal(alert)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Review & Take Action
                    </button>
                  </div>
                </div>

                {/* Evidence & Suggested Action Strips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 p-3.5 bg-white/90 rounded-xl text-xs border border-slate-200/80 shadow-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Info className="w-4 h-4 text-blue-600" />
                      <span>Underlying Evidence (Transparent Reason)</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{alert.evidence}</p>
                  </div>

                  <div>
                    <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Suggested Support Recommendation</span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed">{alert.suggestedAction}</p>
                  </div>
                </div>

                {alert.facultyNotes && (
                  <div className="mt-3 text-xs bg-amber-50/80 border border-amber-200 p-3 rounded-xl text-amber-900 font-medium">
                    <span className="font-bold">Faculty Review Notes:</span> {alert.facultyNotes}
                  </div>
                )}

                {alert.outcomeMetric && (
                  <div className="mt-2 text-[11px] font-mono text-slate-500 font-medium">
                    Target Recovery Metric: <strong className="text-slate-700">{alert.outcomeMetric}</strong>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Faculty Review Modal */}
      {activeReviewAlert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">Faculty Support Alert Review</h3>
                <p className="text-xs text-slate-500">
                  {activeReviewAlert.studentName} ({activeReviewAlert.studentId}) · {activeReviewAlert.department}
                </p>
              </div>
              <button
                onClick={() => setActiveReviewAlert(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Alert Title:</span> {activeReviewAlert.title}
                <div className="text-slate-600 mt-1">{activeReviewAlert.evidence}</div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Update Follow-up Status:</label>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as InterventionStatus)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="New">New (Pending Review)</option>
                  <option value="In Review">In Review (Discussing with Mentor)</option>
                  <option value="Session Scheduled">Session Scheduled (Meeting Booked)</option>
                  <option value="Action Plan Active">Action Plan Active (Remedial in Progress)</option>
                  <option value="Resolved">Resolved (Milestone Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Faculty Confidential Observations & Remedial Plan:
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Enter mentor discussion notes, remedial topics assigned, or parental communication logs..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {onNavigateToInterventionWithStudent && (
                <button
                  type="button"
                  onClick={() => {
                    const sid = activeReviewAlert.studentId;
                    setActiveReviewAlert(null);
                    onNavigateToInterventionWithStudent(sid);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Schedule Formal Mentoring Log →
                </button>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setActiveReviewAlert(null)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Save Review
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
