var express = require("express"); 
var mongojs = require("mongojs"); 
var axios = require("axios"); 
var cheerio = require("cheerio"); 

var app = express();
var databaseUrl = "scraper"; 
var collections = ["scrapedData"]; 

var db = mongojs(databaseUrl, collections); 
db.on("error", function(error){
	console.log("Error: ", error); 
}); 

app.get("/all", function(req, res){
	db.scrapedData.find({}, function(error, found){
		if(error) throw error; 
		else res.json(found); 
	})
})

app.get("/scrape", function(req, res){
	axios.get("https://www.newyorker.com/magazine/fiction").then(function(response){
		var $ = cheerio.load(response.data); 
		$(".River__hed___re6RP").each(function(i, element){
			var title = $(element).text();
			var summary = $(element).parent().siblings(".River__riverItemBody___347sz").children("h5").text();
			var link = 'https:www.newyorker.com' + $(element).parent().attr("href"); 
			if (title){
				db.scrapedData.insert({
					title: title, 
					summary: summary,
					link: link
				},
				function(err, inserted){
					if(err) throw err; 
					else console.log(inserted); 
				});
			}
		});
	});
	res.send("scrape complete"); 
});




app.listen(3000, function() {
  console.log("App running on port 3000!");
});
