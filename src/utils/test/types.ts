import { createDbClientMock } from "./mocks";

export type DbClientMock = ReturnType<typeof createDbClientMock>['dbClientMock'];
export type DbClientSpies = ReturnType<typeof createDbClientMock>['spies'];