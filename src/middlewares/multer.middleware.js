import multer  from "multer";

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,"./public/temp")   // this null is here for errors..... the format is error,value
    },
    filename: function(req,file,cb){
        cb(null,file.originalname)
    }
});

export const upload = multer({storage: storage});
