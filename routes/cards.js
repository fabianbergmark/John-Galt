
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
        , { "owner"  : "Marcus Skagenberg"
          , "number" : "011126082x"
          }
        , { "owner"  : "Johan Stenberg"
          , "number" : "0111410555"
          }
        , { "owner"  : "Arvid"
          , "number" : "0111410564"
          }
        ]
    }
  res.end(JSON.stringify(cards));
};
