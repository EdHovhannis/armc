export interface AuthResult {
  user: User;
  username: string;
  redirect?: string;
}

export interface User {
  id: string;
  name: string;
  admin: boolean;
}

export interface SearchUsers {
  currentCountOfUsers: number;
  maxCountOfUsers: number;
  users: User[];
}

export type AuthType = 'legacy' | 'autz';
