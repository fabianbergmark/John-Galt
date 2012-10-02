var $ = require('jquery');

exports.fetch = function(url, cps) {
  $(function() {
    $.get( url
       , function(data) {
           cps(data);
         });
  });
};

