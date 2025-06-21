import { useState } from "react";
import { RedditSetupInstructions } from "@/components/reddit-setup-instructions";
import { CredentialsForm } from "@/components/credentials-form";
import { CommentExtractor } from "@/components/comment-extractor";
import type { RedditCredentials } from "@shared/schema";

export default function Home() {
  const [credentials, setCredentials] = useState<RedditCredentials | null>(null);

  return (
    <div className="bg-slate-900 text-slate-50 font-sans min-h-screen">
      {/* Header */}
      <header className="bg-surface border-b border-surface-variant">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-primary/10 p-3 rounded-xl">
              <i className="fab fa-reddit-alien text-primary text-2xl"></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-50">Reddit Comment Extractor</h1>
              <p className="text-slate-300 mt-1">Extract and download comments from any Reddit post</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <RedditSetupInstructions onComplete={() => {}} isCompleted={false} />
        <CredentialsForm onSubmit={setCredentials} isCompleted={false} />
        {credentials && <CommentExtractor credentials={credentials} />}

        {/* Features Section */}
        <section className="mb-12">
          <div className="bg-surface rounded-2xl p-8 border border-surface-variant">
            <h2 className="text-2xl font-bold text-center text-slate-50 mb-8">What You Get</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="bg-blue-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-code text-blue-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-slate-50 mb-2">JSON Format</h3>
                <p className="text-sm text-slate-400">Structured data with comment metadata, timestamps, votes, and nested replies</p>
              </div>

              <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="bg-green-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-file-alt text-green-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-slate-50 mb-2">Readable Text</h3>
                <p className="text-sm text-slate-400">Clean, formatted text file with comments and replies in an easy-to-read format</p>
              </div>

              <div className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="bg-purple-500/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-shield-alt text-purple-400 text-xl"></i>
                </div>
                <h3 className="font-semibold text-slate-50 mb-2">Secure & Private</h3>
                <p className="text-sm text-slate-400">All processing happens in your browser. No data is sent to external servers</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-surface-variant py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-sm">
            Built for extracting Reddit comments • Uses Reddit API • 
            <a href="#" className="text-primary hover:text-blue-400 transition-colors ml-1">Privacy Policy</a> • 
            <a href="#" className="text-primary hover:text-blue-400 transition-colors ml-1">Terms of Service</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
