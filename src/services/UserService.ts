import Service from './Service';

const API_URL = import.meta.env.VITE_API_URL;

export type AppUser = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
  themePreference: 'LIGHT' | 'DARK' | 'DEVICE';
  createdAt: string;
  updatedAt: string;
};

/** Display name from app (backend) profile fields. */
export function formatAppUserName(user: AppUser | null | undefined): string {
  if (!user) return '';
  return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
}

export type BootstrapResult = {
  user: AppUser;
  isPlatformAdmin: boolean;
};

function splitName(name: string | null | undefined): {
  firstName?: string;
  lastName?: string | null;
} {
  const trimmed = name?.trim();
  if (!trimmed) return {};

  const [firstName, ...rest] = trimmed.split(/\s+/);
  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(' ') : null,
  };
}

class UserService extends Service {
  /** Provision app User + default Personal org from Neon Auth session (idempotent). */
  async bootstrap(
    token: string,
    neonUser?: { name?: string | null; email?: string | null; image?: string | null },
  ): Promise<[BootstrapResult | null, string | undefined]> {
    if (!API_URL) {
      return [null, 'VITE_API_URL is not configured'];
    }

    const { firstName, lastName } = splitName(neonUser?.name);
    const email =
      typeof neonUser?.email === 'string' && neonUser.email.includes('@')
        ? neonUser.email.trim()
        : undefined;
    const profilePicture =
      typeof neonUser?.image === 'string' && neonUser.image.startsWith('http')
        ? neonUser.image
        : undefined;

    return this.request<BootstrapResult>(`${API_URL}/api/v1/me/bootstrap`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(email ? { email } : {}),
        ...(firstName ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(profilePicture ? { profilePicture } : {}),
      }),
    });
  }
}

export default new UserService();
