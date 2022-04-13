const mockS3 = () => ({
  upload: jest.fn().mockReturnThis(),
  deleteObject: jest.fn().mockReturnThis(),
  promise: jest.fn().mockReturnThis(),
});

export { mockS3 };
