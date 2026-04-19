const config = require("./config.js");
const express = require("express");
const { connectDB, closeDBConn } = require("./database/db.js");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const routes = require("./routes/index.js");

const app = express();

connectDB();

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Enabling Sessions
const TWELVE_HOURS = 1000 * 60 * 60 * 12;
app.use(
  expressSession({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: connectMongo.create({
      mongoUrl: config.mongoURI,
    }),
    cookie: {
      maxAge: TWELVE_HOURS,
    },
  }),
);

app.use(function (req, res, next) {
  res.locals = {
    auth: req.session.userId,
    scripts: config.scripts,
  };
  next();
});

app.use(routes);

app.use((req, res) => {
  res.status(404).render("errors/404", { title: "Page Not Found" });
});

const server = app.listen(config.port, function () {
  console.log(`Server started on port ${config.port}`);
});

let isShuttingDown = false;
const shutdown = async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log("\nReceived kill signal, shutting down gracefully.");

  server.close(async () => {
    console.log("Closing remaining connections.");
    closeDBConn();
  });
  server.closeAllConnections();
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
