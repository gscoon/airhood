config = require('./config/config.json');

var cheerio = require("cheerio");
var needle = require('needle');
var moment = require('moment');
var async = require('async');
var phantom = require('phantom');
var fs = require('fs');

var plotly = require('plotly')('gscoon', config.plotlyKey);
var GoogleMapsAPI = require('googlemaps');

var publicConfig = {key: config.googleKey};
var gmAPI = new GoogleMapsAPI(publicConfig);
var magazine = {long: config.home.long, lat: config.home.lat};

var db = require('./inc/db.js');

(function(){
    var base = 'https://boston.craigslist.org';
    var frontPageURL = 'https://boston.craigslist.org/search/gbs/nfa?max_price=2000&query=private+entrance&hasPic=1&min_price=1000';
    needle.get(frontPageURL, handleFrontPage);

    function handleFrontPage(err, res){
        var b = res.body;
        var $ = cheerio.load(b);
        var As = $('.row a.i');
        var waitIndex = 0;
        // loop through each anchor
        As.each(function(i, v){
            if(i > 1) return true;
            setTimeout(function(){
                var url = $(v).attr('href');
                if(url.indexOf(':') == -1)  url = base + url;
                console.log(url, moment().format("YYYY-MM-DD HH:mm:ss"));
                // get scrape anchor page
                needle.get(url, function(err, res){
                    var $ = cheerio.load(res.body);
                    var c = {url:url};

                    var d = {
                        latitude: parseFloat($('#map').attr('data-latitude')),
                        longitude: parseFloat($('#map').attr('data-longitude')),
                        title: $('title').text(),
                        price: $('.price').text(),
                        inside: $('.attrgroup').eq(0).find('span').eq(0).text(),
                    }

                    d.distance = calcDistance(d.latitude, d.longitude);
                    c.details = d;

                    db.insertCraigsRow(c, function(err, res){
                        // if(err) console.log(err);
                    });
                });
            }, waitIndex * 1000); // wait 2 seconds between

            waitIndex++;
        });

    }


    function calcDistance(lat, long){
        var A = magazine.long - long;
        var B = magazine.lat - lat;
        var C = Math.pow(Math.pow(A,2) + Math.pow(B,2), .5); //pythag
        return C * 69; // miles
    }

})()
