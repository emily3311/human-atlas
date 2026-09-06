# Anatomy terminology sources

The Chinese-name layer is a learning aid, not a claim of professional review. Unresolved model names remain visibly pending and retain their original English name and identifier.

## Primary terminology source

- Taiwan Ministry of Education, National Academy for Educational Research terminology dataset: <https://data.gov.tw/en/datasets/14549>
- Inspected artifact: the dataset's CSV export (`/tmp/atlas-anatomy-naer.csv`), 6,233 data rows. The exported columns are row number, source term, Chinese term, and source site.
- License: Government Open Data License 1.0, <https://data.gov.tw/license>
- The CSV column is headed “English name,” but many records are Latin. Matching therefore used only exact, inspected atlas-name cores: an optional `M.` designator was recognized as *musculus*, and no general Latin-to-English equivalence was assumed.
- Each added record stores the inspected CSV row number, original Latin/source term, original Chinese text, HTTPS dataset URL, and any explicit Simplified Chinese or mainland word-order normalization note.

Platysma uses the mainland Chinese term confirmed by IMAIOS at <https://www.imaios.cn/cn/e-anatomy/anatomical-structures/platysma-1541115436>. Its evidence note also records NAER row 4426 (`Platysma` / `闊肌(頸)`). No IMAIOS definition or proprietary terminology collection was copied.

For atlas English names that do not themselves match NAER's Latin, the bridge is FIPAT's official TA2 terminology page (<https://libraries.dal.ca/Fipat/ta2.html>) and its linked TA2 Viewer collaboration (<https://ta2viewer.openanatomy.org/>). FIPAT states that individual TA2 terms are public domain (the publication as a whole is CC BY-ND). These records retain the TA2 ID, English term, Latin term, NAER row ID, and Chinese term; definitions and publication text were not copied.

## Matching policy

Lookup is case-insensitive after trimming the whole input, then performs only an exact core lookup with an optional explicit `Left ` or `Right ` prefix. It does not replace substrings. Thus side is preserved, while an invented structure such as `Imaginary branch of left platysma` and malformed `Left  platysma` stay unchanged.

Existing legacy translations still count toward display coverage, but have not been retroactively labeled as newly source-verified. The evidence disclosure appears only for records in the reviewed source table.

## Coverage

Coverage counts actual entries in `public/models/atlas.json`, including repeated mesh entries, rather than unique names or source-vocabulary rows.

- Before: 185 / 2,234 translated; 2,049 unresolved.
- After: 490 / 2,234 translated; 1,744 unresolved.
- This change adds 158 reviewed exact cores that cover 305 actual mesh entries.

Remaining unresolved mesh entries by system:

| System | Unresolved |
| --- | ---: |
| arterial | 577 |
| venous | 370 |
| muscular | 240 |
| skeletal | 169 |
| nervous | 97 |
| respiratory | 117 |
| digestive | 85 |
| sensory | 26 |
| connective | 31 |
| cardiac | 23 |
| reproductive | 5 |
| endocrine | 2 |
| lymphatic | 2 |
| integumentary | 0 |
| urinary | 0 |

## Deliberately unresolved

Rows with ambiguous, incomplete, misleading, variant, or obsolete-looking correspondence were not used. Examples include CSV `axis` → `軸`, `radius` → `半徑`, and `Putamen` → `殼`; these do not safely support the atlas structures' current mainland Chinese names. Branches, named parts, digit groups, and other subdivisions were also not inferred from a whole-structure match. This preserves side, ordinal, subdivision, and whole-versus-part distinctions and leaves those names pending until a primary source directly resolves them.
