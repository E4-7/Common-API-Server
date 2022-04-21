const MockexamUserDataArray = [
  {
    created_at: '2022-04-08T14:56:02.045Z',
    Exam: {
      id: '123e4567-e89b-12d3-a456-426614174000.',
      created_at: '2022-04-08T14:30:40.122Z',
      updated_at: '2022-04-08T14:30:40.122Z',
      name: '운영체제 3반',
      exam_time: '2021-07-17T05:30:00.000Z',
      is_openbook: true,
      ExamPaper: null,
      deleted_at: null,
      status: 1,
      OwnerId: '123e4567-e89b-12d3-a456-426614174000.',
    },
  },
];
const MockoneExamData = {
  OwnerId: '1',
  exam_time: '2021-07-17T14:30:00+09:00',
  is_openbook: true,
  name: '운영체제 3반',
  deleted_at: null,
  id: '123e4567-e89b-12d3-a456-426614174000.',
  ExamPaper: null,
  created_at: '2022-04-10T16:30:23.761Z',
  updated_at: '2022-04-10T16:30:23.761Z',
  status: 1,
};
const MocknewExamDataColumn = {
  name: '조찬민',
  exam_time: new Date('2021-07-17T14:30:00+09:00'),
  is_openbook: false,
  status: 1,
};

export { MockexamUserDataArray, MockoneExamData, MocknewExamDataColumn };
