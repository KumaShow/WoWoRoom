const api_path = "js-2022";
const urlProducts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`;
const urlCarts = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`;

const productList = document.querySelector('#productList');
const form = document.querySelector('#orderForm');
const inputs = document.querySelectorAll("[data-validate]");
const messages = document.querySelectorAll("[data-msg]");

// let pathName = location.pathname;
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
form.addEventListener('submit', e => {
  e.preventDefault();
  // console.log(errors);
  // if (errors) {
  //   showErrorMessage(errors);
  // } else {
    addOrder();
  // }
});

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
    .then(res => {
      form.reset();
      getCarts();
      alert('已送出訂單');
    })
    .catch(err => console.log('提交訂單失敗，請重新確認'));
}

// 取得產品列表
function getProducts() {
  axios.get(urlProducts)
  .then((res) => {
    const productListData = res.data.products;
    renderProductList(productListData);
  })
  .catch((err) => {
    console.log(err);
  });
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
            <p class="card-text fs-5 text-decoration-line-through">NT$${product.origin_price}</p>
            <p class="card-text fs-3">NT$${product.price}</p>
          </div>
        </div>
      </li>
    `;
  })
  productList.innerHTML = str;
}

let cartsData;
// 加入購物車
productList.addEventListener('click', e => {
  if(e.target.nodeName !== 'BUTTON') {
    return;
  }
  const productId = e.target.dataset.id;

  addToCarts(productId);
})

// 取得購物車資料
function getCarts() {
  axios.get(urlCarts)
    .then(res => {
      cartsData = res.data.carts;
      renderCarts(cartsData);
    })
    .catch(err => {
      console.log(err);
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
      </tr>
    `;
  } else {
    thead.classList.remove('d-none');
    cartsData.forEach(item => {
      total += item.quantity * item.product.price;
      str += `
        <tr>
          <th scope="row" class="d-flex align-items-center fw-normal">
            <img src="${item.product.images}" alt="${item.product.title}" class="cart-product-img">
            <p class="lh-lg">${item.product.title}</p>
          </th>
          <td>NT$${item.product.price}</td>
          <td>${item.quantity}</td>
          <td>NT$${item.product.price * item.quantity}</td>
          <td class="text-end">
            <button type="button" class="border-0 bg-transparent" data-id="${item.id}" 
            onClick="deleteCartsItem('${item.id}')">
              <i class="fa-solid fa-x"></i>
            </button>
          </td>
        </tr>
      `;
    });
    // 總金額
    str += `
      <tr class="carts-total">
        <td class="border-0">
          <button type="button" class="btn btn-outline-black py-3 px-6" onclick="deleteAllCarts()">刪除所有品項</button>
        </td>
        <td class="border-0"></td>
        <td class="border-0"></td>
        <td class="border-0">
          <p>總金額</p>
        </td>
        <td class="border-0 fs-3">NT$${total}</td>
      </tr>
    `
    cartsList.innerHTML = str;
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
  .then(res => {
    getCarts();
    console.log('已加入購物車');
    // alert("已加入購物車");
  })
  .catch(err => console.log(err));
}

// 刪除購物車單筆(設置在 dom onclick)
function deleteCartsItem(id) {
  const url = `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${id}`;

  axios.delete(url,id)
    .then(res => {
      getCarts();
    })
    .catch(err => {
      console.log('沒有這筆資料');
    })
}

// 刪除購物車所有品項(設置在 dom onclick)
function deleteAllCarts() {
  axios.delete(urlCarts)
    .then(res => {
      alert('購物車已清空');
      getCarts();
    })
    .catch(err => {
      console.log(err);
    });
}


function init() {
  getProducts();
  getCarts();
}
init();

