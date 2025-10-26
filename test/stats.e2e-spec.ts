import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createAppWithDb } from "./utils/app-factory-db";

describe("Stats API (e2e)", () => {
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

  const createReservation = async (payload: {
    roomId: number;
    startTime: string;
    endTime: string;
  }) => {
    await request(app.getHttpServer()).post("/reservations").send(payload).expect(201);
  };

  it("should compute daily occupancy when querying the occupancy endpoint", async () => {
    const room = await createRoom("Ocean");

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T08:00:00+01:00",
      endTime: "2030-03-01T11:00:00+01:00",
    });

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T14:00:00+01:00",
      endTime: "2030-03-01T17:00:00+01:00",
    });

    const response = await request(app.getHttpServer())
      .get("/stats/occupancy")
      .query({ roomId: room.id, period: "daily", date: "2030-03-01" })
      .expect(200);

    expect(response.body).toEqual({ data: { rate: 25 }, meta: {} });
  });

  it("should compute average duration when querying for a room", async () => {
    const room = await createRoom("Ocean");

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-01T08:00:00+01:00",
      endTime: "2030-03-01T10:00:00+01:00",
    });

    await createReservation({
      roomId: room.id,
      startTime: "2030-03-02T08:00:00+01:00",
      endTime: "2030-03-02T09:00:00+01:00",
    });

    const response = await request(app.getHttpServer())
      .get("/stats/average-duration")
      .query({ roomId: room.id })
      .expect(200);

    expect(response.body).toEqual({ data: { averageMinutes: 90 }, meta: {} });
  });

  it("should list the top rooms when requesting the ranking", async () => {
    const firstRoom = await createRoom("Ocean");
    const secondRoom = await createRoom("Harbor");

    await createReservation({
      roomId: firstRoom.id,
      startTime: "2030-03-01T08:00:00+01:00",
      endTime: "2030-03-01T09:00:00+01:00",
    });

    await createReservation({
      roomId: firstRoom.id,
      startTime: "2030-03-02T08:00:00+01:00",
      endTime: "2030-03-02T09:00:00+01:00",
    });

    await createReservation({
      roomId: secondRoom.id,
      startTime: "2030-03-01T08:00:00+01:00",
      endTime: "2030-03-01T09:00:00+01:00",
    });

    const response = await request(app.getHttpServer()).get("/stats/top-rooms").expect(200);

    expect(response.body.data[0]).toMatchObject({ roomId: firstRoom.id, reservationCount: 2 });
    expect(response.body.meta).toEqual({ total: 2 });
  });
});
