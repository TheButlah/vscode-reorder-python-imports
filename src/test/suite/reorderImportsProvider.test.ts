import * as assert from 'assert';
import * as vscode from 'vscode';
import { changesSubstring } from '../../reorderImportsProvider';

const suiteDesc = 'Reorder Imports Provider - changeSubstring';
suite(suiteDesc, () => {
    vscode.window.showInformationMessage('Testing ' + suiteDesc);

    test('changesRange', () => {
        assert.strictEqual(changesSubstring('abcdefg', 'abcdefg'), 'no-change');
        assert.strictEqual(changesSubstring('abcd', 'dcba'), 'full-change');
        assert.strictEqual(changesSubstring('', ''), 'no-change');
        assert.strictEqual(changesSubstring('abcdef', ''), 'full-change');

        assert.deepStrictEqual(changesSubstring('abcdef', 'abcxyz'), [
            [3, 3],
            [3, 3],
        ]);
        assert.deepStrictEqual(changesSubstring('abcdef', 'abXYXYef'), [
            [2, 2],
            [2, 4],
        ]);
        assert.deepStrictEqual(changesSubstring('abcdef', 'abef'), [
            [2, 2],
            [2, 0],
        ]);
        assert.deepStrictEqual(changesSubstring('abef', 'abcdef'), [
            [2, 0],
            [2, 2],
        ]);
    });
});
