import { UserRole } from './constants/user-role.enum';

const userData = {
  email: 'happyjarban@gmail.com',
  name: '조찬민',
  deleted_at: null,
  id: 9,
  created_at: '2022-04-11T05:17:18.618Z',
  updated_at: '2022-04-11T05:17:18.618Z',
  status: 1,
  RoleId: 1,
  Role: {
    type: 2,
  },
};

const signupData = {
  email: 'happyjarban@gmail.com',
  password: 'thisispassword',
  name: 'joasdas',
};

const userDataAssistant = Object.assign({}, userData);
userDataAssistant.Role = Object.assign({}, userData.Role);
userDataAssistant.Role.type = UserRole.ASSISTANT;

const mockUserService = {
  join: jest.fn().mockResolvedValue({ data: 'data' }),
  delete: jest.fn().mockResolvedValue({ data: 'data' }),
};

export { userData, userDataAssistant, mockUserService, signupData };
