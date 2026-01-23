import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

function getTestDocHtml(): string {
    return `<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="default-src 'none';">
    </head>
    <body>
        <h1>PonieScript Docs</h1>
        <h3>print()</h3>
        <p>Prints any series of expressions.</p>
    </body>
</html>`;
}

function showDocsWebview(uri: vscode.Uri) {
    const panel = vscode.window.createWebviewPanel(
        'poniescriptDocs',
        'PonieScript Docs',
        vscode.ViewColumn.One,
        { enableScripts: false }
    );

    panel.webview.html = getTestDocHtml();
}

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('poniescript');
    const lspPath = config.get<string>('languageServer.path', 'poniescript-lsp');
    const lspArgs = config.get<string[]>('languageServer.args', []);
    const lspEnabled = config.get<boolean>('languageServer.enabled', false);

    var uriPrefix = vscode.env.uriScheme + "://" + "poniescript.poniescript-vscode";
    console.log("poniescript: uriPrefix = ", uriPrefix);

    context.subscriptions.push(
        vscode.commands.registerCommand('poniescript.showDocs', async() => {
            //showDocsWebview(vscode.Uri.parse("poniescript-docs://index"));
            vscode.commands.executeCommand(
                'vscode.open',
                vscode.Uri.parse(uriPrefix + "/index")
            );
        })
    );

    vscode.window.registerUriHandler({
        handleUri(uri: vscode.Uri) {
            showDocsWebview(uri);
        }
    });

    // Skip the LSP if it isn't enabled.
    if (!lspEnabled) { return; }

    // Things to look into in the future: Debug options, etc.
    const serverOptions: ServerOptions = {
        command: lspPath,
        args: lspArgs,
    };

    // The 'synchronize' option I'm throwing in right now just because
    // it seems like it might be relevant. It might end up not being relevant.
    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'poniescript' }],
        synchronize: {
            fileEvents: [
                vscode.workspace.createFileSystemWatcher("**/*.poni"),
                vscode.workspace.createFileSystemWatcher("**/ponies.toml")
            ]
        }
    };

    client = new LanguageClient(
        'poniescriptLanguageServer',
        'PonieScript Language Server',
        serverOptions,
        clientOptions
    );

    client.start();

    context.subscriptions.push(
        vscode.commands.registerCommand('poniescript.restartLanguageServer', async() => {
            await client.stop();
            client.start();
            vscode.window.showInformationMessage('PonieScript LSP restarted');
        })
    )
}

export function deactivate(): Thenable<void> | undefined {
    return client ? client.stop() : undefined;
}