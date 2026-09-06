# 解剖学术语来源

中文名称层是学习辅助，不代表经过专业审校。未解析名称仍明确标记为待核对，并保留原始英文名称和编号。

## 主要术语来源

- 台湾教育部、国家教育研究院术语数据集：<https://data.gov.tw/en/datasets/14549>
- 已检查该数据集的 CSV 导出文件（`/tmp/atlas-anatomy-naer.csv`），共 6,233 条数据；列为行号、来源术语、中文术语和来源网站。
- 许可证：Government Open Data License 1.0，<https://data.gov.tw/license>
- CSV 列标题为 “English name”，但许多记录是拉丁文。因此只匹配经检查的精确图谱名称核心：可选 `M.` 被识别为 *musculus*，不假设通用的拉丁文—英文对应。
- 每条新增记录保留 CSV 行号、原始拉丁文/来源术语、原始中文、HTTPS 链接及明确的简体中文或中国大陆词序规范化说明。

Platysma 使用 IMAIOS 确认的中国大陆术语：<https://www.imaios.cn/cn/e-anatomy/anatomical-structures/platysma-1541115436>。证据说明同时保留 NAER row 4426（`Platysma` / `闊肌(頸)`）。未复制 IMAIOS 定义或专有术语集。

英文名称不直接匹配 NAER 拉丁文时，桥接依据为 FIPAT 官方 TA2 术语页（<https://libraries.dal.ca/Fipat/ta2.html>）及 TA2 Viewer（<https://ta2viewer.openanatomy.org/>）。FIPAT 说明单个 TA2 术语属于公共领域（整体出版物为 CC BY-ND）。记录保留 TA2 ID、英文术语、拉丁文术语、NAER row ID 和中文术语；未复制定义或出版物正文。

## 六项教学分类校正

教学加载层仅校正 FJ1409/FJ1409M、FJ1410/FJ1410M、FJ1411/FJ1411M。原始 `system` 均为 `skeletal`；TA2 2653/2652/2649 将 fibularis brevis/longus/tertius 列为 muscle，NAER 622/623/624 分别记录 `M. fibularis brevis/longus/tertius`。因此教学层将六项显示为 `muscular`。

校正必须同时精确匹配 ID、名称和原系统；不修改原始 JSON、输入对象、名称、概念、几何、chunk/buffer 索引或 bounds。该校正不表示其余分类已经专业审核。

## 匹配策略

查找在去除整个输入两端空白并转为小写后，只执行精确核心匹配，可选前缀仅限 `Left ` 或 `Right `。不做子字符串替换，因此侧别得以保留，而 `Imaginary branch of left platysma` 和格式异常的 `Left  platysma` 保持不变。

既有旧翻译仍计入显示覆盖率，但不追溯标记为本次新增来源核验项。证据披露仅出现于已复核的来源表记录。

## 覆盖率

覆盖率统计 `public/models/atlas.json` 中的实际条目（包括重复网格项），而非唯一名称或来源词汇行。

- 之前：185 / 2,234 已翻译；2,049 未解析。
- 之后：490 / 2,234 已翻译；1,744 未解析。
- 新增 158 个经复核的精确核心词，覆盖 305 个实际网格项。

| 系统 | 未解析 |
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

## 有意保留为未解析

未采用对应模糊、不完整、可能误导、属于变体或似已过时的记录。例如 CSV `axis` → `軸`、`radius` → `半徑`、`Putamen` → `殼`，都不能安全支持图谱结构当前的中国大陆中文名称。分支、命名部分、指/趾组及其他细分也未从整体匹配中推断，以保留侧别、序数、细分部位和整体/部分区别。
