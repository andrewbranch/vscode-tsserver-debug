import * as vscode from "vscode";
import { findFreePort } from "./lib/findFreePort";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging", restartWithDebuggingEnabled)
	);
}

async function restartWithDebuggingEnabled() {
	const port = String(await findFreePort(9559, 1000, 1000));
	process.env.TSS_DEBUG = port;
	try {
		await vscode.commands.executeCommand("typescript.restartTsServer");
		return vscode.window.showInformationMessage(`TS Server listening on port ${port}.`);
	} catch {
		return vscode.window.showWarningMessage(`TS Server was not running. If this window starts TS Server later, it will start listening on port ${port}.`);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
