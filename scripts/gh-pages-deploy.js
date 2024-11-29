const { exec } = require('child_process');
const ghpages = require('gh-pages');
const path = require('path');

function getCommitMessage(command) {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(`Error: ${stderr || error.message}`);
				return;
			}
			resolve(stdout.trim());
		});
	});
}

async function deploy() {
	try {
		// Predeploy check has ran so we assume we have a valid tag
		const commitMessage = await getCommitMessage('git tag --points-at HEAD');

		ghpages.publish(
			path.join(__dirname, '../build'),
			{message: commitMessage},
			(err) => {
				if(err)
					console.error('Deployment failed:', err);
				else
				 console.log('Deployment successful with message:', commitMessage);
			}
		);
	} catch (error) {
		console.error('Failed to get commit message:', error);
	}
}

deploy();
