"use strict";

var api_path = "js-2022";
var token = "kk6wTiHvysgMHTb81Mkv3q2j0M23";
var urlAdminOrders = "https://livejs-api.hexschool.io/api/livejs/v1/admin/".concat(api_path, "/orders");
var orderList = document.querySelector('#ordersList');
var btnDeleteAll = document.querySelector('#btnDeleteAll'); // 渲染訂單畫面

function renderOrders(ordersData) {
  var str = '';
  ordersData.forEach(function (order) {
    var status = order.paid ? '已處理' : '未處理'; // order.products.forEach(item => {
    //   // str += `
    //   //   <tr class="align-middle">
    //   //     <th scope="row">10088377474</th>
    //   //     <td>${order.user.name}<br>${order.user.tel}</td>
    //   //     <td>${order.user.address}</td>
    //   //     <td>${order.user.email}</td>
    //   //     <td>${item.title}</td>
    //   //     <td>2021/03/08</td>
    //   //     <td class="text-info">
    //   //       <a href="#!" class="text-decoration-underline link-info" data-paid="${order.paid}" data-id="${order.id}">
    //   //         ${status}
    //   //       </a>
    //   //     </td>
    //   //     <td>
    //   //       <button type="button" class="btn btn-danger" data-id="${order.id}">刪除</button>
    //   //     </td>
    //   //   </tr>`
    // })

    str += "\n    <tr class=\"align-middle\">\n      <th scope=\"row\">10088377474</th>\n      <td>".concat(order.user.name, "<br>").concat(order.user.tel, "</td>\n      <td>").concat(order.user.address, "</td>\n      <td>").concat(order.user.email, "</td>\n      <td>").concat(order.products[0].title, "</td>\n      <td>2021/03/08</td>\n      <td class=\"text-info\">\n        <a href=\"#!\" class=\"text-decoration-underline link-info\" data-paid=\"").concat(order.paid, "\" data-id=\"").concat(order.id, "\">\n          ").concat(status, "\n        </a>\n      </td>\n      <td>\n        <button type=\"button\" class=\"btn btn-danger\" data-id=\"").concat(order.id, "\">\u522A\u9664</button>\n      </td>\n    </tr>");
  });
  orderList.innerHTML = str;
}

var ordersData = []; // 取得訂單資料

function getOrders() {
  axios.get(urlAdminOrders, {
    headers: {
      'Authorization': token
    }
  }).then(function (res) {
    ordersData = res.data.orders;
    console.log(ordersData);

    if (ordersData.length === 0) {
      btnDeleteAll.classList.add('d-none');
    } else {
      btnDeleteAll.classList.remove('d-none');
    }

    var category = {};
    ordersData.forEach(function (order) {
      order.products.forEach(function (item) {
        console.log(item.category);
        category[item.category] ? category[item.category]++ : category[item.category] = 1;
      });
    });
    console.log(category);
    renderOrders(ordersData);
    renderChart(category);
  });
} // 訂單事件


orderList.addEventListener('click', function (e) {
  var isPaid = e.target.dataset.paid;
  var orderId = e.target.dataset.id;
  var target = e.target.nodeName;

  if (target === 'A') {
    editOrders(orderId, isPaid);
  } else if (target === 'BUTTON') {
    deleteOrder(orderId);
  } else if (target !== 'A' || target !== 'BUTTON') {
    return;
  }
}); // 修改訂單狀態

function editOrders(id) {
  axios.put(urlAdminOrders, {
    "data": {
      "id": id,
      "paid": true
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    }
  }).then(function (res) {
    console.log(res);
    getOrders();
  })["catch"](function (err) {
    return console.log(err);
  });
} // 刪除單筆訂單


function deleteOrder(id) {
  var urlDeleteOrder = "https://livejs-api.hexschool.io/api/livejs/v1/admin/".concat(api_path, "/orders/").concat(id);
  axios["delete"](urlDeleteOrder, {
    headers: {
      'Authorization': token
    }
  }).then(function () {
    getOrders();
  })["catch"](function () {
    console.log('無該筆訂單資料');
  });
} // 監聽清除全部訂單按鈕


btnDeleteAll.addEventListener('click', deleteOrderAll); // 刪除所有訂單

function deleteOrderAll() {
  axios["delete"](urlAdminOrders, {
    headers: {
      'Authorization': token
    }
  }).then(function () {
    getOrders();
    alert('已刪除所有訂單!');
  })["catch"](function () {
    alert('目前沒有訂單資料!');
  });
} // 圖表


function renderChart(category) {
  var categoryData = Object.entries(category);
  var chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: categoryData,
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
/* TODO 
  1. 訂單品項 目前只有單筆、未抓取陣列
  2. 訂單日期 根據送出日期產生
  3. 訂單狀態 點擊切換狀態 (目前無法 toggle 切換)
  5. 圖表 切換
*/


function initAdmin() {
  getOrders();
}

initAdmin();
"use strict";

var api_path = "js-2022";
var urlProducts = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/products");
var urlCarts = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/carts");
var productList = document.querySelector('#productList');
var form = document.querySelector('#orderForm');
var inputs = document.querySelectorAll("[data-validate]");
var messages = document.querySelectorAll("[data-msg]"); // let pathName = location.pathname;
// if(pathName.includes('index')) {}
// TODO: 驗證套件

/*
const constraints = {
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
const errors = validate(form, constraints);

// 顯示訂單驗證錯誤資訊
function showErrorMessage(errors) {
  messages.forEach((item) => {
    item.textContent = "";
    item.textContent = errors[item.dataset.msg];
  });
}

// 監控所有 input 的操作
inputs.forEach((item) => {
  item.addEventListener("change", e => {
    e.preventDefault();
    const targetName = item.name;
    const errors = validate(form, constraints);
    item.previousElementSibling.textContent = "";
    // 針對正在操作的欄位呈現警告訊息
    if (errors) {
      document.querySelector(`[data-msg='${targetName}']`).textContent =
        errors[targetName];
    }
  });
});
*/
// 表單送出監聽

form.addEventListener('submit', function (e) {
  e.preventDefault(); // console.log(errors);
  // if (errors) {
  //   showErrorMessage(errors);
  // } else {

  addOrder(); // }
}); // 送出訂單

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
  axios.post(urlOrder, order).then(function (res) {
    form.reset();
    getCarts();
    alert('已送出訂單');
  })["catch"](function (err) {
    return console.log('提交訂單失敗，請重新確認');
  });
} // 取得產品列表


function getProducts() {
  axios.get(urlProducts).then(function (res) {
    var productListData = res.data.products;
    renderProductList(productListData);
  })["catch"](function (err) {
    console.log(err);
  });
} // 渲染產品列表


function renderProductList(productListData) {
  var str = '';
  productListData.forEach(function (product) {
    str += "\n      <li class=\"products-item col-md-6 col-lg-4 col-xl-3\">\n        <div class=\"card p-0\">\n          <span class=\"products-tag\">\u65B0\u54C1</span>\n          <img src=\"".concat(product.images, "\" class=\"card-img-top\" alt=\"").concat(product.title, "\">\n          <div class=\"card-body p-0\">\n            <button type=\"button\" class=\"btn btn-black rounded-0 pb-2 w-100\" data-id=\"").concat(product.id, "\">\u52A0\u5165\u8CFC\u7269\u8ECA</button>\n            <h5 class=\"card-title pb-2\">").concat(product.title, "</h5>\n            <p class=\"card-text fs-5 text-decoration-line-through\">NT$").concat(product.origin_price, "</p>\n            <p class=\"card-text fs-3\">NT$").concat(product.price, "</p>\n          </div>\n        </div>\n      </li>\n    ");
  });
  productList.innerHTML = str;
}

var cartsData; // 加入購物車

productList.addEventListener('click', function (e) {
  if (e.target.nodeName !== 'BUTTON') {
    return;
  }

  var productId = e.target.dataset.id;
  addToCarts(productId);
}); // 取得購物車資料

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
    cartsList.innerHTML = "\n      <tr class=\"text-center\">\n        <td class=\"border-0 fs-3\">\u76EE\u524D\u8CFC\u7269\u8ECA\u7121\u5546\u54C1!</td>\n      </tr>\n    ";
  } else {
    thead.classList.remove('d-none');
    cartsData.forEach(function (item) {
      total += item.quantity * item.product.price;
      str += "\n        <tr>\n          <th scope=\"row\" class=\"d-flex align-items-center fw-normal\">\n            <img src=\"".concat(item.product.images, "\" alt=\"").concat(item.product.title, "\" class=\"cart-product-img\">\n            <p class=\"lh-lg\">").concat(item.product.title, "</p>\n          </th>\n          <td>NT$").concat(item.product.price, "</td>\n          <td>").concat(item.quantity, "</td>\n          <td>NT$").concat(item.product.price * item.quantity, "</td>\n          <td class=\"text-end\">\n            <button type=\"button\" class=\"border-0 bg-transparent\" data-id=\"").concat(item.id, "\" \n            onClick=\"deleteCartsItem('").concat(item.id, "')\">\n              <i class=\"fa-solid fa-x\"></i>\n            </button>\n          </td>\n        </tr>\n      ");
    }); // 總金額

    str += "\n      <tr class=\"carts-total\">\n        <td class=\"border-0\">\n          <button type=\"button\" class=\"btn btn-outline-black py-3 px-6\" onclick=\"deleteAllCarts()\">\u522A\u9664\u6240\u6709\u54C1\u9805</button>\n        </td>\n        <td class=\"border-0\"></td>\n        <td class=\"border-0\"></td>\n        <td class=\"border-0\">\n          <p>\u7E3D\u91D1\u984D</p>\n        </td>\n        <td class=\"border-0 fs-3\">NT$".concat(total, "</td>\n      </tr>\n    ");
    cartsList.innerHTML = str;
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
    getCarts();
    console.log('已加入購物車'); // alert("已加入購物車");
  })["catch"](function (err) {
    return console.log(err);
  });
} // 刪除購物車單筆(設置在 dom onclick)


function deleteCartsItem(id) {
  var url = "https://livejs-api.hexschool.io/api/livejs/v1/customer/".concat(api_path, "/carts/").concat(id);
  axios["delete"](url, id).then(function (res) {
    getCarts();
  })["catch"](function (err) {
    console.log('沒有這筆資料');
  });
} // 刪除購物車所有品項(設置在 dom onclick)


function deleteAllCarts() {
  axios["delete"](urlCarts).then(function (res) {
    alert('購物車已清空');
    getCarts();
  })["catch"](function (err) {
    console.log(err);
  });
}

function init() {
  getProducts();
  getCarts();
}

init();
//# sourceMappingURL=all.js.map
