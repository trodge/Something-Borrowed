$(document).ready(function () {
    $('#addItem').on('click', function (event) {
        event.preventDefault();
        const item = {
            itemName: $('#itemName').val().trim(),
            itemImage: $('#itemImage').val().trim(),
            itemDescription: $('#itemDesc').val().trim(),
            itemCategory: $('#itemCategory').val().trim()
        };
        $.ajax('/api/items', {
            type: 'POST',
            data: item
        }).then(function (/*response*/) {
            location.reload();
        });
    });
    $('#addGroup').on('click', function (event) {
        event.preventDefault();
        const groupInfo = {
            groupName: $('#groupName').val().trim(),
            groupDescription: $('#groupDescription').val().trim()
        };
        $.ajax('/api/groups', {
            type: 'POST',
            data: groupInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });
});