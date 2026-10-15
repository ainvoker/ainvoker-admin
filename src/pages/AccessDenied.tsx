import { useState } from 'react';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';
import { useAuth } from '../contexts/AuthContext';
import { AuthShell } from '../components/auth/AuthUI';
import { Button } from '../components/common/Button';
import { CLIENT_URL } from '../utils/auth';

export default function AccessDenied() {
  const { user, signout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignout = async () => {
    setSigningOut(true);
    await signout();
  };

  return (
    <AuthShell
      title="This account doesn't have admin access"
      subtitle={
        <>
          You're signed in as <span className="font-medium text-accent">{user?.email}</span>. The admin
          console is limited to platform operators, but your account works on the AInvoker
          dashboard.
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <Button className="w-full py-3" onClick={() => window.location.assign(CLIENT_URL)}>
          Go to AInvoker dashboard
          <HiOutlineArrowTopRightOnSquare className="size-4" aria-hidden />
        </Button>
        <Button variant="secondary" className="w-full" onClick={handleSignout} loading={signingOut}>
          Sign out
        </Button>
      </div>
    </AuthShell>
  );
}
