import { AlertTriangle } from "lucide-react";
import { Button } from "./index";

export const LoadError = ({
  message = "Couldn't load this page.",
  onRetry,
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-6">
    <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center mb-4">
      <AlertTriangle size={20} className="text-danger" />
    </div>
    <p className="font-display text-base font-semibold text-ink">{message}</p>
    <p className="text-sm text-ink-muted mt-1 max-w-sm">
      Make sure the backend server is running, then try again.
    </p>
    {onRetry && (
      <Button variant="outline" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);
