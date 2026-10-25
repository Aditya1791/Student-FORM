import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Database,
  FileSpreadsheet,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
} from 'lucide-react';

export interface UserSession {
  name: string;
  email: string;
  role: string;
  provider: 'sso' | 'institutional';
  connectedDatabase: string;
  consentGiven: boolean;
  signedInAt: string;
}

interface LoginPageProps {
  onLogin: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('admin@university.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [consentGranted, setConsentGranted] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Video showcase state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [progress, setProgress] = useState(25);

  const chapters = [
    { id: 0, title: '01 Overview', time: '0:00' },
    { id: 1, title: '02 CRUD & Details', time: '0:22' },
    { id: 2, title: '03 Recharts GPA', time: '0:45' },
    { id: 3, title: '04 Excel Sync', time: '1:05' },
  ];

  // Video timer simulation
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        const next = prev + 1;
        if (next < 25) setCurrentChapter(0);
        else if (next < 50) setCurrentChapter(1);
        else if (next < 75) setCurrentChapter(2);
        else setCurrentChapter(3);
        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleSsoSignIn = () => {
    if (!consentGranted) {
      setError('Please provide consent to connect the Institutional Database.');
      return;
    }

    onLogin({
      name: 'Academic Administrator',
      email: email || 'admin@university.edu',
      role: 'Chief Registrar & Academic Administrator',
      provider: 'sso',
      connectedDatabase: 'Institutional Central Database',
      consentGiven: true,
      signedInAt: new Date().toISOString(),
    });
  };

  const handleInstitutionalSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentGranted) {
      setError('Please provide consent to connect the Institutional Database.');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid institutional email.');
      return;
    }

    onLogin({
      name: email.split('@')[0].replace(/[._]/g, ' '),
      email,
      role: 'Academic Department Admin',
      provider: 'institutional',
      connectedDatabase: 'Institutional Central Database',
      consentGiven: true,
      signedInAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A] flex flex-col font-sans relative selection:bg-[#6D28D9] selection:text-white">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-noise opacity-[0.02] pointer-events-none z-50" />

      {/* Variation 18 Header */}
      <header className="h-[72px] border-b border-[#E2E8F0] flex items-center justify-between px-6 sm:px-10 bg-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="font-serif-cormorant text-2xl sm:text-[1.75rem] font-semibold text-[#0F172A] tracking-tight">
          S.M. System
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          <div className="font-mono-geist text-[11px] uppercase tracking-[0.1em] text-[#64748B] hidden sm:block">
            Network: Encrypted
          </div>
          <div className="font-mono-geist text-[11px] uppercase tracking-[0.1em] text-[#64748B] hidden md:block">
            Server: G-Cloud-DB
          </div>
          <div className="px-3 py-1 bg-[#F5F3FF] text-[#6D28D9] rounded-full text-[11px] font-semibold font-mono-geist tracking-wide border border-[#EDE9FE]">
            ADMIN ACCESS
          </div>
        </div>
      </header>

      {/* Main Layout: 3 Columns matching Variation 18 */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[300px_1fr_380px] xl:grid-cols-[320px_1fr_400px] border-b border-[#E2E8F0]">
        {/* Left Column: Architecture Overview */}
        <aside className="p-6 sm:p-8 xl:p-10 border-b lg:border-b-0 lg:border-r border-[#E2E8F0] bg-white flex flex-col justify-between">
          <div>
            <div className="font-mono-geist text-[11px] uppercase tracking-[0.12em] text-[#64748B] mb-6">
              Architecture Overview
            </div>

            <ul className="space-y-4">
              <li className="pb-3 border-b border-[#E2E8F0] flex items-start justify-between gap-3 group">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6D28D9] transition-colors">
                    Comprehensive CRUD
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">Direct student record mutations.</p>
                </div>
                <span className="font-mono-geist text-xs text-[#94A3B8]">01</span>
              </li>

              <li className="pb-3 border-b border-[#E2E8F0] flex items-start justify-between gap-3 group">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6D28D9] transition-colors">
                    Excel Syncing
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">Bulk import/export workbook automation.</p>
                </div>
                <span className="font-mono-geist text-xs text-[#94A3B8]">02</span>
              </li>

              <li className="pb-3 border-b border-[#E2E8F0] flex items-start justify-between gap-3 group">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6D28D9] transition-colors">
                    Recharts Analytics
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">Visual data layers & cohort trends.</p>
                </div>
                <span className="font-mono-geist text-xs text-[#94A3B8]">03</span>
              </li>

              <li className="pb-3 border-b border-[#E2E8F0] flex items-start justify-between gap-3 group">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6D28D9] transition-colors">
                    Connected Database
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">Central DB persistence & security.</p>
                </div>
                <span className="font-mono-geist text-xs text-[#94A3B8]">04</span>
              </li>

              <li className="pb-3 border-b border-[#E2E8F0] flex items-start justify-between gap-3 group">
                <div>
                  <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#6D28D9] transition-colors">
                    Daily Attendance
                  </h4>
                  <p className="text-xs text-[#64748B] mt-1">Individual percentage tracking & logs.</p>
                </div>
                <span className="font-mono-geist text-xs text-[#94A3B8]">05</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#E2E8F0] text-xs text-[#64748B]">
            <div className="font-mono-geist text-[10px] uppercase text-[#94A3B8]">Backend Engine</div>
            <div className="font-semibold text-[#0F172A] mt-0.5">Express + REST API Engine</div>
          </div>
        </aside>

        {/* Center Column: Editorial Hero & Interactive Video Walkthrough */}
        <section className="bg-[#F8FAFC] p-6 sm:p-10 xl:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-[#E2E8F0] space-y-8">
          <div>
            <h1 className="font-serif-cormorant text-4xl sm:text-5xl xl:text-6xl font-normal leading-[1.08] text-[#0F172A] mb-4">
              University records, <br />
              <em className="italic font-normal text-[#6D28D9]">beautifully</em> refined.
            </h1>
            <p className="text-[#475569] leading-relaxed text-sm sm:text-base max-w-xl">
              Experience end-to-end management of university student records. Perform full CRUD operations,
              track GPA distributions with live Recharts analytics, and sync bulk spreadsheets effortlessly.
            </p>
          </div>

          {/* Interactive Walkthrough Video Simulator in Light Mode */}
          <div className="rounded-xl overflow-hidden border border-[#E2E8F0] bg-white shadow-lg">
            {/* Light Mode Window Header */}
            <div className="h-10 px-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
                <div className="h-4 w-px bg-[#CBD5E1] mx-1" />
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono-geist text-[11px] font-semibold text-[#0F172A] tracking-wider">
                    SYSTEM SIMULATOR
                  </span>
                </div>
              </div>

              <span className="font-mono-geist text-[10px] font-semibold text-[#6D28D9] bg-[#F5F3FF] px-2.5 py-0.5 rounded border border-[#EDE9FE]">
                {chapters[currentChapter].title}
              </span>
            </div>

            {/* Video Screen Content - Light Mode Canvas */}
            <div className="p-5 bg-gradient-to-b from-[#F8FAFC] to-white aspect-[16/10] sm:aspect-video flex flex-col justify-between">
              {/* Dynamic Content Preview */}
              <div className="my-auto py-2">
                {currentChapter === 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#64748B]">
                      <span className="font-mono-geist text-[10px] uppercase font-semibold">Cohort Performance Telemetry</span>
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Live Database Synced
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center font-mono-geist text-[10px]">
                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="text-[#64748B] text-[9px]">ENROLLED</div>
                        <div className="text-base font-bold text-[#0F172A] mt-0.5">8</div>
                        <div className="text-[9px] text-[#64748B] mt-0.5">Students</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="text-[#64748B] text-[9px]">AVG GPA</div>
                        <div className="text-base font-bold text-[#6D28D9] mt-0.5">3.49</div>
                        <div className="text-[9px] text-[#64748B] mt-0.5">/ 4.00 Scale</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="text-[#64748B] text-[9px]">HONORS</div>
                        <div className="text-base font-bold text-emerald-600 mt-0.5">6</div>
                        <div className="text-[9px] text-emerald-700 mt-0.5">75% Ratio</div>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-[#E2E8F0] shadow-xs">
                        <div className="text-[#64748B] text-[9px]">ATTENDANCE</div>
                        <div className="text-base font-bold text-[#0F172A] mt-0.5">93%</div>
                        <div className="text-[9px] text-[#64748B] mt-0.5">Satisfactory</div>
                      </div>
                    </div>
                  </div>
                )}

                {currentChapter === 1 && (
                  <div className="p-4 bg-white rounded-lg border border-[#E2E8F0] shadow-xs font-mono-geist text-xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[#64748B] uppercase text-[10px]">CRUD Operation Log</span>
                      <span className="text-[#6D28D9] font-bold text-[10px]">02 CRUD & Details</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">POST</span>
                      <span className="text-[#475569]">/api/students &rarr; CS-2026-007 (Zara Khan) Created</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <span className="px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[10px] font-bold">PUT</span>
                      <span className="text-[#475569]">/api/students/std_01 &rarr; GPA Updated to 3.98</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#0F172A]">
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">GET</span>
                      <span className="text-[#475569]">/api/students &rarr; 8 Active Records Synchronized</span>
                    </div>
                  </div>
                )}

                {currentChapter === 2 && (
                  <div className="p-4 bg-white rounded-lg border border-[#E2E8F0] shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono-geist text-[10px] uppercase font-semibold text-[#64748B]">
                        Recharts GPA Distribution
                      </span>
                      <span className="text-xs font-semibold text-[#6D28D9]">Modal Bracket: 3.50 - 3.69</span>
                    </div>
                    <div className="h-20 flex items-end justify-around gap-3 font-mono-geist text-[10px] pt-2 border-b border-slate-200">
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">1</div>
                        <div className="w-10 bg-rose-500 rounded-t h-8" />
                        <span className="text-[9px] text-[#64748B]">&lt;2.5</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">1</div>
                        <div className="w-10 bg-amber-500 rounded-t h-8" />
                        <span className="text-[9px] text-[#64748B]">2.5-3.0</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">0</div>
                        <div className="w-10 bg-slate-200 rounded-t h-1" />
                        <span className="text-[9px] text-[#64748B]">3.0-3.5</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">2</div>
                        <div className="w-10 bg-indigo-500 rounded-t h-16" />
                        <span className="text-[9px] text-[#64748B]">3.5-3.7</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">2</div>
                        <div className="w-10 bg-[#6D28D9] rounded-t h-16" />
                        <span className="text-[9px] text-[#64748B]">3.7-3.9</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] text-slate-500 font-bold">2</div>
                        <div className="w-10 bg-emerald-500 rounded-t h-16" />
                        <span className="text-[9px] text-[#64748B]">3.9-4.0</span>
                      </div>
                    </div>
                  </div>
                )}

                {currentChapter === 3 && (
                  <div className="grid grid-cols-2 gap-3 font-mono-geist text-xs">
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950">
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-800 font-bold text-[11px]">.XLSX IMPORT</span>
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-[10px] text-emerald-700 mt-1 leading-relaxed">
                        Drag-and-drop roster parsing, validation, and automated batch enrollment.
                      </p>
                    </div>
                    <div className="p-3.5 bg-violet-50/70 border border-violet-200 rounded-lg text-violet-950">
                      <div className="flex items-center justify-between">
                        <span className="text-[#6D28D9] font-bold text-[11px]">.XLSX EXPORT</span>
                        <FileSpreadsheet className="w-4 h-4 text-[#6D28D9]" />
                      </div>
                      <p className="text-[10px] text-[#6D28D9] mt-1 leading-relaxed">
                        One-click multi-sheet workbook generation with student directory and stats.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Light Mode Scrubber and Video Controls Bar */}
              <div className="bg-white rounded-lg p-2.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 text-[#0F172A] hover:bg-slate-100 rounded transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <span className="font-mono-geist text-[11px] text-[#64748B]">
                    {Math.floor((progress * 0.9) / 60)}:{(Math.floor(progress * 0.9) % 60).toString().padStart(2, '0')} / 1:30
                  </span>
                </div>

                {/* Scrubber progress bar */}
                <div className="flex-1 max-w-[140px] bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                  <div
                    className="bg-[#6D28D9] h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center gap-1">
                  {chapters.map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setCurrentChapter(ch.id);
                        setProgress(ch.id * 25 + 5);
                      }}
                      className={`px-2 py-1 rounded text-[10px] font-mono-geist transition-colors ${
                        currentChapter === ch.id
                          ? 'bg-[#6D28D9] text-white font-semibold'
                          : 'text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
                      }`}
                    >
                      {ch.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Terminal Block from Variation 18 */}
          <div className="bg-[#0F172A] rounded-lg p-5 shadow-lg border border-slate-800">
            <div className="font-mono-geist text-[11px] uppercase tracking-[0.1em] text-[#94A3B8] mb-3 flex items-center justify-between">
              <span>Active Operations Trace</span>
              <span className="text-emerald-400 font-bold">● CONNECTED</span>
            </div>
            <pre className="font-mono-geist text-xs text-[#E2E8F0] leading-relaxed overflow-x-auto">
{`[PUT]  /api/students/id_882 → SET status="ACTIVE", gpa=3.82 [OK]
[GET]  /api/analytics/gpa_distribution → RENDERING RECHARTS_HISTOGRAM
[POST] /api/bulk_import → VALIDATING SCHEMA_TRANSCRIPT_2026.XLSX
[POST] /api/attendance/bulk → LOGGED 8 STUDENTS [200 OK]`}</pre>
          </div>
        </section>

        {/* Right Column: Variation 18 Auth Pane */}
        <aside className="bg-white p-6 sm:p-8 xl:p-10 flex flex-col justify-center">
          <div className="font-mono-geist text-[11px] uppercase tracking-[0.12em] text-[#64748B] mb-2">
            Login Portal
          </div>
          <h2 className="font-serif-cormorant text-3xl sm:text-4xl font-semibold text-[#0F172A] mb-6">
            Access the Registry
          </h2>

          {error && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 rounded text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Institutional Single Sign-On Button */}
          <button
            type="button"
            onClick={handleSsoSignIn}
            className="w-full h-12 bg-white text-[#0F172A] border border-[#CBD5E1] rounded hover:border-[#6D28D9] hover:bg-slate-50 transition-all font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xs mb-6 group"
          >
            <ShieldCheck className="w-5 h-5 text-[#6D28D9]" />
            <span>Continue with Institutional SSO</span>
          </button>

          <form onSubmit={handleInstitutionalSignIn} className="space-y-4">
            <div>
              <label htmlFor="reg-email" className="block font-mono-geist text-[11px] uppercase tracking-[0.1em] text-[#64748B] mb-2">
                Institutional Email
              </label>
              <input
                id="reg-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 border border-[#CBD5E1] rounded bg-[#F1F5F9] font-mono-geist text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label htmlFor="reg-passkey" className="block font-mono-geist text-[11px] uppercase tracking-[0.1em] text-[#64748B] mb-2">
                Registry Passkey
              </label>
              <input
                id="reg-passkey"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 px-4 border border-[#CBD5E1] rounded bg-[#F1F5F9] font-mono-geist text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#6D28D9] focus:bg-white transition-colors"
              />
            </div>

            <div className="text-[12px] text-[#64748B] my-4 flex items-start gap-2.5 leading-relaxed">
              <input
                id="reg-consent"
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => {
                  setConsentGranted(e.target.checked);
                  if (e.target.checked) setError(null);
                }}
                className="mt-1 w-4 h-4 rounded border-[#CBD5E1] text-[#6D28D9] focus:ring-[#6D28D9]"
              />
              <label htmlFor="reg-consent" className="cursor-pointer">
                I grant consent to connect the <strong>Institutional Database</strong> for live student records synchronization, CRUD updates, and automated Excel backups.
              </label>
            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#0F172A] hover:bg-[#6D28D9] text-white font-semibold text-xs sm:text-sm rounded transition-all duration-200 transform hover:-translate-y-0.5 shadow-sm"
            >
              Access Dashboard
            </button>
          </form>

          {/* Demo session shortcut */}
          <button
            type="button"
            onClick={() =>
              onLogin({
                name: 'Academic Administrator',
                email: 'admin@university.edu',
                role: 'Chief Registrar',
                provider: 'sso',
                connectedDatabase: 'Institutional Central Database',
                consentGiven: true,
                signedInAt: new Date().toISOString(),
              })
            }
            className="mt-6 bg-none border-none underline font-mono-geist text-xs text-[#6D28D9] hover:text-[#5B21B6] cursor-pointer text-center"
          >
            Demo Session: Academic Administrator
          </button>
        </aside>
      </main>

      {/* Variation 18 Footer */}
      <footer className="h-12 border-t border-[#E2E8F0] bg-white px-6 sm:px-10 flex items-center justify-between text-[#64748B] font-mono-geist text-xs">
        <div className="meta">SYSTEM_STATUS: READY</div>
        <div className="meta">2026 © ACADEMIC RECORDS PORTAL</div>
      </footer>
    </div>
  );
};
