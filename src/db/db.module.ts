import { Module } from "@nestjs/common";

import { DATABASE_PROVIDER, DB_PROVIDER } from "./db.provider";

@Module({
  providers: [...DB_PROVIDER],
  exports: [DATABASE_PROVIDER],
})
export class DatabaseModule {}
