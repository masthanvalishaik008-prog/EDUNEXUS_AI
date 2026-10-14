import React, { useState } from 'react';
import { Student } from '../../types/student';
import { CAREER_PATHWAYS_DATA } from '../../data/mockData';
import { BarChart } from '../charts/BarChart';
import {
  Briefcase,
  CheckCircle2,
  FolderGit2,
  BookOpen,
  Award,
  Cpu,
  Terminal,
  Activity,
  Layers,
  Search,
  ExternalLink,
  Sparkles,
  TrendingUp,
  Target
} from 'lucide-react';

interface PlacementIntelligenceProps {
  students: Student[];
  currentStudentId: string;
  onSelectStudent: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
}

export function PlacementIntelligence({
  students,
  currentStudentId,
  onSelectStudent,
  onNavigateToTab,
}: PlacementIntelligenceProps) {
  const [selectedPathwayId, setSelectedPathwayId] = useState<string>('embedded-iot');
  const student = students.find((s) => s.id === currentStudentId) || students[0];

  const activePathway =
    CAREER_PATHWAYS_DATA.find((p) => p.id === selectedPathwayId) || CAREER_PATHWAYS_DATA[0];

  // Evaluate student fit for active pathway
  const codingGap = Math.max(0, activePathway.benchmarkCodingScore - student.placement.codingScore);
  const aptitudeGap = Math.max(0, activePathway.benchmarkAptitudeScore - student.placement.aptitudeScore);
  const isTargetFit = student.placement.preferredDomain === activePathway.name;

  const pathwaySkillBars = [
    {
      label: 'Coding',
      value: student.placement.codingScore,
      highlight: student.placement.codingScore >= activePathway.benchmarkCodingScore,
      color: 'bg-blue-600',
    },
    {
      label: 'Aptitude',
      value: student.placement.aptitudeScore,
      highlight: student.placement.aptitudeScore >= activePathway.benchmarkAptitudeScore,
      color: 'bg-emerald-600',
    },
    {
      label: 'Mock (x10)',
      value: Math.round(student.placement.mockInterviewRating * 10),
      highlight: true,
      color: 'bg-purple-600',
    },
    {
      label: 'Technical',
      value: student.skills.technicalSkillRating,
      highlight: true,
      color: 'bg-cyan-600',
    },
    {
      label: 'Soft Skills',
      value: student.skills.softSkillRating,
      highlight: true,
      color: 'bg-teal-600',
    },
  ];

  const pathwayColorThemes: Record<string, { border: string; bg: string; badge: string; iconColor: string }> = {
    'embedded-iot': {
      border: 'border-blue-300 ring-blue-500',
      bg: 'bg-gradient-to-br from-blue-50/80 to-indigo-50/60',
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      iconColor: 'text-blue-600',
    },
    'software-dev': {
      border: 'border-purple-300 ring-purple-500',
      bg: 'bg-gradient-to-br from-purple-50/80 to-pink-50/60',
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      iconColor: 'text-purple-600',
    },
    'data-analytics': {
      border: 'border-emerald-300 ring-emerald-500',
      bg: 'bg-gradient-to-br from-emerald-50/80 to-teal-50/60',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconColor: 'text-emerald-600',
    },
    'electronics-testing': {
      border: 'border-amber-300 ring-amber-500',
      bg: 'bg-gradient-to-br from-amber-50/80 to-orange-50/60',
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      iconColor: 'text-amber-600',
    },
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Banner with Gradient & Candidate Dropdown */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-blue-900/10 border border-purple-200/90 rounded-3xl p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-300 w-fit mb-2 shadow-xs">
            <Briefcase className="w-3.5 h-3.5 text-purple-600" />
            <span>Placement Career Pathways & Benchmark Intelligence</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Industry Alignment & Placement Trajectories
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Benchmarking student competencies against four core corporate recruitment sectors
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-bold hidden sm:inline">Active Candidate:</span>
          <select
            value={student.id}
            onChange={(e) => onSelectStudent(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none shadow-xs cursor-pointer"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4 Career Pathway Tabs with Rich Thematic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {CAREER_PATHWAYS_DATA.map((pathway) => {
          const isSelected = pathway.id === selectedPathwayId;
          const isStudentPref = student.placement.preferredDomain === pathway.name;
          const theme = pathwayColorThemes[pathway.id] || pathwayColorThemes['embedded-iot'];

          return (
            <div
              key={pathway.id}
              onClick={() => setSelectedPathwayId(pathway.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-xs ${
                isSelected
                  ? `${theme.bg} ${theme.border} ring-2 shadow-md`
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                  {pathway.badge}
                </span>
                {isStudentPref && (
                  <span className="text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full shadow-xs">
                    Target Track
                  </span>
                )}
              </div>
              <h3 className="text-sm font-extrabold text-slate-900">{pathway.name}</h3>
              <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                {pathway.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Pathway Deep Dive & Student Fit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pathway Details */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">{activePathway.name}</h3>
              <span className="text-xs text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md font-mono font-bold border border-purple-200">
                Code: {activePathway.id}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{activePathway.description}</p>
          </div>

          {/* Target Job Roles */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-purple-600" />
              <span>Target Corporate Recruitment Profiles:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePathway.targetRoles.map((role, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-purple-50 text-purple-900 px-3 py-1 rounded-lg font-semibold border border-purple-200"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          {/* Core Curriculum Requirements */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Prerequisite Technical Competencies:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {activePathway.coreSubjects.map((subj, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100"
                >
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="font-medium">{subj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Capstone Projects */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <FolderGit2 className="w-4 h-4 text-emerald-600" />
              <span>Recommended Portfolio Capstone Projects:</span>
            </div>
            <div className="space-y-2">
              {activePathway.recommendedProjects.map((proj, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl text-xs flex items-start gap-3"
                >
                  <FolderGit2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">{proj}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Production-grade architecture, hardware schematics, unit test suites, and documentation.
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Certifications */}
          <div>
            <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-teal-600" />
              <span>Recommended Industry Certifications:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activePathway.recommendedCertifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-semibold"
                >
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Candidate Benchmark Comparison with High Visual Contrast */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-xs flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Candidate Benchmark Fit</h3>
                <p className="text-xs text-slate-500">Comparing skill levels against minimum corporate cutoffs</p>
              </div>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                {student.name}
              </span>
            </div>

            <BarChart data={pathwaySkillBars} maxValue={100} unit="%" height={180} />

            <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">Benchmark Coding Score:</span>
                <span className="font-mono font-bold text-slate-900">{activePathway.benchmarkCodingScore}%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                <span className="font-bold text-slate-800">Candidate Coding Score:</span>
                <span
                  className={`font-mono font-bold ${
                    student.placement.codingScore >= activePathway.benchmarkCodingScore
                      ? 'text-emerald-700'
                      : 'text-rose-600'
                  }`}
                >
                  {student.placement.codingScore}% {codingGap > 0 ? `(-${codingGap}% gap)` : '(Qualified)'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-700">Benchmark Aptitude Score:</span>
                <span className="font-mono font-bold text-slate-900">{activePathway.benchmarkAptitudeScore}%</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                <span className="font-bold text-slate-800">Candidate Aptitude Score:</span>
                <span
                  className={`font-mono font-bold ${
                    student.placement.aptitudeScore >= activePathway.benchmarkAptitudeScore
                      ? 'text-emerald-700'
                      : 'text-amber-700'
                  }`}
                >
                  {student.placement.aptitudeScore}% {aptitudeGap > 0 ? `(-${aptitudeGap}% gap)` : '(Qualified)'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-200/80 text-xs shadow-xs">
            <div className="font-bold text-blue-950 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Advisory Placement Verdict:</span>
            </div>
            <p className="text-slate-700 text-xs leading-relaxed">
              {codingGap === 0 && aptitudeGap === 0
                ? `${student.name} meets all benchmark requirements for ${activePathway.name}. Ready for campus recruitments, technical hackathons, and company interviews.`
                : `${student.name} requires sprint training in ${codingGap > 0 ? 'competitive coding' : ''} ${
                    aptitudeGap > 0 ? 'and timed aptitude drills' : ''
                  } to cross campus placement cutoff criteria.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
