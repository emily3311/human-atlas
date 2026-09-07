# TCMLE reference-explanation attribution

The optional reference explanations in `public/data/cmb-tcmle-explanations.json`
were derived from [Bolin97/TCMLE](https://huggingface.co/datasets/Bolin97/TCMLE).
Its dataset card declares the `apache-2.0` license metadata. This import is
pinned to commit `39e92cda586860c29a0ee00e4e29e15aedabb359`.

## Source subset

The importer reads the 19 JSON files below, all from TCMLE's `Licensed/`
(执业医师) subset. It does not consume Assistant data.

- `Licensed/Analytical_Diagnostic_Questions/Year_1/Past_Paper.json`
- `Licensed/Fundamental_Concept_Questions/Year_1/Mock.json`
- `Licensed/Fundamental_Concept_Questions/Year_1/Past_Paper.json`
- `Licensed/Fundamental_Concept_Questions/Year_2/Mock.json`
- `Licensed/Fundamental_Concept_Questions/Year_2/Past_Paper.json`
- `Licensed/Fundamental_Concept_Questions/Year_3/Mock.json`
- `Licensed/Fundamental_Concept_Questions/Year_3/Past_Paper.json`
- `Licensed/Fundamental_Concept_Questions/Year_4/Mock.json`
- `Licensed/Fundamental_Concept_Questions/Year_4/Past_Paper.json`
- `Licensed/Fundamental_Concept_Questions/Year_5/Past_Paper.json`
- `Licensed/Theory_Questions/Year_1/Mock.json`
- `Licensed/Theory_Questions/Year_1/Past_Paper.json`
- `Licensed/Theory_Questions/Year_2/Mock.json`
- `Licensed/Theory_Questions/Year_2/Past_Paper.json`
- `Licensed/Theory_Questions/Year_3/Mock.json`
- `Licensed/Theory_Questions/Year_3/Past_Paper.json`
- `Licensed/Theory_Questions/Year_4/Mock.json`
- `Licensed/Theory_Questions/Year_4/Past_Paper.json`
- `Licensed/Theory_Questions/Year_5/Past_Paper.json`

## Transformation and limits

The offline importer retains only records whose question stem and each A–E
option match a CMB record independently after NFKC normalization, removal of
Unicode whitespace, and the agreed Chinese/ASCII punctuation equivalences.
Dashes are deliberately not equivalent (for example, `Q-T` and `Q—T` remain
distinct). Empty or replacement-character (`U+FFFD`) reasons are rejected.

At the pinned version, 338 valid strict matches were found: 336 have the same
answer and are emitted as reference explanations; two answer conflicts are
isolated in `public/data/cmb-tcmle-match-report.json` and no explanation is
emitted for them. The application never replaces CMB question stems, options,
or answers with TCMLE data. These are reference explanations, not a medical
validation of all CMB questions.

This centralized attribution is intentionally not imported by question-card
components; each emitted record instead has machine-readable provenance for
auditing.
