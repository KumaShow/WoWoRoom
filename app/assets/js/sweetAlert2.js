/*
  前台 Alert
*/

  // 加入購物車成功
  function swalCartsSuccess() {
    Swal.fire({
      icon: 'success',
      title: '已加入購物車',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 加入購物車失敗
  function swalCartsError() {
    Swal.fire({
      icon: 'error',
      title: '錯誤...',
      text: '購物車數量不能小於1!',
      showConfirmButton: true,
    })
  }

  // 刪除購物車成功
  function swalDeleteCartsSuccess() {
    Swal.fire({
      icon: 'success',
      text: '購物車已清空!',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 刪除購物車失敗
  function swalDeleteCartsError() {
    Swal.fire({
      icon: 'error',
      title: '錯誤...',
      text: '購物車沒有商品!',
      showConfirmButton: true,
    })
  }
  
  // 購物車空的無法送出訂單
  function swalCartsEmpty() {
    Swal.fire({
      icon: 'error',
      title: '購物車沒有商品!',
      text: '快去大肆採購吧ヽ(✿ﾟ▽ﾟ)ノ',
      showConfirmButton: true,
    })
  }

  // 送出訂單成功
  function swalAddOrderSuccess() {
    Swal.fire({
      icon: 'success',
      title: '已成功送出訂單',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 送出訂單失敗
  function swalAddOrderError() {
    Swal.fire({
      icon: 'error',
      title: '送出訂單失敗',
      text: '請確認訂單填寫是否正確',
      showConfirmButton: true,
    })
  }

/*
  後台 Alert
*/

  // 刪除所有訂單成功
  function swalDelAllOrdersSuccess() {
    Swal.fire({
      icon: 'success',
      text: '訂單資料已清空!',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 沒有訂單資料
  function swalOrdersEmpty() {
    Swal.fire({
      icon: 'error',
      text: '目前沒有訂單資料!',
      showConfirmButton: true,
    })
  }

  // 修改訂單狀態成功
  function swalEditOrderSuccess() {
    Swal.fire({
      icon: 'success',
      text: '已修改訂單狀態!',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 修改訂單狀態失敗
  function swalEditOrderError() {
    Swal.fire({
      icon: 'error',
      text: '修改訂單狀態失敗!',
      showConfirmButton: true,
    })
  }

  // 刪除單筆訂單成功
  function swalDelOrderSuccess() {
    Swal.fire({
      icon: 'success',
      text: '刪除單筆訂單成功!',
      showConfirmButton: true,
      timer: 2500
    })
  }

  // 刪除單筆訂單失敗
  function swalDelOrderError() {
    Swal.fire({
      icon: 'error',
      title: '刪除訂單失敗',
      text: '請確認訂單是否存在',
      showConfirmButton: true,
    })
  }