var $ = require('jquery');

exports.fetch = function(cps) {
  $(function() {
    $.get( "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp"
       , function(data) {
           cps(data);
         });
  });
};

