// jsonwebtoken package import kar rahe hain
var jwt = require('jsonwebtoken');

// Secret key jo JWT token verify karne me use hoti hai
const JWT_SECRET = "9fA7!kP2#MZxQe@L8wR$JdS5hT^C0YB1mN";

// fetchuser middleware function
const fetchuser = (req, res, next) => {

    // Request header me jo auth-token aaya hai usko console me print kar rahe hain
    console.log(req.header('auth-token'))

    // Header se token nikaal rahe hain
    const token = req.header('auth-token');

    // Agar token nahi mila to 401 Unauthorized error bhej denge
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }

    try {
        // JWT token ko secret key se verify kar rahe hain
        // Agar valid hua to user ka data mil jayega
        const data = jwt.verify(token, JWT_SECRET);

        // Token se nikla hua user object req.user me store kar rahe hain
        req.user = data.user;

        // Sab sahi raha to next middleware / route ko call karega
        next();

    } catch (error) {

        // Agar token galat ya expired hua to yaha catch hoga
        // Aur 401 error response bhej diya jayega
        res.status(401).send({ error: "Please authenticate using a valid token" })
    }

}

// fetchuser ko export kar rahe hain taki dusri files me use ho sake
module.exports = fetchuser;
