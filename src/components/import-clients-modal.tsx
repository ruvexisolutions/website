"use client";

import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  RefreshCw,
  Users,
} from "lucide-react";
import { RuvexiApi } from "@/lib/api-client";

interface ImportClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ColumnMapping {
  name: string;
  phone: string;
  gender: string;
  email: string;
  totalVisits: string;
  totalSpend: string;
  vipTier: string;
  notes: string;
  formulaNotes: string;
  allergies: string;
}

export function ImportClientsModal({ isOpen, onClose, onSuccess }: ImportClientsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({
    name: "",
    phone: "",
    gender: "",
    email: "",
    totalVisits: "",
    totalSpend: "",
    vipTier: "",
    notes: "",
    formulaNotes: "",
    allergies: "",
  });
  const [duplicateStrategy, setDuplicateStrategy] = useState<"merge" | "skip">("merge");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{
    imported: number;
    updated: number;
    skippedDuplicates: number;
    totalProcessed: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // 1. Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        "Full Name": "Priya Sharma",
        "Phone Number": "9886012345",
        "Gender": "Female",
        "Email": "priya.sharma@example.com",
        "Total Visits": 4,
        "Total Spend (INR)": 4500,
        "VIP Tier": "Gold VIP",
        "Technical Formula": "Matrix 5.0 Natural Brown + 20 Vol",
        "Allergies": "Ammonia sensitive",
        "Notes": "Prefers Manoj as hair stylist",
      },
      {
        "Full Name": "Rahul Verma",
        "Phone Number": "9845098765",
        "Gender": "Male",
        "Email": "rahul.v@example.com",
        "Total Visits": 2,
        "Total Spend (INR)": 750,
        "VIP Tier": "Silver Regular",
        "Technical Formula": "",
        "Allergies": "None",
        "Notes": "Student discount verified",
      },
      {
        "Full Name": "Ananya Hegde",
        "Phone Number": "9900112233",
        "Gender": "Female",
        "Email": "ananya.h@example.com",
        "Total Visits": 7,
        "Total Spend (INR)": 14200,
        "VIP Tier": "Platinum Elite",
        "Technical Formula": "Schwarzkopf Root Touch-Up 6.0",
        "Allergies": "None",
        "Notes": "Always books weekend morning slots",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients_Template");
    XLSX.writeFile(workbook, "RUVEXI_Clients_Import_Template.xlsx");
  };

  // 2. Parse uploaded file (.xlsx, .xls, .csv)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) parseFile(selected);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) parseFile(dropped);
  };

  const parseFile = (uploadFile: File) => {
    setErrorMsg(null);
    setFile(uploadFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        if (json.length === 0) {
          setErrorMsg("The selected file is empty. Please upload a sheet with at least 1 customer row.");
          return;
        }

        const detectedHeaders = Object.keys(json[0]);
        setHeaders(detectedHeaders);
        setRawRows(json);

        // Auto-detect mappings based on header text
        const autoMap: ColumnMapping = {
          name: findBestHeader(detectedHeaders, ["name", "client name", "customer", "customer name", "full name"]),
          phone: findBestHeader(detectedHeaders, ["phone", "mobile", "contact", "contact number", "cell", "phone number"]),
          gender: findBestHeader(detectedHeaders, ["gender", "sex"]),
          email: findBestHeader(detectedHeaders, ["email", "mail", "email id"]),
          totalVisits: findBestHeader(detectedHeaders, ["visits", "total visits", "visit count", "bookings"]),
          totalSpend: findBestHeader(detectedHeaders, ["spend", "total spend", "spent", "amount", "revenue"]),
          vipTier: findBestHeader(detectedHeaders, ["tier", "vip", "vip tier", "category"]),
          notes: findBestHeader(detectedHeaders, ["notes", "remarks", "comments", "preference"]),
          formulaNotes: findBestHeader(detectedHeaders, ["formula", "technical formula", "color formula", "hair formula"]),
          allergies: findBestHeader(detectedHeaders, ["allergies", "allergy", "skin type", "sensitivities"]),
        };
        setMapping(autoMap);
      } catch (err: any) {
        setErrorMsg("Failed to read file: " + (err?.message || "Invalid file format"));
      }
    };

    reader.readAsBinaryString(uploadFile);
  };

  const findBestHeader = (headers: string[], candidates: string[]) => {
    for (const c of candidates) {
      const match = headers.find((h) => h.toLowerCase().trim() === c || h.toLowerCase().includes(c));
      if (match) return match;
    }
    return "";
  };

  // 3. Process & Submit to Backend
  const handleExecuteImport = async () => {
    if (!mapping.phone) {
      setErrorMsg("Please select which column contains the Phone Number.");
      return;
    }
    if (!mapping.name) {
      setErrorMsg("Please select which column contains the Client Name.");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const normalizedPayload = rawRows.map((row) => {
        const rawPhone = String(row[mapping.phone] || "").trim();
        const digits = rawPhone.replace(/\D/g, "");
        const rawName = String(row[mapping.name] || "Valued Client").trim();

        return {
          name: rawName,
          phone: digits.length >= 10 ? digits.slice(-10) : rawPhone,
          gender: mapping.gender ? String(row[mapping.gender] || "").toLowerCase() : "female",
          email: mapping.email ? String(row[mapping.email] || "").trim() : "",
          totalVisits: mapping.totalVisits ? parseInt(row[mapping.totalVisits], 10) || 1 : 1,
          totalSpend: mapping.totalSpend ? parseFloat(row[mapping.totalSpend]) || 0 : 0,
          vipTier: mapping.vipTier ? String(row[mapping.vipTier] || "Silver Regular") : "Silver Regular",
          notes: mapping.notes ? String(row[mapping.notes] || "") : "",
          formulaNotes: mapping.formulaNotes ? String(row[mapping.formulaNotes] || "") : "",
          allergies: mapping.allergies ? String(row[mapping.allergies] || "None Reported") : "None Reported",
        };
      });

      const res = await RuvexiApi.importCustomers(normalizedPayload, duplicateStrategy);
      setImportResult(res);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to import clients. Please check your network and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRawRows([]);
    setHeaders([]);
    setImportResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0c0e0d] border border-emerald-500/30 shadow-2xl p-6 my-8 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Import Clients from Excel / CSV</h2>
              <p className="text-xs text-white/50">Auto-detect columns, deduplicate by phone, and sync to RUVEXI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SUCCESS SUMMARY VIEW */}
        {importResult ? (
          <div className="py-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Clients Imported Successfully!</h3>
              <p className="text-xs text-white/60 mt-1">Your salon customer database is now updated</p>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              <div className="p-3 rounded-xl bg-[#121513] border border-white/5">
                <span className="text-2xl font-bold text-emerald-400">{importResult.imported}</span>
                <p className="text-[11px] text-white/50 mt-0.5">New Clients</p>
              </div>
              <div className="p-3 rounded-xl bg-[#121513] border border-white/5">
                <span className="text-2xl font-bold text-blue-400">{importResult.updated}</span>
                <p className="text-[11px] text-white/50 mt-0.5">Updated</p>
              </div>
              <div className="p-3 rounded-xl bg-[#121513] border border-white/5">
                <span className="text-2xl font-bold text-amber-400">{importResult.skippedDuplicates}</span>
                <p className="text-[11px] text-white/50 mt-0.5">Skipped / Exists</p>
              </div>
            </div>

            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
              >
                Import Another File
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors"
              >
                Done & View Customers
              </button>
            </div>
          </div>
        ) : !file ? (
          /* STEP 1: UPLOAD DROPZONE */
          <div className="space-y-4 py-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-2xl p-8 text-center cursor-pointer bg-[#101211] hover:bg-emerald-500/[0.02] transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-sm text-white">Click to upload or drag and drop</h3>
              <p className="text-xs text-white/40 mt-1">Supports Excel files (.xlsx, .xls) and CSV</p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-white/5 text-[11px] text-emerald-400 border border-emerald-500/20">
                Auto-detects names, phone numbers & formulas
              </span>
            </div>

            {/* Template Download Card */}
            <div className="p-4 rounded-xl bg-[#121513] border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <p className="text-xs font-medium text-white">Need a blank template to fill in?</p>
                  <p className="text-[11px] text-white/40">Includes sample headers for hair formulas, allergies, and visits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download Sample Excel
              </button>
            </div>
          </div>
        ) : (
          /* STEP 2: COLUMN MAPPING & PREVIEW */
          <div className="space-y-4 py-4">
            {/* Loaded file info */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#121513] border border-white/5">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-medium text-white">{file.name}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  {rawRows.length} Rows Found
                </span>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-white/50 hover:text-white transition-colors"
              >
                Change File
              </button>
            </div>

            {/* Mapping Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white/60">Match Columns</h4>
                <span className="text-[11px] text-emerald-400">* Name & Phone required</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                <div>
                  <label className="text-[11px] text-white/60 block mb-1">
                    Client Name <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={mapping.name}
                    onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">
                    Phone Number <span className="text-emerald-400">*</span>
                  </label>
                  <select
                    value={mapping.phone}
                    onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select column...</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Gender</label>
                  <select
                    value={mapping.gender}
                    onChange={(e) => setMapping({ ...mapping, gender: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Optional (Default Female)</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Visits Count</label>
                  <select
                    value={mapping.totalVisits}
                    onChange={(e) => setMapping({ ...mapping, totalVisits: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Optional (Default 1)</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Technical Formula</label>
                  <select
                    value={mapping.formulaNotes}
                    onChange={(e) => setMapping({ ...mapping, formulaNotes: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Optional Formula</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-white/60 block mb-1">Notes / Preferences</label>
                  <select
                    value={mapping.notes}
                    onChange={(e) => setMapping({ ...mapping, notes: e.target.value })}
                    className="w-full bg-[#181c19] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Optional Notes</option>
                    {headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 5-Row Live Preview Table */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-white/50 block">Live Preview (First 5 Rows)</span>
              <div className="rounded-xl border border-white/10 overflow-hidden bg-[#101211]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/5 text-white/60 text-[11px] border-b border-white/10">
                    <tr>
                      <th className="p-2">Name</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Visits</th>
                      <th className="p-2">Formula / Notes</th>
                      <th className="p-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white/80">
                    {rawRows.slice(0, 5).map((row, idx) => {
                      const name = mapping.name ? row[mapping.name] : "—";
                      const phone = mapping.phone ? String(row[mapping.phone] || "") : "";
                      const digits = phone.replace(/\D/g, "");
                      const isValidPhone = digits.length >= 10;
                      const visits = mapping.totalVisits ? row[mapping.totalVisits] || 1 : 1;
                      const note = mapping.formulaNotes
                        ? row[mapping.formulaNotes]
                        : mapping.notes
                        ? row[mapping.notes]
                        : "—";

                      return (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="p-2 font-medium text-white">{name || "—"}</td>
                          <td className="p-2 font-mono text-[11px]">{phone || "—"}</td>
                          <td className="p-2">{visits}</td>
                          <td className="p-2 max-w-[120px] truncate text-white/50">{note || "—"}</td>
                          <td className="p-2 text-right">
                            {isValidPhone ? (
                              <span className="text-[10px] text-emerald-400 font-bold">Valid</span>
                            ) : (
                              <span className="text-[10px] text-amber-400 font-bold">Check Phone</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Strategy Radio Options */}
            <div className="p-3 rounded-xl bg-[#121513] border border-white/5 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">
                If phone already exists in salon:
              </span>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    checked={duplicateStrategy === "merge"}
                    onChange={() => setDuplicateStrategy("merge")}
                    className="accent-emerald-500"
                  />
                  <span>
                    <strong className="text-white">Merge & Update</strong> (Recommended)
                  </span>
                </label>
                <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                  <input
                    type="radio"
                    name="strategy"
                    checked={duplicateStrategy === "skip"}
                    onChange={() => setDuplicateStrategy("skip")}
                    className="accent-emerald-500"
                  />
                  <span>
                    <strong className="text-white">Skip Duplicate</strong>
                  </span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/70 hover:text-white transition-colors"
              >
                Back
              </button>
              <button
                disabled={isProcessing || !mapping.name || !mapping.phone}
                onClick={handleExecuteImport}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Importing {rawRows.length} Clients...</span>
                  </>
                ) : (
                  <>
                    <span>Import {rawRows.length} Clients</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
