/*
 * tst.concurrent.js: tests concurrent jobs
 */

var vasync = require('vasync');

var test = require('../common');
var jobs = require('./jobs');
var client;

var tests = [ jobs.jobM, jobs.jobR, jobs.jobMM, jobs.jobMR, jobs.jobMMRR ];

test.pipeline({ 'funcs': [
    setup,
    runTests,
    teardown
] });

function setup(_, next)
{
	test.setup(function (c) {
		client = c;
		next();
	});
}

function runTests(_, next)
{
	var timeout = tests.reduce(function (sum, testjob) {
		return (sum + testjob['timeout']);
	}, 0);

	test.log.info('using timeout = %s', timeout);

	tests.forEach(function (testjob) {
		testjob['timeout'] = timeout;
	});

	vasync.forEachParallel({
	    'inputs': tests,
	    'func': function (testjob, callback) {
		jobs.populateData(testjob['inputs'], function () {
		    jobs.jobTestRun(client, testjob, callback);
		});
	    }
	}, next);
}

function teardown(_, next)
{
	test.teardown(client, next);
}
