import { Module } from "@nestjs/common";

import { DatabaseModule } from "../../db/db.module";
import { ReservationQueriesService } from "./reservation-queries.service";

@Module({
  imports: [DatabaseModule],
  providers: [ReservationQueriesService],
  exports: [ReservationQueriesService],
})
export class ReservationQueriesModule {}
