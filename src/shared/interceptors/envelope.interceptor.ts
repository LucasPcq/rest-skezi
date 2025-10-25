import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Observable } from "rxjs";
import { map } from "rxjs";

export type EnvelopeResponse<T> = {
  data: T;
  meta?: Record<string, unknown>;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

@Injectable()
export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((value) => {
        if (this.isEnvelope(value)) {
          return {
            data: value.data,
            meta: isPlainObject(value.meta) ? value.meta : {},
          };
        }

        return {
          data: value,
          meta: {},
        };
      }),
    );
  }

  private isEnvelope(value: unknown): value is EnvelopeResponse<unknown> {
    if (!isPlainObject(value)) {
      return false;
    }

    return "data" in value;
  }
}
