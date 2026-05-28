"use client";

import axios from "axios";
import Image from "next/image";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

type CsvRow = Record<string, string | number | null>;

type UploadLog = {
  time: string;
  filename: string;
  type: string;
  total_records: number | null;
  total_emails: number | null;
  emails: string[] | null;
};

type SendFailure = {
  email: string;
  error: string;
};

type SendLog = {
  time: string;
  attempted: number;
  success_count: number;
  failed_count: number;
  failed_emails: SendFailure[];
  success_emails: string[];
};

type SendResult = {
  total?: number;
  success_count?: number;
  failed_count?: number;
  success_emails?: string[];
  failed_emails?: SendFailure[];
};

function extractEmailsFromRows(rows: CsvRow[]) {
  const values = rows.flatMap((row) => Object.values(row).map(String));
  const pattern = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
  return Array.from(new Set(values.flatMap((value) => value.match(pattern) || [])));
}

export default function Home() {
  const { data: session } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [emailLimit, setEmailLimit] = useState(10);
  const [customMessage, setCustomMessage] = useState(
    `Hello,\n\nI am Prince Yadav, a Backend & DevOps developer interested in internship opportunities.\n\nThank You.`
  );
  const [uploadsLog, setUploadsLog] = useState<UploadLog[]>([]);
  const [sendLogs, setSendLogs] = useState<SendLog[]>([]);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const [contactSuccess, setContactSuccess] = useState(false);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => setContactSuccess(false), 4000);
  };

  const uploadFile = async () => {
    if (!file) {
      alert("Please select file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("http://127.0.0.1:8000/upload-csv", formData);

      const extractedEmails = Array.isArray(res.data.emails_found)
        ? res.data.emails_found
        : Array.isArray(res.data.data)
          ? extractEmailsFromRows(res.data.data)
          : [];

      if (extractedEmails.length > 0) {
        setEmails(extractedEmails);
      }

      const logEntry: UploadLog = {
        time: new Date().toISOString(),
        filename: file.name,
        type: res.data.type || "unknown",
        total_records: res.data.total_records || (Array.isArray(res.data.data) ? res.data.data.length : null),
        total_emails:
          res.data.total_emails || extractedEmails.length || (res.data.emails_found ? res.data.emails_found.length : null),
        emails: extractedEmails.length > 0 ? extractedEmails : res.data.emails_found || null,
      };

      setUploadsLog((current) => [logEntry, ...current]);
    } catch (error) {
      console.error(error);
      alert("Upload Failed");
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMails = async () => {
    if (!session) {
      alert("Please Login With Google");
      return;
    }

    if (!session.accessToken) {
      alert("Google access token is missing. Please sign in again.");
      return;
    }

    if (!session.user?.email) {
      alert("Google email is missing from the session.");
      return;
    }

    if (emails.length === 0) {
      alert("No extracted emails to send to. Please upload targets first.");
      return;
    }

    try {
      setSending(true);
      const selectedEmails = emails.slice(0, emailLimit);
      
      const formData = new FormData();
      formData.append("emails", JSON.stringify(selectedEmails));
      formData.append("message", customMessage);
      formData.append("access_token", session.accessToken);
      formData.append("from_email", session.user.email);
      
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }

      const res = await axios.post(
        "http://127.0.0.1:8000/send-bulk-mails",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          timeout: 30000,
        }
      );

      const result: SendResult = res.data || {};
      setSendResult(result);

      const sendLog: SendLog = {
        time: new Date().toISOString(),
        attempted: selectedEmails.length,
        success_count: result.success_count || 0,
        failed_count: result.failed_count || 0,
        failed_emails: result.failed_emails || [],
        success_emails: result.success_emails || [],
      };

      setSendLogs((current) => [sendLog, ...current]);

      if ((result.success_count || 0) > 0) {
        alert(`Sent: ${result.success_count} • Failed: ${result.failed_count || 0}`);
      } else if ((result.failed_count || 0) > 0) {
        alert(`Failed to send emails. ${result.failed_count} failures.`);
      } else {
        alert("No emails were sent. Check server logs.");
      }
    } catch (error) {
      console.error(error);
      alert("Failed To Send Emails");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="page-shell min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2 shadow-lg">
              <Image src="/logo.svg" alt="AI Cold Mail Agent" width={28} height={28} priority />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-zinc-100">ColdMail<span className="text-fuchsia-400">.ai</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">{session ? "Synced" : "Disconnected"}</p>
              <p className="max-w-[200px] truncate text-[11px] text-zinc-400">{session?.user?.email || "Connect Gmail to send"}</p>
            </div>
            {session ? (
              <button onClick={() => signOut()} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10">
                Disconnect
              </button>
            ) : (
              <button onClick={() => signIn("google")} className="rounded-lg bg-white px-4 py-2 text-xs font-bold text-black transition hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Connect Gmail
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex min-h-[calc(100vh-73px)] items-center overflow-hidden bg-black">
        <Image src="/mainimage.jpeg" alt="Dashboard preview" fill sizes="100vw" className="object-cover object-center opacity-60" priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute left-5 top-1/2 z-10 max-w-2xl -translate-y-1/2 sm:left-8 lg:left-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-fuchsia-300 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>
            Cold Outreach, Mastered
          </p>
          <h2 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-[5.5rem] leading-[1.05] drop-shadow-2xl">
            Automate Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-cyan-400">Startup Growth</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base font-medium">
            Extract contacts from HR PDFs or CSVs, attach your resume, and send personalized campaigns natively through your connected Gmail account. High deliverability, zero friction.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
             <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-md">
               <span className="text-sm font-semibold text-zinc-200">🚀 Instant Parsing</span>
             </div>
             <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-md">
               <span className="text-sm font-semibold text-zinc-200">📎 Native Attachments</span>
             </div>
             <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/50 px-5 py-3 backdrop-blur-md">
               <span className="text-sm font-semibold text-zinc-200">🛡️ 100% Secure</span>
             </div>
          </div>
        </div>
      </section>

      {/* Main SaaS Workspace */}
      <section className="relative z-10 -mt-10 px-5 pb-24 sm:px-6">
        <div className="mx-auto max-w-[1400px]">
          
          <div className="mb-10 text-center sm:mb-16">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Campaign Workspace</h2>
            <p className="mt-3 text-sm text-zinc-400">Configure your targets, attachments, and messaging.</p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:items-start">
            
            {/* Left Column: Configuration Flow */}
            <div className="space-y-6">
              
              {/* Step 1: Targets */}
              <div className="rounded-[2rem] border border-white/5 bg-[#0d0d0f] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-400 font-bold">1</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Upload Targets</h3>
                    <p className="text-xs text-zinc-400">Upload a CSV or PDF containing HR contacts.</p>
                  </div>
                  <div className="ml-auto">
                    <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-semibold text-zinc-300">
                      {emails.length} Emails Extracted
                    </span>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="flex-1">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">File Selection</label>
                    <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 transition-colors hover:border-white/20">
                      <input
                        type="file"
                        onChange={(event) => event.target.files && setFile(event.target.files[0])}
                        className="w-full text-sm text-zinc-400 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20 transition-all"
                      />
                    </div>
                  </div>
                  <button onClick={uploadFile} disabled={loading} className="rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(6,182,212,0.3)] transition hover:bg-cyan-400 disabled:opacity-50">
                    {loading ? "Extracting..." : "Extract Emails"}
                  </button>
                </div>
              </div>

              {/* Step 2: Attachments */}
              <div className="rounded-[2rem] border border-white/5 bg-[#0d0d0f] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500/20 text-fuchsia-400 font-bold">2</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Attach Resume (Optional)</h3>
                    <p className="text-xs text-zinc-400">Include your CV or portfolio with the outbound email.</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Select Resume File</label>
                  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/30 p-2 transition-colors hover:border-white/20">
                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(event) => event.target.files && setResumeFile(event.target.files[0])}
                      className="w-full text-sm text-zinc-400 file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-white/20 transition-all"
                    />
                  </div>
                  {resumeFile && <p className="mt-3 text-xs font-medium text-emerald-400 flex items-center gap-1">✓ {resumeFile.name} attached.</p>}
                </div>
              </div>

              {/* Step 3: Message & Send */}
              <div className="rounded-[2rem] border border-white/5 bg-[#0d0d0f] p-6 shadow-2xl sm:p-8">
                <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">3</div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Campaign Details</h3>
                    <p className="text-xs text-zinc-400">Craft your pitch and launch.</p>
                  </div>
                </div>
                
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Email Batch Size</label>
                    <input
                      type="number"
                      value={emailLimit}
                      onChange={(event) => setEmailLimit(Number(event.target.value))}
                      className="w-full max-w-[200px] rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none focus:border-white/30 transition-colors"
                      min={1} max={1000}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Message Body (HTML Supported)</label>
                    <textarea
                      rows={6}
                      value={customMessage}
                      onChange={(event) => setCustomMessage(event.target.value)}
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-zinc-200 outline-none focus:border-white/30 transition-colors font-mono"
                    />
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-white/5">
                    {!session ? (
                       <button onClick={() => signIn("google")} className="w-full sm:w-auto rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition hover:bg-zinc-200">
                         Connect Gmail to Send
                       </button>
                    ) : (
                       <button onClick={sendBulkMails} disabled={sending} className="w-full sm:w-auto rounded-xl bg-white px-10 py-3.5 text-sm font-bold text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] transition hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
                         {sending ? (
                           <>
                             <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                             Sending...
                           </>
                         ) : "Launch Campaign 🚀"}
                       </button>
                    )}
                    <div className="text-xs text-zinc-500 text-center sm:text-right">
                      Sending from: <br/><strong className="text-zinc-300">{session?.user?.email || "N/A"}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Logs */}
            <div className="space-y-6">
              
              <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0c] p-6 shadow-2xl">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">Campaign Status</h3>
                
                {sendResult ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 p-4 border border-white/5">
                      <p className="text-[10px] uppercase tracking-widest text-zinc-500">Attempted</p>
                      <p className="mt-1 text-2xl font-black text-white">{sendResult.total}</p>
                    </div>
                    <div className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20">
                      <p className="text-[10px] uppercase tracking-widest text-emerald-500/70">Success</p>
                      <p className="mt-1 text-2xl font-black text-emerald-400">{sendResult.success_count}</p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-rose-500/10 p-4 border border-rose-500/20">
                      <p className="text-[10px] uppercase tracking-widest text-rose-500/70">Failed</p>
                      <p className="mt-1 text-2xl font-black text-rose-400">{sendResult.failed_count}</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
                    <p className="text-xs text-zinc-500">No campaigns launched yet.</p>
                  </div>
                )}
              </div>

              <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0c] p-6 shadow-2xl flex flex-col h-[500px]">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400 mb-5">Activity Log</h3>
                
                <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                  {uploadsLog.map((entry) => (
                    <div key={`${entry.filename}-${entry.time}`} className="rounded-xl border border-white/5 bg-black/40 p-4 relative overflow-hidden group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500"></div>
                      <p className="text-xs font-bold text-zinc-200">File Extracted: {entry.filename}</p>
                      <p className="mt-1 text-[10px] text-zinc-500">{new Date(entry.time).toLocaleTimeString()}</p>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="rounded bg-white/5 px-2 py-1 text-[10px] font-semibold text-zinc-400">{entry.type}</span>
                         <span className="text-xs font-bold text-cyan-400">+{entry.total_emails} found</span>
                      </div>
                    </div>
                  ))}

                  {sendLogs.map((entry) => (
                    <div key={entry.time} className="rounded-xl border border-white/5 bg-black/40 p-4 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                      <p className="text-xs font-bold text-zinc-200">Campaign Launched</p>
                      <p className="mt-1 text-[10px] text-zinc-500">{new Date(entry.time).toLocaleTimeString()}</p>
                      <div className="mt-3 text-xs text-zinc-300">
                        {entry.success_count} sent successfully. {entry.failed_count > 0 && <span className="text-rose-400">{entry.failed_count} failed.</span>}
                      </div>
                    </div>
                  ))}

                  {uploadsLog.length === 0 && sendLogs.length === 0 && (
                     <div className="flex h-full items-center justify-center">
                       <p className="text-xs text-zinc-600">Awaiting activity...</p>
                     </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Design from previous instruction */}
      <section className="w-full border-t border-white/10 bg-[#0a0a0c] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-wide text-white sm:text-4xl">
              Making Life Easier for You
            </h2>
            <div className="mt-20 grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Workflow<br />Automation</h3>
                <p className="mt-4 max-w-[250px] text-sm leading-6 text-zinc-400">
                  Identifying and automating repetitive decision-making processes
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Robotic<br />Process Automation</h3>
                <p className="mt-4 max-w-[250px] text-sm leading-6 text-zinc-400">
                  Implementing software robots to mimic human interactions with digital systems
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-white">Document<br />Processing</h3>
                <p className="mt-4 max-w-[250px] text-sm leading-6 text-zinc-400">
                  Automating the extraction, classification, and validation of data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full border-t border-white/5 bg-[#050505] py-24 text-white">
        <div className="mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-4xl font-black leading-[1.1] tracking-wide">
                Innovate with AI.<br />Connect Now
              </h2>
              <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                Let's discuss your business challenges and craft intelligent solutions. Reach out to our AI experts now.
              </p>
            </div>
            {contactSuccess ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] transition-all">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-xl font-bold text-emerald-400">Message Sent!</h3>
                <p className="mt-2 text-sm text-emerald-200/70">Thanks for reaching out. We will get back to you shortly.</p>
              </div>
            ) : (
              <form className="space-y-4" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <input type="text" placeholder="First name*" required className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/30" />
                  <input type="email" placeholder="Email address*" required className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/30" />
                </div>
                <textarea placeholder="Message*" required rows={5} className="w-full resize-none rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white outline-none transition focus:border-white/30 focus:ring-1 focus:ring-white/30"></textarea>
                <button type="submit" className="rounded-xl border border-white/20 bg-white px-10 py-3.5 text-sm font-bold text-black transition hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <footer className="relative w-full overflow-hidden border-t border-white/10 bg-[#020202] py-16 text-white sm:py-24">
        {/* Decorative background glow */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[1px] w-3/4 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"></div>
        <div className="absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 rounded-[100%] bg-fuchsia-500/10 blur-[100px] pointer-events-none"></div>

        <div className="relative mx-auto max-w-7xl px-5 sm:px-6">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
             {/* Brand */}
             <div className="lg:col-span-2">
               <div className="flex items-center gap-3">
                 <div className="rounded-xl border border-white/10 bg-black p-2 shadow-lg shadow-fuchsia-500/20">
                   <Image src="/logo.svg" alt="ColdMail Agent" width={24} height={24} />
                 </div>
                 <h2 className="text-2xl font-black tracking-tight text-white">ColdMail<span className="text-fuchsia-400">.ai</span></h2>
               </div>
               <p className="mt-6 max-w-sm text-sm leading-7 text-zinc-400">
                 Automating HR outreach and startup growth with intelligent, Gmail-native cold campaigns. Built with precision and scale in mind.
               </p>
             </div>
             
             {/* Links */}
             <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Connect</h3>
               <ul className="mt-6 space-y-4 text-sm text-zinc-400">
                 <li><a href="https://github.com/prince-up" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-fuchsia-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub Profile</a></li>
                 <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition hover:text-cyan-400"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> Twitter (X)</a></li>
               </ul>
             </div>

             {/* Tech Stack */}
             <div>
               <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Tech Stack</h3>
               <ul className="mt-6 space-y-4 text-sm text-zinc-400">
                 <li>Next.js 14</li>
                 <li>Tailwind CSS</li>
                 <li>FastAPI</li>
                 <li>Google OAuth API</li>
               </ul>
             </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between border-t border-white/10 pt-8 sm:flex-row">
            <p className="text-xs font-semibold tracking-wide text-zinc-500">© {new Date().getFullYear()} Prince Yadav. All Rights Reserved.</p>
            <div className="mt-4 flex gap-4 sm:mt-0">
               <span className="flex items-center gap-2 text-xs font-bold text-zinc-400"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span> Systems Operational</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
