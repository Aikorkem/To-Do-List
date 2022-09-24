const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
const items = [];
const workItems = [];

// basic setup using EJS
app.set('view engine', 'ejs');

//use bodyParser to read from Post request
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.get("/",function(req, res){
    let day = date.getDate();  
    // templating with EJS, list.ejs file in views directory
    res.render('list', {listTitle: day, items: items});
});

//Workig with different pages
app.post("/", function(request, response){
    let item = request.body.newItem;
    let title = request.body.button;
    console.log(request.body);
    if(title == "Work"){
        workItems.push(item);
        response.redirect("/work");
    }else {
        items.push(item);
        response.redirect("/");
    }
});

app.get("/work", function(req,res){
    res.render("list", {listTitle: "Work List", items: workItems});
});

app.get("/about", function(req,res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});