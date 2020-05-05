import {
    Uri,
    CodeActionProvider,
    TextDocument,
    Range,
    Selection,
    Command,
    CodeAction,
    CancellationToken,
    CodeActionContext,
    ProviderResult,
    CodeActionKind,
    window,
} from "vscode";

export class ReorderImportsProvider implements CodeActionProvider {
    provideCodeActions(
        document: TextDocument,
        range: Range | Selection,
        context: CodeActionContext,
        token: CancellationToken
    ): ProviderResult<CodeAction[]> {
        let action = new CodeAction(
            "Reorder Imports",
            CodeActionKind.SourceOrganizeImports
        );
        action.command = {
            command: "reorder-python-imports.reorderImports",
            title: "",
        };
        return [action];
    }

    public async reorderImports(_uri?: Uri) {
        _uri = _uri ?? window.activeTextEditor?.document.uri;
        if (_uri === undefined) {
            throw new Error(
                "URI must be provided or an editor must be active!"
            );
        }
        let uri: Uri = _uri;
        console.log("Reordering " + uri);

        if (uri.scheme !== "file") {
            throw new Error(
                "`reorderImports()` was called with a URI that did not use `file://`!"
            );
        }
        throw new Error("Method not implemented.");
    }
}
