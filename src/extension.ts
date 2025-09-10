import * as vscode from "vscode";
import { findFreePort } from "./lib/findFreePort.js";

const tsserverPattern = /[\\/]tsserver\.js\b/;
const syntaxServerPattern = / --serverMode (?:partialSemantic|syntactic)\b/i;

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging", restartWithDebuggingEnabled),
		vscode.commands.registerCommand("io.wheream.vscode-tsserver-debug.restart-with-debugging-brk", () => restartWithDebuggingEnabled(true)),
	);
}

async function restartWithDebuggingEnabled(brk?: boolean) {
	const config = vscode.workspace.getConfiguration("tsserver-debug");
	const timeout = Math.max(1000, config.get("discoveryTimeout", 3000));
	const debugPort = config.get("debugPort", 9559);
	const port = await findFreePort(debugPort, 1000, timeout);
	if (port) {
		const varName = brk ? "TSS_DEBUG_BRK" : "TSS_DEBUG";
		const saveValue = process.env[varName];
		process.env[varName] = String(port);
		try {
			await vscode.commands.executeCommand("typescript.restartTsServer");
			const { semantic } = await findTSServerProcesses();
			return vscode.window.showInformationMessage(`TS Server listening on port ${port}${semantic ? ` (PID: ${semantic.pid})` : ""}.`);
		} catch {
			return vscode.window.showWarningMessage(`TS Server was not running. If this window starts TS Server later, it will start listening on port ${port}.`);
		} finally {
			process.env[varName] = saveValue;
		}
	} else {
		await vscode.window.showErrorMessage(`Timeout elapsed prior to discovering an open port to use for debugging.`);
	}
}

async function findTSServerProcesses() {
	const psList = (await import("ps-list")).default;
	const candidates = (await psList()).filter(p => p.cmd && p.ppid === process.pid && tsserverPattern.test(p.cmd));
	const syntax = candidates.find(p => syntaxServerPattern.test(p.cmd!));
	const semantic = candidates.length === 2 && syntax
		? candidates[+!candidates.indexOf(syntax)]
		: candidates.find(p => !syntaxServerPattern.test(p.cmd!));
	return { syntax, semantic };
}

// this method is called when your extension is deactivated
export function deactivate() { }
