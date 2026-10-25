import React, { useState } from 'react';
import { X, Play, Terminal, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface ApiExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  defaultPayload?: string;
  defaultQuery?: string;
}

const ENDPOINTS: ApiEndpoint[] = [
  {
    method: 'GET',
    path: '/api/students',
    description: 'List students with optional query filters (search, department, status, sortBy, sortOrder)',
    defaultQuery: '?department=Computer Science&sortBy=gpa&sortOrder=desc',
  },
  {
    method: 'GET',
    path: '/api/students/stats',
    description: 'Fetch aggregate cohort analytics (total, average GPA, honors, department breakdown)',
  },
  {
    method: 'GET',
    path: '/api/students/std_01',
    description: 'Fetch full record details and course transcripts for a single student by ID',
  },
  {
    method: 'POST',
    path: '/api/students',
    description: 'Create a new student record with schema validation and uniqueness checks',
    defaultPayload: JSON.stringify(
      {
        rollNumber: 'CS-2026-999',
        firstName: 'Elena',
        lastName: 'Rostova',
        email: 'elena.rostova@university.edu',
        phone: '+1 (555) 789-4321',
        department: 'Computer Science',
        academicYear: 'Year 1',
        semester: 'Semester 1',
        gpa: 3.88,
        status: 'Active',
        attendanceRate: 97,
        courses: [],
        notes: 'Enrolled via REST API tester',
      },
      null,
      2
    ),
  },
  {
    method: 'PUT',
    path: '/api/students/std_01',
    description: 'Update student attributes (e.g., GPA adjustment, phone, department, or status)',
    defaultPayload: JSON.stringify(
      {
        gpa: 3.95,
        phone: '+1 (555) 234-9999',
        notes: 'Updated honors status via REST API',
      },
      null,
      2
    ),
  },
  {
    method: 'DELETE',
    path: '/api/students/std_08',
    description: 'Permanently remove a student record from the persistent database',
  },
];

export const ApiExplorerModal: React.FC<ApiExplorerModalProps> = ({ isOpen, onClose }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [customPath, setCustomPath] = useState(ENDPOINTS[0].path + (ENDPOINTS[0].defaultQuery || ''));
  const [customPayload, setCustomPayload] = useState(ENDPOINTS[0].defaultPayload || '');
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseData, setResponseData] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentEndpoint = ENDPOINTS[selectedIdx];

  const handleSelectEndpoint = (index: number) => {
    setSelectedIdx(index);
    const ep = ENDPOINTS[index];
    setCustomPath(ep.path + (ep.defaultQuery || ''));
    setCustomPayload(ep.defaultPayload || '');
    setResponseStatus(null);
    setResponseData(null);
    setResponseTime(null);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponseStatus(null);
    setResponseData(null);
    const startTime = performance.now();

    try {
      const options: RequestInit = {
        method: currentEndpoint.method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (['POST', 'PUT'].includes(currentEndpoint.method) && customPayload) {
        options.body = customPayload;
      }

      const res = await fetch(customPath, options);
      const duration = Math.round(performance.now() - startTime);
      setResponseTime(duration);
      setResponseStatus(res.status);

      const json = await res.json();
      setResponseData(JSON.stringify(json, null, 2));
    } catch (err: any) {
      const duration = Math.round(performance.now() - startTime);
      setResponseTime(duration);
      setResponseStatus(500);
      setResponseData(JSON.stringify({ error: err.message || 'Network request failed' }, null, 2));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (responseData) {
      navigator.clipboard.writeText(responseData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getMethodColor = (m: string) => {
    switch (m) {
      case 'GET':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'POST':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'PUT':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'DELETE':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-explorer-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="api-explorer-title" className="text-base font-bold text-slate-900">
                Interactive REST API Explorer
              </h2>
              <p className="text-xs text-slate-500">
                Execute live requests against Express backend endpoints & observe responses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close API explorer"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 min-h-[460px] max-h-[70vh]">
          {/* Sidebar: Endpoint list */}
          <div className="md:col-span-4 border-r border-slate-200 bg-slate-50/50 p-3 space-y-1 overflow-y-auto">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Available Endpoints
            </div>
            {ENDPOINTS.map((ep, idx) => (
              <button
                key={`${ep.method}-${ep.path}`}
                type="button"
                onClick={() => handleSelectEndpoint(idx)}
                className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                  selectedIdx === idx
                    ? 'bg-white border-indigo-300 shadow-xs'
                    : 'bg-transparent border-transparent hover:bg-white/60 hover:border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`px-1.5 py-0.5 font-mono text-[10px] font-bold rounded border ${getMethodColor(
                      ep.method
                    )}`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-slate-800 truncate font-medium">{ep.path}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 truncate">{ep.description}</div>
              </button>
            ))}
          </div>

          {/* Main: Request builder & Response inspector */}
          <div className="md:col-span-8 p-4 flex flex-col justify-between overflow-y-auto space-y-4">
            <div>
              {/* Endpoint target bar */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1.5 font-mono text-xs font-bold rounded-lg border ${getMethodColor(
                    currentEndpoint.method
                  )}`}
                >
                  {currentEndpoint.method}
                </span>
                <input
                  type="text"
                  value={customPath}
                  onChange={(e) => setCustomPath(e.target.value)}
                  className="flex-1 px-3 py-1.5 font-mono text-xs border border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleExecute}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Send</span>
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">{currentEndpoint.description}</p>

              {/* Payload editor if POST/PUT */}
              {['POST', 'PUT'].includes(currentEndpoint.method) && (
                <div className="mt-3">
                  <label htmlFor="req-payload" className="block text-xs font-semibold text-slate-600 mb-1">
                    Request JSON Body:
                  </label>
                  <textarea
                    id="req-payload"
                    rows={6}
                    value={customPayload}
                    onChange={(e) => setCustomPayload(e.target.value)}
                    className="w-full p-2.5 font-mono text-xs border border-slate-300 rounded-lg bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              {/* Response output */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-700">Response</span>
                    {responseStatus !== null && (
                      <span
                        className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                          responseStatus >= 200 && responseStatus < 300
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        Status: {responseStatus}
                      </span>
                    )}
                    {responseTime !== null && (
                      <span className="text-[11px] text-slate-500 font-mono">{responseTime} ms</span>
                    )}
                  </div>

                  {responseData && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                    </button>
                  )}
                </div>

                <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto min-h-[160px] max-h-[220px]">
                  {isLoading ? (
                    <div className="text-xs text-slate-400 font-mono animate-pulse">
                      Executing HTTP {currentEndpoint.method} request to {customPath}...
                    </div>
                  ) : responseData ? (
                    <pre className="text-xs font-mono text-slate-100 whitespace-pre-wrap">{responseData}</pre>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono italic">
                      Click "Send" to execute this API request against the server and view the JSON response payload.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Backend: Node Express + TypeScript</span>
              <span>Storage: File-Backed JSON Database</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
