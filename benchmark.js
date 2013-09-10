"use strict";

var util = require('util'),
	mysql = require('mysql');

var benchmarkCount = 10000;

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

    insert : {
		sql : 'INSERT INTO name (id, name) VALUES (?, ?)',
		parameter : function (i) {
			return [ i, 'name' + i ];
		}
	},
    select : {
		sql : 'SELECT * FROM name WHERE id = ?',
		parameter : function (i) {
			return [ i ];
		}
	}
};


var connection = mysql.createConnection(dbConfig);

connection.connect();

var runBenchmark = function (connection, benchmarkCount, sqlCommand, callback) {

    var setup = function (cb) {
        connection.query(sqlCommands.dropTable, function (err) {
            if (err) {
                console.log('on drop table:' + err);
                process.exit(1);
            }
            connection.query(sqlCommands.createTable, function (err) {
				if (err) {
					console.log('on create table:' + err);
					process.exit(1);
				}
				cb();
            });
        });
    };

    var runLoop = function (i, cb) {
		if (i < benchmarkCount) {
			connection.query(sqlCommand.sql, sqlCommand.parameter(i), function (err, r) {
				if (err) {
					console.log('on benchmark loop:' + err);
					process.exit(1);
				}
				runLoop(i + 1, cb);
			})
		} else {
			//end
			cb();
		}
    };

    setup(function () {
		var startTime = new Date();
        runLoop(0, function () {
			var endTime = new Date();
			console.log(util.format('Duration: %d ms', endTime - startTime));
			callback();
		});
	});
};

console.log('start insert');
runBenchmark(connection, benchmarkCount, sqlCommands.insert, function () {
	console.log('start select');
	runBenchmark(connection, benchmarkCount, sqlCommands.select, function () {
		console.log('done!');
	});

});

