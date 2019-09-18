$(document).ready(function () {
    // Scroll down to open accordion on Profile page
    $('a[data-toggle=collapse]').on('click', function() {
        $('html,body').animate({
            scrollTop: $(this).offset().top
        }, 700);
    });
    
});