export type User = {
  id: string;
  username: string;
  email: string;
};

export type AuthResponse = {
  user: User;
};

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};