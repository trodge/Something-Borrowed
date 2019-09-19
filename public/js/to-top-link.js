// Start block to protect JavaScript
{
    // Start jQuery Document Ready
    jQuery(document).ready(($) => {

        // Assign variable to show "To Top" link
        // if vertical scrollbar appears and
        // if not don't show it
        const findOutIfPageHasVerticalScrollBar = () => {
            const $toTopParagraph = $('#to-top');

            let pageHasVerticalScrollbar = $(document).height() > $(window).height();

            if(pageHasVerticalScrollbar) {
                $toTopParagraph.removeClass('hide');
                console.log('SHOW');
            }
            else {
                $toTopParagraph.addClass('hide');
                console.log('HIDE');
            }
        };

        // If the #to-top-link anchor tag exists
        // execute scroll to top of page function
        const $toTopLink = $('#to-top-link');
    
        if ($toTopLink.length > 0) {
            $toTopLink.on('click', (e) => {
                e.preventDefault();
                $('html, body').animate({
                    scrollTop: 0
                }, 700);
            });
        }
    
        // Call method to find out if page has vertical
        // scroll bar and if yes display "To Top" link
        findOutIfPageHasVerticalScrollBar();
    
        // Call method on resize
        $(window).on('resize', findOutIfPageHasVerticalScrollBar);

    });

}