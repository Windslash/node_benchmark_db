"use strict";

var mysql = require('mysql'),
	benchmarkModules = require('./benchmarkModules');

var dbConfig = {
    host : 'localhost',
    user : 'root',
    password : 'root',
    database : 'benchmark_mysql'
};

var sqlCommands = {
    dropDatabase : 'DROP DATABASE IF EXISTS benchmark_mysql',
    createDatabase : 'CREATE DATABASE benchmark_mysql',
    createTable : 'CREATE TABLE name ('
        + 'id int(10) unsigned NOT NULL, '
        + 'name varchar(64) DEFAULT NULL, '
        + 'PRIMARY KEY (id) '
        + ') ENGINE=InnoDB DEFAULT CHARSET=utf8',
    dropTable : 'DROP TABLE IF EXISTS name',

    insert : 'INSERT INTO name (id, name) VALUES (?, ?)',
    select : 'SELECT * FROM name WHERE id = ?'

};

var config = {
    spawnCount : 100,
    sqlCommands : sqlCommands
};


var connection = mysql.createConnection(dbConfig);

connection.connect();

var runBenchmark = function (connection, config, benchModule, callback) {

    var setup = function (cb) {
        connection.query(config.sqlCommands.dropTable, function (err) {
            if (err) {
                console.log('on drop table:' + err);
                process.exit(1);
            }
            connection.query(config.sqlCommands.createTable, function (err) {
				if (err) {
					console.log('on create table:' + err);
					process.exit(1);
				}
				cb();
            });
        });
    };

    var runLoop = function (i) {
    };

    setup(function () {
        runLoop(config.spawnCount);
	});
};

runBenchmark(connection, config, benchmarkModules.mysql, function (reports) {
    console.log(reports);
});

