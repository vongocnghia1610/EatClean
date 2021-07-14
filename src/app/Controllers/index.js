var jwt = require("jsonwebtoken");
const bucket = require("../../config/firebase/firebase");
const uuid = require('uuid-v4');
const fs = require('fs');
async function createToken(idUser) {
  const token = await jwt.sign(idUser, process.env.ACCESS_TOKEN);
  return token;
}

async function createTokenTime(idUser) {
  const token = await jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + 60*5,
      data: idUser,
    },
    process.env.ACCESS_TOKEN
  );
  return token;
}

async function verifyToken(token) {
  const idUser = await jwt.verify(token, process.env.ACCESS_TOKEN);
  return idUser;
}

function makePassword(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}
async function UploadImage(name, folder) {
  const path = "./uploads/" + name;
  const metadata = {
    metadata: {
      // This line is very important. It's to create a download token.
      firebaseStorageDownloadTokens: uuid(),
    },
    contentType: "image/png",
    cacheControl: "public, max-age=31536000",
  };

  const tasks = await bucket.upload(path, {
    // Support for HTTP requests made with `Accept-Encoding: gzip`
    gzip: true,
    metadata: metadata,
    destination: folder + name,
  });

  const urls = await tasks[0].getSignedUrl({
    action: "read",
    expires: "03-09-2491",
  });

  // Delete image
  fs.unlinkSync(path);

  return urls[0];
}

module.exports = {
  createToken,
  verifyToken,
  createTokenTime,
  makePassword,
  UploadImage,
};
