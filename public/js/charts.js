(function () {
    var BRAND = '#1b4d3e';
    var SIGNAL = '#d9642a';
    var INK_SOFT = '#5b6874';
    var LINE = '#dfe4e2';

    function size(selector) {
        var el = document.querySelector(selector);
        return { width: el.clientWidth, height: 280 };
    }

    /* גרף א' - עמודות: ק"מ לכל קבוצה בחודש הנוכחי */
    function barChart(rows) {
        var margin = { top: 16, right: 16, bottom: 46, left: 52 };
        var box = size('#groupKmChart');
        var width = box.width - margin.left - margin.right;
        var height = box.height - margin.top - margin.bottom;

        d3.select('#groupKmChart').selectAll('*').remove();

        if (!rows.length) {
            d3.select('#groupKmChart').append('p')
                .attr('class', 'empty-state').text('אין דיווחי ריצה בקבוצות החודש.');
            return;
        }

        var svg = d3.select('#groupKmChart').append('svg')
            .attr('width', box.width).attr('height', box.height)
            .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var x = d3.scaleBand().domain(rows.map(function (d) { return d.label; }))
            .range([0, width]).padding(0.25);
        var y = d3.scaleLinear().domain([0, d3.max(rows, function (d) { return d.value; }) * 1.1])
            .range([height, 0]);

        /*
         * שמות הקבוצות בעברית ארוכים מדי לתוויות מסובבות - הן גלשו
         * מתחת לגובה ה-SVG ונחתכו. לכן תוויות אופקיות, מקוצרות לפי
         * רוחב העמודה בפועל, והשם המלא נשאר ב-title לריחוף.
         */
        var maxChars = Math.max(6, Math.floor((x.step() - 8) / 5.6));

        function shorten(text) {
            return text.length > maxChars
                ? text.slice(0, maxChars - 1) + '\u2026'
                : text;
        }

        svg.append('g').attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'middle')
            .style('fill', INK_SOFT)
            .style('font-size', '11px')
            .each(function (d) {
                var node = d3.select(this);
                node.text(shorten(d));
                node.append('title').text(d);
            });

        svg.append('g').call(d3.axisLeft(y).ticks(5))
            .selectAll('text').style('fill', INK_SOFT);

        svg.selectAll('.grid').data(y.ticks(5)).enter().append('line')
            .attr('x1', 0).attr('x2', width)
            .attr('y1', y).attr('y2', y)
            .attr('stroke', LINE);

        svg.selectAll('.bar').data(rows).enter().append('rect')
            .attr('x', function (d) { return x(d.label); })
            .attr('width', x.bandwidth())
            .attr('y', height).attr('height', 0)
            .attr('fill', BRAND).attr('rx', 4)
            .transition().duration(600)
            .attr('y', function (d) { return y(d.value); })
            .attr('height', function (d) { return height - y(d.value); });

        svg.selectAll('.value').data(rows).enter().append('text')
            .attr('x', function (d) { return x(d.label) + x.bandwidth() / 2; })
            .attr('y', function (d) { return y(d.value) - 6; })
            .attr('text-anchor', 'middle')
            .style('font-size', '11px').style('fill', INK_SOFT)
            .text(function (d) { return d.value; });
    }

    /* גרף ב' - קו: ק"מ מצטבר לאורך 8 שבועות */
    function lineChart(rows) {
        var margin = { top: 16, right: 20, bottom: 50, left: 52 };
        var box = size('#weeklyKmChart');
        var width = box.width - margin.left - margin.right;
        var height = box.height - margin.top - margin.bottom;

        d3.select('#weeklyKmChart').selectAll('*').remove();

        if (rows.length < 2) {
            d3.select('#weeklyKmChart').append('p')
                .attr('class', 'empty-state').text('צריך לפחות שני שבועות עם דיווחי ריצה.');
            return;
        }

        var svg = d3.select('#weeklyKmChart').append('svg')
            .attr('width', box.width).attr('height', box.height)
            .append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

        var x = d3.scalePoint().domain(rows.map(function (d) { return d.label; }))
            .range([0, width]).padding(0.5);
        var y = d3.scaleLinear().domain([0, d3.max(rows, function (d) { return d.value; }) * 1.1])
            .range([height, 0]);

        svg.append('g').attr('transform', 'translate(0,' + height + ')')
            .call(d3.axisBottom(x))
            .selectAll('text').style('fill', INK_SOFT).style('font-size', '11px');

        svg.append('g').call(d3.axisLeft(y).ticks(5))
            .selectAll('text').style('fill', INK_SOFT);

        svg.selectAll('.grid').data(y.ticks(5)).enter().append('line')
            .attr('x1', 0).attr('x2', width)
            .attr('y1', y).attr('y2', y)
            .attr('stroke', LINE);

        var area = d3.area()
            .x(function (d) { return x(d.label); })
            .y0(height)
            .y1(function (d) { return y(d.value); })
            .curve(d3.curveMonotoneX);

        var line = d3.line()
            .x(function (d) { return x(d.label); })
            .y(function (d) { return y(d.value); })
            .curve(d3.curveMonotoneX);

        svg.append('path').datum(rows)
            .attr('fill', BRAND).attr('opacity', .10).attr('d', area);

        var path = svg.append('path').datum(rows)
            .attr('fill', 'none').attr('stroke', BRAND).attr('stroke-width', 2.5)
            .attr('d', line);

        var total = path.node().getTotalLength();
        path.attr('stroke-dasharray', total + ' ' + total)
            .attr('stroke-dashoffset', total)
            .transition().duration(800).attr('stroke-dashoffset', 0);

        svg.selectAll('.dot').data(rows).enter().append('circle')
            .attr('cx', function (d) { return x(d.label); })
            .attr('cy', function (d) { return y(d.value); })
            .attr('r', 4).attr('fill', SIGNAL)
            .append('title')
            .text(function (d) { return d.label + ': ' + d.value + ' ק"מ מצטבר'; });
    }

    function difficultyTable(rows) {
        var labels = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        var tbody = d3.select('#difficultyTable tbody');
        tbody.selectAll('*').remove();

        if (!rows.length) {
            tbody.append('tr').append('td').attr('colspan', 3)
                .style('color', INK_SOFT).text('אין נתונים עדיין.');
            return;
        }

        var tr = tbody.selectAll('tr').data(rows).enter().append('tr');
        tr.append('td').html(function (d) {
            return '<span class="badge-' + d.difficulty + '">' + labels[d.difficulty] + '</span>';
        });
        tr.append('td').text(function (d) { return d.runCount; });
        tr.append('td').text(function (d) { return d.avgDistance + ' ק"מ'; });
    }

    /*
     * אגרגציה א' - $group: סך הק"מ בכל קבוצה, מפוצל לפי חודש.
     * המקור: /api/stats/km-by-group-month
     */
    var MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
                  'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];

    function groupMonthTable(rows) {
        var tbody = d3.select('#groupMonthTable tbody');
        tbody.selectAll('*').remove();

        if (!rows.length) {
            tbody.append('tr').append('td').attr('colspan', 5)
                .style('color', INK_SOFT).text('אין דיווחי ריצה בקבוצות עדיין.');
            return;
        }

        var tr = tbody.selectAll('tr').data(rows).enter().append('tr');
        tr.append('td').text(function (d) { return d.groupName; });
        tr.append('td').text(function (d) { return MONTHS[d.month - 1] + ' ' + d.year; });
        tr.append('td').text(function (d) { return d.runCount; });
        tr.append('td').text(function (d) { return d.avgKm + ' ק"מ'; });
        tr.append('td').text(function (d) { return d.totalKm + ' ק"מ'; });
    }

    $(function () {
        $.ajax({ url: '/api/charts/group-km', dataType: 'json' })
            .done(function (data) {
                $('#chartMonth').text(data.month);
                barChart(data.rows);
            })
            .fail(function () {
                $('#groupKmChart').html('<p class="empty-state">טעינת הגרף נכשלה.</p>');
            });

        $.ajax({ url: '/api/charts/weekly-km', dataType: 'json' })
            .done(function (data) { lineChart(data.rows); })
            .fail(function () {
                $('#weeklyKmChart').html('<p class="empty-state">טעינת הגרף נכשלה.</p>');
            });

        $.ajax({ url: '/api/stats/by-difficulty', dataType: 'json' })
            .done(function (data) { difficultyTable(data.rows); })
            .fail(function () {});

        $.ajax({ url: '/api/stats/km-by-group-month', dataType: 'json' })
            .done(function (data) { groupMonthTable(data.rows); })
            .fail(function () {
                $('#groupMonthTable tbody')
                    .html('<tr><td colspan="5">טעינת הנתונים נכשלה.</td></tr>');
            });
    });
})();