"use strict";
const express = require("express");
const path = require("path");
const compression = require("compression");
const bodyParser = require("body-parser");
const YouTubeJS = require("youtubei.js");
const serverYt = require("./server/youtube.js");
const cors = require('cors');
const cookieParser = require('cookie-parser');

let app = express();
let client;

app.use(compression());
app.use(express.static(__dirname + "/public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.set("trust proxy", 1);
app.use(cookieParser());

// ログインチェック
app.use((req, res, next) => {
    if (req.cookies.loginok !== 'ok' && !req.path.includes('login') && !req.path.includes('back')) {
        return res.redirect('/login');
    } else {
        next();
    }
});

app.get('/', (req, res) => {
  if (req.query.r === 'y') {
    res.render("home/index");
  } else {
    res.redirect('/wkt');
  }
});

app.use("/wkt", require("./routes/wakametube"));
app.use("/game", require("./routes/game"));
app.use("/tools", require("./routes/tools"));
app.use("/pp", require("./routes/proxy"));
app.use("/wakams", require("./routes/music"));
app.use("/blog", require("./routes/blog"));

app.get('/login', (req, res) => {
    res.render('home/login');
});

app.use((req, res) => {
  res.status(404).render("error.ejs", {
    title: "404 Not found",
    content: "そのページは存在しません。",
  });
});

async function initInnerTube() {
  try {
    // YouTube接続設定を最適化
    client = await YouTubeJS.Innertube.create({ 
        lang: "ja", 
        location: "JP",
        cache: new YouTubeJS.UniversalCache(false) 
    });
    serverYt.setClient(client);
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => {
      console.log(`Ready on port ${port}`);
    });
  } catch (e) {
    console.error("YouTube Init Error:", e);
    setTimeout(initInnerTube, 10000);
  };
};

initInnerTube();
