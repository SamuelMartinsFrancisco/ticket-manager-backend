import { Test, TestingModule } from "@nestjs/testing";
import { TicketRepository } from "./ticket.repository";
import { DatabaseService } from "@/infrastructure/database/database.service";
import { ticketsTable } from "@/infrastructure/database/schema";
import { IssueStatus } from "./ticket.dto";
import { UserRole } from "../users/user.dto";
import {
  createFakeTicket,
} from "@/utils/test/mocks/ticket.mock";
import { createDatabaseMock, createFakeTokenPayload } from "@/utils/test/mocks/commons.mock";
import { desc, eq } from "drizzle-orm";

describe("TicketRepository", () => {
  let repository: TicketRepository;
  let dbServiceMock: any;
  let dbMock: any;
  let selectWhereMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let orderByMock: jest.Mock;

  beforeEach(async () => {
    const mocks = createDatabaseMock();
    dbServiceMock = mocks.dbServiceMock;
    dbMock = mocks.dbMock;
    selectWhereMock = mocks.selectWhereMock;
    insertReturningMock = mocks.insertReturningMock;
    orderByMock = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketRepository,
        { provide: DatabaseService, useValue: dbServiceMock },
      ],
    }).compile();

    repository = module.get<TicketRepository>(TicketRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAll", () => {
    it("should list all tickets for admin with no filters", async () => {
      const adminUser = createFakeTokenPayload({
        role: UserRole.ADMIN,
        sub: "admin-1",
      });
      const tickets = [
        createFakeTicket({ id: 1 }),
        createFakeTicket({ id: 2 }),
        createFakeTicket({ id: 3 }),
      ];
      selectWhereMock.mockReturnValue({ orderBy: orderByMock });
      orderByMock.mockReturnValue(tickets);

      const result = await repository.getAll({}, adminUser);

      expect(result).toEqual(tickets);
      expect(selectWhereMock).toHaveBeenCalledWith(undefined);
      expect(orderByMock).toHaveBeenCalledWith(desc(ticketsTable.priority));
    });

    it("should force ownerId for client role", async () => {
      const clientUser = createFakeTokenPayload({
        role: UserRole.CLIENT,
        sub: "client-1",
      });
      const clientTickets = [createFakeTicket({ authorId: "client-1" })];
      selectWhereMock.mockReturnValue({ orderBy: orderByMock });
      orderByMock.mockReturnValue(clientTickets);

      const result = await repository.getAll({}, clientUser);

      expect(result).toEqual(clientTickets);
      expect(selectWhereMock).not.toHaveBeenCalledWith(undefined);
    });

    it("should filter by status for a client (forced owner + status)", async () => {
      const clientUser = createFakeTokenPayload({
        role: UserRole.CLIENT,
        sub: "client-1",
      });
      const ticket = createFakeTicket({
        authorId: "client-1",
        status: IssueStatus.NEW,
      });
      selectWhereMock.mockReturnValue({ orderBy: orderByMock });
      orderByMock.mockReturnValue([ticket]);

      const result = await repository.getAll(
        { status: IssueStatus.NEW },
        clientUser
      );

      expect(result).toEqual([ticket]);
      expect(selectWhereMock).not.toHaveBeenCalledWith(undefined);
    });

    it("should apply category filter for non‑client without forcing owner", async () => {
      const techUser = createFakeTokenPayload({
        role: UserRole.TECHNICIAN,
        sub: "tech-1",
      });
      const tickets = [
        createFakeTicket({ category: 5, authorId: "other" }),
        createFakeTicket({ category: 5, authorId: "another" }),
      ];
      selectWhereMock.mockReturnValue({ orderBy: orderByMock });
      orderByMock.mockReturnValue(tickets);

      const result = await repository.getAll({ category: 5 }, techUser);

      expect(result).toEqual(tickets);
      expect(selectWhereMock).not.toHaveBeenCalledWith(undefined);
    });

    it("should return empty array when no tickets match", async () => {
      const clientUser = createFakeTokenPayload({
        role: UserRole.CLIENT,
        sub: "client-5",
      });
      selectWhereMock.mockReturnValue({ orderBy: orderByMock });
      orderByMock.mockReturnValue([]);

      const result = await repository.getAll(
        { status: IssueStatus.SOLVED },
        clientUser
      );

      expect(result).toEqual([]);
    });
  });

  describe("getOne", () => {
    it("should retrieve an existing ticket by id", async () => {
      const ticket = createFakeTicket({ id: 1001 });
      selectWhereMock.mockReturnValue([ticket]);

      const result = await repository.getOne(1001);

      expect(result).toEqual(ticket);
      expect(selectWhereMock).toHaveBeenCalledWith(eq(ticketsTable.id, 1001));
    });

    it("should return undefined when ticket is not found", async () => {
      selectWhereMock.mockReturnValue([]);

      const result = await repository.getOne(9999);

      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should insert a ticket and return the created object", async () => {
      const insertPayload = {
        title: "Test Ticket",
        description: "desc",
        authorId: "user-1",
        category: 1,
        impact: 2,
        urgency: 2,
        priority: 4,
        status: IssueStatus.NEW,
      };
      const createdTicket = createFakeTicket(insertPayload);
      insertReturningMock.mockReturnValue([createdTicket]);

      const result = await repository.create(insertPayload);

      expect(result).toEqual(createdTicket);
      expect(dbMock.insert).toHaveBeenCalledWith(ticketsTable);
      const valuesMock = jest.mocked(dbMock.insert).mock.results[0].value.values;
      expect(valuesMock).toHaveBeenCalledWith(insertPayload);
      expect(insertReturningMock).toHaveBeenCalled();
    });

    it("should propagate unique constraint violation error", async () => {
      const error = new Error("duplicate key");
      (error as any).cause = { code: "23505" };
      insertReturningMock.mockRejectedValue(error);

      await expect(repository.create({} as any)).rejects.toThrow(error);
    });

    it("should propagate generic database error", async () => {
      const dbError = new Error("db connection lost");
      insertReturningMock.mockRejectedValue(dbError);

      await expect(repository.create({} as any)).rejects.toThrow(dbError);
    });
  });
});