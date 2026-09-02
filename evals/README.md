# Evaluation cases

`activation-cases.json` is a small forward-evaluation corpus for the skill's
agent-facing contract. Run it with an independent agent or harness that can
decide whether the skill should activate and report which reference it would
open.

Evaluate both surfaces:

1. **Retrieval:** `shouldActivate` must be correct. False positives on ordinary
   TypeScript 5/6 work are failures, not harmless extra context.
2. **Behavior after retrieval:** required behaviors must appear and forbidden
   behaviors must not. Route matching is semantic; opening one clearly owning
   route is better than loading every listed reference.

The corpus is intentionally data-only. It must not be loaded during normal
skill use, and it does not replace executing the probe, compiler, or validator.
