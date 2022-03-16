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
    public static readonly PROVIDED_KINDS = [
        // This will also get triggered from `CodeActionKind.SourceOrganizeImports`, as
        // it "extends" from that kind.
        CodeActionKind.SourceOrganizeImports.append('reorder-python-imports'),
    ];

    provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): ProviderResult<CodeAction[]> {
        console.log('Context:', context);
        const actionTitle = 'Reorder Imports';

        let action = new CodeAction(
            actionTitle,
            ReorderImportsProvider.PROVIDED_KINDS[0]
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

        const extSpecifiedArgs = ['--exit-zero-even-if-changed'];
        const userSpecifiedArgs = workspace
            .getConfiguration('reorder-python-imports')
            .get<string[]>('args');

        let reorderArgs = userSpecifiedArgs || [];

        // Don't add arg if user has already specified it in conf
        extSpecifiedArgs.map((arg) => {
            if (!reorderArgs.includes(arg)) {
                reorderArgs.push(arg);
            }
        });

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
                        `${reorderPath} ${reorderArgs.join(' ')} -`,
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
            console.log('STDOUT:', stdout);
            console.log('STDERR:', stderr);

            const changeOffsetRanges = changesSubstring(input, stdout);

            if (changeOffsetRanges === 'no-change') {
                console.log('No change');
                return;
            } else if (changeOffsetRanges === 'full-change') {
                // callback used instead of the edit in the func args, due to edits
                // being invalidated in callbacks/async fns.
                console.log('Full change');
                editor.edit((edit) => {
                    edit.replace(new Range(startPos, endPos), stdout);
                });
            } else {
                let originalChangeRange = new Range(
                    doc.positionAt(changeOffsetRanges[0][0]),
                    doc.positionAt(
                        changeOffsetRanges[0][0] + changeOffsetRanges[0][1]
                    )
                );
                const changeStr = stdout.substr(
                    changeOffsetRanges[1][0],
                    changeOffsetRanges[1][1]
                );
                console.log('Change from range:', originalChangeRange);
                console.log('Change string:', changeStr);
                editor.edit((edit) => {
                    edit.replace(originalChangeRange, changeStr);
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
 * Returns [[originalStartIndex, originalLength], [otherStartIndex, otherLength]]
 *
 * Example: "abcdefgh" and "abcxyzh" would return `[[3, 4], [3, 3]]`
 */
export function changesSubstring(
    original: string,
    other: string
): 'no-change' | 'full-change' | [[number, number], [number, number]] {
    if (original === other) {
        return 'no-change';
    }

    let minLength = Math.min(original.length, other.length);

    let numFromStart; // Offset of the first change from the start of the strings
    for (numFromStart = 0; numFromStart < minLength; ++numFromStart) {
        if (original[numFromStart] !== other[numFromStart]) {
            break;
        }
    }

    let numFromEnd; // Offset of the last change from the end of the strings
    for (numFromEnd = 0; numFromEnd < minLength; ++numFromEnd) {
        if (
            original[original.length - numFromEnd - 1] !==
            other[other.length - numFromEnd - 1]
        ) {
            break;
        }
    }

    if (deepStrictEqual([numFromStart, numFromEnd], [0, 0])) {
        return 'full-change';
    }

    return [
        [numFromStart, original.length - numFromEnd - numFromStart],
        [numFromStart, other.length - numFromEnd - numFromStart],
    ];
}
