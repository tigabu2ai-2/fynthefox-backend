require('dotenv').config()

const redis = require("../databases/redis")
const { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } = process.env


class RedisAuthHelper {


    static async saveAccessToken(user_id, access_hash, meta) {
        const token_key = `access:${access_hash}`
        const user_set_key = `user:${user_id}:accesses`

        await redis.set(token_key, JSON.stringify(meta), { expiration: { type: 'EX', value: ACCESS_TOKEN_TTL } }) // Storing detailed info for the access token
        await redis.sAdd(user_set_key, access_hash)


    }

    static async saveRefreshToken(user_id, refresh_hash, meta) {
        const token_key = `refresh:${refresh_hash}`;
        const user_set_key = `user:${user_id}:refreshs`;

        await redis.set(token_key, JSON.stringify(meta), { expiration: { type: 'EX', value: REFRESH_TOKEN_TTL } }) // Storing detailed info for the refresh token
        await redis.sAdd(user_set_key, refresh_hash); // This is just for session management. To list
    }

    static async revokeRefreshToken(user_id, refresh_hash) {
        const token_key = `refresh:${refresh_hash}`;
        const user_set_key = `user:${user_id}:refreshs`;

        await redis.del(token_key)
        await redis.sRem(user_set_key, refresh_hash)
    }

    static async revokeAccessToken(user_id, access_hash) {
        const token_key = `access:${access_hash}`
        const user_set_key = `user:${user_id}:accesses`

        await redis.del(token_key)
        await redis.sRem(user_set_key, access_hash)
    }

    static async revokeAllToken(user_id) {
        const user_set_key = `user:${user_id}`

        const refresh_hashs = await redis.sMembers(`${user_set_key}:refreshs`);
        const access_hashs = await redis.sMembers(`${user_set_key}:accesses`);


        const pipeline = redis.multi();
        for (const hash of refresh_hashs) {
            pipeline.del(`refresh:${hash}`)
        }

        for (const hash of access_hashs) {
            pipeline.del(`access:${hash}`)
        }

        pipeline.del(`${user_set_key}:refreshs`)
        pipeline.del(`${user_set_key}:accesses`)

        await pipeline.exec()


    }
    static async listUserSessions(user_id) {
        const user_set_key = `user:${user_id}:refreshs`
        const hashs = await redis.sMembers(user_set_key)

        const sessions = []

        for (const hash of hashs) {
            const raw = await redis.get(`refresh:${hash}`)
            if (raw) {
                sessions.push(JSON.parse(raw))
            }
        }



        return sessions;
    }

    static async verifyRefreshToken(refresh_hash) {
        const token_key = `refresh:${refresh_hash}`
        const data = await redis.get(token_key)

        if (!data) return null; //invalid or expired

        const meta = JSON.parse(data)
console.log(meta)
        console.log(data)
        return meta;

    }
    static async verifyAccessToken(access_hash) {
        const token_key = `access:${access_hash}`
        const data = await redis.get(token_key)

        if (!data) return null; // Invalid or expired access token
        const meta = JSON.parse(data)
        

        return meta;
    }
}

module.exports = RedisAuthHelper