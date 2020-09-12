$(function () {
  $(".dataTable").DataTable({
    paging: true,
    lengthChange: true,
    searching: true,
    ordering: true,
    info: true,
    autoWidth: false,
    responsive: true,
    "language": {
        "url": "//cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/French.json"
    },
    destroy: true
  });

  // Enable Popover
  $('[data-toggle="popover"]').popover();


  // Enable Select2
  $(document).ready(function () {
    $('.select2').select2();
  });
});