import { Link } from 'react-router-dom';
import { Button } from '../components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-display text-6xl font-semibold text-forest">404</p>
      <p className="text-ink-muted mt-3 mb-6">This page doesn't exist.</p>
      <Link to="/"><Button>Back to dashboard</Button></Link>
    </div>
  );
}
