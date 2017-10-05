var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';


var config = {
  development: {
    root: rootPath,
    app: {
      name: 'firebird-run'
    },
    db: {
      url: 'jdbc:firebirdsql://192.168.1.6/spdb_dnepr', //jdbc:firebirdsql://host[:port]/<database>
      minpoolsize: 2,
      maxpoolsize: 3,
      properties: {
        user : 'SYSDBA',
        password: 'u8ntkSEa'
      }
    },
    myDB:{
      host: 'localhost',
      database: 'sapoweb',
      user: 'root',
      password: 'test123'
    },
    jdbc:{
      libpath: './jdbc/jaybird-full-2.2.7.jar',
      libs: ['./jdbc/lib/*.jar'],
      drivername: 'org.firebirdsql.jdbc.FBDriver'
    },
    email:{
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'co.mobile.test@gmail.com',
        pass: 'comobile123'
      }
    },
    port: 3000,
    staticUserPasswordSalt: "!^+",
    DEFAULT_CITY_ID: 101,
    secretKey: 'y4ye73y43'
  },

  test: {
    root: rootPath,
    app: {
      name: 'firebird-test'
    },
    db: {
      url: 'jdbc:firebirdsql://192.168.1.6/spdb_dnepr', //jdbc:firebirdsql://host[:port]/<database>
      minpoolsize: 2,
      maxpoolsize: 3,
      properties: {
        user : 'SYSDBA',
        password: 'u8ntkSEa'
      }
    },
    myDB:{
      host: '192.168.1.206',
      database: 'sapoweb',
      user: 'root',
      password: '1111'
    },
    jdbc:{
      libpath: './jdbc/jaybird-full-2.2.7.jar',
      libs: ['./jdbc/lib/*.jar'],
      drivername: 'org.firebirdsql.jdbc.FBDriver'
    },
    email:{
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'co.mobile.test@gmail.com',
        pass: 'comobile123'
      }
    },
    port: 3000,
    staticUserPasswordSalt: "!^+",
    DEFAULT_CITY_ID: 101,
    secretKey: 'y4ye73y43'
  },

  production: {
    root: rootPath,
    app: {
      name: 'firebird-test'
    },
    port: 3000
  }
};


module.exports = config[env];
