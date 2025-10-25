import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";

const DEFAULT_MESSAGE = "An unexpected error occurred.";

type HttpExceptionBody = {
  code?: string;
  message?: string | string[];
  error?: string;
  details?: unknown;
  [key: string]: unknown;
};

@Catch()
export class EnvelopeExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      const error = this.normalizeError(body, exception.name);

      return response.status(status).json({
        data: null,
        meta: {},
        error,
      });
    }

    const message = exception instanceof Error ? exception.message : DEFAULT_MESSAGE;
    const stack = exception instanceof Error ? exception.stack : undefined;
    Logger.error(message, stack, "EnvelopeExceptionFilter");

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      data: null,
      meta: {},
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: DEFAULT_MESSAGE,
      },
    });
  }

  private normalizeError(body: unknown, fallbackCode: string) {
    if (typeof body === "string") {
      return {
        code: fallbackCode,
        message: body,
      };
    }

    if (typeof body === "object" && body !== null) {
      const { code, message, error, details } = body as HttpExceptionBody;
      const normalizedMessage = Array.isArray(message)
        ? message.join(", ")
        : typeof message === "string"
          ? message
          : typeof error === "string"
            ? error
            : DEFAULT_MESSAGE;

      const payload: Record<string, unknown> = {
        code: typeof code === "string" ? code : fallbackCode,
        message: normalizedMessage,
      };

      if (details !== undefined) {
        payload.details = details;
      }

      return payload;
    }

    return {
      code: fallbackCode,
      message: DEFAULT_MESSAGE,
    };
  }
}
