$(function () {
    var $form = $('#userSearchForm');
    var $results = $('#userResults');
    if (!$form.length) { return; }

    function escapeHtml(value) {
        return $('<div>').text(value == null ? '' : value).html();
    }

    function render(users, friendIds) {
        if (!users.length) {
            $results.html('<p class="empty-state">לא נמצאו משתמשים התואמים לחיפוש.</p>');
            return;
        }

        var html = '<div class="row g-3">';
        users.forEach(function (u) {
            var isFriend = friendIds.indexOf(String(u._id)) !== -1;
            html += '<div class="col-md-6 col-lg-4">' +
                '<article class="user-card">' +
                '<img class="user-card-avatar" src="' + escapeHtml(u.profileImage) + '" alt="תמונת פרופיל">' +
                '<div class="user-card-body">' +
                '<a class="user-card-name" href="/users/' + escapeHtml(u._id) + '">' + escapeHtml(u.fullName) + '</a>' +
                '<p class="user-card-meta">@' + escapeHtml(u.username) + (u.city ? ' · ' + escapeHtml(u.city) : '') + '</p>' +
                '</div>' +
                '<button class="btn btn-sm friend-toggle ' + (isFriend ? 'btn-outline-brand' : 'btn-brand') + '" ' +
                'data-user-id="' + escapeHtml(u._id) + '" data-is-friend="' + isFriend + '">' +
                (isFriend ? 'הסרה' : 'הוספה') +
                '</button></article></div>';
        });
        html += '</div>';
        $results.html(html);
    }

    $form.on('submit', function (e) {
        e.preventDefault();
        $results.addClass('is-loading');

        $.ajax({
            url: '/users',
            method: 'GET',
            data: { q: $('#q').val(), city: $('#city').val() },
            dataType: 'json'
        }).done(function (data) {
            render(data.users, data.friendIds);
        }).fail(function () {
            $results.html('<p class="empty-state">החיפוש נכשל. נסו שוב.</p>');
        }).always(function () {
            $results.removeClass('is-loading');
        });
    });
});