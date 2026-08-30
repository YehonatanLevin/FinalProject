(function () {
    var COLORS = { easy: '#1b4d3e', medium: '#d9642a', hard: '#8a2020' };
    var LABELS = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };

    var map = L.map('map').setView([32.09, 34.85], 9);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    var layer = L.layerGroup().addTo(map);
    var pending = null;

    function escapeHtml(v) { return $('<div>').text(v == null ? '' : v).html(); }

    function popupHtml(r) {
        return '<strong>' + escapeHtml(r.name) + '</strong><br>' +
            escapeHtml(r.city) + ' · ' + escapeHtml(r.distanceKm) + ' ק"מ<br>' +
            escapeHtml(LABELS[r.difficulty]) + '<br>' +
            '<a href="/routes/' + escapeHtml(r._id) + '">פרטים</a>' +
            (r.isMine ? ' · <a href="/routes/' + escapeHtml(r._id) + '/edit">עריכה</a>' : '');
    }

    function load() {
        $.ajax({ url: '/routes/json', dataType: 'json' })
            .done(function (data) {
                layer.clearLayers();
                data.routes.forEach(function (r) {
                    L.circleMarker([r.lat, r.lng], {
                        radius: 8,
                        color: COLORS[r.difficulty] || '#1b4d3e',
                        fillColor: COLORS[r.difficulty] || '#1b4d3e',
                        fillOpacity: .65,
                        weight: 2
                    }).bindPopup(popupHtml(r)).addTo(layer);
                });
            })
            .fail(function () {
                $('#mapMessage').html('<div class="alert alert-danger">טעינת המסלולים נכשלה.</div>');
            });
    }

    map.on('click', function (e) {
        if (pending) map.removeLayer(pending);
        pending = L.circleMarker(e.latlng, {
            radius: 9, color: '#d9642a', fillColor: '#d9642a', fillOpacity: .4, weight: 2
        }).addTo(map);

        $('#mapLat').val(e.latlng.lat.toFixed(6));
        $('#mapLng').val(e.latlng.lng.toFixed(6));
        $('.map-panel-hint').hide();
        $('#mapRouteForm').prop('hidden', false);
    });

    $('#mapCancel').on('click', function () {
        if (pending) { map.removeLayer(pending); pending = null; }
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
            if (pending) { map.removeLayer(pending); pending = null; }
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

    load();
})();