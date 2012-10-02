
/*
 * GET registered cards.
 */

exports.list = function(req, res) {
  cards =
    { "cards":
        [ { "owner"  : "Fabian Bergmark"
          , "number" : "0111352283"
          }
        , { "owner"  : "August Bonds"
          , "number" : "0111311117"
          }
        ]
    }
  res.end(JSON.stringify(cards));
};
