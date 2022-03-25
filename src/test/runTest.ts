import { spawnSync } from 'child_process';
import path from 'path';
import * as fse from 'fs-extra';
import { tmpdir } from 'os';

import {
    downloadAndUnzipVSCode,
    resolveCliArgsFromVSCodeExecutablePath,
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

        // download VS Code
        const vscodeExecutablePath = await downloadAndUnzipVSCode('stable');

        const [cli, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        const userDataDirectory = await createSetting();

        // install ms-python
        spawnSync(cli, [...args, '--install-extension', 'ms-python.python'], {encoding: 'utf-8', stdio: 'inherit'});

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
