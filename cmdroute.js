var fs = require('fs');
var path = require('path');
var util = require('util');

var optionator = require('optionator');


var manifest = {
	name: '<module>',
	version: ''
};
var argParser = optionator({
	prepend: 'Usage: ' + manifest.name + ' [command] [options]',
	options: [
		{
			option: 'help',
			alias: 'h',
			type: 'Boolean',
			description: 'Displays help'
		},
		{
			option: 'version',
			alias: 'v',
			type: 'Boolean',
			description: 'Displays version'
		}
	]
});


function init(mnfst) {
	manifest = mnfst;

	return module.exports;
}


function exec(argv) {
	var args, cmd, command, resolved, result;

	argv = argv.slice();

	if (argv[2] && argv[2].charAt(0) !== '-') {
		cmd = argv.splice(2, 1)[0];
	}

	if (!cmd) {
		args = argParser.parse(argv);

		if (args.help) {
			showHelp();
			process.exit(0);
		}

		if (args.version) {
			util.puts(manifest.name + ' ' + manifest.version);
			process.exit(0);
		}
	}

	resolved = path.resolve(path.join(__dirname, 'commands', cmd + '.js'));
	command = require(resolved);
	result = command.main(process.argv);

	if (typeof result === 'string') {
		util.puts(result);
	}

	if (command.persist !== true) {
		process.exit(0);
	}
}


function help() {
	var i, dir, dirname, filename, files, name;

	dirname = path.resolve(path.join(__dirname, 'commands'));
	dir = fs.readdirSync(dirname);
	files = [];

	for (i = 0; i < dir.length; i++) {
		filename = path.join(dirname, dir[i]);

		if (!fs.statSync(filename).isDirectory()) {
			name = path.basename(filename, path.extname(filename));
			files.push(name);
		}
	}

	util.puts(argParser.generateHelp());
	util.puts('\nAvailable commands:');

	for (i = 0; i < files.length; i++) {
		util.puts('  ' + files[i]);
	}
}


module.exports = {
	exec: exec,
	help: help,
	init: init
};
