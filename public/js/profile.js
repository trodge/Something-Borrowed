$(document).ready(function () {
    $('#addItem').on('click', function (event) {
        let allowedCategories = ['books', 'cleaning-supplies', 'electronics', 'kitchen', 'miscellaneous', 'movies-tv', 'outdoor-tools', 'video-games'];
        event.preventDefault();
        if ($('#itemName').val().trim() === '' || $('#itemName').val().trim() === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter an item name.');
            return;
        }
        if ($('#itemDesc').val().trim() === '' || $('#itemDesc').val().trim() === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter an item description.');
            return;
        }
        let itemUrl = $('#itemImage').val().trim();
        itemUrl.substring(0,4).toLowerCase();
        if (itemUrl.substring(0,4).toLowerCase() !== 'http') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter an item image URL that begins with "http".');
            return;
        }
        let category;
        if (allowedCategories.includes($('#itemCategory').val().trim())) {
            category = $('#itemCategory').val().trim();
        } else {
            category = 'miscellaneous';
        }
        let groupIds = [];
        $.each($("input[name='groupOption']:checked"), function(){            
            groupIds.push(parseInt($(this).val()));
        });
        if (groupIds.length === 0) {
            $('#errorModal').modal('show');
            $('#errorMessage').text('You must select at least one group this item will be available to.');
            return;
        }
        console.log(groupIds);
        const item = {
            itemName: $('#itemName').val().trim(),
            itemImage: itemUrl,
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

    $('.requestGroup').on('click', function(event) {
        event.preventDefault();
        let requestId = event.target.dataset.requestid;
        console.log(event);
        console.log(requestId);
        let requestInfo = {
            groupId: requestId
        };
        $.ajax('/api/group-requests', {
            type: 'POST',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });
});