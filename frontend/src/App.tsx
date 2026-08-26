import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { ProjectAnalysisPage } from './pages/ProjectAnalysisPage';
import { TeamBuilderPage } from './pages/TeamBuilderPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { InvitationsPage } from './pages/InvitationsPage';
import { Sparkles } from 'lucide-react';

// Guard for protected application routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-20 text-slate-400">Loading auth state...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

function App() {
  const { user, logout } = useAuth();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 font-sans">
        {/* Navigation Header */}
        <nav className="glass-panel !rounded-none border-t-0 border-x-0 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <Link to="/" className="font-display text-xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-cyan" />
            <span className="bg-gradient-to-r from-accent-cyan to-accent-ember bg-clip-text text-transparent">ProjectMatch</span>
            <span className="text-[10px] bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full ml-1 stat-mono">MVP v1.0</span>
          </Link>

          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/dashboard" className="text-xs font-semibold text-slate-300 hover:text-teal-400 transition-colors">
                  Dashboard
                </Link>
                <Link to="/onboarding" className="text-xs font-semibold text-slate-300 hover:text-teal-400 transition-colors">
                  Profile
                </Link>
                <Link to="/invitations" className="text-xs font-semibold text-slate-300 hover:text-teal-400 transition-colors">
                  Invitations
                </Link>
                <button onClick={logout} className="btn-secondary !px-3 !py-1 text-xs text-slate-400 hover:text-white">
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-secondary !px-4 !py-1.5 text-xs font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </nav>

        {/* Route Definitions */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/onboarding" element={
              <ProtectedRoute>
                <OnboardingPage />
              </ProtectedRoute>
            } />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />

            <Route path="/projects/new" element={
              <ProtectedRoute>
                <CreateProjectPage />
              </ProtectedRoute>
            } />

            <Route path="/projects/:projectId/analysis" element={
              <ProtectedRoute>
                <ProjectAnalysisPage />
              </ProtectedRoute>
            } />

            <Route path="/projects/:projectId/team" element={
              <ProtectedRoute>
                <TeamBuilderPage />
              </ProtectedRoute>
            } />

            <Route path="/projects/:projectId" element={
              <ProtectedRoute>
                <ProjectDetailPage />
              </ProtectedRoute>
            } />

            <Route path="/invitations" element={
              <ProtectedRoute>
                <InvitationsPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
