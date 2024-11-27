const { exec } = require('child_process');

function fail(msg) {
	console.log(msg);
	process.exit(1)
}

exec('git tag --points-at HEAD', 
	(err, stdout, stderr) => {
		if(err)
			fail('Predeploy check failed: git process returned error below\n' + err);
		if(stdout === '')
			fail(
				'Predeploy check failed: there is no release tag at the current commit. ' + 
				'Create a tag named \'vX.Y.Z\' on the current commit and ensure the changes ' +
				'from the latest version are listed in the changelog.'
			);
		const trimmed = stdout.substring(0, stdout.length - 1);
		if(!/^v\d+\.\d+\.\d+$/.test(trimmed))
			fail(
				'Predeploy check failed: the release tag is named incorrectly. ' + 
				'Create a tag named \'vX.Y.Z\' on the current commit and ensure the changes ' +
				'from the latest version are listed in the changelog.'
			);
		console.log('Deploying version tagged as ' + trimmed);
	}
);