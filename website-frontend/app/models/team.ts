import { Event } from "./event";
import { User } from "./user";

export interface Team {
  id: string;
  event: Event;
  teamNumber: string;
  conference: string;
  members: User[];
  captain: User;
  checkInDate: string;
}