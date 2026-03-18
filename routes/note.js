// Express framework import kar rahe hain
const express = require("express");

// fetchuser middleware import (JWT authentication ke liye)
const {fetchuser,admin} = require("../middleware/fetchuser");

// Notes model import (MongoDB collection)
const Notes = require("../models/Notes");

// Router create kar rahe hain
const router = express.Router();

// express-validator import (form validation ke liye – abhi is route me use nahi hua)
const { body, validationResult } = require("express-validator");


// ROUTE 1: Logged-in user ke saare notes fetch karna
// Method: GET
// Path: /fetchallnotes
// fetchuser pehle chalega (user authenticate karega)
router.get("/fetchallnotes", fetchuser, async (req, res) => {

    try {
        // Database me Notes collection se sirf wahi notes la rahe hain
        // jinka user id == logged in user id ho
        const notes = await Notes.find({ user: req.user.id })

        // Frontend ko notes JSON format me bhej rahe hain
        res.json(notes)

    } catch (error) {

        // Agar koi error aaye to console me print karega
        console.error(error.message);

        // Client ko 500 error response bhejega
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 2: Naya note add karne ke liye route
// Method: POST
// Path: /addnote
// fetchuser middleware pehle chalega (JWT verify karega)

router.post("/addnote", fetchuser,

     // express-validator rules
     [
        // Title kam se kam 5 characters ka hona chahiye
        body('title', 'Please enter a title').isLength({ min: 5 }),

        // Description kam se kam 10 characters ka hona chahiye
        body('description', 'Please enter description').isLength({ min: 10 }),
     ],

     async (req, res) => {

    // Validation ke baad errors check kar rahe hain
    const errors = validationResult(req);

    // Agar validation fail hui to 400 status ke saath errors bhej denge
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {

        // Request body se title, description aur tag nikaal rahe hain
        const { title, description, tag } = req.body;

        // Naya Notes object bana rahe hain
        // user:req.user.id => logged in user ki id save kar rahe hain
        const note = new Notes({
            title,
            description,
            tag,
            user: req.user.id
        })

        // Note ko MongoDB me save kar rahe hain
        const saveNote = await note.save()

        // Saved note ko frontend ko JSON me bhej rahe hain
        res.json(saveNote)

    } catch (error) {

        // Agar koi server error aaye to console me print karega
        console.error(error.message);

        // Client ko 500 Internal Server Error bhejega
        res.status(500).send("Internal Server Error");
    }
})


// ROUTE 3: Existing note ko update karne ke liye route
// Method: PUT
// Path: /updatenote/:id
// fetchuser middleware pehle chalega (JWT token verify karega)

router.put('/updatenote/:id', fetchuser, async (req, res) => {

    // Request body se title, description aur tag nikaal rahe hain
    const { title, description, tag } = req.body;

    try {

        // Ek empty object bana rahe hain jisme sirf updated fields store hongi
        const newNote = {};

        // Agar title bheja gaya hai to newNote me add karo
        if (title) { newNote.title = title };

        // Agar description bheja gaya hai to newNote me add karo
        if (description) { newNote.description = description };

        // Agar tag bheja gaya hai to newNote me add karo
        if (tag) { newNote.tag = tag };

        // Database me id ke basis par pehle note find kar rahe hain
        let note = await Notes.findById(req.params.id);

        // Agar note exist nahi karta to 404 error return karo
        if (!note) { return res.status(404).send("Not Found") }

        // Check kar rahe hain ki ye note isi logged-in user ka hai ya nahi
        // note.user ObjectId hota hai isliye string me convert kar rahe hain
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // MongoDB me note update kar rahe hain
        // $set: newNote => sirf wahi fields update hongi jo newNote me hain
        // { new: true } => updated note wapas return karega
        note = await Notes.findByIdAndUpdate(
            req.params.id,
            { $set: newNote },
            { new: true }
        )

        // Updated note ko frontend ko JSON format me bhej rahe hain
        res.json({ note });

    } catch (error) {

        // Agar server error aaye to console me print karega
        console.error(error.message);

        // Client ko 500 Internal Server Error bhej rahe hain
        res.status(500).send("Internal Server Error");
    }
})




// ROUTE 4: Existing note delete karne ke liye route
// Method: DELETE
// Path: /deletenote/:id
// fetchuser middleware pehle chalega (JWT token verify karega)

router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {

        // Database me id ke basis par pehle note find kar rahe hain
        let note = await Notes.findById(req.params.id);

        // Agar note exist nahi karta to 404 error return karo
        if (!note) { return res.status(404).send("Not Found") }

        // Check kar rahe hain ki ye note isi logged-in user ka hai ya nahi
        // note.user ObjectId hota hai isliye string me convert kar rahe hain
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }

        // Agar user owner hai to note ko MongoDB se delete kar rahe hain
        note = await Notes.findByIdAndDelete(req.params.id)

        // Frontend ko success message aur deleted note bhej rahe hain
        res.json({ "Success": "Note has been deleted", note: note });

    } catch (error) {

        // Agar koi server error aaye to console me print karega
        console.error(error.message);

        // Client ko 500 Internal Server Error bhej rahe hain
        res.status(500).send("Internal Server Error");
    }
})


// ================= ROUTE =================
// count notes of logged in user
// method : GET
// url : /api/auth/countnotes

router.get('/countnotes', fetchuser, async (req, res) => {
  try {

    const totalNotes = await Notes.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      totalNotes
    });

  } catch (error) {

    console.error(error.message);
    res.status(500).send("Internal Server Error");

  }
});


router.get('/countallnotes', fetchuser,admin, async (req, res) => {
  try {

    const totalNotes = await Notes.countDocuments();

    res.json({
      success: true,
      totalNotes
    });

  } catch (error) {

    console.error(error.message);
    res.status(500).send("Internal Server Error");

  }
});

// Router ko export kar rahe hain taaki main app.js/index.js me use ho sake
module.exports = router

