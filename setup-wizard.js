const inquirer = require("inquirer");
const fs = require('fs');
const yaml = require('yamljs');

const questions = [
    {
        type: 'input',
        name: 'skillName',
        message: 'Please enter the name of your skill:\t',
        default: 'i.e. small-talk'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Please enter the author\'s name\t',
        default: 'Your name'
    },
    {
        type: 'confirm',
        name: 'pushScript',
        message: 'Do you want to setup your Bluemix deployment credentials?'
    },
    {
        when: function(response) {
            return response.pushScript;
        },
        type: 'input',
        name: 'hostName',
        message: 'Please enter your host name\t',
        default: 'If the address is small-talk.mybluemix.net it would be small-talk'
    },
    {
        when: function(response) {
            return response.pushScript;
        },
        type: 'input',
        name: 'domainName',
        message: 'Please enter your domain name\t',
        default: 'If the address is small-talk.mybluemix.net it would be mybluemix.net'
    },
    {
        when: function(response) {
            return response.pushScript;
        },
        type: 'input',
        name: 'spaceName',
        message: 'Please enter your Bluemix space name\t',
        default: 'i.e. dev, test, prod'
    },
    {
        when: function(response) {
            return response.pushScript;
        },
        type: 'input',
        name: 'organization',
        message: 'Please enter your Bluemix organization name\t'
    },
    {
        type: 'confirm',
        name: 'WCSCredentials',
        message: 'Do you want to enter your WCS credentials?\t',
    },
    {
        when: function(response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'WCSUrl',
        message: 'Please enter your WCS url:\t',
        default: 'i.e. https://gateway.watsonplatform.net/conversation/api'
    },
    {
        when: function(response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'WCSUsername',
        message: 'Please enter your WCS username:\t'
    },
    {
        when: function(response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'WCSPassword',
        message: 'Please enter your WCS password:\t'
    },
    {
        when: function(response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'version',
        message: 'Please enter your WCS version:\t',
        default: 'e.g. v1'
    },

    {
        when: function (response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'versionDate',
        message: 'Please enter your WCS version date:\t',
        default: 'e.g. 2017-04-21'
    },
    {
        when: function (response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'workspaceID',
        message: 'Please enter your WCS workspace id:\t',
    },
    {
        when: function (response) {
            return response.WCSCredentials;
        },
        type: 'input',
        name: 'workspaceName',
        message: 'Please enter your WCS workspace name:\t',
    },

    {
        type: "checkbox",
        name: "nlu",
        message: "What nlu engines will your skill use?\t",
        choices: ['wcs', 'regexp','skill'],
        default: 'select using space button'
    }
];

inquirer.prompt(questions).then(function(response) {
    let skillName = response.skillName;
    let author = response.author;
    let nlu = response.nlu;

    // create manifest.json file
    fs.readFile('res/assets/manifest.json', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        let manifestJSON = JSON.parse(data);
        manifestJSON.author = author;
        manifestJSON.nlu = nlu;
        fs.writeFile('res/assets/manifest.json', JSON.stringify(manifestJSON, null, 2), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Manifest json saved');
        });
    });
    if (response.WCSCredentials) {
        //create wcs.json file
        let version = response.version;
        let WCSUrl = response.WCSUrl;
        let WCSPassword = response.WCSPassword;
        let WCSUsername = response.WCSUsername;
        let versionDate = response.versionDate;
        let workspaceID = response.workspaceID;
        let workspaceName = response.workspaceName;
        let WCSJSON = {
            'workspace': {
                'en-US': {
                    'name': workspaceName,
                    'workspace_id': workspaceID
                }
            },
            'credentials': {
                'url': WCSUrl,
                'version': version,
                'version_date': versionDate,
                'password': WCSPassword,
                'username': WCSUsername
            }
        };
        fs.writeFile('res/nlu/wcs.json', JSON.stringify(WCSJSON, null, 2), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('WCS json saved');
        });
    }

    if(response.pushScript) {
        let organization = response.organization;
        let spaceName = response.spaceName;
        let manifestYaml = yaml.load('manifest.yml');
        manifestYaml.applications[0].name = skillName;
        manifestYaml.applications[0].host = response.hostName;
        manifestYaml.applications[0].domain = response.domainName;
        fs.writeFile('manifest.yml', yaml.stringify(manifestYaml, 4), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Manifest yml saved');
        });

        let pushScript = 'YML="manifest.yml"\n\nSPACE="' + spaceName + '"\n\nORGANIZATION="' + organization + '"\n\nbx target -s $SPACE -o $ORGANIZATION\nbx app push -f $YML';
        fs.writeFile('push.sh', pushScript, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log('Push script saved');
        });
    }

    setTimeout(function() {
        console.log('\n-----------  Your skill is ready to go!  ------------\n');
    }, 500);
});
