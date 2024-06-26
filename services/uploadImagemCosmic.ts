import { createBucketClient } from "@cosmicjs/sdk";
import multer from "multer";
import cosmicjs from "cosmicjs";

const { BUCKET_SLUG, READ_KEY, WRITE_KEY } = process.env;

const bucketDevagram = createBucketClient({
  bucketSlug: BUCKET_SLUG as string,
  readKey: READ_KEY as string,
  writeKey: WRITE_KEY as string,
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadImagemCosmic = async (req: any) => {
  if (req?.file?.originalname){

    if(!req.file.originalname.includes('.png') &&
       !req.file.originalname.includes(',jpg') &&
       !req.file.originalname.includes('.jpeg')){
        throw new Error('extensao da imagem invalido');
       }
       
    const media_object = {
      originalname: req.file.originalname,
      buffer: req.file.buffer,
    };

    if (req.url && req.url.includes("publicacoes")) {
      return await bucketDevagram.media.insertOne({
        media: media_object,
        folder: "publicacao",
      });
    } else {
      return await bucketDevagram.media.insertOne({
        media: media_object,
        folder: "avatares",
      });
    } 
  }
};

export { upload, uploadImagemCosmic };