const commonHelper = require('all-in-one');

const wrapper = commonHelper.Wrapper;
const pool = require('./connection');

class DB {
  constructor(config) {
    this.config = config;
  }

  static errorMessage(code) {
    switch(code) {
    case 'PROTOCOL_CONNECTION_LOST':
      return 'Database connection was closed.';
    case 'ER_CON_COUNT_ERROR':
      return 'Database has too many connections.';
    case 'ECONNREFUSED':
      return 'Database connection was refused.';
    default:
    }
  }

  async query(statement) {
    let db = await pool.getConnection(this.config);
    if(!db){
      db = await pool.createConnectionPool(this.config);
    }
    const recordset = () => new Promise((resolve, reject) => {
        db.getConnection((error, connection) => {
          if (error) {
            connection.release();
            return reject(wrapper.error(DB.errorMessage(error.code)));
          }
          connection.query(statement, (err, res) => {
            if (err) {
              connection.release();
              return reject(wrapper.error(err.message));
            }
            connection.release();
            return resolve(wrapper.data(res));
          });
        });
      });
    return recordset().then(res => res).catch(err => err);
  }

  async preparedQuery(statement, parameter) {
    let db = await pool.getConnection(this.config);
    if(!db){
      db = await pool.createConnectionPool(this.config);
    }
    const recordset = () => new Promise((resolve, reject) => {
        db.getConnection((error, connection) => {
          if (error) {
            connection.release();
            return reject(wrapper.error(DB.errorMessage(error.code)));
          }
          connection.query(statement, parameter, (err, res) => {
            if (err) {
              connection.release();
              return reject(wrapper.error(err.message));
            }
            connection.release();
            return resolve(wrapper.data(res));
          });
        });
      });
    return recordset().then(res => res).catch(err => err);
  }

}

module.exports = DB;
