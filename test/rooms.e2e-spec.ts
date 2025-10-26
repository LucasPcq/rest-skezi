import type { INestApplication } from "@nestjs/common";
import request from "supertest";

import { createAppWithDb } from "./utils/app-factory-db";

describe("Rooms API (e2e)", () => {
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

  it("should create a room and return it in the envelope when the payload is valid", async () => {
    const response = await request(app.getHttpServer())
      .post("/rooms")
      .send({ name: "Ocean", capacity: 12 })
      .expect(201);

    expect(response.body).toEqual({
      data: expect.objectContaining({
        id: expect.any(Number),
        name: "Ocean",
        capacity: 12,
      }),
      meta: {},
    });
  });

  it("should reject a room creation when the name already exists", async () => {
    await request(app.getHttpServer()).post("/rooms").send({ name: "Ocean", capacity: 12 });

    const response = await request(app.getHttpServer())
      .post("/rooms")
      .send({ name: "Ocean", capacity: 8 })
      .expect(400);

    expect(response.body).toEqual({
      data: null,
      meta: {},
      error: {
        code: "ROOM_NAME_ALREADY_EXISTS",
        message: "A room with this name already exists.",
      },
    });
  });

  it("should filter unavailable rooms when querying availability", async () => {
    const server = app.getHttpServer();

    const firstRoom = await request(server)
      .post("/rooms")
      .send({ name: "Ocean", capacity: 12 })
      .expect(201);
    const secondRoom = await request(server)
      .post("/rooms")
      .send({ name: "Harbor", capacity: 10 })
      .expect(201);

    await request(server)
      .post("/reservations")
      .send({
        roomId: secondRoom.body.data.id,
        startTime: "2030-03-01T09:00:00+01:00",
        endTime: "2030-03-01T10:00:00+01:00",
      })
      .expect(201);

    const response = await request(server)
      .get("/rooms/availability")
      .query({
        date: "2030-03-01",
        startTime: "09:00",
        endTime: "10:00",
        roomIds: `${firstRoom.body.data.id},${secondRoom.body.data.id}`,
      })
      .expect(200);

    expect(response.body).toEqual({
      data: [
        expect.objectContaining({
          id: firstRoom.body.data.id,
          name: "Ocean",
        }),
      ],
      meta: { total: 1 },
    });
  });
});
