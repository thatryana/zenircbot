var redis_lib = require('redis');
var sub = redis_lib.createClient();
var pub = redis_lib.createClient();
var sys = require('sys')
var exec = require('child_process').exec;
var bot_config = require('../config');
var config = require('./admin_config');
var service_regex = new RegExp(bot_config.nick + ': restart (.*)');

function puts(error, stdout, stderr) { sys.puts(stdout) }

pub.publish('out', JSON.stringify({
    channel: config.channel,
    message: 'admin online',
}));

sub.subscribe('in');
sub.on('message', function(channel, message){
    msg = JSON.parse(message)
    if (msg.version == 1 && msg.type == 'privmsg') {
	if (msg.data.sender == bot_config.admin) { 
	    if (msg.data.message == bot_config.nick + ': restart') {
		restart();
	    } else if (service_regex.test(msg.data.message)) {
		result = service_regex.exec(msg.data.message);
		restart_service(result[1]);
	    } else if (msg.data.message == bot_config.nick + ': pull') {
		git_pull();
	    }
	}
    }
	
});

function restart() {
    pub.publish('out', JSON.stringify({
	channel: config.channel,
	message: 'brb!',
    }));
    exec("fab zenbot restart", puts);
}

function restart_service(service) {
    pub.publish('out', JSON.stringify({
	channel: config.channel,
	message: 'restarting ' + service,
    }));
    exec("fab zenbot service:" + service, puts);
}

function git_pull() {
    pub.publish('out', JSON.stringify({
	channel: config.channel,
	message: 'pulling down new code',
    }));
    exec("git pull", puts);
}
