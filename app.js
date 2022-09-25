const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

const items = [];
const workItems = [];

// basic setup using EJS
app.set('view engine', 'ejs');

//use bodyParser to read from Post request
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//connecting to database
mongoose.connect("mongodb://localhost:27017/todolistDB");

const Item = mongoose.model("Item", {name: {type: String, required: true}});

const item1 = new Item({
    name: "First item"
});

const item2 = new Item({
    name: "Second item"
});



app.get("/",function(req, res){
    let day = date.getDate();  

    //reading data from collection Item
    Item.find({}, function(error, results){
        if(error){
            console.log(error);
        }else{

            if(results.length === 0){
                //inserting default entries if collection is empty
                Item.insertMany([item1,item2], function(error){
                    if( error ){
                        console.log(error);
                    }else{
                        console.log("Successs");
                    }
                });
            }

            // templating with EJS, list.ejs file in views directory
            res.render('list', {listTitle: day, items: results});
        }
    });    
});

//Getting the entered data
app.post("/", function(request, response){
    const itemName = request.body.newItem;

    const item = new Item({
        name: itemName
    });

    item.save();
    response.redirect("/");

    //Acquiring data without database
    // let title = request.body.button;
    // console.log(request.body);
    //Workig with different pages
    // if(title == "Work"){
    //     workItems.push(item);
    //     response.redirect("/work");
    // }else {
    //     items.push(item);
    //     response.redirect("/");
    // }
});

app.post("/delete", function(req,res){
    const checkedID = req.body.checkbox;

    Item.findByIdAndRemove(checkedID, function(error){
        if(error){
            console.log(error)
        }else{
            console.log("Deleted id - " + checkedID);
        }
    });
    
    res.redirect("/");
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