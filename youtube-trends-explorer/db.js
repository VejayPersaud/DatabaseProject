require('dotenv').config();  // Load environment variables from .env file
const oracledb = require('oracledb');

async function initialize() {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,            // Oracle username from .env
      password: process.env.DB_PASSWORD,    // Oracle password from .env
      connectString: process.env.DB_CONNECTION_STRING,  // Oracle connection string from .env
      poolMin: 1,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Database pool created');
  } catch (err) {
    console.error('Error initializing database pool', err);
    process.exit(1);  // Exit if there’s a connection issue
  }
}

async function close() {
  try {
    await oracledb.getPool().close(10);
    console.log('Database pool closed');
  } catch (err) {
    console.error('Error closing database pool', err);
  }
}

async function simpleExecute(statement, binds = [], opts = {}) {
  let conn;
  opts.outFormat = oracledb.OUT_FORMAT_OBJECT;  // Return as JSON
  opts.autoCommit = true;

  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(statement, binds, opts);
    return result;
  } catch (err) {
    console.error('Database error', err);
    throw err;
  } finally {
    if (conn) {
      try {
        await conn.close();
      } catch (err) {
        console.error('Error closing connection', err);
      }
    }
  }
}

module.exports = { initialize, close, simpleExecute };
