
let config = {
    development: {
        username: process.env.CONFIG_USERNAME,
        password: process.env.CONFIG_PASSWORD,
        database: process.env.CONFIG_DB,
        host: "localhost",
        dialect: "mysql"
    },
    test: {
        username: process.env.CONFIG_USERNAME,
        password: process.env.CONFIG_PASSWORD,
        database: process.env.CONFIG_DB,
        host: "localhost",
        dialect: "mysql",
        logging: false
    },
    production: {
        useEnvVariable: "JAWSDB_URL",
        dialect: "mysql"
    }
};

module.exports = config;