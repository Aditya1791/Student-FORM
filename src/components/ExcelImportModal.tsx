import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { CreateStudentDto } from '../types/student';
import { parseExcelFile, downloadSampleExcelTemplate } from '../services/excelService';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (result: { added: number; updated: number }) => void;
  onBulkImport: (students: CreateStudentDto[]) => Promise<{ added: number; updated: number; errors: string[] }>;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onBulkImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedStudents, setParsedStudents] = useState<CreateStudentDto[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFile(null);
    setParsedStudents([]);
    setErrors([]);
    setTotalRows(0);
    setIsParsing(false);
    setIsSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleProcessFile = async (selectedFile: File) => {
    if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrors(['Please upload a valid Excel (.xlsx, .xls) or CSV file.']);
      return;
    }

    try {
      setIsParsing(true);
      setFile(selectedFile);
      setErrors([]);
      const result = await parseExcelFile(selectedFile);
      setParsedStudents(result.validStudents);
      setErrors(result.errors);
      setTotalRows(result.totalRows);
    } catch (err: any) {
      setErrors([err.message || 'Failed to read spreadsheet file.']);
      setParsedStudents([]);
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      handleProcessFile(selected);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleProcessFile(droppedFile);
    }
  };

  const handleImportSubmit = async () => {
    if (parsedStudents.length === 0) return;
    try {
      setIsSubmitting(true);
      const res = await onBulkImport(parsedStudents);
      onImportSuccess(res);
      handleClose();
    } catch (err: any) {
      setErrors([err.message || 'Server failed to import student records.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="excel-import-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 id="excel-import-title" className="text-base font-bold text-slate-900">
                Import Student Records from Excel / CSV
              </h2>
              <p className="text-xs text-slate-500">
                Bulk upload students to update your central database automatically
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close import dialog"
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Template Download Prompt */}
          <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs">
            <div className="text-indigo-900 font-medium">
              Need the standard column format? Download our pre-formatted template.
            </div>
            <button
              type="button"
              onClick={downloadSampleExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 font-medium rounded-lg hover:bg-indigo-50 shadow-xs shrink-0 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Template
            </button>
          </div>

          {/* Drag & Drop File Zone */}
          {!file && (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800">
                Click or drag & drop spreadsheet file here
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
              </p>
            </div>
          )}

          {/* Parsing Spinner */}
          {isParsing && (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">Reading and validating spreadsheet rows...</div>
            </div>
          )}

          {/* Parsed Summary & Preview */}
          {file && !isParsing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{file.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB · {totalRows} total rows found
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Choose another file
                </button>
              </div>

              {/* Status breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>{parsedStudents.length}</strong> valid student records ready
                  </span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>{errors.length}</strong> row notices / skipped
                  </span>
                </div>
              </div>

              {/* Error messages if any */}
              {errors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 max-h-28 overflow-y-auto space-y-1">
                  <div className="font-semibold text-rose-900 flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                    Validation issues encountered:
                  </div>
                  {errors.slice(0, 5).map((err, i) => (
                    <div key={i} className="font-mono text-[11px]">{err}</div>
                  ))}
                  {errors.length > 5 && (
                    <div className="text-[11px] italic">...and {errors.length - 5} more</div>
                  )}
                </div>
              )}

              {/* Preview table (first 4 items) */}
              {parsedStudents.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-700 mb-2">
                    Preview of Records to Import (Showing first {Math.min(4, parsedStudents.length)} of {parsedStudents.length}):
                  </div>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Roll Number</th>
                          <th className="py-2 px-3">Name</th>
                          <th className="py-2 px-3">Department</th>
                          <th className="py-2 px-3">GPA</th>
                          <th className="py-2 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {parsedStudents.slice(0, 4).map((s, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-3 font-mono text-slate-800">{s.rollNumber}</td>
                            <td className="py-2 px-3 font-medium text-slate-900">{s.firstName} {s.lastName}</td>
                            <td className="py-2 px-3">{s.department}</td>
                            <td className="py-2 px-3 font-semibold text-slate-800">{s.gpa.toFixed(2)}</td>
                            <td className="py-2 px-3 text-slate-700">{s.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleImportSubmit}
            disabled={parsedStudents.length === 0 || isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing records...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Update Database with {parsedStudents.length} Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
