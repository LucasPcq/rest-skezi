import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createAppWithDb } from "./utils/app-factory-db";

describe("Reservations API (e2e)", () => {
  let app: INestApplication;
  let resetDb: () => Promise<void>;

  beforeAll(async () => {
    const setup = await createAppWithDb();
    app = setup.app;
    resetDb = setup.resetDb;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await resetDb();
  });

  const createRoom = async (name: string, capacity = 10) => {
    const response = await request(app.getHttpServer())
      .post("/rooms")
      .send({ name, capacity })
      .expect(201);

    return response.body.data;
  };

  const createReservation = (
    payload: { roomId: number; startTime: string; endTime: string },
    status = 201,
  ) => request(app.getHttpServer()).post("/reservations").send(payload).expect(status);

  it("should create a reservation when the slot is available", async () => {
    const room = await createRoom("Ocean");

    const response = await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T09:00:00+01:00",
      endTime: "2030-03-01T10:30:00+01:00",
    });

    expect(response.body).toEqual({
      data: expect.objectContaining({
        id: expect.any(Number),
        roomId: room.id,
      }),
      meta: {},
    });
  });

  it("should reject a reservation when the slot overlaps", async () => {
    const room = await createRoom("Ocean");

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T09:00:00+01:00",
      endTime: "2030-03-01T10:00:00+01:00",
    });

    const response = await createReservation(
      {
        roomId: room.id,
        startTime: "2030-03-01T09:30:00+01:00",
        endTime: "2030-03-01T10:30:00+01:00",
      },
      400,
    );

    expect(response.body).toEqual({
      data: null,
      meta: {},
      error: {
        code: "RESERVATION_OVERLAP",
        message: "The room is already reserved for this time slot.",
      },
    });
  });

  it("should return reservations in an envelope when listing all reservations", async () => {
    const room = await createRoom("Ocean");

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T09:00:00+01:00",
      endTime: "2030-03-01T10:00:00+01:00",
    });

    const response = await request(app.getHttpServer()).get("/reservations").expect(200);

    expect(response.body.meta).toEqual({ total: 1 });
    expect(response.body.data).toHaveLength(1);
  });
});
