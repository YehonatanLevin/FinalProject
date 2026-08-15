$(function () {
    function sync() {
        var type = $('input[name="type"]:checked').val();
        $('.type-field').each(function () {
            $(this).prop('hidden', $(this).data('for') !== type);
        });
    }

    $('input[name="type"]').on('change', sync);
    sync();

    $('#postForm').on('submit', function (e) {
        var type = $('input[name="type"]:checked').val();
        var messages = [];

        if (!$('#content').val().trim()) {
            messages.push('לא ניתן לפרסם פוסט ריק');
        }

        if (type === 'image' && !$('#image').val()) {
            messages.push('פוסט מסוג תמונה חייב לכלול תמונה');
        }

        if (type === 'run') {
            var d = Number($('#distanceKm').val());
            if (!d || d <= 0) {
                messages.push('דיווח ריצה חייב לכלול מרחק גדול מ-0');
            }
        }

        var $box = $('#postFormErrors');

        if (messages.length) {
            e.preventDefault();

            if (!$box.length) {
                $box = $('<div id="postFormErrors" class="alert alert-danger"></div>');
                $(this).before($box);
            }

            var $list = $('<ul class="error-list"></ul>');

            messages.forEach(function (m) {
                $list.append($('<li></li>').text(m));
            });

            $box.empty().append($list);
            window.scrollTo(0, 0);
        } else if ($box.length) {
            $box.remove();
        }
    });
});
