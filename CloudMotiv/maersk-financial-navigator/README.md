# CloudMotive - PDF Highlighter

Lightweight PDF highlighter app used for the CloudMotive assignment. This repository contains a small React app (Vite) with a PDF viewer and highlight/match tools.

This repo includes helper files to get started quickly in GitHub Codespaces or a local development container.

## What I added
- `README.md` (this file)
- `.gitignore` (Node / Vite defaults)
- `LICENSE` (MIT)
- `.devcontainer/devcontainer.json` (minimal Codespaces/devcontainer config)

## Quick start (local)
1. Clone the repository or work in the existing folder.
2. Install dependencies:

   npm install

3. Run the dev server:

   npm run dev

4. Open http://localhost:5173 (Vite default) in your browser.

## Start coding in Codespaces or a dev container
This repo includes a `.devcontainer/devcontainer.json` that uses the official Node devcontainer image. To open in Codespaces or locally in VS Code:

- On GitHub: click "Code" → "Open with Codespaces" → "New codespace" (requires GitHub Codespaces enabled for your account/org).
- Locally in VS Code: install Remote - Containers, then choose "Remote-Containers: Reopen in Container".

The devcontainer will:
- Use node image with Node 18
- Run `npm install` on create
- Recommend ESLint & Prettier extensions
- Run as non-root user for better security

## Pushing to GitHub
If this repo isn't already connected to a remote, use the commands below (replace the URL with your remote):

git init
git add .
git commit -m "chore: add README, devcontainer, license, gitignore"
git branch -M main
git remote add origin git@github.com:AswarthaHarshitha/CloudMotive-Assignment-PDF-Highlighter.git
git push -u origin main

If you're pushing an existing repo into the remote given above, run:

git remote add origin git@github.com:AswarthaHarshitha/CloudMotive-Assignment-PDF-Highlighter.git
git branch -M main
git push -u origin main

Notes:
- SSH push requires that your machine (or Codespace) has the SSH key added to your GitHub account. You can also use HTTPS and enter personal access token if needed.

## Add collaborators
Two easy ways:

1) GitHub web UI
   - Go to the repository on GitHub → Settings → Manage access → Invite a collaborator → search by username or email and invite.

2) `gh` CLI (requires authentication via `gh auth login`):

   gh repo add-collaborator AswarthaHarshitha --permission write

Replace `AswarthaHarshitha` with the collaborator's GitHub username. Use `--permission admin|maintain|write|triage|read` as needed.

## Search for users
To look up GitHub users by username or email:
- Use the GitHub web search box (https://github.com/search) and choose "Users".
- Or use the `gh` CLI: `gh api -H "Accept: application/vnd.github+json" /search/users -f q="USERNAME"` (replace USERNAME).

## Security & recommendations
- Keep secrets out of the repo; add `.env` to `.gitignore` if you store credentials locally.
- Review Codespaces/devcontainer settings before exposing ports in a shared environment.

## Next steps (suggested)
- Add basic tests and a small CONTRIBUTING.md
- Add GitHub Actions to run lint/tests on push

---
Generated on 21 Nov 2025.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
# CloudMotive-Assignment-PDF-Highlighter
