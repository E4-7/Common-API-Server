import { InternalServerErrorException } from '@nestjs/common';

const mockHttpService = {
  get: jest.fn().mockReturnThis(),
  post: jest.fn().mockReturnThis(),
  toPromise: jest.fn().mockImplementation(() => {
    throw new InternalServerErrorException();
  }),
};

export { mockHttpService };
