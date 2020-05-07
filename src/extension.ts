// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ReorderImportsProvider } from './reorderImportsProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
    console.log('"reorder-python-imports" is now active.');

    let reorder_provider = new ReorderImportsProvider();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let reorder_command = vscode.commands.registerTextEditorCommand(
        'reorder-python-imports.reorderImports',
        reorder_provider.reorderImports
    );
    context.subscriptions.push(reorder_command);

    let reorder_code_action = vscode.languages.registerCodeActionsProvider(
        { language: 'python' },
        reorder_provider,
        {
            providedCodeActionKinds: [
                vscode.CodeActionKind.SourceOrganizeImports,
            ],
        }
    );
    context.subscriptions.push(reorder_code_action);
}

// this method is called when your extension is deactivated
export function deactivate() {
    console.log('"reorder-python-imports" is no longer active.');
}
