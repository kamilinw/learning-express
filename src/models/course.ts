import { Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "COURSES",
})
export class Course {
  @PrimaryGeneratedColumn()
  id: number;
  seqNo: number;
  title: string;
  iconUrl: string;
  longDescription: string;
  categoty: string;
}
