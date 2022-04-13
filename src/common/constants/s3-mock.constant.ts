const mockS3 = () => ({
  upload: jest.fn().mockReturnThis(),
  deleteObject: jest.fn().mockReturnThis(),
  promise: jest.fn().mockReturnThis(),
  then: jest.fn(),
  error: jest.fn(),
});

export { mockS3 };
