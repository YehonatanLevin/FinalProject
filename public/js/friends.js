$(function () {
    $('.friend-toggle').on('click', function () {
        var $btn = $(this);
        var userId = $btn.data('user-id');
        var isFriend = String($btn.data('is-friend')) === 'true';
        var action = isFriend ? 'remove' : 'add';

        $btn.prop('disabled', true);

        $.ajax({
            url: '/friends/' + userId + '/' + action,
            method: 'POST',
            dataType: 'json'
        }).done(function (data) {
            $btn.data('is-friend', data.isFriend);
            $btn.text(data.isFriend ? 'הסרה' : 'הוספה');
            $btn.toggleClass('btn-brand', !data.isFriend);
            $btn.toggleClass('btn-outline-brand', data.isFriend);

            var $count = $('#friendCount');
            if ($count.length) {
                $count.text(parseInt($count.text(), 10) + (data.isFriend ? 1 : -1));
            }
        }).fail(function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'הפעולה נכשלה, נסו שוב';
            alert(msg);
        }).always(function () {
            $btn.prop('disabled', false);
        });
    });
});