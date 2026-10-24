# QueryLens

QueryLens is a Visual Studio Code extension prototype that runs lightweight, line-based checks for common SQL and ORM query patterns in the active editor.

## Checks

- SQL `SELECT *` and `WHERE 1=1`
- ORM `findMany` calls without a visible `take` or `limit`
- Nested `include` patterns
- Query calls inside common loop patterns

The analyzer uses regular expressions; it is not a SQL parser, does not connect to a database, and may miss or misclassify code. Treat its output as a prompt for review, not as proof of a performance defect.

## Use in VS Code

Open a SQL or source file, then run `QueryLens: Analyze active file` from the Command Palette. Results are shown in a Markdown document.

## Develop

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

Package a VS Code extension bundle with `pnpm package`. Core analysis is in `src/logic/`; the editor command is in `src/extension.ts`.

Marketplace publishing is a manual workflow and does not run on ordinary pushes.

## License

Original project content is offered under the [PolyForm Noncommercial License 1.0.0](LICENSE). Third-party dependencies retain their own licenses. This is source-available software, not OSI-approved open source.
