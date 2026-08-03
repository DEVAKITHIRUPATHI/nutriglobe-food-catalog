import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Github, CheckCircle2, LogOut, Loader2, GitBranch, ExternalLink, ShieldCheck } from 'lucide-react';

export const GitHubConnectButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Check connection status on load
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/auth/github/status');
      if (res.ok) {
        const data = await res.json();
        setIsConnected(data.connected);
        if (data.user) setGithubUser(data.user);
      }
    } catch (e) {
      console.error('Failed to fetch GitHub status:', e);
    }
  };

  useEffect(() => {
    checkStatus();

    // Listen for OAuth completion from popup postMessage
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GITHUB_OAUTH_SUCCESS') {
        setIsConnected(true);
        setGithubUser(event.data.user);
        setStatusMsg('GitHub account successfully linked!');
        checkStatus();
      } else if (event.data?.type === 'GITHUB_OAUTH_ERROR') {
        setStatusMsg(`OAuth Error: ${event.data.error}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    setStatusMsg('');
    try {
      const res = await fetch('/api/auth/github/url');
      if (!res.ok) throw new Error('Could not retrieve OAuth URL');
      const { url } = await res.json();

      // Open OAuth popup window
      const popup = window.open(
        url,
        'github_oauth_popup',
        'width=600,height=700,status=no,menubar=no,toolbar=no'
      );

      if (!popup) {
        setStatusMsg('Popup blocked. Please allow popups for this site to finish OAuth.');
      }
    } catch (err: any) {
      setStatusMsg(`Connection error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch('/api/auth/github/disconnect', { method: 'POST' });
      setIsConnected(false);
      setGithubUser(null);
      setStatusMsg('Disconnected from GitHub.');
    } catch (e) {
      console.error('Failed to disconnect:', e);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className={`text-xs font-bold rounded-xl gap-1.5 transition-all shadow ${
          isConnected
            ? 'bg-slate-900 text-emerald-400 border border-emerald-500/40 hover:bg-slate-800'
            : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-600'
        }`}
      >
        <Github className="w-3.5 h-3.5 text-slate-200" />
        <span className="hidden sm:inline">
          {isConnected ? `@${githubUser?.login}` : 'Connect GitHub'}
        </span>
        {isConnected && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md bg-slate-900 text-white border-slate-800">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Github className="w-5 h-5 text-emerald-400" />
              GitHub OAuth Integration
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Connect your GitHub account using Client ID <code className="text-emerald-300 font-mono">Ov23liMXY9Bh97JVHJJK</code>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {isConnected && githubUser ? (
              <div className="p-4 bg-slate-800/80 rounded-2xl border border-emerald-500/30 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={githubUser.avatar_url}
                    alt={githubUser.login}
                    className="w-12 h-12 rounded-full border-2 border-emerald-400"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                      {githubUser.name}
                      <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">Connected</Badge>
                    </h4>
                    <p className="text-xs text-slate-400">@{githubUser.login}</p>
                  </div>
                </div>

                <div className="text-xs text-slate-300 space-y-1 font-mono pt-2 border-t border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Public Repos:</span>
                    <span className="text-emerald-400 font-bold">{githubUser.public_repos || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Client ID:</span>
                    <span className="text-slate-200">Ov23liMXY9Bh97...</span>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <a
                    href={githubUser.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1"
                  >
                    <Button variant="outline" size="sm" className="w-full text-xs border-slate-700 hover:bg-slate-700 text-slate-200 gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Profile
                    </Button>
                  </a>
                  <Button
                    onClick={handleDisconnect}
                    variant="destructive"
                    size="sm"
                    className="text-xs gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700 space-y-3 text-center">
                <GitBranch className="w-10 h-10 mx-auto text-emerald-400 animate-bounce" />
                <h4 className="text-sm font-bold">Connect your GitHub Repository</h4>
                <p className="text-xs text-slate-400">
                  Authorizes repository sync & version management using secure OAuth credentials.
                </p>

                <Button
                  onClick={handleConnect}
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-md gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Github className="w-4 h-4" />}
                  Authorize with GitHub OAuth
                </Button>
              </div>
            )}

            {statusMsg && (
              <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{statusMsg}</span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
