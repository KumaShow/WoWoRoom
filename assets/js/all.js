"use strict";

var api_path = "js-2022";
var token = "kk6wTiHvysgMHTb81Mkv3q2j0M23";
var config = {
  headers: {
    'Authorization': token
  }
};
"use strict";

var urlAdminOrders = "https://livejs-api.hexschool.io/api/livejs/v1/admin/".concat(api_path, "/orders");
var ordersData = []; // 訂單日期

function orderCreateDate(ms) {
  var timer = new Date(ms * 1000);
  var y = timer.getFullYear();
  var m = timer.getMonth() + 1 >= 10 ? timer.getMonth() + 1 : "0".concat(timer.getMonth() + 1);
  var d = timer.getDate() >= 10 ? timer.getDate() : "0".concat(timer.getDate());
  return "".concat(y, "/").concat(m, "/").concat(d);
}

; // 渲染訂單畫面

function renderOrders(ordersData) {
  var orderList = document.querySelector('#ordersList');
  var str = ''; // 訂單排序新到舊

  ordersData.sort(function (a, b) {
    return b.createdAt - a.createdAt;
  });
  ordersData.forEach(function (order) {
    var status = order.paid ? '已處理' : '未處理';
    var orderDate = orderCreateDate(order.createdAt);
    var orderProducts = order.products.map(function (item) {
      return "".concat(item.title, " x ").concat(item.quantity);
    }).join('<br>');
    str += "\n    <tr class=\"align-middle\">\n      <th scope=\"row\">".concat(order.id, "</th>\n      <td>").concat(order.user.name, "<br>").concat(order.user.tel, "</td>\n      <td>").concat(order.user.address, "</td>\n      <td>").concat(order.user.email, "</td>\n      <td>").concat(orderProducts, "</td>\n      <td>").concat(orderDate, "</td>\n      <td class=\"text-info\">\n        <a href=\"#!\" class=\"text-decoration-underline link-info\" data-paid=\"").concat(order.paid, "\" data-id=\"").concat(order.id, "\">\n          ").concat(status, "\n        </a>\n      </td>\n      <td>\n        <button type=\"button\" class=\"btn btn-danger\" data-id=\"").concat(order.id, "\" >\u522A\u9664</button>\n      </td>\n    </tr>");
  });
  orderList.innerHTML = str;
  renderBtnDelete();
} // 渲染按鈕 清除全部訂單


function renderBtnDelete() {
  var btnDeleteAll = document.querySelector('#btnDeleteAll');

  if (ordersData.length === 0) {
    btnDeleteAll.classList.add('d-none');
  } else {
    btnDeleteAll.classList.remove('d-none');
  }

  btnDeleteAll.addEventListener('click', deleteOrderAll);
} // 取得訂單資料


function getOrders() {
  axios.get(urlAdminOrders, config).then(function (res) {
    ordersData = res.data.orders;
    renderChart(ordersData);
    renderOrders(ordersData);
  })["catch"](function (err) {
    console.log(err);
  });
} // 訂單點擊事件監聽


function orderListClick() {
  var orderList = document.querySelector('#ordersList');

  if (orderList) {
    orderList.addEventListener('click', function (e) {
      e.preventDefault();

      if (e.target.nodeName === 'A') {
        var isPaid = e.target.dataset.paid;
        var productId = e.target.dataset.id;
        isPaid = isPaid === 'false' ? false : true;
        editOrders(productId, isPaid);
        return;
      } else if (e.target.nodeName === 'BUTTON') {
        var orderId = e.target.dataset.id;
        deleteOrder(orderId);
        return;
      } else {
        return;
      }
    });
  }
} // 修改訂單狀態


function editOrders(id, isPaid) {
  isPaid = !isPaid;
  var data = {
    "data": {
      "id": id,
      "paid": isPaid
    }
  };
  axios.put(urlAdminOrders, data, config).then(function (res) {
    ordersData = res.data.orders;
    renderOrders(ordersData);
    swalSuccess('修改訂單成功', 'success');
  })["catch"](function () {
    swalError('修改訂單失敗', 'error');
  });
} // 刪除單筆訂單


function deleteOrder(id) {
  var urlDeleteOrder = "https://livejs-api.hexschool.io/api/livejs/v1/admin/".concat(api_path, "/orders/").concat(id);
  axios["delete"](urlDeleteOrder, config).then(function (res) {
    ordersData = res.data.orders;
    renderOrders(ordersData);
    renderChart(ordersData);
    swalSuccess('已刪除單筆訂單', 'success');
  })["catch"](function (err) {
    console.log(err);
    swalError('刪除單筆訂單失敗', 'error');
  });
} // 刪除所有訂單


function deleteOrderAll() {
  axios["delete"](urlAdminOrders, config).then(function (res) {
    ordersData = res.data.orders;
    renderOrders(ordersData);
    renderChart(ordersData);
    swalSuccess('已刪除所有訂單', 'success');
  })["catch"](function () {
    swalError('目前沒有訂單', 'warning');
  });
} // c3 圖表


function renderChart(ordersData) {
  var chartDisplay = document.querySelector('#chart');

  if (ordersData.length === 0) {
    chartDisplay.classList.add('d-none');
  } else {
    chartDisplay.classList.remove('d-none');
  }

  var total = {};
  ordersData.forEach(function (order) {
    order.products.forEach(function (productItem) {
      total[productItem.category] ? total[productItem.category] += productItem.price * productItem.quantity : total[productItem.category] = productItem.price * productItem.quantity;
    });
  });
  var chartData = Object.entries(total);
  var chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: chartData,
      type: "pie",
      colors: {
        床架: "#DACBFF",
        收納: "#9D7FEA",
        窗簾: "#5434A7",
        其他: "#301E5F"
      }
    }
  });
}
"use strict";

var urlProducts = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/products");
var urlCarts = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/carts");
var productList = document.querySelector('#productList');
var form = document.querySelector('#orderForm');
var cartsList = document.querySelector('#cartsList');
var productListData;
var productCategory = {};
var cartsData = []; // 不同頁面分別執行初始化

if (location.pathname.includes('index') || location.pathname === '/' || location.pathname === /WoWoRoom/) {
  // 首頁
  getProducts();
  getCarts();
  recommendationDrag();
  submitForm();
} else if (location.pathname.includes('admin')) {
  // 後臺
  getOrders();
  orderListClick();
} // 驗證套件


var constraints = {
  姓名: {
    presence: {
      message: "是必填欄位"
    }
  },
  電話: {
    presence: {
      message: "是必填欄位"
    },
    length: {
      minimum: 8,
      message: "號碼需超過 8 碼"
    }
  },
  Email: {
    presence: {
      message: "是必填欄位"
    },
    email: {
      message: "格式有誤"
    }
  },
  地址: {
    presence: {
      message: "是必填欄位"
    }
  }
};
var errors = validate(form, constraints); // 顯示訂單驗證錯誤資訊

function showErrorMessage(errors) {
  var messages = document.querySelectorAll("[data-msg]");
  messages.forEach(function (item) {
    item.textContent = "";
    item.textContent = errors[item.dataset.msg];
  });
} // 監控所有 input 的操作


function checkFormInput() {
  var inputs = document.querySelectorAll("[data-validate]");
  inputs.forEach(function (item) {
    item.addEventListener("change", function (e) {
      e.preventDefault(); // 先清空錯誤訊息

      item.previousElementSibling.textContent = "";
      var targetName = item.name;
      var errors = validate(form, constraints); // 針對正在操作的欄位呈現警告訊息

      if (errors) {
        document.querySelector("[data-msg='".concat(targetName, "']")).textContent = errors[targetName];
      }
    });
  });
} // 表單送出監聽


function submitForm() {
  var btnSubmitForm = document.querySelector('#btnSubmitForm');
  btnSubmitForm.addEventListener('click', function (e) {
    e.preventDefault();

    if (!cartsData.length) {
      swalError('購物車沒有商品!', 'error', '快去大肆採購吧ヽ(✿ﾟ▽ﾟ)ノ');
      return;
    }

    checkFormInput();
    var errors = validate(form, constraints); // 有錯誤則顯示錯誤訊息

    if (errors) {
      showErrorMessage(errors);
    } else {
      addOrder();
    }
  });
} // 送出訂單


function addOrder() {
  var urlOrder = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/orders");
  var userName = document.querySelector("#userName").value.trim();
  var userPhone = document.querySelector("#userPhone").value.trim();
  var userEmail = document.querySelector("#userEmail").value.trim();
  var userAddress = document.querySelector("#userAddress").value.trim();
  var payMethod = document.querySelector("#payMethod").value;
  var order = {
    data: {
      user: {
        name: userName,
        tel: userPhone,
        email: userEmail,
        address: userAddress,
        payment: payMethod
      }
    }
  };
  axios.post(urlOrder, order).then(function () {
    form.reset();
    getCarts();
    swalSuccess('已送出訂單', 'success');
  })["catch"](function () {
    swalError('訂單送出失敗', 'error', '請確認訂單是否填寫正確!');
  });
} // 取得產品列表


function getProducts() {
  axios.get(urlProducts).then(function (res) {
    productListData = res.data.products;
    renderProductList(productListData);
    productFilterChange(productListData);
    productListClick();
  })["catch"](function (err) {
    console.log(err);
  });
} // 產品篩選


function productFilterChange() {
  var productType = document.querySelector('#productType');
  productType.addEventListener('change', function (e) {
    var category = e.target.value;

    if (category === '全部') {
      renderProductList(productListData);
      return;
    }

    var filterArr = productListData.filter(function (item) {
      return item.category === category;
    });
    renderProductList(filterArr);
  });
} // 渲染產品列表


function renderProductList(productListData) {
  var str = '';
  productListData.forEach(function (product) {
    str += "\n      <li class=\"products-item col-md-6 col-lg-4 col-xl-3\">\n        <div class=\"card p-0\">\n          <span class=\"products-tag\">\u65B0\u54C1</span>\n          <img src=\"".concat(product.images, "\" class=\"card-img-top\" alt=\"").concat(product.title, "\">\n          <div class=\"card-body p-0\">\n            <button type=\"button\" class=\"btn btn-black rounded-0 pb-2 w-100\" data-id=\"").concat(product.id, "\">\u52A0\u5165\u8CFC\u7269\u8ECA</button>\n            <h5 class=\"card-title pb-2\">").concat(product.title, "</h5>\n            <p class=\"card-text fs-5 text-decoration-line-through\">NT$").concat(toThousand(product.origin_price), "</p>\n            <p class=\"card-text fs-3\">NT$").concat(toThousand(product.price), "</p>\n          </div>\n        </div>\n      </li>\n    ");
  });
  productList.innerHTML = str;
} // 加入購物車事件


function productListClick() {
  productList.addEventListener('click', function (e) {
    e.preventDefault();

    if (e.target.nodeName !== 'BUTTON') {
      return;
    }

    var productId = e.target.dataset.id;
    addToCarts(productId);
  });
} // 取得購物車資料


function getCarts() {
  axios.get(urlCarts).then(function (res) {
    cartsData = res.data.carts;
    renderCarts(cartsData);
  })["catch"](function (err) {
    console.log(err);
  });
} // 顯示購物車資料


function renderCarts(cartsData) {
  var thead = document.querySelector('.cart thead');
  var total = 0;
  var str = '';

  if (cartsData.length === 0) {
    thead.classList.add('d-none');
    cartsList.innerHTML = "\n      <tr class=\"text-center\">\n        <td class=\"border-0 fs-3\">\u76EE\u524D\u8CFC\u7269\u8ECA\u7121\u5546\u54C1!</td>\n      </tr>";
  } else {
    thead.classList.remove('d-none');
    cartsData.forEach(function (item) {
      total += item.quantity * item.product.price;
      str += "\n        <tr>\n          <th scope=\"row\" class=\"d-flex align-items-center fw-normal\">\n            <img src=\"".concat(item.product.images, "\" alt=\"").concat(item.product.title, "\" class=\"cart-product-img\">\n            <p class=\"lh-lg\">").concat(item.product.title, "</p>\n          </th>\n          <td>NT$").concat(toThousand(item.product.price), "</td>\n          <td>\n            ").concat(item.quantity, "\n          </td>\n          <td>NT$").concat(toThousand(item.product.price * item.quantity), "</td>\n          <td class=\"text-end\">\n            <a href=\"#!\" class=\"border-0 bg-transparent link-black\" data-id=\"").concat(item.id, "\">\n              <i class=\"fa-solid fa-x\" data-id=\"").concat(item.id, "\"></i>\n            </a>\n          </td>\n        </tr>");
    }); // 總金額

    str += "\n      <tr class=\"carts-total\">\n        <td class=\"border-0\">\n          <button type=\"button\" class=\"btn btn-outline-black py-3 px-6\" id=\"btnClearCarts\">\u522A\u9664\u6240\u6709\u54C1\u9805</button>\n        </td>\n        <td class=\"border-0\"></td>\n        <td class=\"border-0\"></td>\n        <td class=\"border-0\">\n          <p>\u7E3D\u91D1\u984D</p>\n        </td>\n        <td class=\"border-0 fs-3\">NT$".concat(toThousand(total), "</td>\n      </tr>\n    ");
    cartsList.innerHTML = str; // 刪除所有選項按鈕

    var btnClearCarts = document.querySelector('#btnClearCarts');

    if (btnClearCarts) {
      btnClearCarts.addEventListener('click', function (e) {
        e.preventDefault();
        deleteAllCarts();
      });
    }
  }
} // 加入購物車


function addToCarts(id) {
  var num = 1;
  cartsData.forEach(function (item) {
    if (item.product.id === id) {
      num = item.quantity += 1;
    }
  });
  var data = {
    "data": {
      "productId": id,
      "quantity": num
    }
  };
  axios.post(urlCarts, data).then(function (res) {
    cartsData = res.data.carts;
    renderCarts(cartsData);
    swalSuccess('已加入購物車', 'success');
  })["catch"](function (err) {
    console.log(err);
    swalError('加入購物車失敗', 'error');
  });
} // 購物車刪除事件


if (cartsList) {
  cartsList.addEventListener('click', function (e) {
    e.preventDefault();
    var cartItemId = e.target.getAttribute('data-id');

    if (e.target.nodeName !== 'A' && e.target.nodeName !== 'I') {
      return;
    } else {
      deleteCartsItem(cartItemId);
      return;
    }
  });
} // 刪除購物車單筆


function deleteCartsItem(id) {
  var url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/carts/").concat(id);
  axios["delete"](url, id).then(function (res) {
    cartsData = res.data.carts;
    renderCarts(cartsData);
  })["catch"](function (err) {
    console.log(err);
  });
} // 刪除購物車所有品項


function deleteAllCarts() {
  axios["delete"](urlCarts).then(function (res) {
    renderCarts(res.data.carts);
    swalSuccess('已清空購物車', 'success');
  })["catch"](function (err) {
    console.log(err);
    swalError('清空失敗', 'error');
  });
} // 千分位


function toThousand(num) {
  var numStr = num.toString();
  return numStr.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
} // 好評推薦拖拉功能


function recommendationDrag() {
  document.addEventListener("DOMContentLoaded", function () {
    var ele = document.querySelector(".recommendation-wall");
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
}
"use strict";

// Alert 成功
function swalSuccess(title, status, text) {
  Swal.fire({
    icon: status,
    title: title,
    text: text,
    showConfirmButton: true,
    timer: 2500
  });
} // Alert 失敗


function swalError(title, status, text) {
  Swal.fire({
    icon: status,
    title: title,
    text: text,
    showConfirmButton: true
  });
}
//# sourceMappingURL=all.js.map
