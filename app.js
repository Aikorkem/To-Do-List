const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
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
mongoose.connect("mongodb+srv://AbylDouble:AbylDouble@cluster0.a55fsdd.mongodb.net/todolistDB");

const Item = mongoose.model("Item", {name: {type: String, required: true}});
const List = mongoose.model("List", {name: String, items: [{name: String}]});

const item1 = new Item({
    name: "First item"
});

const item2 = new Item({
    name: "Second item"
});

const defaultItems = [item1, item2];

app.get("/",function(req, res){
    let day = date.getDate();  

    //reading data from collection Item
    Item.find({}, function(error, results){
        if(error){
            console.log(error);
        }else{

            if(results.length === 0){
                //inserting default entries if collection is empty
                Item.insertMany(defaultItems, function(error){
                    if( error ){
                        console.log(error);
                    }else{
                        console.log("Success");
                    }
                });
            }

            // templating with EJS, list.ejs file in views directory
            res.render('list', {listTitle: "Today", items: results});
        }
    });    
});

app.get("/:title", function(req,res){

    const title = _.capitalize(req.params.title);

    List.findOne({name: title}, function(error, results){
        if(!error){
            if(!results){
                const list = new List({
                    name: title,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + title);
            }else{
                res.render("list", {listTitle: results.name, items: results.items});
            }

            
        }else{
            console.log(error);
        }

    });
    
    
});

//Getting the entered data
app.post("/", function(request, response){
    const itemName = request.body.newItem;
    const listTitle = request.body.button;
    let day = date.getDate(); 
    const item = new Item({
        name: itemName
    });

    if(listTitle === "Today"){
        item.save();
        response.redirect("/");
    }else{
        List.findOne({name: listTitle}, function(error,results){
            if(error){
                console.log(error);
            }else{
                results.items.push(item);
                results.save();
                response.redirect("/" + listTitle);
            }
        });
    }
    

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
    const listTitle = req.body.listName;

    if(listTitle === "Today"){
        Item.findByIdAndRemove(checkedID, function(error){
            if(error){
                console.log(error)
            }else{
                console.log("Deleted id - " + checkedID);
            }
        });
        
        res.redirect("/");
    }else{
        List.findOneAndUpdate(
            {name: listTitle},
            {$pull: {items: {_id: checkedID}}},
            function(error){
                if(error) {
                    console.log(error);
                }else{
                    console.log("Deleted id - " + checkedID);
                }
            }
        );

        res.redirect("/" + listTitle);
    }
    
});

app.get("/about", function(req,res){
    res.render("about");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});