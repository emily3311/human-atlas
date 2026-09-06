# CMB data attribution

This project redistributes a filtered conversion of the CMB (Chinese Medical Benchmark) training data from [FreedomIntelligence/CMB](https://github.com/FreedomIntelligence/CMB). The source archive is available from the repository's [data directory](https://github.com/FreedomIntelligence/CMB/tree/main/data), and the imported entry is `CMB/CMB-Exam/CMB-train/CMB-train-merge.json`.

- Archive SHA-256: `c2e4288127fa5e6c03cc3659d893b0bbb19e699f74fdadce8e7fa10ac5bfdd94`
- License: Apache License 2.0; the verbatim upstream license is included at `public/licenses/CMB-Apache-2.0.txt`.
- Repository citation authors: Xidong Wang, Guiming Hardy Chen, Dingjie Song, Zhiyi Zhang, Qingying Xiao, Xiangbo Wu, Feng Jiang, Jianquan Li, Benyou Wang (2023).
- Paper citation authors: Xidong Wang, Guiming Hardy Chen, Dingjie Song, Zhiyi Zhang, Zhihong Chen, Qingying Xiao, Feng Jiang, Jianquan Li, Xiang Wan, Benyou Wang, Haizhou Li (2023).

## Conversion boundary

The importer verifies the archive digest and selects only records whose source fields exactly identify `医师考试` / `执业医师` / `中医执业医师` / `单项选择题`. It requires non-empty string question and A–E option fields, a valid A–E answer, and no Unicode replacement character. Display text is preserved except for trimming leading and trailing whitespace. A normalized question-and-options key is used only for duplicate detection; same-answer duplicates retain the first source row, while every row in a conflicting-answer group is quarantined.

This conversion is not an official examination bank, is not claimed to be complete for any current-year syllabus, and has not undergone a medical or per-answer professional audit. No endorsement by the original authors or repository is implied.
