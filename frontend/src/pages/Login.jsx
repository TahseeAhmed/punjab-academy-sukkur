import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to sign in. Check your credentials and try again.');
      toast.error('Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - identity */}
      <div className="hidden lg:flex w-[42%] bg-forest text-white flex-col justify-between p-12 ledger-bg relative overflow-hidden">
        <div>
          <div className="w-14 h-14 rounded-full border-2 border-gold-light flex items-center justify-center mb-8">
            <span className="font-display text-xl font-semibold text-gold-light">PA</span>
          </div>
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-sm">
            Punjab Academy, Sukkur
          </h1>
          <p className="text-white/60 mt-4 max-w-xs leading-relaxed">
            One register for students, attendance, fees and results — open to admin, teachers and students alike.
          </p>
        </div>
        <p className="text-xs text-white/40">Academy Management System</p>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-paper">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
              <span className="font-display text-sm font-semibold text-gold-light">PA</span>
            </div>
            <p className="font-display text-lg font-semibold text-ink">Punjab Academy</p>
          </div>

          <h2 className="font-display text-2xl font-semibold text-ink">Sign in</h2>
          <p className="text-sm text-ink-muted mt-1.5 mb-7">Use the email and password your academy gave you.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@punjabacademy.com"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            {error && (
              <p className="text-sm text-danger bg-danger-50 border border-danger/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
