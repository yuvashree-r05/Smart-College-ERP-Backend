const multer = require("multer");

const storage = multer.diskStorage({
    destination(req, file, cb){
        cb(null,path.join(__dirname, "../uploads"));
    },
    filename: function(req, file,cb){
       cb(null,Date.now()+"-"+file.originalname);
    }
});

const upload = multer({
    storage: storage
});

module.exports = upload;