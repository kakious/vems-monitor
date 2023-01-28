export default () => ({
    twitch: {
        clientId: process.env['TWITCH_CLIENT_ID'] || '',
        bearer: process.env['TWITCH_BEARER'] || '',
    },
    vrchat: {
        username: process.env['VRCHAT_USERNAME'] || '',
        password: process.env['VRCHAT_PASSWORD'] || '',
    },
});
