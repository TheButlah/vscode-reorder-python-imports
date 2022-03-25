import { readFile } from 'fs-extra'; // promisified
import path from 'path';
import { execPath } from 'process';
import vscode from 'vscode';
import execPromise from '../../execPromise';

export const getVenvExecutable = (venvDir: string, executable: string) => {
    const execDir = process.platform === 'win32' ? 'Scripts' : 'bin';
    return `${path.join(venvDir, execDir, executable)}`;
};

export const getVenvActivateCmd = (venvDir: string) => {
    let execPath = getVenvExecutable(venvDir, 'activate');

    return process.platform === 'win32' ? execPath : 'source ' + execPath;
};

export const createVenv = async (pythonPath: string, venvDir: string) => {
    await execPromise(`${pythonPath} -m virtualenv ${venvDir}`);

    return getVenvExecutable(venvDir, 'python');
};

/**`
 * gets the workspace folder by name
 * @param name Workspace folder name
 */
export const getWorkspaceFolderUri = (workspaceFolderName: string) => {
    const workspaceFolder = vscode.workspace.workspaceFolders!.find(
        (folder) => {
            return folder.name === workspaceFolderName;
        }
    );
    if (!workspaceFolder) {
        throw new Error(
            'Folder not found in workspace. Did you forget to add the test folder to test.code-workspace?'
        );
    }
    return workspaceFolder!.uri;
};

export const getText = async (
    workspaceFolderName: string,
    expectedFile: string
) => {
    const base = getWorkspaceFolderUri(workspaceFolderName);
    const expectedPath = path.join(base.fsPath, expectedFile);
    const expected = await readFile(expectedPath, 'utf8');
    return expected;
};
