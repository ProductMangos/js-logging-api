// In db.js
const { Pool } = require("pg");

// The secret connection string you copied earlier
const connectionString =
  "postgresql://postgres:YiWinSEGJntTadOBlWeCWnWQvxZBoUoP@autorack.proxy.rlwy.net:12664/railway";

const pool = new Pool({
  connectionString,
});

module.exports = pool;
