const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Op } = require('sequelize');
const bcrypt = require('bcrypt')
const crypto = require('crypto')


const { User, Role } = require('../models/index');

const CustomException = require('../exceptions/custom_exception');
const mailer = require('../utils/mailer');
const RedisAuthHelper = require('../helpers/redis_auth_helper')


class AuthService {
    constructor() {
        this.accessSecret = process.env.ACCESS_TOKEN_SECRET;
        this.refreshSecret = process.env.REFRESH_TOKEN_SECRET;
        this.accessHashSecret = process.env.ACCESS_TOKEN_HASH_SECRET
        this.refreshHashSecret = process.env.REFRESH_TOKEN_HASH_SECRET

    }
    async generateAccessToken(user) {
        const access_token = jwt.sign({ id: user.id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.Role.name }, this.accessSecret, { expiresIn: '10m' });

        const access_hash = crypto.createHmac("sha256", this.accessHashSecret).update(access_token).digest("hex")

        await RedisAuthHelper.saveAccessToken(user.id, access_hash, {})

        return access_token;
    }

    async generateRefreshToken(user) {
        const refresh_token = jwt.sign({ id: user.id }, this.refreshSecret, { expiresIn: '20m' })

        const refresh_hash = crypto.createHmac("sha256", this.refreshHashSecret).update(refresh_token).digest("hex")

        await RedisAuthHelper.saveRefreshToken(user.id, refresh_hash, {})

        return refresh_token;
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
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user);

        return { access_token: accessToken, refresh_token: refreshToken };
    }

    async refresh(token) {

        try {
            const decoded = jwt.verify(token, this.refreshSecret);
            const user = await User.findByPk(decoded.id, {
                include: {
                    model: Role,
                    attributes: ['id', 'name']
                }
            });
            if (!user) throw new CustomException('User not found');
            const accessToken = await this.generateAccessToken(user);
            const refreshToken = await this.generateRefreshToken(user);

            // Revoking the previous refresh token
            const refresh_hash = crypto.createHmac("sha256", this.refreshHashSecret).update(token).digest("hex")

            await RedisAuthHelper.revokeRefreshToken(user.id, refresh_hash);

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