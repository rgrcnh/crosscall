// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { strict } from 'assert';
import * as vscode from 'vscode';
import { API as GitAPI, GitExtension, APIState, BranchQuery, UpstreamRef } from './git'; 

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "crosscall" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('crosscall.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from crosscall!');
		gitInteract();
	});

	context.subscriptions.push(disposable);
}

async function gitInteract() {
	const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git')?.exports;
	if (gitExtension) {
		const api = gitExtension.getAPI(1);
		const repo = api.repositories[0];
		const head = repo.state.HEAD;
		if (head) {
			// Get the branch and commit 
			console.log("How is the content of repo.state.HEAD");
			console.log(JSON.stringify(head));
			const {commit,upstream, name: branch} = head;
			
			if (branch) {
				let up : UpstreamRef|undefined = upstream;
				if (up) {
					console.log(`Remote name: ${up.remote}`);
				}
				// Get head of any other branch
				const mainBranch = 'master';
				const branchDetails = await repo.getBranch(mainBranch);

				// Get last merge commit
				const lastMergeCommit = await repo.getMergeBase(branch, mainBranch);

				const status = await repo.status();
				console.log({ branch, commit, lastMergeCommit, needsSync: lastMergeCommit !== commit });

				console.log('List specific commit');
				const mycommit = await repo.getCommit('95a12fd7020351a22d3e3d239b2406a8f6299e18');
				console.log(JSON.stringify(mycommit));
				
				console.log('List branches');
				const q:BranchQuery = {remote:false};

				console.log(JSON.stringify(await api.repositories[0].getBranches(q)));	
				console.log(JSON.stringify(await api.repositories[0].getConfigs()));

				let remoteName = '';
				try { 
					console.log('Trying with main branch as main');
					remoteName = await api.repositories[0].getConfig(`branch.main.remote`);
					console.log(await api.repositories[0].getConfig(`remote.${remoteName}.url`));
				} catch {
					console.log('Trying with main branch as master');
					remoteName = await api.repositories[0].getConfig(`branch.master.remote`);
					console.log(await api.repositories[0].getConfig(`remote.${remoteName}.url`));
				}
			}
		}
	}
}
// This method is called when your extension is deactivated
export function deactivate() {}
