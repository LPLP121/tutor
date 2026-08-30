import { auth } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';

const ANON_COOKIE = 'tutor_anon_id';

export async function getLearnerId(): Promise<string> {
  const { userId } = await auth();
  if (userId) return userId;

  const jar = await cookies();
  const existing = jar.get(ANON_COOKIE)?.value;
  if (existing) return existing;

  const fresh = `anon_${randomUUID()}`;
  jar.set(ANON_COOKIE, fresh, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 90,
  });
  return fresh;
}