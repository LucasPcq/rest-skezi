import { Module } from "@nestjs/common";

import { DatabaseModule } from "../db/db.module";
import { RoomsModule } from "../rooms/rooms.module";
import { ReservationQueriesModule } from "../shared/reservation-queries/reservation-queries.module";
import { TransactionService } from "../shared/database/transaction.service";

import { ReservationsController } from "./reservations.controller";
import { ReservationsRepository } from "./reservations.repository";
import { ReservationsService } from "./reservations.service";

@Module({
  imports: [DatabaseModule, RoomsModule, ReservationQueriesModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository, TransactionService],
  exports: [ReservationsService, ReservationsRepository],
})
export class ReservationsModule {}
