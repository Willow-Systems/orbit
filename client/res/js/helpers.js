function renderAlbums(albumData) {

  albumData = JSON.parse(albumData)

  //Sort
  albumData.sort(function(a, b) {
    console.log(b)
    if (! a.hasOwnProperty("title")) { a.title = "ZZZZZZZZ"}
    if (! b.hasOwnProperty("title")) { b.title = "ZZZZZZZZ"}

    var textA = a.title.toUpperCase();
    var textB = b.title.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
  });


  for (var x in albumData) {
    console.log("add " + albumData[x].title)
    var tile = generateAlbumDiv(albumData[x]);
    $('#main').append(tile);
  }

  startLazyLoad();
}

function generateAlbumDiv(album) {
  var artworkpath=endpoint + "/art/" + album.id

  //If there is no album art file, we wont have album.art to get highlights. In which case we go yellow
  if (! album.hasOwnProperty("art")) {
    album.art = {
      highlight: "ffcd3f",
      highlightText: "000000"
    }
  }

  var out = '<div class="album hidden" id="' + album.id + '"> \
    <img class="lazy hidden" src="" data-src="' + artworkpath + '"></img> \
    <div class="album-div" style="background-color:' + album.art.highlight + '; color:' + album.art.highlightText + '"> \
      <div class="title" title="' + album.title + '">' + album.title + '</div> \
      <div class="artist" title="' + album.artist + '">' + album.artist + '</div> \
    </div> \
  </div>'
  return out
}



//Totally copied from https://css-tricks.com/the-complete-guide-to-lazy-loading-images/
//Detect when images with .lazy enter the viewport and only then get their image
function startLazyLoad() {
  var lazyloadImages;
  if ("IntersectionObserver" in window) {
    lazyloadImages = document.querySelectorAll(".lazy");
    console.log("imgs: ")
    console.log(lazyloadImages)
    var imageObserver = new IntersectionObserver(function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var image = entry.target;
          console.log(image)
          image.src = image.dataset.src;
          image.classList.remove("lazy");
          image.classList.remove("hidden");
          imageObserver.unobserve(image);
          setTimeout(() => {
            image.classList.remove("hidden");
            image.parentNode.classList.add("animated");
            image.parentNode.classList.add("fadeInUp");
          }, 100)
          // setTimeout(() => {
          //   setAlbumFooterColour(image.parentNode.id);
          // },200 + delayAdd);
          // delayAdd + 50;
          // image.addEventListener('load', function() {
          //   setAlbumFooterColour(image.parentNode.id, function() {
          //     image.parentNode.classList.add("animated");
          //     image.parentNode.classList.add("fadeInUp");
          //   })
          // });
          // image.addEventListener('error', function() {
          //   image.parentNode.classList.add("animated");
          //   image.parentNode.classList.add("fadeInUp");
          // });
        }
      });
    });
    lazyloadImages.forEach(function(image) {
      imageObserver.observe(image);
    });
  } else {
    var lazyloadThrottleTimeout;
    lazyloadImages = document.querySelectorAll(".lazy");
    function lazyload () {
      if(lazyloadThrottleTimeout) {
        clearTimeout(lazyloadThrottleTimeout);
      }
      lazyloadThrottleTimeout = setTimeout(function() {
        var scrollTop = window.pageYOffset;
        lazyloadImages.forEach(function(img) {
          if(img.offsetTop < (window.innerHeight + scrollTop)) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
          }
        });
        if(lazyloadImages.length == 0) {
          document.removeEventListener("scroll", lazyload);
          window.removeEventListener("resize", lazyload);
          window.removeEventListener("orientationChange", lazyload);
        }
      }, 20);
    }
    document.addEventListener("scroll", lazyload);
    window.addEventListener("resize", lazyload);
    window.addEventListener("orientationChange", lazyload);
  }
}

function init() {
  getAlbums()
}
