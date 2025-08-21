export type User = {
  id: string;
  email: string;
  user_metadata?: {
    role?: 'user' | 'super_admin';
    name?: string;
  };
};

export type UserEntry = {
  id: string;
  name: string;
  mobile: string;
  address: string;
  dateAdded: string;
  userId: string;
};
