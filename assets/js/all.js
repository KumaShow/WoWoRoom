"use strict";

var api_path = "js-2022";
var urlProducts = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/products");
axios.get(urlProducts).then(function (res) {
  console.log(res.data);
})["catch"](function (err) {
  console.log(err.data);
});
document.addEventListener("DOMContentLoaded", function () {
  var ele = document.querySelector(".review-wall");
  ele.style.cursor = "grab";
  var pos = {
    top: 0,
    left: 0,
    x: 0,
    y: 0
  };

  var mouseDownHandler = function mouseDownHandler(e) {
    ele.style.cursor = "grabbing";
    ele.style.userSelect = "none";
    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY
    };
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };

  var mouseMoveHandler = function mouseMoveHandler(e) {
    // How far the mouse has been moved
    var dx = e.clientX - pos.x;
    var dy = e.clientY - pos.y; // Scroll the element

    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };

  var mouseUpHandler = function mouseUpHandler() {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");
    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  }; // Attach the handler


  ele.addEventListener("mousedown", mouseDownHandler);
});
//# sourceMappingURL=all.js.map
