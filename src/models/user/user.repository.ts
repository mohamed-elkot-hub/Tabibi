import { InjectModel } from "@nestjs/mongoose";
import { abstractRepository } from "../abstract.repository.js";
import { User, UserDocument } from "./user.schema.js";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";


@Injectable()
export class UserRepository extends abstractRepository<UserDocument>{

constructor(@InjectModel(User.name) userModel : Model<UserDocument>){
    super(userModel)
}

}