export interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: string;
  profile?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
