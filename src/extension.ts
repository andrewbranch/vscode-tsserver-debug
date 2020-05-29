import * as vscode from "vscode";
import { findFreePort } from "./lib/findFreePort";

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging", restartWithDebuggingEnabled),
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging-brk", () => restartWithDebuggingEnabled(true)),
	);
}

async function restartWithDebuggingEnabled(brk?: boolean) {
	const port = String(await findFreePort(9559, 1000, 1000));
	const varName = brk ? 'TSS_DEBUG_BRK' : 'TSS_DEBUG';
	const saveValue = process.env[varName];
	process.env[varName] = port;
	try {
		await vscode.commands.executeCommand("typescript.restartTsServer");
		return vscode.window.showInformationMessage(`TS Server listening on port ${port}.`);
	} catch {
		return vscode.window.showWarningMessage(`TS Server was not running. If this window starts TS Server later, it will start listening on port ${port}.`);
	} finally {
		process.env[varName] = saveValue;
	}
}

// this method is called when your extension is deactivated
export function deactivate() { }
