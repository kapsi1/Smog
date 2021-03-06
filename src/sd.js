var updateIntervalMinutes = 10;
function forEach(array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i);
    }
}

function update(station) {
    var smogTypes = [
            {label: {long: 'Dwutlenek siarki', short: 'SO<sub>2</sub>'}, row: 2, norm: 350},
            {label: {long: 'Dwutlenek azotu', short: 'NO<sub>2</sub>'}, row: 4, norm: 200},
            {label: {long: 'Pył zawieszony', short: 'PM10'}, row: 7, norm: 50},
            {label: {long: 'Pył zawieszony', short: 'PM2.5'}, row: 8, norm: 25}
        ],
        url = 'http://monitoring.krakow.pios.gov.pl/iseo/aktualne_stacja.php?stacja=' + station.number;

    function getData() {
        var xhr = new XMLHttpRequest();
        xhr.onload = function () {
            var page = this.responseXML;
            var table = page.querySelector('table tbody');
            var rows = table.querySelectorAll('tr');
            smogTypes.forEach(function (type, i) {
                var row, tc, panel = document.querySelectorAll('.panel')[i];

                //find data type in table rows
                for (var k = 0; k < rows.length; k++) {
                    tc = rows[k].querySelector('td').textContent;
                    if (tc.indexOf(type.label.long) !== -1 &&
                        tc.indexOf(type.label.short.replace('<sub>', '').replace('</sub>', '')) !== -1) {
                        row = rows[k];
                        break;
                    }
                }
                if (!row && !panel.querySelector('.value').textContent) { //don't set b/d if we have data
                    panel.className = 'panel panel-default';             //but server didn't sent it this time
                    panel.querySelector('.panel-body .value').textContent = 'b/d';
                    panel.querySelector('.time').style.display = 'none';
                }
                if (!row) return;
                var j, columns, lastVal, hour;
                columns = [].splice.call(row.querySelectorAll('td'), 0).map(function (col) {
                    return col.textContent;
                });
                for (j = columns.length - 2; j > 0; j--) {
                    lastVal = columns[j].trim();
                    hour = j - 2;
                    if (lastVal) {
                        break;
                    }
                }
                if (hour < 1 && panel.querySelector('.hour').textContent) {
                    //we have saved measurement but server didn't respond with an updated one
                    hour = parseInt(panel.querySelector('.time .hour').textContent, 10);
                }
                var measureTime = new Date();
                measureTime.setHours(hour);
                var timeDiffH = Math.floor((new Date() - measureTime) / 1000 / 60 / 60);

                if (hour < 1 || timeDiffH > 3) {
                    panel.className = 'panel panel-default';
                    panel.querySelector('.value').textContent = 'b/d';
                    panel.querySelector('.time').style.display = 'none';
                } else {
                    var percentVal = Math.round(lastVal / type.norm * 100);
                    if (percentVal >= 100) {
                        panel.className = 'panel panel-danger';
                    } else if (percentVal >= 75) {
                        panel.className = 'panel panel-warning';
                    } else {
                        panel.className = 'panel panel-success';
                    }
                    panel.querySelector('.value').textContent = percentVal + '%';
                    panel.querySelector('.time .hour').textContent = hour + ':00';
                    panel.querySelector('.time .offset').textContent = timeDiffH;
                    panel.querySelector('.time').style.display = 'inline';
                }
            });
        };
        xhr.open('GET', url);
        xhr.responseType = "document";
        xhr.send();
    }

    opr.speeddial.update({url: url, title: 'Smog: Kraków - ' + station.name});
    getData();
    setInterval(getData, 1000 * 60 * updateIntervalMinutes);
}

chrome.runtime.onMessage.addListener(function (station) {
    forEach(document.querySelectorAll('.value, .hour, .offset'), function (el) {
        el.textContent = '';
    });
    forEach(document.querySelectorAll('.time'), function (el) {
        el.style.display = 'none';
    });
    update(station);
});
var savedStation = JSON.parse(localStorage.getItem('station'));
if (savedStation === null) {
    chrome.tabs.create({'url': '/src/options.html'});
} else {
    update(savedStation);
}