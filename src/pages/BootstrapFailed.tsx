import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthUI';
import { Button } from '../components/common/Button';

export default function BootstrapFailed({ message }: { message: string }) {
  const { refresh, signout } = useAuth();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    await refresh();
    setRetrying(false);
  };

  return (
    <AuthShell
      title="Couldn't load your account"
      subtitle="You're signed in, but the AInvoker API didn't respond. Check that it's running and that this site's origin is in CORS_ORIGIN, then try again."
    >
      <p className="mb-4 rounded-lg bg-red-50 px-3 py-2.5 font-mono text-xs text-red-700">{message}</p>
      <div className="flex flex-col gap-2">
        <Button className="w-full py-3" onClick={handleRetry} loading={retrying}>
          Try again
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => void signout()}>
          Sign out
        </Button>
      </div>
    </AuthShell>
  );
}
