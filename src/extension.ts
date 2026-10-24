import * as vscode from "vscode";
import { analyzeSource, formatSmells } from "./logic/index.js";

export function activate(context: vscode.ExtensionContext) {
  const run = vscode.commands.registerCommand("querylens.analyzeActive", async () => {
    const ed = vscode.window.activeTextEditor;
    if (!ed) {
      vscode.window.showWarningMessage("No active editor");
      return;
    }
    const smells = analyzeSource(ed.document.getText());
    const doc = await vscode.workspace.openTextDocument({
      content: `# QueryLens\n\n${formatSmells(smells)}\n`,
      language: "markdown",
    });
    await vscode.window.showTextDocument(doc, { preview: true });
  });
  context.subscriptions.push(run);
}

export function deactivate() {}
