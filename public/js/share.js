$(function () {
    $(document).on('click', '.share-fb', function () {
        var $btn = $(this);
        var $card = $btn.closest('.post-card');
        var $out = $card.find('.share-result');

        $btn.prop('disabled', true).text('משתף...');
        $out.empty();

        $.ajax({
            url: '/posts/' + $card.data('post-id') + '/share/facebook',
            method: 'POST',
            dataType: 'json'
        }).done(function (data) {
            var $box = $('<div class="share-ok"></div>')
                .append($('<strong></strong>').text('שותף לפייסבוק'))
                .append($('<span class="share-id"></span>').text(' · מזהה ' + data.facebookId));
            if (data.permalink) {
                $box.append($('<a target="_blank" rel="noopener"></a>')
                    .attr('href', data.permalink).text(' צפייה בפוסט'));
            }
            $out.append($box);
        }).fail(function (xhr) {
            $out.append($('<div class="share-error"></div>')
                .text((xhr.responseJSON && xhr.responseJSON.error) || 'השיתוף נכשל'));
        }).always(function () {
            $btn.prop('disabled', false).text('שיתוף לפייסבוק');
        });
    });
});