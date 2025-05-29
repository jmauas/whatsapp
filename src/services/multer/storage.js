import multer from "multer";
import uniqid from 'uniqid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // path.resolve
  },
  filename: (req, file, cb) => {
    let name = file.originalname;
    const extension = name.substring(name.lastIndexOf('.')+1);
    name = name.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/g, 'n')
      .replace(/Ñ/g, 'N')
      .replace(/ /g, '_');
    name = name.substring(0, name.lastIndexOf('.'));
    cb(null, `${name}$${uniqid()}.${extension}`);
  },
});

export default storage;