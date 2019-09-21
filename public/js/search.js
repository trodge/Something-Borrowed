$(document).ready(function () {
    $('#search').on('click', function (event) {
        event.preventDefault();
        const query = $('#searchInput').val().trim();
        window.location.href = `/search/${query}`;
    });    
});