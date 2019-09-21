$(document).ready(function () {
    $('#submitRequest').on('click', function (event) {
        if ($('#duration').val().trim() === '' || $('#itemName').val().trim() === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter a duration');
            return;
        }
        event.preventDefault();
        const requestInfo = {
            itemId: $('#request').data('itemid'),
            duration: $('#duration').val().trim(),
            notes: $('#notes').val().trim()
        };
        console.log(requestInfo);
        $.ajax('/api/item-requests', {
            type: 'POST',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });
});