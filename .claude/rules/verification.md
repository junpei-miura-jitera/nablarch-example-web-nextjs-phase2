# Verification

## 構造ルール

検証前に、配置変更がある場合は `.claude/rules/structure.md` に反していないか確認する。

## 型チェック

```bash
pnpm --filter @app/content typecheck
```

## Storybook ビルド

```bash
CI=1 ./node_modules/.bin/storybook build
```

Storybook 対象 component を触ったら build まで確認する。

## テスト

```bash
pnpm test
pnpm --filter @app/content e2e
```

## lint

```bash
pnpm lint
```
