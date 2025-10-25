import { Module } from "@nestjs/common";

import { DatabaseModule } from "../db/db.module";
import { RoomsModule } from "../rooms/rooms.module";

import { ReservationsController } from "./reservations.controller";
import { ReservationsRepository } from "./reservations.repository";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [DatabaseModule, RoomsModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
  exports: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
