export interface User {
  id: number;
  name: string;
  nim: string;
  email: string;
  faculty: string;
  major: string;
  semester: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  nim: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  nim: string;
  email: string;
  faculty: string;
  major: string;
  semester: number;
  password: string;
}
