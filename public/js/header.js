$(document).ready(function () {
    const pathname = window.location.pathname;
    const first = pathname.split('/');
    $('.nav').each(function () {
        let link = $(this).attr('href');
        const firstLink = link.split('/');
        if (`/${firstLink[1]}` === `/${first[1]}`) {
            $(this).parent().attr('class', 'currentPage');
        }
    });
});