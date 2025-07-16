export type INTERFACE_ROLE_KEY = 'admin';
// 平台用的角色值
export const ROLE: Record<INTERFACE_ROLE_KEY, INTERFACE_ROLE_KEY> = {
  admin: 'admin',
} as const;
// 后端对应的角色值
export const ROLE_BACKEND: Record<INTERFACE_ROLE_KEY, string> = {
  admin: 'administrator', // 管理员
} as const;

export const HOME_PATH = '/task-list';

export const PRIMARY_COLOR = '#7b7ac4';
