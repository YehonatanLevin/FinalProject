$(function () {
    $('.join-btn').on('click', function () {
        var $btn = $(this);
        var groupId = $btn.data('group-id');
        var isMember = String($btn.data('is-member')) === 'true';
        var action = isMember ? 'leave' : 'join';

        $btn.prop('disabled', true);

        $.ajax({
            url: '/groups/' + groupId + '/' + action,
            method: 'POST',
            dataType: 'json'
        })
            .done(function (data) {
                $btn.data('is-member', data.isMember);
                $btn.text(data.isMember ? 'עזיבת הקבוצה' : 'הצטרפות');
                $btn.toggleClass('btn-brand', !data.isMember);
                $btn.toggleClass('btn-outline-brand', data.isMember);
                $('#memberCount').text(data.memberCount);
            })
            .fail(function (xhr) {
                alert(
                    (xhr.responseJSON && xhr.responseJSON.error) ||
                    'הפעולה נכשלה'
                );
            })
            .always(function () {
                $btn.prop('disabled', false);
            });
    });

    $('#deleteGroupForm').on('submit', function (e) {
        if (!confirm('למחוק את הקבוצה? הפעולה אינה הפיכה.')) {
            e.preventDefault();
        }
    });
});
