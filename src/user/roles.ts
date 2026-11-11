export const ADMIN_ROLE = 'admin';
export const DEFAULT_ROLE = 'user';

export const isAdmin = (user: { role: string }): boolean => user.role === ADMIN_ROLE;
