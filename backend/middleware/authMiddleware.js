import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Checking for JWT token in request and validating it used in routes that beed authentication

export const protect = async (req, res, next) => {
    try {
        //Grab token from header(?.) stops the code if no token
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authorization denied" });
        }

        // Verify JWT takes the token and the secret kkeyyy
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Adding Token to the user request
        req.user = decoded;

        // sab hone k baad move to the next step i.e to the route handler
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message || error);
        res.status(401).json({ message: "Token is not valid" });
    }
};