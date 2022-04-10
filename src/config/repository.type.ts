import { Repository } from 'typeorm';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const mockRepository = () => ({
  createQueryBuilder: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnThis(),
  }),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

class MockConnection {
  createQueryRunner(mode?: 'master' | 'slave') {
    return {
      manager: {
        save: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        getRepository: jest.fn().mockReturnThis(),
      },
      connect: jest.fn(),
      release: jest.fn(),
      startTrasaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
    };
  }
}

export { MockRepository, mockRepository, MockConnection };
