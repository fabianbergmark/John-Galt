$(function() {
  
  function book(room, date, period) {
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "bokid"   : room
                    , "bokdag"  : date
                    , "period"  : period
                    , "typ"     : "Grp"
                    , "loan"    : "0111311117"
                    , "anv"     : "John Galt"
                    }
      , "success" : function(data) {
          console.log(data);
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }
  
  function unbook(room, date, period) {
    $.ajax(
      { "type"    : "POST"
      , "url"     : "http://www.kth.se/kthb/tjanster/grupprum/gruppschema/bokaupd_po.asp"
      , "data"    : { "bibid"   : "KTHB"
                    , "bokid"   : room
                    , "bokdag"  : date
                    , "period"  : period
                    , "typ"     : "Grp"
                    , "loan"    : "0111311117"
                    , "anv"     : "John Galt"
                    }
      , "success" : function(data) {
          console.log(data);
        }
      , "error": function(request,error,code) {
          console.log(error);
        }
      });
  }

  $("#check").click(function(event) {
    $.ajax(
      { "type" : "GET"
      , "crossDomain": true
      , "url"  : "http://www.kth.se/kthb/2.33341/gruppschema/bokning_po.asp"
      , "success": function(data) {
          console.log(data);
        }
      , "error": function(request, error, code) {
          console.log(error);
        }
      });
    $("#room").children().each(function() {
      var d = new Date();
      var hours  = d.getHours();
      var period = (hours - 8) / 2 + 1;
      var date = d.toISOString().substr(0,10);
      book($(this).attr("value"),"2012-10-02",3);
    }); 
  });
});
