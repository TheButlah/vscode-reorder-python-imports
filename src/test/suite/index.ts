import * as path from 'path';
import Mocha from 'mocha';
import glob from 'glob';
import {
    getWorkspaceFolderUri,
    createVenv,
} from './testUtils';
import * as vscode from 'vscode';
import execPromise from '../../execPromise';
import getPythonPath from '../../getPythonPath';

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

        const venvPythonPath = await createVenv(getPythonPath(), venvDir);

        await execPromise(
            `${venvPythonPath} -m pip install reorder-python-imports`
        );

        const settings = vscode.workspace.getConfiguration('python');
        settings.update('defaultInterpreterPath', venvPythonPath);
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
