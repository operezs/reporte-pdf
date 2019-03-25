var sql = require("mssql");
var connect = function()
{
    var conn = new sql.ConnectionPool({
        user: 'sa',
        password: '123',
        server: '127.0.0.1',
        //database: 'pdfreport'
        database: 'JUNTAS'
    });

    return conn;
};

module.exports = connect;