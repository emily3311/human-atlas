# Final review fix report

## Scope and implementation evidence

- `app/tcm/tcm.css` explicitly anchors the catalogue, model, and detail children to their intended grid columns at 901–1099 px, and anchors the model/detail after the 8 px resize track at >=1100 px. Rules exclude `.anatomy-focus` and do not apply at <=900 px.
- `app/tcm/teaching-atlas.ts` provides the single immutable teaching load normalization. `TcmApp` applies it immediately after parsing `/models/atlas.json`, before the same atlas state reaches both `AnatomyCatalogue` and `AtlasScene`.
- Corrections require exact original ID + exact name + old `skeletal` system. Only FJ1409/FJ1409M, FJ1410/FJ1410M, and FJ1411/FJ1411M are copied with `system: muscular`; all other fields and unmatched records retain their original values/identity. The raw manifest and geometry were not edited.
- `AnatomyPanel` explains “体表仅查目录，教学视图隐藏”. The shared `canIsolateTeachingPart` policy removes isolate actions from both details and the floating selection for an integumentary part, while retaining them for internal structures.
- Explanatory evidence notes in `anatomy-terms.ts` and the source disclosure document are Chinese. Original Latin/English source terms, row identifiers, TA2 identifiers, and links remain intact.

## Source classification evidence and limits

The cached NAER CSV contains:

```text
623:622,*M. fibularis brevis,腓骨短肌,https://terms.naer.edu.tw/
624:623,*M. fibularis longus,腓骨長肌,https://terms.naer.edu.tw/
625:624,*M. fibularis tertius,腓骨第三肌,https://terms.naer.edu.tw/
```

Existing terminology evidence bridges these to TA2 2653 (`fibularis brevis muscle` / `musculus fibularis brevis`), TA2 2652 (`fibularis longus muscle` / `musculus fibularis longus`), and TA2 2649 (`fibularis tertius muscle` / `musculus fibularis tertius`). The six corresponding raw records were inspected locally and all have exact expected names with original `system: skeletal`. This narrow correction does not imply that any remaining atlas classification has been professionally audited.

## TDD evidence

RED command:

```text
npm test -- tests/teaching-atlas.test.ts
```

The run failed with `ERR_MODULE_NOT_FOUND` for `app/tcm/teaching-atlas.ts` (40 prior tests passed, 1 failed), proving the new behavior did not yet exist. After minimal implementation, the focused behavioral run passed 17/17. Assertions exercise normalization output and immutability: all six corrections, exact ID/name/old-system guards, an unrelated part, unchanged raw source, preserved non-system fields, and unchanged identity when no record qualifies. No test searches source strings.

A controller review found a second rendered skin-isolation entry in the floating selection. A second RED command, `node --experimental-strip-types --test tests/teaching-display.test.ts`, failed because `canIsolateTeachingPart` did not exist. The shared policy was then implemented and the focused normalization/display run passed 4/4.

## Automated verification

```text
npm test
# tests 43; # pass 43; # fail 0; duration_ms 160.43225

npm run check
tsc --noEmit
exit 0

npm run build
vite v8.0.13; 2497 modules transformed; built in 564ms
dist/assets/index-CnvYpP_i.css 241.47 kB (gzip 41.14 kB)
dist/assets/index-BmrzBNpx.js 1,108.92 kB (gzip 321.67 kB)
exit 0 (existing >500 kB chunk advisory only)

git diff --check
exit 0, no output
```

## Browser acceptance

Pre-fix RED supplied by controller: at 1512×752 the expanded workspace columns were 320/8/839/345 px and the model width collapsed to 8 px. At 1024×720 the collapsed model was 503 px but expanded model incorrectly moved into the 221 px first column.

Post-build controller checks:

- 1024×720 expanded: sidebar 760 px, model 503 px, detail 300 px; model matches the collapsed baseline.
- 1280×720 expanded: sidebar 760 px, model 607 px, detail 345 px; after exit sidebar 320 px and model remains 607 px.
- 1280×720 resize: drag from x=324 to x=420 changed sidebar 320→416 px and aria value to 416, model 607→511 px, with no horizontal overflow; collapsed catalogue retained six complete visible rows.
- 1512×752 expanded after setting the sidebar to 260 px: sidebar 760 px, model 899 px, detail 345 px, with no overflow.
- Expanded → 记忆卡片 automatically closed expansion and restored columns 416/8/511/345 px.
- At 390×844, the catalogue drawer was 320×731 px, its list viewport/scroll height was 476/21007 px, the resize divider was hidden, and there was no horizontal overflow. Searching “孔最” produced one result; selection closed the drawer and the LU6 detail retained its explicit uncalibrated-3D disclosure.
- All six fibularis entries rendered with Chinese subtitles and “肌肉” classification; with only the muscle filter checked, all six remained searchable. FJ1409 details showed the muscle tag and Chinese source note.

- On the final `index-BmrzBNpx.js` build, selecting integumentary FJ2810 showed the catalogue-only explanation and neither details nor the floating selection exposed an isolate button; the existing 2/382 learning state was unchanged.
