$(document).ready(function () {
    $('#addItem').on('click', function (event) {
        let allowedCategories = ['Books', 'Cleaning Supplies', 'Electronics', 'Kitchen', 'Miscellaneous', 'Movies/TV', 'Outdoor Tools', 'Video Games'];
        event.preventDefault();
        let category;
        if (allowedCategories.includes($('#itemCategory').val().trim())) {
            category = $('#itemCategory').val().trim();
        } else {
            category = 'Miscellaneous';
        }
        let groupIds = [];
        $.each($("input[name='groupOption']:checked"), function(){            
            groupIds.push(parseInt($(this).val()));
        });
        console.log(groupIds);
        const item = {
            itemName: $('#itemName').val().trim(),
            itemImage: $('#itemImage').val().trim(),
            itemDescription: $('#itemDesc').val().trim(),
            itemCategory: category,
            groupsAvailable: groupIds
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

    $('.confirmRequest').on('click', function (event) {
        event.preventDefault();
        let requestId = event.target.dataset.requestid;
        console.log(event);
        console.log(requestId);
        let requestInfo = {
            requestId: requestId,
            confirmed: true,
            denied: false
        };
        $.ajax('/api/itemrequests', {
            type: 'PUT',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.denyRequest').on('click', function (event) {
        event.preventDefault();
        let requestId = event.target.dataset.requestid;
        console.log(event);
        console.log(requestId);
        let requestInfo = {
            requestId: requestId,
            confirmed: true,
            denied: true
        };
        $.ajax('/api/itemrequests', {
            type: 'PUT',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });
});