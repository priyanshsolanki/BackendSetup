require("dotenv/config");

const cookieParser = require("cookie-parser");
const cors = require("cors");
const { verify } = require("jsonwebtoken");
const { hash, compare } = require("bcryptjs");
const { isAuth } = require("./auth.js");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const dateObj = new Date();

mongoose.connect(
  "mongodb+srv://agarwalbatteries2021:Yash%400312@cluster0.mljzw.mongodb.net/UserData?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const DataSchema = {
  email: String,
  password: String,

  name: String,
  phn: String,
  role: String,
  Rtoken: String,
};

const StockSchema = {
  serialId: String,
  type: String,
  compName: String,
  date: String,
  category: String,
};

const BatteryAssign = {
  serialId: String,
  workerId: String,
  type: String,
  compName: String,
  workerN: String,
  date: String,
  category: String,
};

const SellSchema = {
  items: [],
  invoiceN: String,
  workerId: String,
  workerN: String,
  custName: String,
  phone: Number,
  vehNum: String,
  date: String,
  total: Number,
  paid: Number,
  GSTin: String,
  Address: String,
  paymentstatus: String,
};

invoiceN = {
  inId: Number,
};
const userD = mongoose.model("User-Datas", DataSchema);
const inID = mongoose.model("InvoiceNumber", invoiceN);
const assignD = mongoose.model("Battery-Assigned-To-Worker", BatteryAssign);
const stockD = mongoose.model("Battery-Stock", StockSchema);
const SaleData = mongoose.model("Sold-Stock", SellSchema);

const {
  createAccessToken,
  createRefreshToken,
  sendRefreshToken,
  sendAccessToken,
} = require("./token.js");
const res = require("express/lib/response");
const req = require("express/lib/request");

const server = express();
server.use(cookieParser());

server.use(
  cors({
    origin: [
      "http://localhost:3000"
    ],
    credentials: true,
  })
);

const getCurrentTime = () => {
  var currentTime = new Date();
  var currentOffset = currentTime.getTimezoneOffset();
  var ISTOffset = 330; // IST offset UTC +5:30

  var ISTTime = new Date(
    currentTime.getTime() + (ISTOffset + currentOffset) * 60000
  );
  return ISTTime;
};

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// server.post("/update-cost", async (req, res) => {
//   const { id, paid } = req.body;

//   try {
//     const userId = isAuth(req);
//     if (userId !== null) {
//       let user = await userD.findById(userId);
//       if (user.role !== "admin") {
//         return res.status(401).send({ error: "kick" });
//       }
//       let batstock = await SaleData.findById(id);
//       var tmp = batstock.paid + parseInt(paid);
//       if (tmp > batstock.total)
//         return res.send({ error: "Cost of Battery exceeded" });
//       try {
//         let doc = await SaleData.findOneAndUpdate({ _id: id }, { paid: tmp });
//         if (!doc) {
//           res.status(400).send("Serial Id not Found");
//         }
//         if (doc.total == tmp) {
//           let doc1 = await SaleData.findOneAndUpdate(
//             { _id: id },
//             { paymentstatus: "paid" }
//           );
//         }
//         res.send({ message: "Cost & Payment Status Updated" });
//       } catch (err) {
//         res.status(401).send({
//           error: `${err.message}`,
//         });
//       }
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

// server.post("/get-assigned-batteries", async (req, res) => {
//   try {
//     const userId = isAuth(req);
//     if (userId !== null) {
//       let user = await userD.findById(userId);
//       if (user.role !== "admin") {
//         return res.status(401).send({ error: "kick" });
//       }
//       try {
//         assignD.find({}, function (err, datas) {
//           res.send(datas);
//         });
//       } catch (err) {
//         res.status(401).send({
//           error: `${err.message}`,
//         });
//       }
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });


// Stock entry and handling

// server.post("/get-stock", async (req, res) => {
//   try {
//     const userId = isAuth(req);
//     if (userId !== null) {
//       let user = await userD.findById(userId);
//       if (user.role !== "admin") {
//         return res.status(401).send({ error: "kick" });
//       }
//       try {
//         stockD.find({}, function (err, datas) {
//           res.send(datas);
//         });
//       } catch (err) {
//         res.status(401).send({
//           error: `${err.message}`,
//         });
//       }
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

// server.post("/get-workers", async (req, res) => {
//   try {
//     const userId = isAuth(req);
//     if (userId !== null) {
//       let user = await userD.findById(userId);
//       if (user.role !== "admin") {
//         return res.status(401).send({ error: "kick" });
//       }
//       try {
//         userD.find({}, function (err, datas) {
//           res.send(datas);
//         });
//       } catch (err) {
//         res.status(401).send({
//           error: `${err.message}`,
//         });
//       }
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

// server.post("/add-battery", async (req, res) => {
//   const { serialId, type, compName, category } = req.body;
//   let stock = await stockD.findOne({ serialId: serialId });

//   try {
//     const userId = isAuth(req);

//     if (userId !== null) {
//       try {
//         let user = await userD.findById(userId);
//         if (user.role !== "admin") {
//           return res.status(401).send({ error: "kick" });
//         }
//         if (stock) {
//           return res.send({ error: "Battery Already in stock" });
//         } else {
//           // Insert the new user if they do not exist yet
//           stock = new stockD({
//             serialId: serialId,
//             type: type,
//             compName: compName,
//             category: category,
//             date: getCurrentTime(),
//           });
//           await stock.save();
//           res.send({ message: "Battery Registered In Stock" });
//         }
//       } catch (err) {
//         res.status(401).send({
//           error: `${err.message}`,
//         });
//       }
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

// Login , Register User and Generating Refresh Token

// server.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     // username chk
//     let user = await userD.findOne({ email: email });

//     if (!user) throw new Error("User Doesnt exists");

//     //password chk
//     const valid = await compare(password, user.password);

//     if (valid) {
//       const accesstok = createAccessToken(user.id);
//       const refreshtok = createRefreshToken(user.id);

//       user.Rtoken = refreshtok;
//       await user.save();

//       sendRefreshToken(res, refreshtok);
//       sendAccessToken(res, req, accesstok, refreshtok);
//     } else {
//       return res.status(200).send({ error: "Invalid credentials" });
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

// server.post("/register", async (req, res) => {
//   const { email, password, name } = req.body;
//   console.log(name);
//   try {
//     try {
//       let user = await userD.findOne({ email: email });

//       if (user) {
//         return res.status(200).send({ error: "User Already Exists" });
//       }
//       const userId = isAuth(req);

//       user = await userD.findById(userId);
//       if (user.role !== "admin") {
//         return res.status(401).send({ error: "kick" });
//       }

//       if (userId !== null) {
//         const hashedPassword = await hash(password, 10);

//         user = new userD({
//           email: email,
//           password: hashedPassword,
//           name: name,
//           phn: phn,
//           role: role,
//         });
//         await user.save();
//         res.send({ message: "Registration Successful" });
//       }
//     } catch (err) {
//       req.statusCode = 401;
//       res.status(401).send({
//         error: `${err.message}`,
//       });
//     }
//   } catch (err) {
//     res.status(401).send({
//       error: `${err.message}`,
//     });
//   }
// });

server.post("/protected", async (req, res) => {});

server.post("/refreshtoken", async (req, res) => {
  const token = req.body.refreshtc;
  // If we don't have a token in our request
  if (!token) return res.send({ accesstoken: "1" });

  // We have a token, let's verify it!
  let payload = null;

  try {
    payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
  } catch (err) {
    return res.send({ accesstoken: err });
  }
  // token is valid, check if user exist
  let id = payload.userId;
  let user = await userD.findById(id);

  if (!user) return res.send({ accesstoken: "3" });
  // user exist, check if refreshtoken exist on user
  if (user.Rtoken !== token)
    return res.send({ error: "Invalid refresh token" });
  // token exist, create new Refresh- and accesstoken

  const accesstoken = createAccessToken(user.id);
  const refreshtoken = createRefreshToken(user.id);
  // update refreshtoken on user in db
  // Could have different versions instead!
  user.Rtoken = refreshtoken;
  user.save();
  // All good to go, send new refreshtoken and accesstoken
  sendRefreshToken(res, refreshtoken);
  return res.send({ accesstoken, refreshtoken });
});

server.listen(3000, function () {
  console.log("server Active Now");
});
// server.listen(3000, function () {
//   console.log("server Active Now on port " + process.env.PORT);
// });
