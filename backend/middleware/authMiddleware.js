import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
    try {
        // 1. Grab the token from the headers
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // 2. Verify the token using your Secret Key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. ATTACH THE USER TO THE REQUEST (This fixes the crash!)
        req.user = decoded; 

        // 4. Move to the next step (the Controller)
        next();
    } catch (error) {
        res.status(401).json({ message: "Token is not valid" });
    }
};