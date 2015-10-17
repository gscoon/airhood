var moment = require('moment');
var pg = require('pg');

var dbClass = function(){

    var connStr = config.connStr;

    this.insertAirRow = function(a){
        var q = "INSERT INTO air_listing (url, title, body) VALUES ($1, $2, $3)";
        var params = [a.url, a.title, a.body];
        pqQuery(q, params, function(err, results){})
    }

    this.deleteAirRow = function(a, cb){
        var q = "DELETE FROM air_listing WHERE url = $1";
        var params = [a.url];
        pqQuery(q, params, cb)
    }

    this.getAirRows = function(callback){
        var q = "SELECT * FROM air_listing";
        pqQuery(q, [], callback);
    }

    this.updateAirROw = function(url, field, value){
        var q = "UPDATE air_listing SET " + field + " = ($1) WHERE url = ($2)";
        pqQuery(q, [value, url], function(err, res){
            if(err) console.log('db error: ', err)
        });
    }

    // craigslist

    this.insertCraigsRow = function(c, cb){
        var ts = moment().format("YYYY-MM-DD HH:mm:ss");
        var q = "INSERT INTO craigs_listing (url, details, timestamp) VALUES ($1, $2, $3)";
        var params = [c.url, c.details, ts];
        pqQuery(q, params, cb);
    }

    this.getCraigsRows = function(callback){
        var q = "SELECT * FROM craigs_listing";
        pqQuery(q, [], callback);
    }

    this.getCraigsURLs = function(url, callback){
        var q = "SELECT url FROM craigs_listing";
        pqQuery(q, [], callback);
    }

    function pqQuery(q, params, callback){
        pg.connect(connStr, function(err, client, done) {
            client.query(q, params, function(err, result){
                done();
                // if this is a select, only return the rows
                if(result && result.command == 'SELECT')
                    result = result.rows;
                callback(err, result);
            });
        });
    }
}

module.exports = new dbClass();
