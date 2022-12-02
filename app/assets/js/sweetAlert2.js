  // Alert 成功
  function swalSuccess(title, status, text) {
    Swal.fire({
      icon: status,
      title: title,
      text: text,
      showConfirmButton: true,
      timer: 2500
    })
  }

  // Alert 失敗
  function swalError(title, status, text) {
    Swal.fire({
      icon: status,
      title: title,
      text: text,
      showConfirmButton: true,
    })
  }