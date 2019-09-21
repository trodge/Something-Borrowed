$(document).ready(function () {
    $('#submitRequest').on('click', function (event) {
        event.preventDefault();
        if ($('#duration').val().trim() === '' || $('#duration').val().trim() === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter a duration');
            return;
        }
        const requestInfo = {
            itemId: $('#request').data('itemid'),
            duration: $('#duration').val().trim(),
            notes: $('#notes').val().trim()
        };
        $.ajax('/api/item-requests', {
            type: 'POST',
            data: requestInfo
        }).then(function () {
            location.reload();
        });
    });
});