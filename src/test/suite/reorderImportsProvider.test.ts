import * as assert from 'assert';

import * as vscode from 'vscode';
import { changesSubstring } from '../../reorderImportsProvider';

let suiteDesc = 'Reorder Imports Provider';
suite(suiteDesc, () => {
    vscode.window.showInformationMessage('Testing ' + suiteDesc);

    test('changesRange', () => {
        assert.strictEqual(changesSubstring('abcdefg', 'abcdefg'), 'no-change');
        assert.strictEqual(changesSubstring('abcd', 'dcba'), 'full-change');
        assert.strictEqual(changesSubstring('', ''), 'no-change');
        assert.strictEqual(changesSubstring('abcdef', ''), 'full-change');

        assert.deepStrictEqual(changesSubstring('abcdef', 'abcxyz'), [
            [3, 6],
            [3, 6],
        ]);
        assert.deepStrictEqual(changesSubstring('abcdef', 'abXYXYef'), [
            [2, 4],
            [2, 6],
        ]);
        assert.deepStrictEqual(changesSubstring('abcdef', 'abef'), [
            [2, 4],
            [2, 2],
        ]);
        assert.deepStrictEqual(changesSubstring('abef', 'abcdef'), [
            [2, 2],
            [2, 4],
        ]);
    });
});
