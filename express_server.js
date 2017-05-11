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


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req,res) => {

  let templateVars = {urlDatabase: urlDatabase, cookieUsername:req.cookies.username};
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL : req.params.id, urlDatabase: urlDatabase };
  res.render("urls_show", templateVars);
  // console.log(generateRandomNumberString());
});

app.get("/urls/new", (req, res) => {
   let templateVars = {urlDatabase: urlDatabase, cookieUsername:req.cookies.username};
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("OK");
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

//cookie
app.post("/login", (req, res) => {

  res.cookie('username', req.body.username)

  //res.render("../.._headers.ejs")
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
res.clearCookie('username');
res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});