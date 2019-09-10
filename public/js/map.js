$(document).ready(function () {
    L.mapquest.key = 'bfMAzWUnoSxO6pGQe7gAX1mRwjMCn74X';
    var popup = L.popup();
    var map = L.mapquest.map('map', {
        center: [39.7392, -104.9903],
        layers: L.mapquest.tileLayer('map'),
        zoom: 12
    });


    var popup = L.popup();

    function geolocationErrorOccurred(geolocationSupported, popup, latLng) {
        popup.setLatLng(latLng);
        popup.setContent(geolocationSupported ?
            '<b>Error:</b> The Geolocation service failed.' :
            '<b>Error:</b> This browser doesn\'t support geolocation.');
        popup.openOn(map);
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latLng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            popup.setLatLng(latLng);
            popup.setContent('This is your current location');
            popup.openOn(map);

            map.setView(latLng);
        }, function () {
            geolocationErrorOccurred(true, popup, map.getCenter());
        });
    } else {
        //No browser support geolocation service
        geolocationErrorOccurred(false, popup, map.getCenter());
    }

    map.addControl(L.mapquest.control());
    map.addControl(L.mapquest.geocodingControl({
        className: '',
        closeResultsOnClick: true,
        compactResults: false,
        geocodingOptions: {},
        keepOpen: false,
        marker: {
            icon: 'marker',
            iconOptions: {},
        },
        placeholderText: 'Search',
        placeMarker: true,
        pointZoom: '',
        position: 'topleft',
        removePreviousMarker: false,
        searchAhead: true,
        searchAheadOptions: {
            limit: 6,
            collection: 'address,adminArea,airport,category,franchise,poi',
            location: '',
            countryCode: '',
        }
    }));

});
