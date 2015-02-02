var mainContainer = document.querySelector('#container');

function update(station) {
    var smogTypes = [
            {label: {long: 'Dwutlenek siarki', short: 'SO<sub>2</sub>'}, row: 2, norm: 350},
            {label: {long: 'Dwutlenek azotu', short: 'NO<sub>2</sub>'}, row: 4, norm: 200},
            {label: {long: 'Pył zawieszony', short: 'PM10'}, row: 7, norm: 50},
            {label: {long: 'Pył zawieszony', short: 'PM2.5'}, row: 8, norm: 25}
        ],
        url = 'http://monitoring.krakow.pios.gov.pl/iseo/aktualne_stacja.php?stacja=' + station.number;

    smogTypes.forEach(function () {
        var container = document.createElement('div'),
            heading = document.createElement('div'),
            panelBody = document.createElement('div'),
            value = document.createElement('span');
        container.className = 'panel';
        heading.className = 'panel-heading';
        panelBody.className = 'panel-body';
        value.className = 'value';
        panelBody.appendChild(value);
        container.appendChild(heading);
        container.appendChild(panelBody);
        mainContainer.appendChild(container);
    });

    function getData() {
        var req = new XMLHttpRequest();
        req.onload = function () {
            var page = document.createElement('html');
            page.innerHTML = req.responseText;
            var table = page.querySelector('table tbody');
            var rows = table.querySelectorAll('tr');
            smogTypes.forEach(function (st, i) {
                var row = rows[st.row];
                var j, columns, lastVal, time;
                columns = [].splice.call(row.querySelectorAll('td'), 0).map(function (col) {
                    return col.textContent;
                });
                for (j = columns.length - 2; j > 0; j--) {
                    lastVal = columns[j].trim();
                    time = j - 2;
                    if (lastVal) break;
                }
                var percentVal = Math.round(lastVal / st.norm * 100);
                var panel = document.querySelectorAll('.panel')[i];
                if (percentVal >= 100) {
                    panel.className = 'panel panel-danger';
                } else if (percentVal >= 75) {
                    panel.className = 'panel panel-warning';
                } else {
                    panel.className = 'panel panel-success';
                }

                panel.querySelector('.panel-heading').innerHTML =
                    '<span class="label-long">' + st.label.long + ' (</span>'+
                    '<span class="label-short">' + st.label.short + '</span>'+
                    '<span class="label-long">)';
                panel.querySelector('.panel-body .value').textContent = percentVal + '%';
            });
        };
        req.open('GET', url);
        req.send();
    }

    opr.speeddial.update({url: url, title: 'Smog: Kraków - ' + station.name});
    getData();
    setInterval(getData, 1000 * 60 * 5); //5m
}

chrome.runtime.onMessage.addListener(function (station) {
    mainContainer.innerHTML = '';
    update(station);
});
var savedStation = JSON.parse(localStorage.getItem('station'));
if (savedStation === null) {
    chrome.tabs.create({'url': '/src/options.html'});
} else {
    update(savedStation);
}