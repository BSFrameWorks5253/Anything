/**
 * Utility to extract user initials.
 * Requirement: The first letter of the email is used as the profile letter.
 * e.g. "burhanuddin@..." -> "B"
 * e.g. "zeninfosys@..." -> "Z"
 */
export function getProfileInitial(user?: { email?: string; name?: string } | null): string {
  if (!user) return 'B';

  const email = (user.email || '').trim();
  if (email.length > 0) {
    const clean = email.replace(/^[^a-zA-Z0-9]+/, '');
    if (clean.length > 0) {
      return clean.charAt(0).toUpperCase();
    }
  }

  const name = (user.name || '').trim();
  if (name.length > 0) {
    const clean = name.replace(/^[^a-zA-Z0-9]+/, '');
    if (clean.length > 0) {
      return clean.charAt(0).toUpperCase();
    }
  }

  return 'B';
}

/**
 * Returns a consistent stylish color gradient for an initial
 */
export function getInitialGradient(initial: string): string {
  const code = (initial.charCodeAt(0) || 65) % 6;
  const gradients = [
    'from-cyan-500 via-sky-500 to-blue-600',
    'from-purple-500 via-pink-500 to-rose-500',
    'from-emerald-400 via-teal-500 to-cyan-600',
    'from-amber-400 via-orange-500 to-red-500',
    'from-indigo-500 via-purple-500 to-pink-500',
    'from-rose-500 via-red-500 to-orange-500',
  ];
  return gradients[code];
}
