$(function () {

    var $form = $('#memberSearchForm');
    var $results = $('#memberResults');

    if (!$form.length) {
        return;
    }

    function escapeHtml(v) {
        return $('<div>').text(v == null ? '' : v).html();
    }

    function dateText(value) {
        return value ? new Date(value).toLocaleDateString('he-IL') : '-';
    }

    function render(members) {

        if (!members.length) {
            $results.html('<p class="empty-state">לא נמצאו חברים התואמים לחיפוש.</p>');
            return;
        }

        var html = '<p class="result-count">' + members.length + ' חברים</p>' +
            '<table class="table result-table"><thead><tr>' +
            '<th>חבר</th><th>עיר</th><th>יעד חודשי</th>' +
            '<th>ריצות בקבוצה</th><th>סך ק"מ</th><th>ריצה אחרונה</th>' +
            '</tr></thead><tbody>';

        members.forEach(function (m) {
            html += '<tr>' +
                '<td><a href="/users/' + escapeHtml(m._id) + '">' +
                escapeHtml(m.fullName) + '</a>' +
                (m.isManager ? ' <span class="member-tag">מנהל</span>' : '') +
                '</td>' +
                '<td>' + escapeHtml(m.city || '-') + '</td>' +
                '<td>' + escapeHtml(m.monthlyGoalKm) + '</td>' +
                '<td>' + escapeHtml(m.runs) + '</td>' +
                '<td>' + escapeHtml(m.totalKm) + '</td>' +
                '<td>' + escapeHtml(dateText(m.lastRun)) + '</td>' +
                '</tr>';
        });

        $results.html(html + '</tbody></table>');
    }

    function search() {

        $results.addClass('is-loading');

        $.ajax({
            url: '/groups/' + $form.data('group-id') + '/members/search',
            method: 'GET',
            data: {
                q: $('#mq').val(),
                city: $('#mcity').val(),
                minGoal: $('#mgoal').val(),
                sort: $('#msort').val()
            },
            dataType: 'json'
        })
            .done(function (data) {
                render(data.members);
            })
            .fail(function (xhr) {
                var msg = (xhr.responseJSON && xhr.responseJSON.error) ||
                          'החיפוש נכשל. נסו שוב.';
                $results.html('<p class="empty-state"></p>');
                $results.find('.empty-state').text(msg);
            })
            .always(function () {
                $results.removeClass('is-loading');
            });
    }

    $form.on('submit', function (e) {
        e.preventDefault();
        search();
    });

    /* טעינה ראשונה - כל חברי הקבוצה */
    search();

});