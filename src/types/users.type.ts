export type TUSer = {
  id: number;
  email: string;
  username: string;
  bio?: string | null;
  image?: string | null;
};

export type TAuthenticatedUser = TUSer & {
  token: string;
};
