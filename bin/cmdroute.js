var fs = require('fs');
var path = require('path');
var util = require('util');

var optionator = require('optionator');


var argParser, manifest, root;


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

	try {
		resolved = path.resolve(path.join(root, 'commands', cmd + '.js'));
	}
	catch(ex) {
		util.puts('Command directory not found.');
		process.exit(0);
	}

	try {
		command = require(resolved);
	}
	catch(ex) {
		util.puts('Command `' + cmd + '` not found.');
		process.exit(0);
	}

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

	try {
		dirname = path.resolve(path.join(root, 'commands'));
	}
	catch(ex) {
		util.puts('Command directory not found.');
		process.exit(0);
	}

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


module.exports = function(mnfst, rt) {
	manifest = mnfst;
	root = rt;
	argParser = optionator({
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

	return {
		exec: exec,
		help: help
	};
};
