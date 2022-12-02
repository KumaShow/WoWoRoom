const urlAdminOrders = `https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`;

let ordersData = [];

// 訂單日期
function orderCreateDate(ms){
  const timer = new Date(ms * 1000);
  const y = timer.getFullYear() ;
  const m = timer.getMonth()+1 >= 10 
    ? timer.getMonth()+1 
    : `0${timer.getMonth()+1}`;
  const d = timer.getDate() >= 10 
    ? timer.getDate() 
    : `0${timer.getDate()}`;
  return `${y}/${m}/${d}`;
};

// 渲染訂單畫面
function renderOrders() {
  const orderList = document.querySelector('#ordersList');
  let str = '';

  ordersData.forEach(order => {
    let status = order.paid ? '已處理' : '未處理';
    const orderDate = orderCreateDate(order.createdAt);
    const orderProducts = order.products.map(item => {
      return `${item.title} x ${item.quantity}`;
    }).join('<br>');

    str += `
    <tr class="align-middle">
      <th scope="row">${order.id}</th>
      <td>${order.user.name}<br>${order.user.tel}</td>
      <td>${order.user.address}</td>
      <td>${order.user.email}</td>
      <td>${orderProducts}</td>
      <td>${orderDate}</td>
      <td class="text-info">
        <a href="#!" class="text-decoration-underline link-info" data-paid="${order.paid}" data-id="${order.id}">
          ${status}
        </a>
      </td>
      <td>
        <button type="button" class="btn btn-danger" data-id="${order.id}" >刪除</button>
      </td>
    </tr>`
  })
  orderList.innerHTML = str;
}

// 渲染按鈕 清除全部訂單
function renderBtnDelete() {
  const btnDeleteAll = document.querySelector('#btnDeleteAll');
  if(ordersData.length === 0) {
    btnDeleteAll.classList.add('d-none');
  } else {
    btnDeleteAll.classList.remove('d-none');
  }
  btnDeleteAll.addEventListener('click', deleteOrderAll);
}

// 取得訂單資料
function getOrders() {
  axios.get(urlAdminOrders,{
    headers: {
      'Authorization': token
    }
  }).then(res => {
    ordersData = res.data.orders;
    renderChart(ordersData);
    renderOrders();
    renderBtnDelete();
  }).catch(err => {
    console.log(err);
  });
}

// 訂單點擊事件監聽
function orderListClick() {
  const orderList = document.querySelector('#ordersList');
  if (orderList) {
    orderList.addEventListener('click', e=> {
      e.preventDefault();
      if(e.target.nodeName === 'A') {
        let isPaid = e.target.dataset.paid;
        const productId = e.target.dataset.id;
        isPaid = isPaid === 'false' ? false : true;
        editOrders(productId, isPaid);
        return;
      } else if (e.target.nodeName === 'BUTTON') {
        const orderId = e.target.dataset.id;
        deleteOrder(orderId);
        return;
      } else {
        return;
      }
    })
  }
}

// 修改訂單狀態
function editOrders(id, isPaid) {
  isPaid = !isPaid;
  axios.put(urlAdminOrders,
    {
      "data": {
        "id": id,
        "paid": isPaid
      }
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      }
    })
  .then(() => {
    getOrders();
    swalSuccess('修改訂單成功', 'success');
  }).catch(() => {
    swalError('修改頂單失敗', 'error');
  });
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
    swalSuccess('已刪除單筆訂單', 'success');
  }).catch(() => {
    swalError('刪除單筆訂單失敗', 'error');
  });
}

// 刪除所有訂單
function deleteOrderAll() {
  axios.delete(urlAdminOrders,{
    headers: {
      'Authorization': token
    }
  }).then(() => {
    getOrders();
    swalSuccess('已刪除所有訂單', 'success');
  }).catch(() => {
    swalError('目前沒有訂單', 'warning');
  })
}

// c3 圖表
function renderChart(ordersData) {
  const chartDisplay = document.querySelector('#chart');
  if(ordersData.length === 0){
    chartDisplay.classList.add('d-none');
  } else {
    chartDisplay.classList.remove('d-none');
  }
  
  let total = {};
  ordersData.forEach(order => {
    order.products.forEach(productItem => {
      total[productItem.category] 
        ? total[productItem.category] += productItem.price * productItem.quantity
        : total[productItem.category] = productItem.price * productItem.quantity;
    })
  });
  const chartData = Object.entries(total);
  const chart = c3.generate({
    bindto: "#chart",
    data: {
      columns: chartData,
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
// TODO: 圖表切換
function chartFilter() {
  const chartFilter = document.querySelector('#chartFilter');
  chartFilter.addEventListener('change', e => {
    console.log(e.target);
    console.log(e.target.value);
  })
}

/* TODO 
  1. 圖表 切換
*/
