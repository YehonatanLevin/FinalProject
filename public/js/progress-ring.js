(function () {
    var canvas = document.getElementById('progressRing');
    if (!canvas || !canvas.getContext) { return; }

    var ctx = canvas.getContext('2d');
    var cx = canvas.width / 2;
    var cy = canvas.height / 2;
    var radius = 88;
    var thickness = 16;

    function ring(fraction) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.lineWidth = thickness;
        ctx.strokeStyle = '#dfe4e2';
        ctx.stroke();

        if (fraction > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
            ctx.lineWidth = thickness;
            ctx.lineCap = 'round';
            ctx.strokeStyle = fraction >= 1 ? '#1b4d3e' : '#d9642a';
            ctx.stroke();
        }
    }

    function label(done, goal, percent) {
        ctx.fillStyle = '#16202a';
        ctx.textAlign = 'center';
        ctx.font = '700 34px Assistant, sans-serif';
        ctx.fillText(percent + '%', cx, cy + 4);
        ctx.fillStyle = '#5b6874';
        ctx.font = '600 14px Assistant, sans-serif';
        ctx.fillText(done + ' / ' + goal + ' ק"מ', cx, cy + 28);
    }

    $.ajax({ url: '/api/progress/monthly', dataType: 'json' })
        .done(function (data) {
            var target = data.goal > 0 ? Math.min(1, data.done / data.goal) : 0;
            var current = 0;
            var step = target / 40;

            (function animate() {
                current = Math.min(target, current + step);
                ring(current);
                label(data.done, data.goal, Math.round(current * 100));
                if (current < target) { requestAnimationFrame(animate); }
            })();

            $('#progressText').text(data.runs + ' ריצות החודש');
        })
        .fail(function () {
            ring(0);
            $('#progressText').text('לא ניתן לטעון את הנתונים');
        });
})();