// Express framework import kiya
const express = require("express");
const router = express.Router();

// express-validator se body validation ke tools import kiye
const { body, validationResult } = require("express-validator");

// User model import kiya (MongoDB schema)
const User = require("../models/User");

// Password hashing ke liye bcrypt import kiya
//bcrypt node.js ka ek package he jo pasword ko secure karne me help karta he
const bcrypt = require("bcryptjs");

// JWT token generate karne ke liye jsonwebtoken import kiya
// jwt token user ko varify karne ka ek tarika he 
var jwt = require('jsonwebtoken');
const { fetchuser, admin } = require("../middleware/fetchuser");
const Notes = require("../models/Notes");

// JWT secret key (real project me .env file me rakhna chahiye)
const JWT_SECRET = process.env.JWT_SECRET


// ================= ROUTE 1 =================
// User ko register / create karne ke liye API
// Method: POST
// URL: /api/auth/createuser
// Login ki requirement nahi hai
router.post(
  "/createuser",
  [
    // Name validation: minimum 3 aur maximum 20 characters
    body('name', 'Please enter a valid name').isLength({ min: 3, max: 20 }),

    // Email validation
    body('email', 'Please enter a valid email').isEmail(),

    // Password strong validation
    body("password")
      .isLength({ min: 8 }).withMessage("Password kam se kam 8 characters ka hona chahiye")
      .matches(/[A-Z]/).withMessage("Password me ek uppercase letter hona chahiye")
      .matches(/[a-z]/).withMessage("Password me ek lowercase letter hona chahiye")
      .matches(/[0-9]/).withMessage("Password me ek number hona chahiye")
      .matches(/[@$!%*?&#]/).withMessage("Password me ek special character hona chahiye")
  ],
  async (req, res) => {

    // Validation errors check kar rahe hain (agar koi ho)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check kar rahe hain ki email pehle se exist to nahi karta
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ errors: "User with this email already exists" });
      }

      // Password ko secure banane ke liye salt generate kar rahe hain
      const salt = await bcrypt.genSalt(10);

      // Plain password ko hash me convert kar rahe hain
      const securePassword = await bcrypt.hash(req.body.password, salt);

      // New user ko database me save kar rahe hain
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: securePassword
      });

      const data = {
        user: {
          id: user.id,
          role: user.role
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Client ko token return kar rahe hain
      res.json({ authtoken });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);


// ================= ROUTE 2 =================
// User login / authenticate karne ke liye API
// Method: POST
// URL: /api/auth/login
// Login required nahi hai (ye khud login API hai)
router.post(
  "/login",
  [
    // Email validation
    body('email', 'Please enter a valid email').isEmail(),

    // Password validation
    body('password', 'Password cannot be blank').exists(),
  ],
  async (req, res) => {

    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Request body se email aur password nikal rahe hain
      const { email, password } = req.body;

      // Database me user search kar rahe hain
      let user = await User.findOne({ email: email });
      if (!user) {
        return res.status(400).json({ error: "Please enter correct credentials" });
      }

      // Entered password ko database ke hashed password se compare kar rahe hain
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({ error: "Please enter correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
          role: user.role
        }
      }
      const authtoken = jwt.sign(data, JWT_SECRET);

      // Token response me bhej rahe hain
      res.json({ authtoken });

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);



// ================= ROUTE 3 =================
//get logedin user details 
//method : POST
//url : /api/auth/getuser
//login is requird

// POST request route banaya "/getuser" path ke liye
// fetchuser middleware pehle chalega (JWT se user verify karega)
router.get("/getuser", fetchuser, async (req, res) => {

  // try block — agar koi error na ho to ye code chalega
  try {

    // req.user fetchuser middleware se aata hai
    // yaha hum logged-in user ki id nikaal rahe hain
    const userId = req.user.id

    // MongoDB me User collection se user ko id ke basis par find kar rahe hain
    const user = await User.findById(userId)

    // client (frontend / postman) ko user ka data bhej rahe hain
    res.send(user)

  } catch (error) {

    // agar koi error aaye to console me print karega
    console.error(error.message);

    // client ko 500 status ke saath error message bhejega
    res.status(500).send("Internal Server Error");
  }
});



// ================= ROUTE 4=================
//updateuser
//method : PUT
//url : /api/auth/updateuser/:id
//login is requird
// Put request route banaya "/updateuser" path ke liye
// fetchuser middleware pehle chalega (JWT se user verify karega)
router.put("/updateuser/:id", fetchuser,
  [
    // Name validation: minimum 3 aur maximum 20 characters
    body('name', 'Please enter a valid name').optional().isLength({ min: 3, max: 20 }),

    // Email validation
    body('email', 'Please enter a valid email').optional().isEmail(),

    // Password strong validation
    body("password").optional()
      .isLength({ min: 8 }).withMessage("Password kam se kam 8 characters ka hona chahiye")
      .matches(/[A-Z]/).withMessage("Password me ek uppercase letter hona chahiye")
      .matches(/[a-z]/).withMessage("Password me ek lowercase letter hona chahiye")
      .matches(/[0-9]/).withMessage("Password me ek number hona chahiye")
      .matches(/[@$!%*?&#]/).withMessage("Password me ek special character hona chahiye")
  ],
  async (req, res) => {

    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      if (req.params.id !== req.user.id) {
        return res.status(401).send("Not Allowed");
      }
      // Request body se email aur password nikal rahe hain
      const { name, email, password } = req.body || {};

      const newUser = {};

      if (name) { newUser.name = name };
      if (email) { newUser.email = email };
      if (password) {
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(password, salt);
        newUser.password = securePassword
      };

      let user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).send("Not Found");
      }
      user = await User.findByIdAndUpdate(
        req.params.id,
        { $set: newUser },
        { new: true }
      )

      // Updated note ko frontend ko JSON format me bhej rahe hain
      res.json({ user });


    } catch (error) {
      // Agar server error aaye to console me print karega
      console.error(error.message);

      // Client ko 500 Internal Server Error bhej rahe hain
      res.status(500).send("Internal Server Error");
    }

  });



// ================= ROUTE 5=================
//deleteuser
//method : DELETE
//url : /api/auth/deleteuser/:id
//login is requird
// delete request route banaya "/deleteuser" path ke liye
// fetchuser middleware pehle chalega (JWT se user verify karega)  
router.delete('/deleteuser/:id', fetchuser, async (req, res) => {

  try {

    let user = await User.findById(req.params.id);

    if (!user) { return res.status(404).send("User not found in database") }

    if (req.params.id !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }
    await Notes.deleteMany({ user: req.params.id })
    // Agar user owner hai to note ko MongoDB se delete kar rahe hain
    user = await User.findByIdAndDelete(req.params.id)

    // Frontend ko success message aur deleted note bhej rahe hain
    res.json({ "Success": "User has been deleted", user: user });

  } catch (error) {

    // Agar koi server error aaye to console me print karega
    console.error(error.message);

    // Client ko 500 Internal Server Error bhej rahe hain
    res.status(500).send("Internal Server Error");
  }
})



router.get('/fetchallusers', fetchuser, admin, async (req, res) => {
  try {

    // sabhi users fetch kar rahe hain (password hide kar diya)
    const users = await User.find().select("-password");

    res.json({
      success: true,
      users
    });

  } catch (error) {

    console.error(error.message);

    res.status(500).send("Internal Server Error");

  }
});

router.get('/countusers', fetchuser, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      totalUsers
    });

  } catch (error) {

    console.error(error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });

  }
});
// Router ko export kar rahe hain taaki app.js me use ho sake

// ================= ROUTE =================
// get single user by id
// method : GET
// url : /api/auth/getsingleuser/:id
// login required

router.get('/getsingleuser/:id', fetchuser, admin, async (req, res) => {
  try {

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {

    console.error(error.message);
    res.status(500).send("Internal Server Error");

  }
});

module.exports = router;
