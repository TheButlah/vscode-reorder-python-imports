import * as path from 'path';
import Mocha from 'mocha';
import glob from 'glob';
import {
    getWorkspaceFolderUri,
    getVenvActivateCmd,
    getVenvExecutable,
} from './testUtils';
import * as vscode from 'vscode';
import execPromise from '../../execPromise';

export function run(): Promise<void> {
    // Create the mocha test
    const mocha = new Mocha({
        ui: 'tdd',
        color: true,
    });

    const testsRoot = path.resolve(__dirname, '..');

    mocha.globalSetup(async () => {
        mocha.timeout(5000);
        const venvDir = path.join(
            getWorkspaceFolderUri('test-folder').fsPath,
            'venv'
        );
        const setupVenvCmd = `python3 -m virtualenv "${venvDir}"`;

        const activateVenvCmd = `"${getVenvActivateCmd(venvDir)}"`;

        const installCmd = 'pip install reorder-python-imports';

        await execPromise(
            [setupVenvCmd, activateVenvCmd, installCmd].join(' && ')
        );

        const settings = vscode.workspace.getConfiguration('python');
        settings.update(
            'defaultInterpreterPath',
            getVenvExecutable(venvDir, 'python')
        );
    });

    return new Promise((c, e) => {
        glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
            if (err) {
                return e(err);
            }

            // Add files to the test suite
            files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

            try {
                // Run the mocha test
                mocha.run((failures: any) => {
                    if (failures > 0) {
                        e(new Error(`${failures} tests failed.`));
                    } else {
                        c();
                    }
                });
            } catch (err) {
                console.error(err);
                e(err);
            }
        });
    });
}
