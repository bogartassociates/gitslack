var express = require('express');
var app = express();
var bodyParser = require("body-parser");
var router = express.Router();
var OAuth2 = require("oauth").OAuth2;
var GitHubApi = require("github");

var token ="63f7060a650618969d07dccc012243a07f9afd8a";
var github = new GitHubApi({
	version: "3.0.0",
	debug: true,
	protocol: "https",
	host: "api.github.com",
	timeout: 5000,
	headers: {
		"user-agent": "GitSlackBAI"
	}
});

app.use(bodyParser.urlencoded({extended: false}));

function authenticateGitHubAPI() {
	github.authenticate({
		type: "oauth",
                token: "63f7060a650618969d07dccc012243a07f9afd8a"
        });
}

function addUserToTeam(params, res) {
	var usage = "Invalid parameters. Usage:\n\t";
	usage += "/gitslack addUserToTeam [team-id] [github-username]";
	usage += "\nUse listAvailableTeams to get team ids";
	authenticateGitHubAPI();
	if (params.length != 2) {
		res.send(usage);
		return;
	}
	github.orgs.addTeamMembership({
		id: params[0],
		user: params[1]
	}, function (err, results) {
		if (err != null) {
			res.send(err.message);
		} else {
			if (results.state == 'active') {
				res.send(params[1] + " added as member to the team with id " + params[0] + ".");
			} else if (results.state == 'pending') {
				res.send(params[1] + " was invited to join the team with id " + params[0] + " and " +
						"must accept the invite to become active");
			}
		}
	});
}

function getTeamMembers(params, res) {
	var usage = "Invalid parameters. Usage:\n\t";
	usage += "/gitslack listTeamMembers [team-id]";
	usage += "\nUse listAvailableTeams to get team ids";
	if (params.length != 1) {
		res.send(usage);
		return;
	}
	var id = params.shift();
	authenticateGitHubAPI();
	github.orgs.getTeamMembers({
		id: id
	}, function (err, result) {
		if (err != null) {
			res.send(err.message);
		} else {
			var members = "Team Members:";
			result.forEach(function(member) {
				members += "\n\t" + member.login;
			});
			res.send(members);
		}
	});		
}


function createNewRepo(params, res) {
	var usage = "Invalid parameters. Usage\n\t";
	usage += "/gitslack createNewRepo [name] [team-id] [private (true|false)] [description]";
	usage += "\nUse listAvailableTeams to get team ids";
	
	if (params.length < 4) {
		res.send(usage);
		return;
	}

	var name = params.shift();
	var team_id = params.shift();
	var privrepo = params.shift();
	var isprivate = false;
	if (privrepo == "true"){
		isprivate = true;
	} else {
		isprivate = false;
	}
	var desc = params.join(' ');
	authenticateGitHubAPI();
	github.repos.createFromOrg({
		org: "bogartassociates",
		name: name,
		team_id : team_id,
		private : isprivate,
		description: desc
	}, function(err, results) {
		if (err != null) {
			var obj = JSON.parse(err);
			res.send("Could not create repo - " + obj.message);
		} else {
			res.send("Repository named " + results.name + " was created with id " + results.id + ".");
		}
	});
}
function addTeamToRepo(params, res) {
	var usage = "Invalid parameters. Usage:\n\t";
	usage += "/gitslack addTeamToRepo [team-id] [repo-name]";
	usage += "\nUse listAvailableTeams for team ids.";
	
	if (params.length != 2) {
		res.send(usage);
		return;
	}

	var id = params.shift();
	var repo = params.shift();

	github.orgs.addTeamRepo({
		id: id,
		repo: repo,
		user: "bogartassociates"
	}, function(err, results) {
		if (err != null) {
			var obj = JSON.parse(err);
			res.send("Could not add team to repo - " + obj.message);
		} else {
			res.send("Team added to repository");
		}
	});
}
function getTeamRepos(params, res) {
	var usage = "Invalid parameters. Usage:\n\t";
	usage += "/gitslack listTeamRepos [team-id]";
	usage += "\nUse listAvailableTeams to get team ids";
	authenticateGitHubAPI();
	if (params.length != 1) {
		res.send(usage);
		return;
	}

	var id = params.shift();
	github.orgs.getTeamRepos({
		id: id
	}, function(err, result) {
		if (err != null) {
			var obj = JSON.parse(err);
			res.send("Could not get repos - " + obj.message);
		} else {
			var repos = "Team Repositories:";
			result.forEach(function(repo) {
				repos += "\n\t" + repo.name + " [ " + repo.id + "].";
			});
				res.send(repos);
		}
	});
		
}
function createNewTeam(params, res) {
	authenticateGitHubAPI();
	//team name
	var name = params.shift();
	var repos = [];
	if (params.length > 0) {
		repos =params;
	}
	github.orgs.createTeam({
		org: "bogartassociates",
		permission: "admin",
		name: name,
		repo_names: repos
	}, function (err, result) {
		if (err != null) {
			var obj = JSON.parse(err);
			res.send("Could not create team - " + obj.message);
		} else {
			if (result.meta.status == '201 Created') {
				res.send(result.name + " created as a team for organization with id " + result.id + "."); 
			} else {
				res.send("Something went really wrong");
			}
		}
	});
		
}

function listAvailableTeams(params,  res) {
	authenticateGitHubAPI();
	github.orgs.getTeams({
		org: "bogartassociates",
	}, function(err, result) {
		if (err != null) {
			res.send(err.message);
		} else {
			var teams="Available Teams:";
			result.forEach(function(obj) {
				if (obj.name != 'Owners' && obj.name != 'Admins' && obj.name != 'Team Managers') {
					teams += "\n\t" + obj.name + " [" + obj.id + "]";
				}
			});

			res.send(teams);
		}
	});
}

function validCommands() {
	var validCommands = "Valid Commands:\n\t [Team Commands] - addUserToTeam|createNewTeam|listAvailableTeams|listTeamMembers\n\t";
	validCommands += "[Repository Commands] - addTeamToRepo|createNewRepo|listAvailableRepos";
	
	return validCommands;
}
router.post("/", function(req,res) {
	//verify the token. If this is wrong goaway
	var slackToken='NYP8xc8EY5oHUTV4f4dQRI4c'
	if (req.body.token == slackToken) {
		var params = req.body.text.split(" ");
		var cmd = params.shift();

		switch(cmd) {
			case 'addUserToTeam':
				addUserToTeam(params, res);
				break;
			case 'listAvailableTeams':
				listAvailableTeams(params, res);
				break;
			case 'createNewTeam':
				createNewTeam(params, res);
				break;
			case 'listTeamMembers':
				getTeamMembers(params, res);
				break;
			case 'addTeamToRepo':
				addTeamToRepo(params, res);
				break;
			case 'createNewRepo':
				createNewRepo(params, res);
				break;
			case 'listTeamRepos':
				getTeamRepos(params, res);
				break;
			case 'help':
				res.send(validCommands());
				break;
			default:
				res.send("Invalid command sent." + validCommands());
				break;
		}		
	} else {
		res.send("Unauthorized Request: Denied!");
		return;
	}
});

app.use("/gitslack", router);
app.listen(3000);
console.log("listening on port 3000");
