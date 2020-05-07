import { ChildProcess, exec, ExecException } from 'child_process';
import deepEqual from 'deep-equal';
import * as path from 'path';
import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    Position,
    ProviderResult,
    Range,
    Selection,
    TextDocument,
    TextEditor,
    workspace,
} from 'vscode';

const deepStrictEqual = (actual: any, expected: any) =>
    deepEqual(actual, expected, { strict: true });

export class ReorderImportsProvider implements CodeActionProvider {
    provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): ProviderResult<CodeAction[]> {
        let action = new CodeAction(
            'Reorder Imports',
            CodeActionKind.SourceOrganizeImports
        );
        action.command = {
            command: 'reorder-python-imports.reorderImports',
            title: '',
        };
        return [action];
    }

    public async reorderImports(editor: TextEditor) {
        let doc = editor.document;
        console.log('Reordering ' + doc.uri);

        let _wksp = workspace.getWorkspaceFolder(doc.uri);
        if (!_wksp) {
            throw new Error(
                'Could not get a workspace for the active document!'
            );
        }
        let wksp = _wksp;

        let _pythonPath = workspace
            .getConfiguration('python', doc.uri)
            .get<string>('pythonPath');
        if (!_pythonPath) {
            throw new Error('Could not get `python.pythonPath` configuration!');
        }
        let pythonPath = _pythonPath;

        let reorderPath = path.join(
            path.dirname(pythonPath),
            'reorder-python-imports'
        );
        console.log('Reorder Path:', reorderPath);

        const input = doc.getText();

        const lastLine = doc.lineCount - 1;
        const lastChar = doc.lineAt(lastLine).text.length;
        const startPos = new Position(0, 0);
        const endPos = new Position(lastLine, lastChar);

        try {
            const [stdout, stderr] = await new Promise<[string, string]>(
                (resolve, reject) => {
                    const reorderProcess: ChildProcess = exec(
                        `${reorderPath} --exit-zero-even-if-changed -`,
                        { cwd: wksp.uri.fsPath },
                        (error, stdout, stderr) => {
                            if (error) {
                                reject(error);
                                return;
                            }
                            resolve([stdout, stderr]);
                        }
                    );
                    // send code to be formatted into stdin
                    reorderProcess.stdin?.write(input);
                    reorderProcess.stdin?.end();
                }
            );
            console.log('STDERR:', stderr);

            const changeIndexRange = changesSubstring(input, stdout);
            if (changeIndexRange === 'no-change') {
                return;
            } else if (changeIndexRange === 'full-change') {
                // callback used instead of the edit in the func args, due to edits
                // being invalidated in callbacks/async fns.
                editor.edit((edit) => {
                    edit.replace(new Range(startPos, endPos), stdout);
                });
            } else {
                const changeRange = new Range(
                    doc.positionAt(changeIndexRange[0][0]),
                    doc.positionAt(changeIndexRange[0][1])
                );
                const changeStr = stdout.substr(
                    changeIndexRange[1][0],
                    changeIndexRange[1][1]
                );
                editor.edit((edit) => {
                    edit.replace(changeRange, changeStr);
                });
            }
        } catch (_error) {
            if (!(_error as ExecException)) {
                throw _error;
            }
            let error: ExecException = _error;

            // TODO: Intelligently detect error types
            throw error;
        }
    }
}

/**
 * Compares two strings and determines what the range of differences are.
 *
 * If the return type is [number, number], this represents the largest substring where
 * there is a difference.
 *
 * Example: "abcdefgh" and "abcxyzh" would return `[[3, 7], [3, 6]]`
 */
export function changesSubstring(
    original: string,
    other: string
): 'no-change' | 'full-change' | [[number, number], [number, number]] {
    if (original === other) {
        return 'no-change';
    }

    let minLength = Math.min(original.length, other.length);

    let start = 0; // Offset from the start for the start of the change
    while (start < minLength && original[start] === other[start]) {
        ++start;
    }

    let end = 0; //Offset from the end for the end of the change
    while (
        end < minLength &&
        original[original.length - end - 1] === other[other.length - end - 1]
    ) {
        ++end;
    }

    if (deepStrictEqual([start, end], [0, 0])) {
        return 'full-change';
    }

    return [
        [start, original.length - end],
        [start, other.length - end],
    ];
}
