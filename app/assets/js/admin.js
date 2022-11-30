const api_path = "js-2022";
const token = "kk6wTiHvysgMHTb81Mkv3q2j0M23";
const urlAdminOrders = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;

const orderList = document.querySelector('#ordersList');
const btnDeleteAll = document.querySelector('#btnDeleteAll');

// 渲染訂單畫面
function renderOrders(ordersData) {
  let str = '';
  ordersData.forEach(order => {
    let status = order.paid ? '已處理' : '未處理';
    // order.products.forEach(item => {
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
    str += `
    <tr class="align-middle">
      <th scope="row">10088377474</th>
      <td>${order.user.name}<br>${order.user.tel}</td>
      <td>${order.user.address}</td>
      <td>${order.user.email}</td>
      <td>${order.products[0].title}</td>
      <td>2021/03/08</td>
      <td class="text-info">
        <a href="#!" class="text-decoration-underline link-info" data-paid="${order.paid}" data-id="${order.id}">
          ${status}
        </a>
      </td>
      <td>
        <button type="button" class="btn btn-danger" data-id="${order.id}">刪除</button>
      </td>
    </tr>`
  })
  orderList.innerHTML = str;
}
let ordersData = [];
// 取得訂單資料
function getOrders() {
  axios.get(urlAdminOrders,{
    headers: {
      'Authorization': token
    }
  }).then(res => {
      ordersData = res.data.orders;
      console.log(ordersData); 
      
      if(ordersData.length === 0) {
        btnDeleteAll.classList.add('d-none');
      } else {
        btnDeleteAll.classList.remove('d-none');
      }

      const category = {};
      ordersData.forEach(order => {
        order.products.forEach(item => {
          console.log(item.category);
          category[item.category] 
            ? category[item.category]++ 
            : category[item.category] = 1;
        })
      })
      console.log(category);
      renderOrders(ordersData);
      renderChart(category);
    });
}

// 訂單事件
orderList.addEventListener('click', e => {
  let isPaid = e.target.dataset.paid;
  const orderId = e.target.dataset.id;
  const target = e.target.nodeName;
  if (target === 'A') {
    editOrders(orderId, isPaid);
  } else if (target === 'BUTTON') {
    deleteOrder(orderId);
  }else if(target !== 'A' || target !== 'BUTTON') {
    return;
  }
})

// 修改訂單狀態
function editOrders(id) {
  axios.put(urlAdminOrders,
    {
      "data": {
        "id": id,
        "paid": true
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
  .then(res => {
    console.log(res);
    getOrders();
  }).catch(err => console.log(err));
}
// 刪除單筆訂單
function deleteOrder(id) {
  const urlDeleteOrder = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`;
  axios.delete(urlDeleteOrder,{
    headers: {
      'Authorization': token
    }
  }).then(() => {
    getOrders();
  }).catch(() => {
    console.log('無該筆訂單資料');
  });
}
// 監聽清除全部訂單按鈕
btnDeleteAll.addEventListener('click', deleteOrderAll);
// 刪除所有訂單
function deleteOrderAll() {
  axios.delete(urlAdminOrders,{
    headers: {
      'Authorization': token
    }
  }).then(() => {
    getOrders();
    alert('已刪除所有訂單!');
  }).catch(() => {
    alert('目前沒有訂單資料!');
  })
}

// 圖表
function renderChart(category) {
  const categoryData = Object.entries(category);
  const chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: categoryData,
      type: "pie",
      colors: {
        床架: "#DACBFF",
        收納: "#9D7FEA",
        窗簾: "#5434A7",
        其他: "#301E5F",
      },
    },
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