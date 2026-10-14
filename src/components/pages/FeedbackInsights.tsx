import React, { useState } from 'react';
import { Student, UserRole } from '../../types/student';
import { BarChart } from '../charts/BarChart';
import {
  MessageSquareQuote,
  Shield,
  Eye,
  EyeOff,
  ThumbsUp,
  AlertCircle,
  Sparkles,
  HelpCircle,
  Building2,
  BookOpen,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface FeedbackInsightsProps {
  students: Student[];
  userRole: UserRole;
  onSelectStudent: (id: string) => void;
}

export function FeedbackInsights({
  students,
  userRole,
  onSelectStudent,
}: FeedbackInsightsProps) {
  const [anonymizeMode, setAnonymizeMode] = useState<boolean>(true);

  // Aggregate satisfaction
  const veryHighCount = students.filter((s) => s.feedback.satisfactionLevel === 'Very High').length;
  const highCount = students.filter((s) => s.feedback.satisfactionLevel === 'High').length;
  const moderateCount = students.filter((s) => s.feedback.satisfactionLevel === 'Moderate').length;
  const lowCount = students.filter((s) => s.feedback.satisfactionLevel === 'Low').length;

  const satisfactionData = [
    { label: 'Very High', value: veryHighCount, color: 'bg-emerald-500' },
    { label: 'High', value: highCount, color: 'bg-blue-600' },
    { label: 'Moderate', value: moderateCount, color: 'bg-amber-500' },
    { label: 'Support Needed', value: lowCount, color: 'bg-rose-500' },
  ];

  // Thematic clustering of feedback concerns with rich colors
  const feedbackThemes = [
    {
      id: 'lab-infra',
      title: 'Lab Hardware & Equipment Access',
      count: 14,
      sentiment: 'Operational Needs',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
      cardColor: 'border-blue-200/90 bg-gradient-to-br from-white to-blue-50/60',
      description: 'Scholars request extended hours in microelectronics & IoT hardware labs before project review milestones.',
      recommendedAction: 'Extend lab facility operating window until 8:00 PM during project evaluation sprints.',
    },
    {
      id: 'curriculum-pace',
      title: 'Pacing of Mathematical & Core Subjects',
      count: 19,
      sentiment: 'Cognitive Load',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      cardColor: 'border-amber-200/90 bg-gradient-to-br from-white to-amber-50/60',
      description: 'Digital Signal Processing and Power Systems theoretical pacing reported as requiring deeper numerical drills.',
      recommendedAction: 'Schedule weekly peer TA problem-solving clinics and recorded micro-lectures.',
    },
    {
      id: 'placement-prep',
      title: 'Industry Mock Screening Frequency',
      count: 22,
      sentiment: 'High Priority',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      cardColor: 'border-purple-200/90 bg-gradient-to-br from-white to-purple-50/60',
      description: 'High student demand for more 1-on-1 alumni technical mock interviews and resume reviews.',
      recommendedAction: 'Initiate Saturday Alumni Placement Sprint with corporate recruitment mentors.',
    },
    {
      id: 'assessment-spread',
      title: 'Internal Assessment Clustered Deadlines',
      count: 11,
      sentiment: 'Wellbeing Focus',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      cardColor: 'border-rose-200/90 bg-gradient-to-br from-white to-rose-50/60',
      description: 'Overlap of 3 internal tests and 2 lab submissions in the same 48-hour exam period.',
      recommendedAction: 'Implement centralized academic test staggered scheduling calendar.',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/10 via-orange-900/5 to-yellow-900/10 border border-amber-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 w-fit mb-2 shadow-xs">
            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600" />
            <span>Student Voice & Wellness Pulse Telemetry</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Feedback Insights & Pulse Analytics
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Holistic qualitative sentiment analysis paired with strict confidentiality protections
          </p>
        </div>

        {/* Anonymity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-300 shadow-xs">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">Privacy Anonymization:</span>
            <button
              onClick={() => setAnonymizeMode(!anonymizeMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                anonymizeMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
              }`}
            >
              {anonymizeMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{anonymizeMode ? 'Anonymized (Protected)' : 'Identified View'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 1: Satisfaction Distribution & Pulse Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Satisfaction Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of campus pulse sentiment</p>
            </div>
            <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
              N={students.length} Scholars
            </span>
          </div>

          <BarChart
            data={satisfactionData}
            maxValue={Math.max(...satisfactionData.map((d) => d.value), 5)}
            unit=" scholars"
            height={180}
          />
        </div>

        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Key Qualitative Pulse Indicators</h3>
              <span className="text-xs font-mono text-slate-400">Scale: 1.0 - 5.0</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Faculty Mentorship Rating</div>
                  <div className="text-[11px] text-slate-500">Academic responsiveness and lab support</div>
                </div>
                <div className="text-xl font-black font-mono text-emerald-700">4.3 / 5.0</div>
              </div>

              <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Student Wellbeing / Course Pace</div>
                  <div className="text-[11px] text-slate-500">Workload balance, mental wellness, and clarity</div>
                </div>
                <div className="text-xl font-black font-mono text-blue-700">3.8 / 5.0</div>
              </div>

              <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">Placement Preparation Confidence</div>
                  <div className="text-[11px] text-slate-500">Confidence for upcoming corporate interviews</div>
                </div>
                <div className="text-xl font-black font-mono text-purple-700">3.9 / 5.0</div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Aggregated from bi-weekly student pulse check-ins and mid-semester reviews.</span>
          </div>
        </div>
      </div>

      {/* Row 2: Clustered Thematic Feedback */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">
            Synthesized Thematic Feedback & Institutional Action Items
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Natural language thematic extraction from student survey open fields
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {feedbackThemes.map((theme) => (
            <div
              key={theme.id}
              className={`p-5 rounded-2xl border ${theme.cardColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-900">{theme.title}</span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${theme.badgeColor}`}
                  >
                    {theme.count} mentions
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{theme.description}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/90 border border-slate-200/80 text-xs text-slate-800 shadow-xs">
                <span className="font-bold text-emerald-800">Action Plan:</span> {theme.recommendedAction}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Granular Feedback Entries (With Anonymity Enforcement) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900">Student Pulse Observations</h3>
            <p className="text-xs text-slate-500">
              {anonymizeMode
                ? 'Student identity anonymized to protect candid self-reporting.'
                : 'Identified view active for authorized advisors.'}
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {students.length} Observations
          </span>
        </div>

        <div className="space-y-3">
          {students.map((st) => (
            <div key={st.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 text-xs shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">
                    {anonymizeMode ? `Scholar [${st.id.slice(0, 5)}***]` : st.name}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500">{st.department}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    st.feedback.satisfactionLevel === 'Very High' || st.feedback.satisfactionLevel === 'High'
                      ? 'bg-emerald-100 text-emerald-800'
                      : st.feedback.satisfactionLevel === 'Moderate'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {st.feedback.satisfactionLevel}
                </span>
              </div>
              <p className="text-slate-700 mt-1">
                <strong className="text-slate-900">Recorded Concern:</strong> {st.feedback.primaryConcernArea}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
