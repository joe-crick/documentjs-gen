'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');

var fileWriter = {
	_yeoman: null,
	/**
	 * @description Set the Project Prefix in files
	 * @param contents
	 * @param tag
	 * @param value
	 * @returns {string}
	 */
	_replaceTag: function replaceTag(contents, tag, value) {
		var regEx = new RegExp("~" + tag + "~", "g");
		return contents.replace(regEx, value);
	},
	/**
	 * @description Writes a file based on a template
	 */
	writeConfigurationFile: function writeFile() {
		var yo = this._yeoman;
		var context = this;
		var configFile = 'documentjs.json';
		var fileTypes = '{' + yo.props.fileTypes.join(',') + '}';
		var folders = yo.props.folders.split(';');
		var folderMask = "[";
		var len = folders.length;

		while (len--) {
			folderMask = '"' + folders[len] + "/**/*." + fileTypes + '"' + len > 0 ? ',' : ']';
		}

		yo.fs.copy(
			yo.templatePath('_' + configFile),
			yo.destinationPath('/' + configFile),
			{
				process: function (contents) {
					var fileString = contents.toString();
					fileString = context._replaceTag(fileString, 'FILE-MASK', fileTypes);
					return context._replaceTag(fileString, 'DEST', yo.props.destFolder);
				}
			}
		);
	},
	/**
	 * @description initializes the file writer applying the name value to the functions
	 * @param yo
	 */
	init: function init(yo) {
		this._yeoman = yo;
	}
};

module.exports = yeoman.generators.Base.extend({

	prompting: function () {
		var done = this.async();

		var prompts = [
			{
				type: 'checkbox',
				name: 'fileTypes',
				message: 'What type of files should DocumentJS document?',
				choices: ['css', 'sass', 'less', 'md'],
				default: 'css'
			},
			{
				type: 'input',
				name: 'folders',
				message: 'Under what folder(s) will your stylesheets reside [separate folders with a semicolon (;)]?'
			},
			{
				type: 'input',
				name: 'destFolder',
				message: 'DocumnentJS will create your documentation site in its own folder. What would you like to call this folder?'
			}
		];

		this.prompt(prompts, function (props) {
			this.props = props;
			done();
		}.bind(this));
	},

	installingDocumentJs: function () {

		if (!this.fs.exists('package.json')) {
			var spawn;
			var context = this;
			spawn = this.spawnCommand('npm', ['init', '-f']);
			spawn.on('close', function () {
				context.spawnCommand('npm', ['i', 'documentjs', '--save-dev']);
			});
		}

	},

	writingConfig: function () {

		this.log('Setting up DocumentJS...');

		fileWriter.init(this);
		fileWriter.writeConfigurationFile();
	}

});
