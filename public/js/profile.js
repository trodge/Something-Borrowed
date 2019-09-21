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
        itemUrl.substring(0, 4).toLowerCase();
        if (itemUrl.substring(0, 4).toLowerCase() !== 'http') {
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
        $.each($("input[name='groupOption']:checked"), function () {
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
            method: 'POST',
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
            method: 'POST',
            data: groupInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.handleItemRequest').on('click', function (event) {
        event.preventDefault();
        let dataset = event.target.dataset;
        let request = {
            requestId: dataset.requestid
        };
        $.ajax(`/api/item-requests/${dataset.requeststatus}`, {
            method: 'PUT',
            data: request
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.editRequest').on('click', function(event) {
        event.preventDefault();
        let dataset = event.target.dataset;
        // $(`#chat${dataset.requestid}`).text() + '\nRequester:' + 
        let chat = $(`#message${dataset.requestid}`).val().trim();
        console.log(chat);
        let request = {
            requestId: dataset.requestid, 
            messages: chat
        };
        
        $.ajax(`/api/item-requests-message`, {
            method: 'PUT',
            data: request
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.deleteRequest').on('click', function(event) {
        event.preventDefault();
        let dataset = event.target.dataset;
        let request = {
            id: dataset.requestid
        };
        console.log(request);
        $.ajax(`/api/item-requests`, {
            method: 'DELETE',
            data: request
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.requestGroup').on('click', function (event) {
        event.preventDefault();
        let requestId = event.target.dataset.requestid;
        console.log(event);
        console.log(requestId);
        let requestInfo = {
            groupId: requestId
        };
        $.ajax('/api/group-request', {
            method: 'POST',
            data: requestInfo
        }).then(function (/*response*/) {
            location.reload();
        });
    });

    $('.handleGroupRequest').click(event => {
        event.preventDefault();
        let dataset = event.target.dataset;
        let request = {
            groupRequestId: dataset.requestid
        };
        console.log(request, dataset);
        $.ajax(`/api/group-request/${dataset.requeststatus}`, {
            method: 'DELETE',
            data: request
        }).then(response => {
            console.log(response);
            location.reload();
        });
    });

    $('.removeMember').click(event => {
        event.preventDefault();
        let dataset = event.target.dataset;
        let request = {
            userid: dataset.userid
        };
        $.ajax(`/api/remove-member/${dataset.groupid}`, {
            method: 'PUT',
            data: request
        }).then(response => {
            console.log(response);
            location.reload();
        });
    });
});