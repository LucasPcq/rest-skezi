import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

import { AppModule } from "./app.module";
import { EnvelopeExceptionFilter } from "./shared/filters/envelope-exception.filter";
import { EnvelopeInterceptor } from "./shared/interceptors/envelope.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new EnvelopeExceptionFilter());
  app.useGlobalInterceptors(new EnvelopeInterceptor());

  const config = new DocumentBuilder()
    .setTitle("Meeting Room Reservation API")
    .setDescription("API for managing meeting rooms and reservations")
    .setVersion("1.0")
    .addTag("rooms", "Room management endpoints")
    .addTag("reservations", "Reservation management endpoints")
    .addTag("stats", "Statistics and analytics endpoints")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
