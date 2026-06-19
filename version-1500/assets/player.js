import { H as Hls } from "./hls-vendor-dru42stk.js";

var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

players.forEach(function (player) {
  var video = player.querySelector("video");
  var layer = player.querySelector(".play-layer");
  var button = player.querySelector(".play-button");
  var config = player.querySelector(".player-config");
  var streamUrl = config ? JSON.parse(config.textContent) : "";
  var prepared = false;

  function prepare() {
    if (prepared || !video || !streamUrl) {
      return;
    }

    prepared = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function play() {
    prepare();

    if (layer) {
      layer.classList.add("hide");
    }

    if (video) {
      video.controls = true;
      var action = video.play();

      if (action && typeof action.catch === "function") {
        action.catch(function () {
          if (layer) {
            layer.classList.remove("hide");
          }
        });
      }
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  if (layer) {
    layer.addEventListener("click", play);
  }
});
