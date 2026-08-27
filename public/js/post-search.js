$(function () {
    var $form = $('#postSearchForm');
    var $results = $('#postResults');

    if (!$form.length) {
        return;
    }

    function escapeHtml(v) {
        return $('<div>').text(v == null ? '' : v).html();
    }

    $form.on('submit', function (e) {
        e.preventDefault();

        $results.addClass('is-loading');

        $.ajax({
            url: '/posts/search',
            method: 'GET',
            data: {
                q: $('#q').val(),
                group: $('#group').val(),
                from: $('#from').val(),
                to: $('#to').val()
            },
            dataType: 'json'
        })
            .done(function (data) {
                if (!data.posts.length) {
                    $results.html(
                        '<p class="empty-state">לא נמצאו פוסטים התואמים לחיפוש.</p>'
                    );
                    return;
                }

                var html =
                    '<p class="result-count">' +
                    data.count +
                    ' תוצאות</p>';

                data.posts.forEach(function (p) {
                    html +=
                        '<article class="post-card post-card-slim">' +

                        '<div class="post-head">' +

                        '<img class="post-avatar" src="' +
                        escapeHtml(p.author.profileImage) +
                        '" alt="">' +

                        '<div class="post-head-meta">' +

                        '<span class="post-author">' +
                        escapeHtml(p.author.fullName) +
                        '</span>' +

                        '<p class="post-time">' +
                        new Date(p.createdAt).toLocaleDateString('he-IL') +
                        (p.group
                            ? ' · ' + escapeHtml(p.group.name)
                            : '') +
                        '</p>' +

                        '</div>' +
                        '</div>' +

                        '<p class="post-content">' +
                        escapeHtml(p.content) +
                        '</p>' +

                        '</article>';
                });

                $results.html(html);
            })
            .fail(function () {
                $results.html(
                    '<p class="empty-state">החיפוש נכשל. נסו שוב.</p>'
                );
            })
            .always(function () {
                $results.removeClass('is-loading');
            });
    });
});
