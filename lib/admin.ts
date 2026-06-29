export const ADMIN_EMAIL = 'leteon2026@gmail.com'

export function isAdmin(email: string | undefined | null): boolean {
  return email === ADMIN_EMAIL
}
