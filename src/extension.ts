import * as vscode from "vscode";
import { findFreePort } from "./lib/findFreePort";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging", restartWithDebuggingEnabled)
	);
}

async function restartWithDebuggingEnabled() {
	const config = vscode.workspace.getConfiguration("tsserver-debug");
	const timeout = Math.max(1000, config.get("discoveryTimeout", 3000));
	const debugPort = config.get("debugPort", 9559);
	const port = await findFreePort(debugPort, 1000, timeout);
	if (port) {
		process.env.TSS_DEBUG = String(port);
		try {
			await vscode.commands.executeCommand("typescript.restartTsServer");
			await vscode.window.showInformationMessage(`TS Server listening on port ${port}.`);
		} catch {
			await vscode.window.showWarningMessage(`TS Server was not running. If this window starts TS Server later, it will start listening on port ${port}.`);
		}
	}
	else {
		await vscode.window.showErrorMessage(`Timeout elapsed prior to discovering an open port to use for debugging.`);
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
