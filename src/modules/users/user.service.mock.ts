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
const userDataAssistant = Object.assign({}, userData);
userDataAssistant.Role = Object.assign({}, userData.Role);
userDataAssistant.Role.type = UserRole.ASSISTANT;

export { userData, userDataAssistant };
