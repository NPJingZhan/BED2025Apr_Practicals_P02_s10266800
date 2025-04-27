const express = require("express");
const app = express();
const PORT = 3000;
const list = ["coding", "reading", "cycling"]
const me = {
  "name": "Jinggg",
  "hobbies": list,
  "intro": "Hi, I'm Jing Zhan, a Year 2 student passionate about building APIs!"
}

// Define route for Home Page
app.get("/", (req, res) => {
  res.send("Welcome to Homework API");
});

// Define route for Intro Page
app.get("/intro", (req, res) => {
  res.send(me.intro);
});

// Define route for Name Page
app.get("/name", (req, res) => {
  res.send("My name is " + me.name);
});

// Define route for Hobbies Page
app.get("/hobbies", (req, res) => {
  res.send(me.hobbies)
});

// Define route for Food Page
app.get("/food", (req, res) => {
  res.send("I like eating pizza.");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

