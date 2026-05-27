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

  const [customMessage, setCustomMessage] = useState(
`Hello,

I am Prince Yadav, a Backend & DevOps developer interested in internship opportunities.

Thank You.`
  );

  // Upload File

  const uploadFile = async () => {

    if (!file) {
      alert("Please select file");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("file", file);

      const res = await axios.post(
        "http://127.0.0.1:8000/upload-csv",
        formData
      );

      setResponseType(res.data.type);

      if (res.data.emails_found) {
        setEmails(res.data.emails_found);
      }

      setLoading(false);

    } catch (error) {

      console.log(error);

      setLoading(false);

      alert("Upload Failed");
    }
  };

  // Send Bulk Emails

  const sendBulkMails = async () => {

    if (!session) {
      alert("Please Login With Google");
      return;
    }

    try {

      setSending(true);

      const selectedEmails = emails.slice(0, emailLimit);

      const res = await axios.post(
        "http://127.0.0.1:8000/send-bulk-mails",
        {
          emails: selectedEmails,
          message: customMessage,
        }
      );

      console.log(res.data);

      setSending(false);

      alert("Bulk Emails Sent Successfully");

    } catch (error) {

      console.log(error);

      setSending(false);

      alert("Failed To Send Emails");
    }
  };

  return (

    <main className="min-h-screen bg-black text-white">

      {/* Navbar */}

      <nav className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-xl sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold">
              AI Cold Mail Agent
            </h1>

            <p className="text-zinc-400 text-sm mt-1">
              Automated HR Outreach Platform
            </p>

          </div>

          {

            !session ? (

              <button
                onClick={() => signIn("google")}
                className="bg-white text-black px-6 py-3 rounded-2xl font-semibold hover:scale-105 transition"
              >
                Login With Google
              </button>

            ) : (

              <div className="flex items-center gap-4">

                <div className="text-right">

                  <p className="text-green-400 font-semibold">
                    Connected
                  </p>

                  <p className="text-sm text-zinc-400">
                    {session.user?.email}
                  </p>

                </div>

                <button
                  onClick={() => signOut()}
                  className="bg-red-600 hover:bg-red-700 px-5 py-3 rounded-2xl"
                >
                  Logout
                </button>

              </div>

            )

          }

        </div>

      </nav>

      {/* Hero */}

      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="mb-12">

          <h2 className="text-6xl font-bold leading-tight max-w-4xl">

            Automate Your
            <span className="text-blue-500"> Cold Outreach </span>
            With AI

          </h2>

          <p className="text-zinc-400 text-lg mt-6 max-w-2xl leading-relaxed">

            Upload HR PDFs or CSVs, extract emails automatically,
            connect your Gmail account, and send personalized cold emails
            at scale.

          </p>

        </div>

        {/* Upload Cards */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* HR Upload */}

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">

            <h3 className="text-3xl font-bold mb-6">
              Upload HR Contacts
            </h3>

            <input
              type="file"
              onChange={(e) => {

                if (e.target.files) {
                  setFile(e.target.files[0]);
                }

              }}
              className="w-full bg-black border border-zinc-700 rounded-2xl p-4 mb-6"
            />

            <button
              onClick={uploadFile}
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl font-semibold transition hover:scale-105"
            >
              {
                loading
                  ? "Uploading..."
                  : "Upload File"
              }
            </button>

          </div>

          {/* Resume Upload */}

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 backdrop-blur-xl">

            <h3 className="text-3xl font-bold mb-6">
              Upload Resume
            </h3>

            <input
              type="file"
              onChange={(e) => {

                if (e.target.files) {
                  setResume(e.target.files[0]);
                }

              }}
              className="w-full bg-black border border-zinc-700 rounded-2xl p-4 mb-6"
            />

            <div className="bg-black border border-zinc-800 rounded-2xl p-4">

              <p className="text-zinc-400">
                {
                  resume
                    ? resume.name
                    : "No Resume Uploaded"
                }
              </p>

            </div>

          </div>

        </div>

        {/* Analytics */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              Emails Extracted
            </p>

            <h2 className="text-5xl font-bold">
              {emails.length}
            </h2>

          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              File Type
            </p>

            <h2 className="text-5xl font-bold uppercase">
              {responseType || "N/A"}
            </h2>

          </div>

          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8">

            <p className="text-zinc-400 mb-3">
              Selected Emails
            </p>

            <h2 className="text-5xl font-bold text-green-400">
              {emailLimit}
            </h2>

          </div>

        </div>

        {/* Controls */}

        <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-10 mt-12">

          <h2 className="text-4xl font-bold mb-10">
            Email Controls
          </h2>

          {/* Limit */}

          <div className="mb-8">

            <label className="block mb-3 text-zinc-400 text-lg">
              Number Of Emails To Send
            </label>

            <input
              type="number"
              value={emailLimit}
              onChange={(e) => setEmailLimit(Number(e.target.value))}
              className="w-full bg-black border border-zinc-700 rounded-2xl p-4 text-lg"
            />

          </div>

          {/* Message */}

          <div className="mb-8">

            <label className="block mb-3 text-zinc-400 text-lg">
              Custom Email Message
            </label>

            <textarea
              rows={10}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full bg-black border border-zinc-700 rounded-2xl p-5 text-lg"
            />

          </div>

          <button
            onClick={sendBulkMails}
            className="bg-green-600 hover:bg-green-700 px-10 py-5 rounded-2xl text-xl font-semibold transition hover:scale-105"
          >
            {
              sending
                ? "Sending Emails..."
                : "Send Bulk Emails"
            }
          </button>

        </div>

        {/* Email List */}

        {

          emails.length > 0 && (

            <div className="mt-14">

              <h2 className="text-4xl font-bold mb-8">
                Extracted Emails
              </h2>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-6 max-h-[600px] overflow-y-auto">

                <div className="grid gap-4">

                  {

                    emails
                      .slice(0, emailLimit)
                      .map((email, index) => (

                        <div
                          key={index}
                          className="bg-black border border-zinc-800 rounded-2xl p-5 flex items-center justify-between"
                        >

                          <p className="text-lg break-all">
                            {email}
                          </p>

                          <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl">
                            Ready
                          </div>

                        </div>

                      ))

                  }

                </div>

              </div>

            </div>

          )

        }

      </section>

    </main>
  );
}