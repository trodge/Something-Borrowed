$(document).ready(function () {
  $('#search').on('click', function (event) {
    event.preventDefault();
    const query = $('#searchInput').val().trim();
    console.log(`search ${query}`);
    window.location.href = `/search/${query}`;
  });
});