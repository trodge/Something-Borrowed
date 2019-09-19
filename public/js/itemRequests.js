$(document).ready(function () {
    $('#submitRequest').on('click', function (event) {
        event.preventDefault();
        const requestInfo = {
            itemId: $('#request').data('itemid'),
            duration: $('#duration').val().trim(),
            exchange1: $('#exchange1').val().trim(),
            exchange2: $('#exchange2').val().trim(),
            exchange3: $('#exchange3').val().trim(),
        };
        console.log(requestInfo);
        $.ajax('/api/itemrequests', {
            type: 'POST',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });
});