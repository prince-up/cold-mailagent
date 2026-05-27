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
      if (res.data.emails_found) setEmails(res.data.emails_found);
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

      console.log(res.data);
      setSending(false);
      alert("Bulk Emails Sent Successfully");
    } catch (error) {
      console.error(error);
      setSending(false);
      alert("Failed To Send Emails");
    }
  };

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
              <h2 className="text-5xl font-extrabold leading-tight">Automate outreach. Close more roles.</h2>
              <p className="mt-6 text-lg text-[var(--muted)] max-w-xl">Upload HR lists or resumes, extract emails with AI, connect Gmail, and send personalized cold emails at scale.</p>

              <div className="mt-8 flex items-center gap-4">
                <a href="#upload" className="inline-flex items-center gap-3 bg-[var(--accent)] hover:bg-[var(--accent-600)] text-white px-6 py-3 rounded-full font-semibold">Get Started</a>
                <a href="#features" className="text-[var(--muted)]">See Features</a>
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

            <div id="upload" className="glass-card rounded-3xl p-8">
              <h3 className="text-2xl font-semibold mb-4">Upload HR Contacts</h3>
              <input type="file" onChange={(e) => { if (e.target.files) setFile(e.target.files[0]); }} className="w-full border rounded-lg p-3 mb-4" />
              <button onClick={uploadFile} className="bg-[var(--accent)] hover:bg-[var(--accent-600)] text-white px-6 py-3 rounded-lg font-semibold">{loading ? 'Uploading...' : 'Upload & Extract'}</button>

              <hr className="my-6" />

              <h3 className="text-2xl font-semibold mb-4">Email Controls</h3>
              <label className="block text-sm text-[var(--muted)] mb-2">Number of emails to send</label>
              <input type="number" value={emailLimit} onChange={(e) => setEmailLimit(Number(e.target.value))} className="w-full border rounded-lg p-3 mb-4" />

              <label className="block text-sm text-[var(--muted)] mb-2">Custom message</label>
              <textarea rows={6} value={customMessage} onChange={(e) => setCustomMessage(e.target.value)} className="w-full border rounded-lg p-3 mb-4" />

              <div className="flex gap-3">
                <button onClick={sendBulkMails} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg">{sending ? 'Sending...' : 'Send Emails'}</button>
                <button onClick={() => { if (session) { alert('Connected: ' + session.user?.email) } else signIn('google') }} className="border px-4 py-2 rounded-lg">{session ? 'Account' : 'Connect Gmail'}</button>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 bg-white/0">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-3xl font-bold mb-6">Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 glass-card rounded-xl">
              <h4 className="font-semibold mb-2">AI Email Extraction</h4>
              <p className="text-sm text-[var(--muted)]">Extract contact emails from PDFs, CSVs and resumes automatically.</p>
            </div>
            <div className="p-6 glass-card rounded-xl">
              <h4 className="font-semibold mb-2">Gmail Integration</h4>
              <p className="text-sm text-[var(--muted)]">Connect securely and send personalized emails from your account.</p>
            </div>
            <div className="p-6 glass-card rounded-xl">
              <h4 className="font-semibold mb-2">Scale & Personalize</h4>
              <p className="text-sm text-[var(--muted)]">Send high-volume outreach while keeping messages personalized.</p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
