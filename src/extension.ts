import * as vscode from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('poniescript');
    const lspPath = config.get<string>('languageServer.path', 'poniescript-lsp');
    const lspArgs = config.get<string[]>('languageServer.args', []);
    const lspEnabled = config.get<boolean>('languageServer.enabled', false);

    console.log("meow meow meow");

    context.subscriptions.push(
        vscode.commands.registerCommand('poniescript.showDocs', async() => {
            const panel = vscode.window.createWebviewPanel(
                'poniescriptDocs',
                'PonieScript Docs',
                vscode.ViewColumn.One,
                { enableScripts: false }
            );

            panel.webview.html = 
`<!DOCTYPE html>
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
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('poniescript.showDocs2', async() => {
            vscode.commands.executeCommand(
                'vscode.open',
                vscode.Uri.joinPath(context.extensionUri, 'docs', 'print.md')
            );
        })
    );

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
            fileEvents: vscode.workspace.createFileSystemWatcher("**/*.poni")
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