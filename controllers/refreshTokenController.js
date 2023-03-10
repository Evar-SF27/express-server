const User = require('../models/User')
const jwt = require('jsonwebtoken')

const handleRefreshToken = async (req, res) => {
    const cookies = req.cookies
    if (!cookies?.jwt) return res.sendStatus(401)
    const refreshToken = cookies.jwt

    const userInstance = await User.findOne({ refreshToken }).exec()
    if (!userInstance) return res.sendStatus(403)

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET_KEY,
        (err, decoded) => {
            if (err || userInstance.username !== decoded.username) return res.sendStatus(403)
            const roles = Object.values(userInstance.roles).filter(Boolean)
            const accessToken = jwt.sign(
                { 
                    "UserInfo": {
                        "username": userInstance.username,
                        "roles":  roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET_KEY,
                { expiresIn: '30s' }
            )
            res.json({ roles, accessToken })
        }
    ) 
}

module.exports = { handleRefreshToken }