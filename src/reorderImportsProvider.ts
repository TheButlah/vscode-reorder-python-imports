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

    public async reorderImports(uri?: Uri) {
        throw new Error("Method not implemented.");
    }
}
