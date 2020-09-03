var endpoint = "http://127.0.0.1:8081/api"

function apiGET(url, callback, errorCallback, callBackObject) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && RegExp('2.*').test(xmlHttp.status)) {
      if (callBackObject != null) {
        callback(xmlHttp.responseText, callBackObject);
      } else {
        callback(xmlHttp.responseText);
      }
      console.log(url);

    } else if (xmlHttp.readyState == 4) {
      if (errorCallback != null) {
        errorCallback(xmlHttp.responseText, xmlHttp.status);
      }
    }
  }
  xmlHttp.open("GET", url, true); // true for asynchronous
  if (getUserToken() != null) {
    xmlHttp.setRequestHeader("X-Authentication", getUserToken());
  }
  xmlHttp.send(null);
}
function apiPOST(rurl, postdata, callback, errorCallback, callBackObject) {
	console.log("POST: " + rurl + " - Data: " + postdata)
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.onreadystatechange = function() {
	if (xmlHttp.readyState == 4 && RegExp('2.*').test(xmlHttp.status)) {
		if (callBackObject != null) {
			callback(xmlHttp.responseText, callBackObject);
		} else {
			callback(xmlHttp.responseText);
    }
	} else if (xmlHttp.readyState == 4) {
           console.log("Error Code: " + xmlHttp.status)
           if (errorCallback != null) {
	   	        errorCallback(xmlHttp.responseText, xmlHttp.status);
       	   }
	}
    }
    xmlHttp.open("POST", rurl, true); // true for asynchronous
    xmlHttp.setRequestHeader("Content-Type", "application/json");
    if (getUserToken() != null) {
      xmlHttp.setRequestHeader("X-Authentication", getUserToken());
    }
    xmlHttp.send(postdata);
}




function getAlbums() {
  apiGET(endpoint + "/list/albums", getAlbums_cb, getAlbums_ecb);
}
function getAlbums_cb(data) {
  renderAlbums(data)
}
function getAlbums_ecb(error) {
  alert("Failed to get albums: " + error)
}
