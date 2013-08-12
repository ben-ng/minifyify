/*!
 * Google Closure Compiler wrapper.
 * https://github.com/Darsain/node-gcc
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/MIT
 */
'use strict';

var child = require('child_process');
var fs = require('fs');
var path = require('path');
var compilerPath = path.normalize(path.join(__dirname, '..', 'bin', 'compiler.jar'));
exports.java = 'java';
exports.defaults = {
	compilation_level: 'SIMPLE_OPTIMIZATIONS'
};
var ignoreOptions = [
	'js_output_file'
];

/**
 * Check whether the value is a function.
 *
 * @param  {Mixed}  value
 *
 * @return {Boolean}
 */
function isFunction(value) {
	return value && {}.toString.call(value) === '[object Function]';
}

/**
 * Turn everything to array.
 *
 * @param  {Mixed}  value
 *
 * @return {Array}
 */
function toArray(value) {
	return Array.isArray(value) ? value : [value];
}

/**
 * Google Closure Compiler wrapper.
 *
 * @param  {Mixed}    src      File path or an array of file paths.
 * @param  {String}   dest     Destination file path. Ommiting will output the code in callback's stdout.
 * @param  {Object}   opts     Object with options. Extends default options.
 * @param  {Function} callback Callback function. Arguments: error, stdout, stderr
 *
 * @return {Void}
 */
exports.compile = function (src, dest, opts, callback) {
	var options = {};
	var args = ['-jar', compilerPath];
	var destStream = false;
	var captureOutput = false;
	var stdout = '';
	var stderr = '';

	// Optional arguments logic
	if (typeof dest !== 'string') {
		callback = opts;
		opts = dest;
		dest = false;
	}
	if (isFunction(opts)) {
		callback = opts;
		opts = false;
	}

	// Terminate if no destination and callback
	if (!dest && !isFunction(callback)) {
		return;
	}

	// Set source files
	toArray(src).forEach(function (file) {
		args.push('--js');
		args.push(file);
	});

	// Extend options
	Object.keys(exports.defaults).forEach(function (key) {
		options[key] = exports.defaults[key];
	});
	if (opts) {
		Object.keys(opts).forEach(function (key) {
			options[key] = opts[key];
		});
	}

	// Parse options into arguments array
	if (typeof options === 'object') {
		Object.keys(options).forEach(function (key) {
			// Ignore options that break stuff
			if (ignoreOptions.indexOf(key) !== -1) {
				return;
			}
			// Add option to the arguments
			toArray(options[key]).forEach(function (value) {
				args.push('--' + key);
				if (typeof value === 'string') {
					args.push(value);
				}
			});
		});
	}

	// Set callback falgs
	if (isFunction(callback)) {
		captureOutput = true;
	}

	// Create destination stream
	if (dest) {
		destStream = fs.createWriteStream(dest, { flags: 'w', encoding: 'utf-8' });
		destStream.on('error', function (error) {
			if (error.errno !== 0) {
				throw error;
			}
		});
	}

	// Spawn compilation process
	var compilation = child.spawn(exports.java, args);
	compilation.stdout.setEncoding('utf8');
	compilation.stderr.setEncoding('utf8');

	// Capture stdout if needed
	if (captureOutput || destStream) {
		compilation.stdout.on('data', function (data) {
			if (captureOutput) {
				stdout += data;
			}
			if (destStream) {
				destStream.write(data);
			}
		});
	}

	// Capture stderr
	compilation.stderr.on('data', function (data) {
		stderr += data;
	});

	// End streams and fire callback
	compilation.on('close', function (code) {
		var error = null;
		if (code !== 0) {
			error = new Error(stderr);
			error.code = code;
		}

		// Close destination stream
		if (destStream) {
			destStream.end();
		}

		// Execute callback
		if (captureOutput) {
			callback(error, stdout, stderr);
		} else if (error) {
			throw error;
		}
	});

	// Return the compilation process
	return compilation;
};