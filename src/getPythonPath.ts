import {
    extensions,
} from 'vscode';

const getPythonPath = (): string => {
    const ext = extensions.getExtension('ms-python.python');

    if (!ext) {
        throw new Error("Can't find ms-python.python extension.");
    }

    const extApi = ext.exports;

    const execCommand = extApi.settings.getExecutionDetails().execCommand[0];

    if (typeof execCommand !== 'string') {
        throw new Error('Unexpected return value from ms-python.python');
    }

    return execCommand;
};

export default getPythonPath;
