import fs from 'fs';

const base64Encode = (file) => {
  const bitmap = fs.readFileSync(file);
  return new Buffer(bitmap).toString('base64');
};

const base64Decode = (base64str, file) => {
  const bitmap = new Buffer(base64str, 'base64');
  fs.writeFileSync(file, bitmap);
};

export {
  base64Encode,
  base64Decode,
};
