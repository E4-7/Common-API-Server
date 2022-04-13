const buffer = Buffer.alloc(513, '0');
const oneFile = {
  originalname: '파일',
  mimetype: 'application/json',
  encoding: 'utf-8',
  filename: 'file',
  size: 12345,
  stream: {},
  destination: 'file',
  path: 'file',
  buffer,
} as Express.Multer.File;

const mockFileUpload = {
  key: 'some-key',
  size: oneFile.size,
  mimetype: oneFile.mimetype,
  originalname: oneFile.originalname,
  url: 'url',
};
export { mockFileUpload, oneFile };
