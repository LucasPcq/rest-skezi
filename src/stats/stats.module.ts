import { Module } from "@nestjs/common";

import { DatabaseModule } from "../db/db.module";
import { RoomsModule } from "../rooms/rooms.module";

import { StatsController } from "./stats.controller";
import { StatsRepository } from "./stats.repository";
import { StatsService } from "./stats.service";

@Module({
  imports: [DatabaseModule, RoomsModule],
  controllers: [StatsController],
  providers: [StatsService, StatsRepository],
  exports: [StatsService],
})
export class StatsModule {}
