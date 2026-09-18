AI Coding Agents — Project Rules
Purpose

This project uses multiple AI coding agents on different models. This file defines who does what, so they don't step on each other or drift into inconsistent code styles. Every agent should read this file before starting any task.

Agent Assignments
Agent	Model	Role	Use it for
VS Code default agent	gpt-oss-20b (via Kaggle)	Autocomplete / quick edits	Inline completions, small single-file tweaks, boilerplate
Cline	internlm/Atria-Dawn-Preview	Feature builder	New features, multi-file changes of moderate complexity
Claude Code (via Jan)	Opus → moonshotai/kimi-k3
Sonnet → z-ai/glm5
Haiku → openai/gpt-oss-20b	Architect / Refactor lead	Large refactors, cross-file/cross-module changes, planning, reviewing what Cline/OpenCode produced
OpenCode	internlm/Atria-Dawn-Preview	Debugger / Reviewer	Bug fixing, pre-merge review, sanity checks

Cline and OpenCode currently share the same model. They're told apart by role, not model — Cline builds, OpenCode reviews/fixes. If that distinction stops being useful in practice, consider dropping one.

Ground rules for every agent
Read this file (AGENTS.md) before starting any task.
Work on your own branch: agent/<tool-name>/<short-task-name>. Never edit main/master directly.
Only one agent should be active on a given file or branch at a time. Check current branches / open changes before starting.
Match the existing code style already in the repo (naming, folder structure, formatting/linting rules). Don't introduce a new pattern without flagging it in the commit/PR description.
Keep commits small and atomic, with messages that explain what changed and why.
Before merging into main, changes should be reviewed — either by you, or by Claude Code acting in the "Architect / Refactor lead" role above.
Project conventions

(fill in for this specific project)

Language / framework:
Folder structure notes:
Test command:
Lint / format command:
Anything agents should never touch:
Model routing notes
Jan's Claude Code integration maps Claude's size tiers to other models: Opus → moonshotai/kimi-k3, Sonnet → z-ai/glm5, Haiku → openai/gpt-oss-20b. If output quality drifts, check this mapping first.
If you rename or swap any model in Jan/Cline/OpenCode settings, update the table above so it stays accurate.