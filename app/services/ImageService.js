var Promise = require('bluebird');
var fs = require('fs'),
    md5 = require('MD5'),
    im = require('imagemagick');
var Image = {};

//---- Загрузка изображения ----//
Image.uploadImages = function(images) {

  return new Promise(function(resolve, reject) {

    var bidImage = [];
    var tmp_path = '';
    var ext = '';
    var type = '';
    var size = 0;
    var newName = '';
    var newPath = '';
    var filenames = [];
    var imgUploadErrMessage = '';
    if (images) {
      if(images instanceof Array){
        bidImage = images;
      } else {
        bidImage.push(images);
      }
      bidImage.forEach(function (image, i) {

        fs.readFile(image.path, function (err, data) {
          tmp_path = image.path;
          ext = image.extension;
          type = image.mimetype;
          size = image.size;
          newName = "IMG_"+ md5(Math.random()).substr(0, 10) +  "." + ext;
          filenames.push(newName);
          newPath = "./uploads/" + newName;
          if (type != 'image/jpeg' && type != 'image/png' && type != 'image/gif') {
            imgUploadErrMessage = 'Разрешены только изображения(jpg, png, gif)';
          }
          if (size > 10485760) {
            imgUploadErrMessage = 'Размер изображений должен быть не более 10Мб';
          }

          if (imgUploadErrMessage != '') {
            reject(imgUploadErrMessage);
          }


          im.resize({
            srcPath: tmp_path,
            dstPath: newPath,
            width: 1024,
            height: 768
          }, function (err) {
            if (err) {
              reject(err);
              console.log(err);
            }
            fs.unlink(image.path, function(err) {
              if (err) {
                console.log(err);
              }
              resolve(JSON.stringify(filenames));
            });
          });
        });
      });
    }
  });
};
module.exports = Image;
