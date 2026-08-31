(function () {
    var COLORS = { easy: '#1b4d3e', medium: '#d9642a', hard: '#8a2020' };
    var LABELS = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };

    var map = null;
    var info = null;
    var markers = [];
    var pending = null;

    function escapeHtml(v) { return $('<div>').text(v == null ? '' : v).html(); }

    function popupHtml(r) {
        return '<strong>' + escapeHtml(r.name) + '</strong><br>' +
            escapeHtml(r.city) + ' · ' + escapeHtml(r.distanceKm) + ' ק"מ<br>' +
            escapeHtml(LABELS[r.difficulty]) + '<br>' +
            '<a href="/routes/' + escapeHtml(r._id) + '">פרטים</a>' +
            (r.isMine ? ' · <a href="/routes/' + escapeHtml(r._id) + '/edit">עריכה</a>' : '');
    }

    /* עיגול צבעוני לפי רמת הקושי, במקום סיכה רגילה */
    function circle(color, scale, opacity) {
        return {
            path: google.maps.SymbolPath.CIRCLE,
            scale: scale,
            fillColor: color,
            fillOpacity: opacity,
            strokeColor: color,
            strokeWeight: 2
        };
    }

    function clearMarkers() {
        markers.forEach(function (m) { m.setMap(null); });
        markers = [];
    }

    function load() {
        $.ajax({ url: '/routes/json', dataType: 'json' })
            .done(function (data) {
                clearMarkers();
                data.routes.forEach(function (r) {
                    var color = COLORS[r.difficulty] || '#1b4d3e';

                    var marker = new google.maps.Marker({
                        position: { lat: r.lat, lng: r.lng },
                        map: map,
                        title: r.name,
                        icon: circle(color, 8, 0.65)
                    });

                    marker.addListener('click', function () {
                        info.setContent(popupHtml(r));
                        info.open(map, marker);
                    });

                    markers.push(marker);
                });
            })
            .fail(function () {
                $('#mapMessage').html('<div class="alert alert-danger">טעינת המסלולים נכשלה.</div>');
            });
    }

    /* נקראת על ידי הלואדר של Google Maps דרך callback=initMap */
    window.initMap = function () {
        map = new google.maps.Map(document.getElementById('map'), {
            center: { lat: 32.09, lng: 34.85 },
            zoom: 9,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
        });

        info = new google.maps.InfoWindow();

        map.addListener('click', function (e) {
            if (pending) { pending.setMap(null); }

            pending = new google.maps.Marker({
                position: e.latLng,
                map: map,
                icon: circle('#d9642a', 9, 0.4)
            });

            $('#mapLat').val(e.latLng.lat().toFixed(6));
            $('#mapLng').val(e.latLng.lng().toFixed(6));
            $('.map-panel-hint').hide();
            $('#mapRouteForm').prop('hidden', false);
        });

        load();
    };

    $('#mapCancel').on('click', function () {
        if (pending) { pending.setMap(null); pending = null; }
        $('#mapRouteForm').prop('hidden', true)[0].reset();
        $('.map-panel-hint').show();
    });

    $('#mapRouteForm').on('submit', function (e) {
        e.preventDefault();
        var $btn = $(this).find('button[type="submit"]').prop('disabled', true);

        $.ajax({
            url: '/routes',
            method: 'POST',
            data: $(this).serialize(),
            dataType: 'json'
        }).done(function () {
            if (pending) { pending.setMap(null); pending = null; }
            $('#mapRouteForm').prop('hidden', true)[0].reset();
            $('.map-panel-hint').show();
            $('#mapMessage').html('<div class="alert alert-success">המסלול נוסף.</div>');
            setTimeout(function () { $('#mapMessage').empty(); }, 2500);
            load();
        }).fail(function (xhr) {
            var msg = (xhr.responseJSON && xhr.responseJSON.error) || 'שמירת המסלול נכשלה';
            $('#mapMessage').html('<div class="alert alert-danger"></div>');
            $('#mapMessage .alert').text(msg);
        }).always(function () {
            $btn.prop('disabled', false);
        });
    });
})();
