$(function () {
    var $form = $('#routeSearchForm');
    var $results = $('#routeResults');

    if (!$form.length) {
        return;
    }

    var LABELS = {
        easy: 'קל',
        medium: 'בינוני',
        hard: 'קשה'
    };

    function escapeHtml(v) {
        return $('<div>').text(v == null ? '' : v).html();
    }

    $form.on('submit', function (e) {
        e.preventDefault();

        $results.addClass('is-loading');

        $.ajax({
            url: '/routes/search',
            method: 'GET',
            data: {
                city: $('#city').val(),
                minKm: $('#minKm').val(),
                maxKm: $('#maxKm').val(),
                difficulty: $('#difficulty').val()
            },
            dataType: 'json'
        })
            .done(function (data) {
                if (!data.routes.length) {
                    $results.html(
                        '<p class="empty-state">לא נמצאו מסלולים התואמים לחיפוש.</p>'
                    );
                    return;
                }

                var html =
                    '<table class="table result-table">' +
                    '<thead><tr>' +
                    '<th>שם</th>' +
                    '<th>עיר</th>' +
                    '<th>מרחק</th>' +
                    '<th>קושי</th>' +
                    '<th>נוצר על ידי</th>' +
                    '</tr></thead><tbody>';

                data.routes.forEach(function (r) {
                    html +=
                        '<tr>' +

                        '<td>' +
                        escapeHtml(r.name) +
                        '</td>' +

                        '<td>' +
                        escapeHtml(r.city) +
                        '</td>' +

                        '<td>' +
                        escapeHtml(r.distanceKm) +
                        ' ק"מ</td>' +

                        '<td><span class="badge-' +
                        escapeHtml(r.difficulty) +
                        '">' +
                        escapeHtml(LABELS[r.difficulty]) +
                        '</span></td>' +

                        '<td>' +
                        escapeHtml(
                            r.createdBy
                                ? r.createdBy.fullName
                                : ''
                        ) +
                        '</td>' +

                        '</tr>';
                });

                $results.html(html + '</tbody></table>');
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
