/* eslint no-unused-vars: 0 */
$(document).ready(function() {
    $('#createProfile').on('click', function (event) {
        event.preventDefault();
        let userImageSrc = $('#userImage').val().trim();
        if ($('#userImage').val().trim() === undefined || $('#userImage').val().trim() === '' || $('#userImage').val().trim() === null) {
            userImageSrc = 'https://lh3.googleusercontent.com/a-/AAuE7mCoky79mIN7EGptigkzsd0I4hCRFumTf93vhNuyKg=s96-c';
        }
        const userInfo = {
            userName: $('#userName').val().trim(),
            userEmail: $('#userEmail').val().trim(),
            userImage: userImageSrc
        };
        $.ajax('/api/login', {
            type: 'PUT',
            data: userInfo
        }).then(function (response) {
            window.location.href = '/profile';
        });
    });
});