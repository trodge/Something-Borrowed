jQuery(document).ready(function($) {
  $('#show-items a[data-toggle=collapse]').on('click', function () {
    this.scrollIntoView();
  });
});