var express = require("express"); 
var mongojs = require("mongojs"); 
var axios = require("axios"); 
var cheerio = require("cheerio"); 

var app = express();
app.set('view engine', 'ejs'); 
var databaseUrl = "scraper"; 
var collections = ["scrapedData"]; 

var db = mongojs(databaseUrl, collections); 
db.on("error", function(error){
	console.log("Error: ", error); 
}); 


app.get('/', function(req, res){
	res.render('pages/index', {
		stories: []
	}); 
})

app.get("/all", function(req, res){
	db.scrapedData.find({}, function(error, found){
		if(error) throw error; 
		else res.render('pages/index', {
			stories: found
		})
	})
})

app.post("/scrape", function(req, res){
	axios.get("https://www.newyorker.com/magazine/fiction").then(function(response){
		var $ = cheerio.load(response.data); 
		$(".River__hed___re6RP").each(function(i, element){
			var t = $(element).text();
			var summary = $(element).parent().siblings(".River__riverItemBody___347sz").children("h5").text();
			var link = 'https:www.newyorker.com' + $(element).parent().attr("href"); 

			if (t && summary && link){
				db.scrapedData.insert({
					title: t, 
					summary: summary,
					link: link
				},
				function(err, inserted){
					if(err) throw err; 
					else console.log(inserted); 
				});
				//console.log('made it');
			}
		});
	});
	res.redirect('/all'); 
});




app.listen(3000, function() {
  console.log("App running on port 3000!");
});
