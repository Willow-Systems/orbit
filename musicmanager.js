var fs = require("fs");
var meta = require("music-metadata");
var utility = require("util")
var V = require("node-vibrant")

var supportedAudioExtensions = ["mp3","flac","m4a","wav","ogg"]

var albums = {};
var songs = [];
var artists = [];

var albumdirs = [];
var pathUUIDMap = {};

function log(text, level) {
  util.log("[MM] " + text, level);
}


function getAlbumData(uuid) {
  if (albums.hasOwnProperty(uuid)) {
    return albums[uuid];
  } else {
    return {}
  }
}

function scanDirsForMusic() {
  var dirs = util.config().music.dirs;
  for (var d in dirs) {
    log("Traverse '" + dirs[d] + "' looking for music", "debug")
    scanSingleDir(dirs[d]);
  }
  // console.log("Music is in: " + JSON.stringify(albumdirs))
  log("FQ Album paths: " + JSON.stringify(albumdirs), "debug")
}
function scanSingleDir(path, callback) {

  //We start at the top of a tree, find every last folder in it and store to inspect later
  //We work on the basis that a single bottom level folder == single album to start with

  if (path.substr(-1) != "/") { path += "/" }

  var list = fs.readdirSync(path);

  if (list.length < 1) {

    // console.log("Found a dir with nothing in")

  } else {

    var hadADirInIt = false;

    for (var d in list) {
      var item = list[d]
      //Is it a file or a dir?
      if (fs.lstatSync(path + item).isDirectory() && item.substr(0,1) != ".") {
        scanSingleDir(path + item);
        hadADirInIt = true;
      }
    };

    if (! hadADirInIt) {
      albumdirs.push(path)
    }

  }

}
function buildAlbumObject(albumArray) {
  albumArray.forEach((album, i) => {

    //Get the first music file
    fs.readdir(album, function(error, songs){
      //We only care about the first song
      var songname = null
      for (var i = 0; i < songs.length; i++) {
        var extension = songs[i].split(".")
        extension = extension[extension.length-1]
        if (supportedAudioExtensions.includes(extension)) {
          songname = songs[i];
          break
        }
      }

      if (songname == null) {
        console.log("!!!!!!!!!!!!!!!! Can't find a valid audio file in this dir to parse (" + album + ")")
      } else {
        meta.parseFile(album + songname)
        .then( metadata => {
        // console.log(utility.inspect(metadata, { showHidden: false, depth: null }));
        // console.log(metadata);
        var aid = util.generateUUID()
        albums[aid] = {
          title: metadata.common.album,
          year: metadata.common.year,
          artist: metadata.common.artist
        }
        pathUUIDMap[album] = aid
        checkAlbumArt(album, aid)
      })
        .catch( err => {
          console.error("!! Error: " + err.message + " for file " + album + songs[0]);
        });
        log("Pull metadata from " + songs[0], "verbose")
      }
    });

  })
}

function checkAlbumArt(directory, UUID) {
  log("Checking dir " + directory + " for cover art", "verbose");

  var aanames = ["folder.jpg","folder.png","cover.jpg","cover.png"]
  var foundit = false

  for (var j = 0; j < aanames.length; j++) {

    if (fs.existsSync(directory + aanames[j])) {
      log("Found " + aanames[j], "verbose")
      foundit = true

      albums[UUID].art = {
        path: directory,
        filename: aanames[j]
      }

      //Get the colour of it
      getAlbumArtColour(UUID)
      break
    }

  }
  if (! foundit) {
    console.log("No album art found for " + directory)
  }

    //Vibrant.from(item).getPalette((err, palette) => console.log(palette))

}
function getAlbumArtColour(UUID) {
  var a = getAlbumData(UUID);
  V.from(a.art.path + a.art.filename).getPalette((err, palette, u=UUID) => {
    //console.log(palette);
    var c = null
    var t = "000000"

    if (palette.hasOwnProperty("LightVibrant") && palette.LightVibrant != null) {
      c = palette.LightVibrant._rgb
    } else if (palette.hasOwnProperty("Muted") && palette.Muted != null) {
      c = palette.Muted._rgb
      t = "FFFFFF"
    } else if (palette.hasOwnProperty("Vibrant") && palette.Vibrant != null) {
      c = palette.Vibrant._rgb
    } else {
      c = [255,200,60]
    }

    albums[u].art.highlight = rgbToHex(c[0], c[1], c[2])
    albums[u].art.highlightText = t
  });
}
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
  r = Math.round(r)
  g = Math.round(g)
  b = Math.round(b)
  return componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function getArt(uuid, callback) {
  if (! albums.hasOwnProperty(uuid)) {
    return null
  }

  var a = albums[uuid]
  // fs.readFileSync(a.art.path + a.art.filename, (err, data) => {
  //   if (err) {
  //     callback(null);
  //     throw err;
  //     return;
  //   }
  //
  //   callback(data);
  // });

  if (a.hasOwnProperty("art") && a.art.hasOwnProperty("path") && a.art.hasOwnProperty("filename")) {
    return a.art.path + a.art.filename
  } else {
    return null
  }

}

function apiOutGetAlbums() {
  var output = [];
  for (const [id, album] of Object.entries(albums)) {
    album.id = id
    output.push(album)
  }
  return output
}

function init() {

  //Init music manager. This code can be blocking as it only runs on startup
  log("Scanning for music", "info");
  scanDirsForMusic();
  buildAlbumObject(albumdirs)
  log("Music scan complete", "info");

  //setTimeout(function() {
  // console.log(albums)
  // console.log(albumdirs)
  //}, 3000);
}

module.exports.init = init;
module.exports.getAlbums = apiOutGetAlbums;
module.exports.getAlbumArt = getArt;
