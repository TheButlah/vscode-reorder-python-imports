import { spawn } from 'child_process';
import path from 'path';
import * as fse from 'fs-extra';
import { tmpdir } from 'os';

import {
    downloadAndUnzipVSCode,
    resolveCliPathFromVSCodeExecutablePath,
    runTests,
} from '@vscode/test-electron';

const createSetting = async () => {
    const userDataDirectory = await fse.mkdtemp(
        path.join(tmpdir(), 'vscode-reorder-python-imports-settings-')
    );
    const settingsFile = path.join(userDataDirectory, 'User', 'settings.json');
    const defaultSettings: Record<string, string | boolean | string[]> = {
        'security.workspace.trust.enabled': false, // Disable trusted workspaces.
    };
    fse.ensureDirSync(path.dirname(settingsFile));
    fse.writeFileSync(
        settingsFile,
        JSON.stringify(defaultSettings, undefined, 4)
    );
    return userDataDirectory;
};

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to test runner
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Install
        const [vscodeExecutablePath, userDataDirectory] = await Promise.all([
            downloadAndUnzipVSCode('stable').then((vsPath) => {
                spawn(
                    resolveCliPathFromVSCodeExecutablePath(vsPath),
                    ['--install-extension', 'ms-python.python'],
                    { stdio: 'inherit' }
                );
                return vsPath;
            }),
            createSetting(),
        ]);

        const workspacePath = path.resolve(
            'test-fixtures',
            'test.code-workspace'
        );

        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                workspacePath,
                '--skip-welcome',
                '--skip-release-notes',
                '--user-data-dir',
                userDataDirectory,
            ],
        });
    } catch (err) {
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
