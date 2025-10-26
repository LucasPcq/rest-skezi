import { Test } from "@nestjs/testing";

import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";

import type { RoomDTO } from "./schemas/room.schema";
import type { CreateRoomDTO } from "./schemas/create-room.schema";
import type { AvailabilityQueryDTO } from "./schemas/availability-query.schema";
import type { RoomIdParamDTO } from "./schemas/room-id.schema";

describe("RoomsController", () => {
  let controller: RoomsController;
  let roomsService: jest.Mocked<RoomsService>;

  const room: RoomDTO = {
    id: 1,
    name: "Focus Room",
    capacity: 6,
    createdAt: new Date("2025-01-05T12:00:00Z"),
  };

  beforeEach(async () => {
    roomsService = {
      createRoom: jest.fn(),
      getAllRooms: jest.fn(),
      getAvailableRooms: jest.fn(),
      getRoomById: jest.fn(),
    } as unknown as jest.Mocked<RoomsService>;

    const moduleRef = await Test.createTestingModule({
      controllers: [RoomsController],
      providers: [{ provide: RoomsService, useValue: roomsService }],
    }).compile();

    controller = moduleRef.get(RoomsController);
  });

  describe("createRoom", () => {
    it("should delegate room creation to the service when handling a creation request", async () => {
      const payload: CreateRoomDTO = { name: "Board Room", capacity: 12 };
      roomsService.createRoom.mockResolvedValue({ ...room, ...payload });

      const result = await controller.createRoom(payload);

      expect(result).toEqual({ ...room, ...payload });
      expect(roomsService.createRoom).toHaveBeenCalledWith(payload);
    });
  });

  describe("getAllRooms", () => {
    it("should wrap all rooms in an envelope when returning the collection", async () => {
      roomsService.getAllRooms.mockResolvedValue([room]);

      const result = await controller.getAllRooms();

      expect(result).toEqual({
        data: [room],
        meta: { total: 1 },
      });
    });
  });

  describe("getAvailability", () => {
    it("should pass availability queries to the service when retrieving room availability", async () => {
      const availableRooms: RoomDTO[] = [room];
      const query: AvailabilityQueryDTO = {
        date: "2025-02-01",
        startTime: "08:00",
        endTime: "09:00",
        roomIds: [room.id],
      };

      roomsService.getAvailableRooms.mockResolvedValue(availableRooms);

      const result = await controller.getAvailability(query);

      expect(roomsService.getAvailableRooms).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: availableRooms,
        meta: { total: availableRooms.length },
      });
    });
  });

  describe("getRoomById", () => {
    it("should retrieve a room via the service when resolving by id", async () => {
      roomsService.getRoomById.mockResolvedValue(room);

      const params: RoomIdParamDTO = { id: room.id };

      const result = await controller.getRoomById(params);

      expect(result).toEqual(room);
      expect(roomsService.getRoomById).toHaveBeenCalledWith(room.id);
    });
  });
});
