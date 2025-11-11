export interface User {
  name: string;
  avatarUrl: string;
  role: 'user' | 'admin';
}