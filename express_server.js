var express = require("express");
var app = express();
var cookieParser = require('cookie-parser')
var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

function generateRandomNumberString() {
  return Math.random().toString(36).substring(2,8);
}

function canRegister(email) {
  let mail = true;
  for (let user in users) {
    if (users[user].email === email) {
      return false;
    }
  }
  return true;
}

function addUser(email,password) {
  let newUserId = "";
  do {
    newUserId = generateRandomNumberString();
  } while(users[newUserId])
  // key is now unique and add the pair
  users[newUserId] = {
    id: newUserId,
    email: email,
    password: password
  };
  return newUserId;

}

function checkUser(email, password) {
  for(let user in users) {
    if(users[user].email === email  && users[user].password === password) {
      return user;
    }
  }
  return "";
  //iterate the for loop


    // 1st: user = userRandomID
    //  users[user] = {}
    //  users[user].email

}

var urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: 'userRandomID'
            },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: 'user2RandomID'
            }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

app.get("/urls", (req,res) => {
  let user_id = req.cookies.user_id
  let email = users[user_id].email;
  let templateVars = {urlDatabase: urlDatabase, user_id:req.cookies.user_id, email : email};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let user_id = req.cookies.user_id
  let email = users[user_id].email;
  let templateVars = { shortURL : req.params.id, urlDatabase: urlDatabase, user_id:req.cookies.user_id, email :email };
  res.render("urls_show", templateVars);
  // console.log(generateRandomNumberString());
});

app.get("/urls/new", (req, res) => {
  let user_id = req.cookies.user_id
  let email = users[user_id].email;
   let templateVars = {urlDatabase: urlDatabase, user_id:req.cookies.user_id, email: email};
  res.render("urls_new", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>HELLO<b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  console.log(req.params.shortURL);
  var longURL = urlDatabase[req.params.shortURL];
  console.log(longURL);
  res.redirect(longURL);
});

//REGISTER
app.get("/register", (req, res) => {
  //let user_id = req.cookies.user_id
//  let email = "";
//    res.render("urls_register", {user_id:req.cookies.user_id, email : email});
    res.render("urls_register", {});
  });

app.get("/login", (req, res) => {
//  let user_id = req.cookies.user_id
  let email = "";//users[user_id].email;
  let templateVars = {
    email: email,
    user_id: false,
    username: ""
  }
  res.render("urls_login", templateVars)
});



//deleting url

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

// updating url

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.newUrl;
  urlDatabase[id] = newUrl;
  //let shortURL ;
  //urlDatabase[shortURL] = newUrl
  console.log(urlDatabase)
  res.redirect("/urls/<%= id %>")
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  //res.cookie('user_id', userId)
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);  // Bad Request
  } else {
    let userId = checkUser(email, pass);
    if(userId) {
      res.cookie('user_id', userId)
      res.redirect("/urls")
    } else {
      res.sendStatus(400);
    }
  }
});

app.post("/register", (req, res) => {
  //let userId = addUser(req.body.email, req.body.password);
  //res.cookie('user_id', userId)
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else {
    if (canRegister()) {
      let userId = addUser(req.body.email, req.body.password);
       res.cookie('user_id', userId)
    } else {
      res.sendStatus(400);
    }
  }
  console.log(users);

  //req.session.user_id = userId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});