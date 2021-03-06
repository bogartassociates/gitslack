# gitslack
Gitslack is a nodeJS Slack slash-command integration with the chat/collaboration tool Slack! It allows members of GitHub repositories to perform various functions in a corporate GitHub account that would not otherwise be available without administrative privileges on the account. 

##Usage

```bash
/gitslack cmd [param 1] [param 2]... [param 3]
```

###List Available Teams
Returns team names with id.
```bash
/gitslack listAvailableTeams
```

###Add Github User To Team and Organization
Get the team-id from listAvailable Teams.
```bash
/gitslack addUserToTeam [team-id] [github-username]
```

###List Team Members
```bash
/gitslack listTeamMembers [team-id]
```

###Create New Team
```bash
/gitslack createNewTeam [team-name]
```

###Create New Repository
```bash
/gitslack createNewRepo [name] [team-id] [private (true|false)] [description]
```

###List Team Repositories
```bash
/gitslack listTeamRepos [team-id]
```

###Add Team To Repository
```bash
/gitslack addTeamToRepo [team-id] [repository-name]
```

