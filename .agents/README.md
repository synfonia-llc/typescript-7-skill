# `.agents/`

Codex, Cursor, GitHub Copilot, Gemini CLI, and several other hosts look here for **project-level** skills (`skills/<name>/SKILL.md`).

This repository **is** that skill. The canonical files live at the repo root (`SKILL.md`, `scripts/`, `references/`) so user-level junctions such as `~/.codex/skills/typescript-7` → this checkout keep working.

Do not add `.agents/skills/typescript-7` as a second copy or as a junction to `.`. The skill id would duplicate, and a junction to the repo root would recurse through `.agents/`.

To use the skill **inside another project**, install this checkout at that project’s `.agents/skills/typescript-7/` (or the host’s user path). See [AGENTS.md](../AGENTS.md) and [README.md](../README.md).
