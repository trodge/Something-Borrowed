/* eslint no-unused-vars: 0 */
function onSignIn(googleUser) {
  var profile = googleUser.getBasicProfile();
  var userIdToken = googleUser.getAuthResponse().id_token;
  let userName = profile.getName();
  let userEmail = profile.getEmail();
  let userImage = profile.getImageUrl();
  $.ajax('/api/login', {
    type: 'POST',
    data: { 
      token: userIdToken, 
      name: userName,
      email: userEmail,
      image: userImage
    }
  }).then(function(response) {
    if (response.registeredUser) {
      window.location.href = '/profile';
    } else if (response.newUser) {
      window.location.href = '/profile/new';
    }
  });
}

function signOut() {
  if (gapi.auth2 === undefined) {
    gapi.load('auth2', function() {
      gapi.auth2.init().then(function(auth2) {
        doSignOut(auth2);
      });
    });
  } else {
    doSignOut(gapi.auth2);
  }
}

function doSignOut(auth2) {
  document.cookie = 'userid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  auth2.signOut().then(function() {
    console.log('User signed out.');
    window.location.href = '/';
  });
}
