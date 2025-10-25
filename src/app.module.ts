import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";

import { DatabaseModule } from "./db/db.module";
import { RoomsModule } from "./rooms/rooms.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DatabaseModule, RoomsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
