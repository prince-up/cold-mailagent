"use client";

import { useState } from "react";
import axios from "axios";

import {
  signIn,
  signOut,
  useSession,
} from "next-auth/react";

export default function Home() {

  const { data: session } = useSession();

  const [file, setFile] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [responseType, setResponseType] = useState("");
  const [emailLimit, setEmailLimit] = useState(10);
  const [customMessage, setCustomMessage] = useState(`Hello,

I am Prince Yadav, a Backend & DevOps developer interested in internship opportunities.

Thank You.`);

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

      setResponseType(res.data.type || "");
      // Update emails when PDF extraction returns results
      if (res.data.emails_found) setEmails(res.data.emails_found);

      // append to upload logs for UI visibility
      const logEntry: any = {
        time: new Date().toISOString(),
        filename: file.name,
        type: res.data.type || "unknown",
        total_records: res.data.total_records || null,
        total_emails: res.data.total_emails || (res.data.emails_found ? res.data.emails_found.length : null),
        emails: res.data.emails_found || null,
      };

      setUploadsLog((s) => [logEntry, ...s]);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Upload Failed");
    }
  };

  const sendBulkMails = async () => {
    if (!session) {
      alert("Please Login With Google");
      return;
    }

    try {
      setSending(true);
      const selectedEmails = emails.slice(0, emailLimit);
      const res = await axios.post("http://127.0.0.1:8000/send-bulk-mails", {
        emails: selectedEmails,
        message: customMessage,
      });

      setSending(false);

      // Use backend response to show accurate result
      const result = res.data || {};
      setSendResult(result);

      if (result.success_count && result.success_count > 0) {
        // inform user what actually succeeded/failed
        alert(`Sent: ${result.success_count} • Failed: ${result.failed_count}`);
      } else if (result.failed_count && result.failed_count > 0) {
        alert(`Failed to send emails. ${result.failed_count} failures.`);
      } else {
        alert('No emails were sent. Check server logs.');
      }

      // store send attempt in logs
      const sendLog = {
        time: new Date().toISOString(),
        attempted: selectedEmails.length,
        success_count: result.success_count || 0,
        failed_count: result.failed_count || 0,
        failed_emails: result.failed_emails || [],
        success_emails: result.success_emails || [],
      };

      setSendLogs((s) => [sendLog, ...s]);
    } catch (error) {
      console.error(error);
      setSending(false);
      alert("Failed To Send Emails");
    }
  };

  // UI state for logs and send results
  const [uploadsLog, setUploadsLog] = useState<any[]>([]);
  const [sendLogs, setSendLogs] = useState<any[]>([]);
  const [sendResult, setSendResult] = useState<any | null>(null);

  return (
    <main className="min-h-screen">

      <header className="sticky top-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div className="flex items-center gap-4">
            <img src="/logo.svg" alt="logo" className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold">AI Cold Mail Agent</h1>
              <p className="text-sm text-[var(--muted)]">Automated HR outreach</p>
            </div>
          </div>

          <div>
            {!session ? (
              <button onClick={() => signIn("google")} className="bg-[var(--foreground)] text-white px-5 py-2 rounded-lg">Login</button>
            ) : (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-green-500 font-semibold">Connected</p>
                  <p className="text-sm text-[var(--muted)]">{session.user?.email}</p>
                </div>
                <button onClick={() => signOut()} className="bg-red-500 text-white px-4 py-2 rounded-lg">Logout</button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Hero */}
      <section className="py-20">
        <div className="mx-auto hero-max px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div>
              <span className="top-badge animate-fade-up">AI · Beta</span>
              <h2 className="text-5xl font-extrabold leading-tight mt-4 hero-heading animate-fade-up" style={{animationDelay: '80ms'}}>Automate outreach. Close more roles.</h2>
              <p className="mt-6 text-lg text-[var(--muted)] max-w-xl animate-fade-up" style={{animationDelay: '160ms'}}>Upload HR lists or resumes, extract emails with AI, connect Gmail, and send personalized cold emails at scale.</p>

              <div className="mt-8 flex items-center gap-4 animate-fade-up" style={{animationDelay: '220ms'}}>
                <a href="#upload" className="btn-primary">Get Started</a>
                <a href="#features" className="btn-ghost muted inline-flex items-center justify-center" style={{padding: '10px 14px'}}>See Features</a>
              </div>

              <div className="mt-8 flex gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold">{emails.length}</div>
                  <div className="text-sm text-[var(--muted)]">Emails extracted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">{emailLimit}</div>
                  <div className="text-sm text-[var(--muted)]">Send limit</div>
                </div>
              </div>
            </div>

            <div id="upload" className="glass-card card-elevated rounded-3xl p-8 animate-fade-up" style={{animationDelay: '260ms'}}>
              <h3 className="text-2xl font-semibold mb-4">Upload HR Contacts</h3>
              <div className="mb-3">
                <label className="text-sm muted mb-2 block">Select a CSV or PDF</label>
                <input type="file" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="w-full border rounded-lg p-3" />
              </div>
              <div className="mb-3 mt-4">
                <label className="text-sm muted mb-2 block">Attach Resume (optional)</label>
                <input type="file" onChange={(e) => { if (e.target.files) setResume(e.target.files[0]); }} className="w-full border rounded-lg p-3" />
                {resume && (<p className="text-sm mt-2 muted">Selected: {resume.name}</p>)}
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={uploadFile} className="btn-primary">{loading ? 'Uploading...' : 'Upload & Extract'}</button>
                <div className="text-sm muted">Supports CSV, PDF, TXT</div>
              </div>

              <hr className="my-6" />

              <h3 className="text-2xl font-semibold mb-4">Email Controls</h3>
              <label className="block text-sm text-[var(--muted)] mb-2">Number of emails to send</label>
              <input type="number" value={emailLimit} onChange={(e) => setEmailLimit(Number(e.target.value))} className="w-full border rounded-lg p-3 mb-4" />

              <label className="block text-sm text-[var(--muted)] mb-2">Custom message</label>
              <textarea rows={6} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} className="w-full border rounded-lg p-3 mb-4" />

              <div className="flex gap-3">
                <button onClick={sendBulkMails} className="btn-primary">{sending ? 'Sending...' : 'Send Emails'}</button>
                <button onClick={() => { if (session) { alert('Connected: ' + session.user?.email) } else signIn('google') }} className="btn-ghost">{session ? 'Account' : 'Connect Gmail'}</button>
              </div>

            </div>

            <div className="hidden lg:flex justify-center items-center">
              <img src="/hero-illustration.svg" alt="hero" className="max-w-[420px] shadow-2xl rounded-2xl" />
            </div>

          </div>
        </div>
      </section>

    {/* Upload & Send Logs */}
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-4">Activity</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-semibold mb-3">Uploads</h4>
            {uploadsLog.length === 0 ? (
              <p className="muted">No uploads yet. Upload a CSV or PDF to see extraction logs.</p>
            ) : (
              <div className="space-y-3">
                {uploadsLog.map((l, i) => (
                  <div key={i} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div className="font-medium">{l.filename}</div>
                      <div className="text-sm muted">{new Date(l.time).toLocaleString()}</div>
                    </div>
                    <div className="text-sm muted">Type: {l.type} • Total: {l.total_records ?? l.total_emails ?? '—'}</div>
                    {l.emails && l.emails.length > 0 && (
                      <details className="mt-2 text-sm"><summary className="cursor-pointer">Show emails ({l.emails.length})</summary>
                        <div className="mt-2 text-xs break-words max-h-40 overflow-y-auto">{l.emails.join(', ')}</div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h4 className="font-semibold mb-3">Send Attempts</h4>
            {sendLogs.length === 0 ? (
              <p className="muted">No send attempts yet.</p>
            ) : (
              <div className="space-y-3">
                {sendLogs.map((slog, idx) => (
                  <div key={idx} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <div className="font-medium">Attempted: {slog.attempted}</div>
                      <div className="text-sm muted">{new Date(slog.time).toLocaleString()}</div>
                    </div>
                    <div className="text-sm muted">Success: {slog.success_count} • Failed: {slog.failed_count}</div>
                    {slog.failed_emails && slog.failed_emails.length > 0 && (
                      <details className="mt-2 text-sm">
                        <summary className="cursor-pointer">Show failed emails and errors</summary>
                        <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                          {slog.failed_emails.map((f: any, errorIndex: number) => (
                            <div key={errorIndex} className="text-xs border rounded-lg p-2">
                              <div className="font-medium break-all">{f.email || f}</div>
                              {f.error && <div className="mt-1 text-red-400 break-words">{f.error}</div>}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 mt-6 lg:mt-0">
            <h4 className="font-semibold mb-3">Last Backend Response</h4>
            {!sendResult ? (
              <p className="muted">No send response yet.</p>
            ) : (
              <div className="text-sm space-y-2">
                <div>Total: {sendResult.total ?? '—'}</div>
                <div>Success: {sendResult.success_count ?? 0}</div>
                <div>Failed: {sendResult.failed_count ?? 0}</div>
                {sendResult.failed_emails?.length > 0 && (
                  <details>
                    <summary className="cursor-pointer">Inspect backend errors</summary>
                    <div className="mt-2 space-y-2 max-h-52 overflow-y-auto">
                      {sendResult.failed_emails.map((f: any, errorIndex: number) => (
                        <div key={errorIndex} className="text-xs border rounded-lg p-2">
                          <div className="font-medium break-all">{f.email}</div>
                          <div className="mt-1 text-red-400 break-words">{f.error}</div>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>

    {/* Dashboard images gallery */}
    <section className="py-6">
      <div className="max-w-7xl mx-auto px-6">
        <h3 className="text-2xl font-semibold mb-4">Preview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl overflow-hidden card-elevated">
            <img src="/dashboard-1.svg" alt="dashboard" className="w-full h-auto" />
          </div>
          <div className="rounded-2xl overflow-hidden card-elevated">
            <img src="/dashboard-2.svg" alt="dashboard" className="w-full h-auto" />
          </div>
        </div>
      </div>
    </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white/0">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 glass-card rounded-xl flex gap-4 items-start">
              <img src="/icon-1.svg" alt="icon" className="h-12 w-12 animate-floaty" />
              <div>
                <h4 className="font-semibold mb-2">AI Email Extraction</h4>
                <p className="text-sm text-[var(--muted)]">Extract contact emails from PDFs, CSVs and resumes automatically.</p>
              </div>
            </div>
            <div className="p-6 glass-card rounded-xl flex gap-4 items-start">
              <img src="/icon-2.svg" alt="icon" className="h-12 w-12" />
              <div>
                <h4 className="font-semibold mb-2">Gmail Integration</h4>
                <p className="text-sm text-[var(--muted)]">Connect securely and send personalized emails from your account.</p>
              </div>
            </div>
            <div className="p-6 glass-card rounded-xl flex gap-4 items-start">
              <img src="/icon-3.svg" alt="icon" className="h-12 w-12" />
              <div>
                <h4 className="font-semibold mb-2">Scale & Personalize</h4>
                <p className="text-sm text-[var(--muted)]">Send high-volume outreach while keeping messages personalized.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
