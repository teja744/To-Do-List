require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

app.use(express.static('public'));

app.set("view engine",'ejs');


// /?retryWrites=true&w=majority
mongoose.connect('mongodb+srv://' +  process.env.IDOFUSER + process.env.PASSWORD + process.env.LASTDATA + '/todolistDataBase',{ useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
    name:String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item(
    {name:"Welocme to your todolist!"
    }
);
const item2 = new Item(
    {name:"Hit the + button to add new items"
    }
);
const item3 = new Item(
    {name:"<---Hit this  to delete"
    }
);
//create array for these default items documents above
const defaultItems = [item1,item2,item3];
//Item.insertMany(defaultItems);
//create new listSchema
const listSchema = {
    name:String,
    items:[itemsSchema]//for resuing the items we keptin items in listSchema
};
//now create model for listSchema
const List = mongoose.model("List",listSchema);

app.use(bodyParser.urlencoded({extended:true}));

//var items  = ["Buy Food","Cook Food","Eat Food"];

app.get('/',async function(req,res){
    res.render("list",{listTitle:"Today",y: await Item.find()}); 
});
app.post("/",function(req,res){
    const itemName = req.body.use;
    const listName = req.body.list;
    const item = new Item(
        {
            name: itemName
    });
    if (listName==="Today"){
        item.save();
        // items.push(inp);
        res.redirect("/");
    }else{
        List.findOne({name:listName}).then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    };
    // shortcut for adding single element is save method  
});

app.post("/delete",async function(req,res){
    const checkedItemId = JSON.stringify(req.body.checkbox);
    const listName  = req.body.listName;
    //console.log(listName);

    if( listName[0] === "Today"){
        Item.deleteMany({ _id: { $eq: req.body.checkbox } }).then(function(){
            console.log("Data deleted"); // Success
            res.redirect("/");
        }).catch(function(error){
            console.log(error); // Failure
        });
        
    }else{
        List.findOneAndUpdate({name: listName[0]}, {$pull: {items: {_id: req.body.checkbox }}}).then(function(){
        res.redirect("/" + listName[0])});
        console.log("else");
    };
    
});

//for user when he try to extend the website with extra data like localhost:3000/home here home is extra item
app.get("/:customListName",function(req,res){
    const customListName = req.params.customListName;
    
    List.findOne({name:customListName}).then(function(foundList){
        if(!foundList){ //if name is not matching then it will enter into if condition and create a new list collection in ListModel
            // console.log("doesn't exist");
            const list = new List({
                name:customListName,//we will get from user webpage extention
                items:defaultItems //by default items aray
            }); 
            list.save();
            res.redirect("/" + customListName);
        }else{
            // console.log("exists");
            //console.log(foundList.items);
            res.render("list",{listTitle:foundList.name,y:foundList.items});
        }
    });
    
    //list.save();
    // console.log(req.params.customListName); to get what user typed in url extention
});
app.get("/about", function(req, res){
    res.render("about");
  });
  let port = process.prependOnceListener.PORT;
  if(port== null || port == ""){
    port = 4040;
  }
//   app.listen(port);
app.listen(4040,function(){
    console.log("Punakalu Loading...")

});


