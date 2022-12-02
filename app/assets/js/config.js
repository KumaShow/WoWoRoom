const api_path = "js-2022";
const token = "kk6wTiHvysgMHTb81Mkv3q2j0M23";

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
  } else if(location.pathname.includes('admin')) {
    // 後臺初始化
    function initAdmin() {
      getOrders();
      orderListClick();
    }
    initAdmin();
  }
}
locationPathChanged();