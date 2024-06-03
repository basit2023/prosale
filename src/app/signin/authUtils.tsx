import { setCookie } from 'nookies';
import { Session } from 'next-auth';

export function handleRememberMe(rememberMeValue: boolean, session: Session | null | undefined) {
  if (rememberMeValue && session) {
    // Set cookie for 30 days
    setCookie(null, 'rememberMe', 'true', { maxAge: 30 * 24 * 60 * 60, path: '/' });
    session?.maxAge = 30 * 24 * 60 * 60; // 30 days
  } else if (!rememberMeValue && session) {
    // Set cookie to expire on tab close
    setCookie(null, 'rememberMe', 'false', { maxAge: -1, path: '/' });
    session?.maxAge = undefined; // Session will expire on tab close
  }
}

