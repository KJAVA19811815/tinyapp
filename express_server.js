//IMPORT THE MODULES

var express = require("express");
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
var app = express();

//ENVIRONMENT SETUP IS HERE

var PORT = process.env.PORT || 8080;
app.set("view engine", "ejs")
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["This-is-my-secrete-key"],
  maxAge: 60 * 60 * 1000 // 1 hour
}));

//ALL THE FUNCTIONS USED IN THE PROGRAM

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
    password: bcrypt.hashSync(password, 10)
  };
  return newUserId;

}

function checkUser(email, password) {
  for(let user in users) {
    if(users[user].email === email  && bcrypt.compareSync(password, users[user].password)){
      return user;           // bcrypt.compareSync(password, users[user].password);
    }
  }
  return "";
}

// function that checks userID
function urlsForUser (id) {
  var arr = {};
  if(id) {
    for(var i in urlDatabase) {
      if(id === urlDatabase[i].userID)
      arr[i] = urlDatabase[i].url;
    }
    return arr;
  }
}

//THE DATABASES USED IN THE PROGRAM
//GLOBAL VARIABLE

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
    email: "a@a.a",
    password: "a"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



app.get("/", (req, res) => {
  res.end("HELLO I HATE U");
})

// function that checks userID

//ALL THE GET REQUESTS

//DISPLAY ALL THE URLS CREATED
app.get("/urls", (req,res) => {
  let user_id = req.session.user_id;
  if(!user_id){
    var email = "";
  } else{
    var email = users[user_id].email;

  };
  if (!user_id) {
    res.redirect('/login');
  } else {
      let templateVars = {urls: urlsForUser(user_id), user_id:req.session.user_id, email : email};
      console.log(templateVars);
      res.render("urls_index",templateVars )
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/users.json", (req, res) => {
  res.json(users);
})

//TO ADD A NEW URL
app.get("/urls/new", (req, res) => {
  let user_id = req.session.user_id
  if(!user_id || !users[user_id]) {
    res.redirect("/login");
  } else {
    let email = users[user_id].email;
    let templateVars = {urlDatabase: urlDatabase, user_id:req.session.user_id, email: email};
    res.render("urls_new", templateVars);
  }
});

// TO SHOW SPECIFIC URL
app.get("/urls/:id", (req, res) => {
  let user_id = req.session.user_id
  let email = users[user_id].email;
  let templateVars = { shortURL : req.params.id, urlDatabase: urlDatabase, user_id:req.session.user_id, email :email };
  res.render("urls_show", templateVars);
  // console.log(generateRandomNumberString());
});

app.get("/hello", (req, res) => {
  res.end("<html><body>HELLO<b>World</b></body></html>\n");
});

app.get("/u/:shortURL", (req, res) => {
  // console.log(req.params);

  console.log('**********************')
  console.log('urlDB:',urlDatabase)
  console.log('**********************')
  var longURL = urlDatabase[req.params.shortURL].url;

  // console.log(longURL);
  res.redirect(longURL);
});

//REGISTER
app.get("/register", (req, res) => {
    res.render("urls_register", {});
  });

app.get("/login", (req, res) => {
  let email = "";
  let templateVars = {
    email: email,
    user_id: false,
    username: ""
  }
  res.render("urls_login", templateVars)
});

// ALL THE POST REQUESTS

//deleting url

app.post("/urls/:id/delete", (req, res) => {
  if(req.session.user_id) {
    var srt = req.params.id;
    if(urlDatabase[srt].userID === req.session.user_id) {
      delete urlDatabase[req.params.id];
      res.redirect("/urls");
     } else {
      res.sendStatus(404);
     }
  }
  else {
    res.sendStatus(404);
  }
  console.log(req.params.id);
  //delete urlDatabase[req.params.id];
  //res.redirect("/urls");
});

// updating url

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newUrl = req.body.newUrl;
  urlDatabase[id] = newUrl;

  urlDatabase[id] = {
    url: newUrl,
    userID: req.session.user_id
  }
  //let shortURL ;
  //urlDatabase[shortURL] = newUrl
  console.log(urlDatabase)
  res.redirect("/urls")
});

//TO LOGIN
//IF EMAIL PASSWORD NO THERE BAD REQUEST

app.post("/login", (req, res) => {
  let email = req.body.email;
  let pass = req.body.password;
  //res.cookie('user_id', userId)
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);  // Bad Request
  } else {
    let userId = checkUser(email, pass);
    if(userId) {
      req.session.user_id = userId;
      res.redirect("/urls")
    } else {
      res.sendStatus(400);
    }
  }
});
//TO REGISTER
//BAD REQUEST IF EMAIL AND PASSWORD MISSING

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.sendStatus(400);
  } else {
    if (canRegister()) {
      let userId = addUser(req.body.email, req.body.password);
       req.session.user_id = userId;
    } else {
      res.sendStatus(400);
    }
  }
  console.log(users);
  res.redirect("/urls");
});

//TO LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");

});

//TO REDIRECT TO URLS PAGE

app.post("/urls", (req, res) => {
  let long = req.body.longURL;
  let short = generateRandomNumberString();
  let cook = req.session.user_id;
  urlDatabase[short] = {
    url: long,
    userID: cook
  }
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});