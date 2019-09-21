$(document).ready(function () {
    $('#contact').on('click', function (event) {
        event.preventDefault();
        let name = $('#contactName').val().trim();
        if (name === '' || name === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter your name.');
            return;
        }
        let phone = $('#contactPhone').val().trim();
        let email = $('#contactEmail').val().trim();
        if (email === '' || email === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter your email.');
            return;
        }
        let message = $('#contactMessage').val().trim();
        if (message === '' || message === ' ') {
            $('#errorModal').modal('show');
            $('#errorMessage').text('Please enter a message.');
            return;
        }
        let contactData = {
            contactName: name,
            contactPhone: phone,
            contactEmail: email,
            contactMessage: message
        };
        $.ajax('/api/contact', {
            type: 'POST',
            data: contactData
        }).then(function () {
            $('#contactSentModal').modal('show');
            $('#contactName').val('');
            $('#contactPhone').val('');
            $('#contactEmail').val('');
            $('#contactMessage').val('');
        });
    });
});