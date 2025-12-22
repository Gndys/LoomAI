import { auth } from '@libs/auth';

type GetSessionArgs = Parameters<typeof auth.api.getSession>[0];

/**
 * Wraps better-auth's getSession to avoid surfacing APIError instances to Next.js runtime.
 */
export async function safeGetSession(args?: GetSessionArgs) {
  try {
    return await auth.api.getSession(args ?? { headers: new Headers() });
  } catch (error) {
    console.error('safeGetSession: Failed to get session', error);
    return null;
  }
}
