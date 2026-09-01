$(function () {

    function escapeHtml(value) {
        return $('<div>')
            .text(value == null ? '' : value)
            .html();
    }


    /* לייקים */

    $('.post-card').on('click', '.like-btn', function () {

        var $btn = $(this);
        var postId = $btn.closest('.post-card').data('post-id');

        $btn.prop('disabled', true);

        $.ajax({
            url: '/posts/' + postId + '/like',
            method: 'POST',
            dataType: 'json'
        })
            .done(function (data) {
                $btn.find('.like-count').text(data.likeCount);
                $btn.toggleClass('is-liked', data.liked);
                $btn.data('liked', data.liked);
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


    /* פתיחה וסגירה של אזור התגובות */

    $('.post-card').on('click', '.comment-toggle', function () {

        var $area = $(this)
            .closest('.post-card')
            .find('.comment-area');

        $area.prop('hidden', !$area.prop('hidden'));

    });


    /* שליחת תגובה */

    $('.post-card').on('submit', '.comment-form', function (e) {

        e.preventDefault();

        var $form = $(this);
        var $card = $form.closest('.post-card');
        var $input = $form.find('.comment-input');

        var text = $input.val().trim();

        if (!text) {
            return;
        }

        $form.find('button').prop('disabled', true);

        $.ajax({
            url: '/posts/' + $card.data('post-id') + '/comments',
            method: 'POST',
            data: {
                text: text
            },
            dataType: 'json'
        })
            .done(function (data) {

                $card.find('.comment-list').append(
                    '<li class="comment" data-comment-id="' + data.comment._id + '">' +
                    '<span class="comment-author">' +
                    escapeHtml(data.comment.author.fullName) +
                    '</span>' +
                    '<span class="comment-text">' +
                    escapeHtml(data.comment.text) +
                    '</span>' +
                    '<span class="comment-time">כרגע</span>' +
                    '<button class="comment-delete" type="button" aria-label="מחיקת תגובה">&times;</button>' +
                    '</li>'
                );

                $card
                    .find('.comment-count')
                    .text(data.commentCount);

                $input.val('');

            })
            .fail(function (xhr) {

                alert(
                    (xhr.responseJSON && xhr.responseJSON.error) ||
                    'שליחת התגובה נכשלה'
                );

            })
            .always(function () {

                $form
                    .find('button')
                    .prop('disabled', false);

            });

    });


    /* מחיקת תגובה - מפעיל את הנתיב שכבר קיים ב-controllers/interaction.js.
       השרת מוודא שרק כותב התגובה או בעל הפוסט רשאים למחוק. */

    $('.post-card').on('click', '.comment-delete', function () {

        if (!confirm('למחוק את התגובה?')) {
            return;
        }

        var $item = $(this).closest('.comment');
        var $card = $(this).closest('.post-card');

        $.ajax({
            url: '/posts/' + $card.data('post-id') +
                 '/comments/' + $item.data('comment-id') + '/delete',
            method: 'POST',
            dataType: 'json'
        })
            .done(function (data) {
                $item.remove();
                $card.find('.comment-count').text(data.commentCount);
            })
            .fail(function (xhr) {
                alert(
                    (xhr.responseJSON && xhr.responseJSON.error) ||
                    'מחיקת התגובה נכשלה'
                );
            });

    });


    /* מחיקת פוסט */

    $('.post-card').on('click', '.post-delete', function () {

        if (!confirm('למחוק את הפוסט?')) {
            return;
        }

        var $card = $(this).closest('.post-card');

        $.ajax({
            url: '/posts/' + $card.data('post-id') + '/delete',
            method: 'POST',
            dataType: 'json'
        })
            .done(function () {
                $card.remove();
            })
            .fail(function (xhr) {

                alert(
                    (xhr.responseJSON && xhr.responseJSON.error) ||
                    'המחיקה נכשלה'
                );

            });

    });

});
