var designWidth = document
  .getElementsByTagName("head")[0]
  .getAttribute("design-width");

function font_size(devwidth) {
  devwidth = Number(devwidth);
  _size();

  window.onresize = function () {
    _size();
  };

  function _size() {
    var deviceWidth = window.innerWidth;

    const deviceWidthNum = Number(deviceWidth);
    // if (deviceWidthNum > 375 && deviceWidthNum < devwidth) {
    //   document.documentElement.style.fontSize = devwidth / 2 / 10 + "px";
    // } else
    if (deviceWidthNum > devwidth) {
      document.getElementsByTagName("html")[0].removeAttribute("style");
    } else {
      document.documentElement.style.fontSize = deviceWidthNum / 10 + "px";
    }
  }
}

var media = document.createElement("style");
media.innerHTML =
  "@media screen and (min-width:" +
  designWidth +
  "px){.center{width:" +
  designWidth +
  "px !important;margin-left:-" +
  designWidth / 2 +
  "px !important;left:50% !important;}.fixed-right{right:calc((100% - 750px)/2)}}";
document.getElementsByTagName("head")[0].appendChild(media);

window.onload = font_size(designWidth);
