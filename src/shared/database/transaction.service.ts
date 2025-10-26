import { Inject, Injectable } from "@nestjs/common";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgTransactionConfig } from "drizzle-orm/pg-core";

import { DATABASE_PROVIDER } from "../../db/db.provider";
import type { schema } from "../../db/schema";

export type DatabaseTransaction = Parameters<
  Parameters<NodePgDatabase<typeof schema>["transaction"]>[0]
>[0];

@Injectable()
export class TransactionService {
  constructor(@Inject(DATABASE_PROVIDER) private db: NodePgDatabase<typeof schema>) {}

  async execute<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>,
    config?: PgTransactionConfig,
  ): Promise<T> {
    return this.db.transaction(callback, config);
  }
}
