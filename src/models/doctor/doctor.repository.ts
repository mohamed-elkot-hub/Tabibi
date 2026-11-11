import { InjectModel } from "@nestjs/mongoose";
import { abstractRepository } from "../abstract.repository.js";
import { Injectable } from "@nestjs/common";
import { Model } from "mongoose";
import { Doctor, DoctorDocument } from "./doctor.schema.js";


@Injectable()
export class DoctorRepository extends abstractRepository<DoctorDocument>{

constructor(@InjectModel(Doctor.name) doctorModel : Model<DoctorDocument>){
    super(doctorModel)
}

}