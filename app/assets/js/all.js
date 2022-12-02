const urlProducts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
const urlCarts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;
const productList = document.querySelector('#productList');
const form = document.querySelector('#orderForm');

let productListData;
let productCategory = {};
let cartsData;

// 不同頁面分別執行初始化
function locationPathChanged() {
  if (location.pathname.includes('index') ||
      location.pathname === '/') {
    // 首頁初始化
    function init() {
      getProducts();
      getCarts();
      recommendationDrag();
      submitForm();
    }
    init();
  } else {
    // 後臺初始化
    function initAdmin() {
      getOrders();
      orderListClick();
    }
    initAdmin();
  }
}
locationPathChanged();

// 驗證套件
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
  const messages = document.querySelectorAll("[data-msg]");
  messages.forEach((item) => {
    item.textContent = "";
    item.textContent = errors[item.dataset.msg];
  });
}

// 監控所有 input 的操作
function checkFormInput() {
  const inputs = document.querySelectorAll("[data-validate]");
  inputs.forEach((item) => {
    item.addEventListener("change", e => {
      e.preventDefault();
      // 先清空錯誤訊息
      item.previousElementSibling.textContent = "";
      const targetName = item.name;
      const errors = validate(form, constraints);
      // 針對正在操作的欄位呈現警告訊息
      if (errors) {
        document.querySelector(`[data-msg='${targetName}']`).textContent =
          errors[targetName];
      }
    });
  });
}

// 表單送出監聽
function submitForm() {
  const btnSubmitForm = document.querySelector('#btnSubmitForm');
  btnSubmitForm.addEventListener('click', e => {
    e.preventDefault();
    if (!cartsData.length) {
      swalError('購物車沒有商品!', 'error', '快去大肆採購吧ヽ(✿ﾟ▽ﾟ)ノ');
      return;
    } 

    checkFormInput();

    let errors = validate(form, constraints);
    // 有錯誤則顯示錯誤訊息
    if(errors) {
      showErrorMessage(errors);
    } else {
      addOrder();
    }
  });
}

// 送出訂單
function addOrder() {
  const urlOrder = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`;
  const userName = document.querySelector("#userName").value.trim();
  const userPhone = document.querySelector("#userPhone").value.trim();
  const userEmail = document.querySelector("#userEmail").value.trim();
  const userAddress = document.querySelector("#userAddress").value.trim();
  const payMethod = document.querySelector("#payMethod").value;

  const order = {
    data: {
      user: {
        name: userName,
        tel: userPhone,
        email: userEmail,
        address: userAddress,
        payment: payMethod,
      }
    }
  }

  axios.post(urlOrder,order)
    .then(() => {
      form.reset();
      getCarts();
      swalSuccess('已送出訂單', 'success');
    })
    .catch(() => {
      swalError('訂單送出失敗', 'error', '請確認訂單是否填寫正確!');
    });
}

// 取得產品列表
function getProducts() {
  axios.get(urlProducts)
    .then((res) => {
      productListData = res.data.products;
      renderProductList(productListData);
      productListClick();
      productFilterChange(productListData);
    })
    .catch((err) => {
      console.log(err);
    });
}

// 產品篩選
function productFilterChange() {
  const productType = document.querySelector('#productType');

  productType.addEventListener('change', e => {
    const category = e.target.value;

    if(category === '全部') {
      renderProductList(productListData);
      return;
    }

    const filterArr = productListData.filter(item => {
      return item.category === category;
    });
    renderProductList(filterArr);
  })
}

// 渲染產品列表
function renderProductList(productListData) {
  let str = '';
  productListData.forEach(product => {
    str += `
      <li class="products-item col-md-6 col-lg-4 col-xl-3">
        <div class="card p-0">
          <span class="products-tag">新品</span>
          <img src="${product.images}" class="card-img-top" alt="${product.title}">
          <div class="card-body p-0">
            <button type="button" class="btn btn-black rounded-0 pb-2 w-100" data-id="${product.id}">加入購物車</button>
            <h5 class="card-title pb-2">${product.title}</h5>
            <p class="card-text fs-5 text-decoration-line-through">NT$${toThousand(product.origin_price)}</p>
            <p class="card-text fs-3">NT$${toThousand(product.price)}</p>
          </div>
        </div>
      </li>
    `;
  })
  productList.innerHTML = str;
}

// 加入購物車
function productListClick() {
  productList.addEventListener('click', e => {
    if(e.target.nodeName !== 'BUTTON') {
      return;
    }
    const productId = e.target.dataset.id;
    addToCarts(productId);
  })
}

// 取得購物車資料
function getCarts() {
  axios.get(urlCarts)
    .then(res => {
      cartsData = res.data.carts;
      renderCarts(cartsData);
    })
    .catch(err => {
      // console.log(err);
    });
}

// 顯示購物車資料
function renderCarts(cartsData) {
  const thead = document.querySelector('.cart thead');
  let total = 0;
  let str = '';

  if(cartsData.length === 0) {
    thead.classList.add('d-none');
    cartsList.innerHTML = `
      <tr class="text-center">
        <td class="border-0 fs-3">目前購物車無商品!</td>
      </tr>`;
  } else {
    const cartsList = document.querySelector('#cartsList');
    thead.classList.remove('d-none');
    cartsData.forEach(item => {
      total += item.quantity * item.product.price;
      str += `
        <tr>
          <th scope="row" class="d-flex align-items-center fw-normal">
            <img src="${item.product.images}" alt="${item.product.title}" class="cart-product-img">
            <p class="lh-lg">${item.product.title}</p>
          </th>
          <td>NT$${toThousand(item.product.price)}</td>
          <td>
            ${item.quantity}
          </td>
          <td>NT$${toThousand(item.product.price * item.quantity)}</td>
          <td class="text-end">
            <a href="#!" class="border-0 bg-transparent link-black" data-id="${item.id}">
              <i class="fa-solid fa-x" data-id="${item.id}"></i>
            </a>
          </td>
        </tr>`;
    });
    // 總金額
    str += `
      <tr class="carts-total">
        <td class="border-0">
          <button type="button" class="btn btn-outline-black py-3 px-6" id="btnClearCarts">刪除所有品項</button>
        </td>
        <td class="border-0"></td>
        <td class="border-0"></td>
        <td class="border-0">
          <p>總金額</p>
        </td>
        <td class="border-0 fs-3">NT$${toThousand(total)}</td>
      </tr>
    `
    cartsList.innerHTML = str;
    btnClearCartsClick();
    cartsListClick();
  }
}

// 加入購物車
function addToCarts(id) {
  let num = 1;
  cartsData.forEach(item => {
    if(item.product.id === id) {
      num = item.quantity += 1;
    }
  })
  const data = {
    "data": {
      "productId": id,
      "quantity": num
    }
  };

  axios.post(urlCarts, data)
  .then(() => {
    getCarts();
    swalSuccess('已加入購物車', 'success');
  })
  .catch(() => {
    swalError('未加入購物車', 'error');
  });
}

// 綁定清除購物車按鈕
function btnClearCartsClick() {
  const btnClearCarts = document.querySelector('#btnClearCarts');
  btnClearCarts.addEventListener('click', e => {
    e.preventDefault();
    deleteAllCarts();
  });
}

// 購物車刪除事件
function cartsListClick() {
  cartsList.addEventListener('click', e => {
    e.preventDefault();
    const cartItemId = e.target.getAttribute('data-id');
  
    if(cartItemId === null) {
      return;
    } else {
      deleteCartsItem(cartItemId);
    }
  });
}

// 刪除購物車單筆
function deleteCartsItem(id) {
  const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`;

  axios.delete(url,id)
    .then(() => {
      getCarts();
    })
    .catch(() => {
      console.log('沒有這筆資料');
    })
}

// 刪除購物車所有品項
function deleteAllCarts() {
  axios.delete(urlCarts)
    .then(() => {
      swalSuccess('已清空購物車', 'success');
      getCarts();
    })
    .catch(err => {
      console.log(err);
      swalError('清空失敗', 'error');
    });
}

// 千分位
function toThousand(num) {
  const numStr = num.toString();
  return numStr.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// 好評推薦拖拉功能
function recommendationDrag() {
  document.addEventListener("DOMContentLoaded", function () {
    const ele = document.querySelector(".recommendation-wall");
    ele.style.cursor = "grab";
    let pos = { top: 0, left: 0, x: 0, y: 0 };
    const mouseDownHandler = function (e) {
      ele.style.cursor = "grabbing";
      ele.style.userSelect = "none";
  
      pos = {
        left: ele.scrollLeft,
        top: ele.scrollTop,
        // Get the current mouse position
        x: e.clientX,
        y: e.clientY,
      };
  
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    };
    const mouseMoveHandler = function (e) {
      // How far the mouse has been moved
      const dx = e.clientX - pos.x;
      const dy = e.clientY - pos.y;
  
      // Scroll the element
      ele.scrollTop = pos.top - dy;
      ele.scrollLeft = pos.left - dx;
    };
    const mouseUpHandler = function () {
      ele.style.cursor = "grab";
      ele.style.removeProperty("user-select");
  
      document.removeEventListener("mousemove", mouseMoveHandler);
      document.removeEventListener("mouseup", mouseUpHandler);
    };
    // Attach the handler
    ele.addEventListener("mousedown", mouseDownHandler);
  });
}
