import { HydratedDocument } from "mongoose";
import { User } from "../models/user/user.schema";

export type UserDocument = HydratedDocument<User>;
