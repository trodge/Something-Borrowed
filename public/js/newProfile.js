// function createNewProfile() {
//     $.ajax('/api/profile', {
//         type: 'POST',
//         data: {  }
//         }).then(function(response) {
//         console.log(response);
//         if (response === 'registeredUser') {
//             window.location.href = '/profile';
//         } else if (response === 'newUser') {
//             window.location.href = '/createProfile';
//         }
//         console.log('Token sent');
//         });
//     }