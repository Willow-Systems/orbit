const express = require("express");
const music = require("./musicmanager.js");
var app = express()

function log(text, level) {
  util.log("[API] " + text, level);
}

app.use("/", express.static("client"));

app.use("/api/list/:type", (req, res) => {
  if (req.params.type == "albums") {
    res.end(JSON.stringify(music.getAlbums()))
  }
});



app.use("/api/art/:albumid", (req, res) => {
  var artpath = music.getAlbumArt(req.params.albumid);
  if (artpath == null) {
    //res.status("404").end('{"s":false,"e":"art.notfound","msg":"No album art available"}')
    res.sendFile(__dirname + "/client/res/img/guitar.png")
  } else {
    res.sendFile(artpath)
  }
})


function initapi() {
  app.listen(util.config().interface.port, () => {
    log("Started web server", "debug")
  });
}

module.exports.init = initapi
