import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const protect = async (req, res, next) => {
    try {
        //Grab token from header -- (?.) stops the code if no token
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Authorization denied" });
        }

        // Verify JWT and attach decoded payload to request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Adding Token to the user request
        req.user = decoded;

        // 4. Move to the next step ()
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message || error);
        res.status(401).json({ message: "Token is not valid" });
    }
};