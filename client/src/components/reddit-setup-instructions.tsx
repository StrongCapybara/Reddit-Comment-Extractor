import { Button } from "@/components/ui/button";

interface RedditSetupInstructionsProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export function RedditSetupInstructions({ onComplete, isCompleted }: RedditSetupInstructionsProps) {
  return (
    <section className="mb-12">
      <div className="bg-surface rounded-2xl p-8 border border-surface-variant">
        <div className="flex items-start space-x-4 mb-6">
          <div className="bg-primary/10 p-3 rounded-xl">
            <i className="fas fa-cog text-primary text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">Step 1: Create Reddit Application</h2>
            <p className="text-slate-300">Follow these steps to create a Reddit app and get your API credentials</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <span className="text-primary font-bold text-sm">1</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-50 mb-2">Visit Reddit App Preferences</h3>
                <p className="text-slate-300 mb-3">Go to Reddit's app preferences page and log in with your Reddit account.</p>
                <a href="https://www.reddit.com/prefs/apps" target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                  <i className="fas fa-external-link-alt text-sm"></i>
                  <span>Open Reddit Apps</span>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <span className="text-primary font-bold text-sm">2</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-50 mb-2">Create New Application</h3>
                <p className="text-slate-300 mb-3">Click "Create App" or "Create Another App" button and fill in the details:</p>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-circle text-xs text-primary"></i>
                    <span><strong>Name:</strong> Reddit Comment Extractor (or any name you prefer)</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-circle text-xs text-primary"></i>
                    <span><strong>App type:</strong> Select "script"</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-circle text-xs text-primary"></i>
                    <span><strong>Description:</strong> Tool for extracting Reddit comments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <i className="fas fa-circle text-xs text-primary"></i>
                    <span><strong>Redirect URI:</strong> http://localhost:8080</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-start space-x-4">
              <div className="bg-primary/20 p-2 rounded-lg">
                <span className="text-primary font-bold text-sm">3</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-50 mb-2">Get Your Credentials</h3>
                <p className="text-slate-300 mb-3">After creating the app, you'll see your credentials:</p>
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-key text-yellow-400"></i>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Client ID</p>
                        <p className="text-xs text-slate-400">Located under your app name (14 character string)</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <i className="fas fa-lock text-red-400"></i>
                      <div>
                        <p className="text-sm font-medium text-slate-300">Client Secret</p>
                        <p className="text-xs text-slate-400">Next to "secret" label (longer string)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-6 flex justify-end">
            <Button onClick={onComplete} className="bg-primary hover:bg-blue-600">
              I've Created My Reddit App
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
