$(function () {
    var $card = $('#weatherCard');
    var routeId = $('.route-detail').data('route-id');
    if (!$card.length || !routeId) { return; }

    $.ajax({ url: '/api/weather/' + routeId, dataType: 'json' })
        .done(function (data) {
            $card.find('.weather-loading').remove();
            $card.append(
                $('<div class="weather-body"></div>')
                    .append($('<span class="weather-temp"></span>').text(Math.round(data.temperature) + '°'))
                    .append($('<span class="weather-desc"></span>').text(data.description))
                    .append($('<p class="weather-meta"></p>').text(
                        'לחות ' + data.humidity + '% · רוח ' + data.windSpeed + ' קמ"ש'))
            );
        })
        .fail(function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'לא ניתן לטעון מזג אוויר';
            $card.find('.weather-loading').text(msg);
        });
});