/*global chrome*/
(function () {
    'use strict';

    function set(id, value) {
        localStorage.setItem.call(localStorage, id, JSON.stringify(value));
        chrome.runtime.sendMessage(null, value);
    }

    function get(id) {
        return JSON.parse(localStorage.getItem.call(localStorage, id));
    }

    function eachElement(arg1, fn) {
        if (typeof arg1 === 'string') //CSS selector
            Array.prototype.forEach.call(document.querySelectorAll(arg1), fn);
        else Array.prototype.forEach.call(arg1, fn); //nodeList
    }

    var savedStation = get('station');
    eachElement('button', function(button){
        if(savedStation && +button.value === +savedStation.number) {
            button.classList.add('active');
        }
        button.addEventListener('click', function(){
            eachElement('button', function(button){
                button.classList.remove('active');
            });
            button.classList.add('active');
            set('station', {
                number: button.value,
                name: button.textContent
            });
        });
    });
})();