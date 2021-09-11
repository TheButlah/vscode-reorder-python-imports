import assert from 'assert';
import { readFile } from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';
import execPromise from '../../execPromise';
import { getWorkspaceFolderUri, getVenvActivateCmd } from './testUtils';

const pyFiles = [
    'comment-in-imports.py',
    'license-comment.py',
    'needs-reordering.py',
    'no-eol.py',
    'no-reorder-all.py',
    'no-reorder-inline.py',
    'noreorder-not-at-beginning.py',
    'trivial.py',
];

const args = [
    '"--add-import from __future__ import absolute_import"',
    '"--add-import from __future__ import division"',
    '"--add-import from __future__ import print_function"',
];

const suiteDesc = 'Reorder Imports Provider - same as cli';
suite(suiteDesc, () => {
    vscode.window.showInformationMessage('Testing ' + suiteDesc);

    pyFiles.forEach((fileName) => {
        const filePath = path.join(
            getWorkspaceFolderUri('test-folder').fsPath,
            fileName
        );

        test(fileName, async () => await compareCodeActionAndCli(filePath));

        test(`${fileName} with args`, async () => {
            await compareCodeActionAndCli(filePath, args);
        });
    });
});

const compareCodeActionAndCli = async (filePath: string, args = ['']) => {
    const input = await readFile(filePath).then((buffer) => buffer.toString());
    const withCli = await reorderWithCli(input, args);
    const withCodeAction = await reorderWithCodeAction(input, args);

    assert(withCli === withCodeAction);
};

const reorderWithCodeAction = async (
    input: string,
    args: string[]
): Promise<string> => {
    const settings = vscode.workspace.getConfiguration();
    settings.update('reorder-python-imports', { args });

    const doc = await vscode.workspace.openTextDocument({
        content: input,
        language: 'python',
    });

    try {
        await vscode.window.showTextDocument(doc);
    } catch (error) {
        console.log(error);
        throw error;
    }

    await vscode.commands.executeCommand(
        'reorder-python-imports.reorderImports'
    );

    return doc.getText();
};

const reorderWithCli = async (
    input: string,
    args: string[]
): Promise<string> => {
    const venvActivateCmd = getVenvActivateCmd(
        `${getWorkspaceFolderUri('test-folder').fsPath}/venv`
    );
    const reorderCmd = `reorder-python-imports ${args.join(' ')} -`;
    let { stdout: withCli } = await execPromise(
        `"${venvActivateCmd}" && ${reorderCmd}`,
        input
    );

    // fix for weird windows cli output
    withCli = withCli.replace(/\r\r/g, '\r');

    return withCli;
};
