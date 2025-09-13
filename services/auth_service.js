const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Op } = require('sequelize');

const { User, Role } = require('../models/index');

const CustomException = require('../exceptions/custom_exception');
const mailer = require('../utils/mailer');


class AuthService {
    constructor() {
        this.accessSecret = process.env.ACCESS_TOKEN_SECRET;
        this.refreshSecret = process.env.REFRESH_TOKEN_SECRET;

    }
    generateAccessToken(user) {
        return jwt.sign({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.Role.name }, this.accessSecret, { expiresIn: '10m' });
    }

    generateRefreshToken(user) {
        return jwt.sign({ id: user.id }, this.refreshSecret, { expiresIn: '20m' })
    }



    async login(email, password) {
        const user = await User.findOne({
            where: { email }, include: {
                model: Role,
                attributes: ['id', 'name']
            }
        });
        if (!user || !(await user.validPassword(password))) {
            throw new CustomException('Invalid email or password');
        }
        console.log(user)
        const accessToken = this.generateAccessToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async refresh(token) {
        // Implement Redis to store refresh tokens and check if the token is valid
        try {
            const decoded = jwt.verify(token, this.refreshSecret);
            const user = await User.findByPk(decoded.id);
            if (!user) throw new CustomException('User not found');
            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { access_token: accessToken, refresh_token: refreshToken };
        } catch (error) {
            throw new CustomException('Invalid refresh token', 401);
        }
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new CustomException('User with this email does not exist', 404);
        }
        // Generate a reset token and set expiration
        const resetToken = jwt.sign({ id: user.id }, process.env.RESET_PASSWORD_SECRET, { expiresIn: '10m' });
        user.reset_password_token = resetToken;
        user.reset_password_expires = Date.now() + 600000; // 10 minutes from now
        await user.save();

        const resetUrl = process.env.FRONTEND_URL + `/reset-password?token=${resetToken}`;

        // Send email with reset link
        await mailer.sendMail(
            user.email,
            'Password Reset Request',
            `You requested a password reset. Click the link to reset your password: ${resetUrl}`,
            `<p>You requested a password reset.</p><a href="${resetUrl}">Click here to reset</a>`
        )
        return { message: 'Password reset link has been sent to your email' };
    }

    async resetPassword(token, newPassword) {
        const user = await User.findOne({ where: { reset_password_token: token, reset_password_expires: { [Op.gt]: Date.now() } } })

        if (!user) {
            throw new CustomException('Invalid or expired reset token', 400);
        }

        user.password_hash = await user.hashPassword(newPassword);
        user.reset_password_token = null;
        user.reset_password_expires = null;
        await user.save();

        return { message: 'Password has been reset successfully' };
    }
}

module.exports = new AuthService();