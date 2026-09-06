# Professional TCM expansion: final fix wave

## Scope

Implemented the two final-review findings only:

1. A resized, settled exploded grid now refreshes both GPU part offsets and picker transforms when its packed layout changes.
2. The mobile anatomy catalogue now has the same directly accessible close action as the standard catalogue.

No medical records, catalogue facts, placements, or unrelated application behavior were changed.

## Root cause and implementation

`AtlasScene` rebuilt `layoutCells` after a resize changed the camera aspect, but its transform-update gate only observed explosion amount and options object identity. At a settled explosion amount, neither value changed, so the new layout was not uploaded to `partData` and was not applied to picker meshes. The scene now treats a changed layout key as an explicit transform invalidation through `shouldUpdateExplosionTransforms`.

`AnatomyCatalogue` replaces the standard sidebar title block entirely, so it did not inherit that block's mobile close button. It now accepts `onClose` from `TcmApp` and renders the existing `mobile-close icon-button` pattern with the same `X` icon and `关闭目录` accessible label. The button remains hidden outside the existing mobile media query, and the existing warm palette is unchanged.

## TDD evidence

Test seam: the public pure helpers in `app/tcm/anatomy-explosion.ts`, exercised by `tests/anatomy-explosion.test.ts`.

### RED

Command:

```text
node --experimental-strip-types --test tests/anatomy-explosion.test.ts
```

Result: exit 1. The new regression test could not import `shouldUpdateExplosionTransforms`, proving the behavior contract did not yet exist:

```text
SyntaxError: The requested module '../app/tcm/anatomy-explosion.ts' does not provide an export named 'shouldUpdateExplosionTransforms'
tests 1; pass 0; fail 1
```

### GREEN

Command:

```text
node --experimental-strip-types --test tests/anatomy-explosion.test.ts
```

Result: exit 0; 5 tests passed, 0 failed. This includes `a settled explosion updates transforms when its packed layout changes`.

## Final verification

Run once at the end:

```text
git diff --check && npm run check && npm test && npm run build
```

Result: exit 0.

- TypeScript: `tsc --noEmit` passed.
- Full tests: 24 passed, 0 failed.
- Production build: Vite transformed 2,492 modules and completed in 538 ms.
- Build retained the pre-existing informational warning that the main JavaScript chunk exceeds 500 kB; it did not fail the build.

Browser verification was intentionally left to the controller task, per assignment.
