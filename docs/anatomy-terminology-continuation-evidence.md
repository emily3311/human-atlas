# 解剖学术语续核证：眼部与下肢

本批仅检查任务指定的 27 个图谱名称核心。中文名称是有来源的学习辅助，不代表经过专业审校。

## 核对方法

- 图谱核心均在 `public/models/atlas.json` 中逐项确认；统计保留重复网格条目。
- FIPAT TA2 记录来自 <https://libraries.dal.ca/Fipat/ta2.html> 及 <https://ta2viewer.openanatomy.org/>。缓存 JavaScript 只以 TypeScript AST 读取 `JSON.parse` 的字符串字面量，未执行脚本；多语种用户增补字段未用作中文证据。
- NAER 记录来自政府开放数据集 <https://data.gov.tw/en/datasets/14549>。表头虽为英文，下列“来源词”实际常为拉丁文。
- 桥接只使用 TA2 记录明示的主词、同义词或 `related_terms`；括号缩写、合字、旧拼法和繁简字形另行说明。
- 大陆规范词形另以复旦大学托管的《人体解剖学名词》参考副本逐页目视核对：<https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf>。文件元数据有印刷占位符，因此仅称“大学托管参考副本”，不声称它是当前正式出版物。本地核验副本 SHA-256 为 `1a29ca3fe95cab6a43a3748f69c28476d577c4b455158434a3279a84a0e64160`。

## 完整候选证据表

| 结果 | 图谱核心 | TA2 英文 / 拉丁文（ID） | NAER 实际行：来源词 → 中文 | 采用名 / 理由 |
| --- | --- | --- | --- | --- |
| 采用 | `choroid` | choroid / chorioidea (6774) | 1881: `Chorioides` → `脈絡膜` | `脉络膜`；TA2 明示 related term `chorioides`。 |
| 采用 | `lacrimal canaliculus` | lacrimal canaliculus / canaliculus lacrimalis (6855) | 2312: `Ductuli lacrimales` → `淚管` | `泪小管`；大陆术语 07.0146（PDF 390）直接记录 lacrimal ductule；TA2 明示旧称桥接。拒绝 row 2327 错配的 `輸乳管`。 |
| 采用 | `lacrimal gland` | lacrimal gland / glandula lacrimalis (6846) | —（NAER 808 仅为眶部/眼睑部合并行） | `泪腺`；大陆术语 07.0137（PDF 390）直接记录整个结构。 |
| 采用 | `lacrimal lake` | lacrimal lake (syn.) / lacus lacrimalis (6852) | 3141: `Lacus lacrimalis` → `淚湖` | `泪湖`。 |
| 采用 | `lens` | lens / lens (6798) | 3219: `Lens crystallina` → `晶狀體` | `晶状体`；TA2 明示 related term `lens crystallina`。 |
| 采用 | `inferior oblique` | inferior oblique muscle / musculus obliquus inferior bulbi oculi (2051) | 630: `*M. obliquus bulbi inferior` → `眼球下斜肌` | `下斜肌`；大陆术语 07.0099（PDF 388）直接确认。 |
| 采用 | `inferior rectus` | inferior rectus muscle / musculus rectus inferior (2043) | 637: `*M. rectus bulbi inferior` → `眼球下直肌` | `下直肌`；大陆术语 07.0093（PDF 388）直接确认。 |
| 采用 | `lateral rectus` | lateral rectus muscle / musculus rectus lateralis bulbi oculi (2045) | 640: `*M. rectus bulbi temporalis` → `眼球顬側直肌` | `外直肌`；大陆术语 07.0095（PDF 388）直接确认。 |
| 采用 | `levator palpebrae superioris` | levator palpebrae superioris / levator palpebrae superioris (2052) | 3563: `M. levator palpebræ superioris` → `提上瞼肌` | `上睑提肌`；大陆术语 07.0100（PDF 388）直接确认。 |
| 采用 | `medial rectus` | medial rectus muscle / musculus rectus medialis (2044) | 638: `*M. rectus bulbi nasalis` → `眼球鼻側直肌` | `内直肌`；大陆术语 07.0094（PDF 388）直接确认。 |
| 采用 | `superior oblique` | superior oblique muscle / musculus obliquus superior bulbi oculi (2048) | 631: `*M. obliquus bulbi superior` → `眼球上斜肌` | `上斜肌`；大陆术语 07.0097（PDF 388）直接确认。 |
| 采用 | `superior rectus` | superior rectus muscle / musculus rectus superior (2042) | 639: `*M. rectus bulbi superior` → `眼球上直肌` | `上直肌`；大陆术语 07.0092（PDF 388）直接确认。 |
| 采用 | `lacrimal nerve` | lacrimal nerve / nervus lacrimalis (6198) | 3911: `N. lacrimalis` → `淚腺神經` | `泪腺神经`；仅展开拉丁缩写并转简体。 |
| 采用 | `nasociliary nerve` | nasociliary nerve / nervus nasociliaris (6204) | 3922: `N. nasociliaris` → `鼻睫[狀]神經` | `鼻睫神经`；大陆术语 06.1061（PDF 367）直接确认。 |
| 采用 | `optic nerve` | optic nerve / nervus opticus (6183) | —（`Fasciculus opticus` → `視束` 不当作神经证据） | `视神经`；大陆术语 06.1032（PDF 366）直接记录整个神经。 |
| 采用 | `long ciliary nerve` | long ciliary nerves / nervi ciliares longi (6206) | 3994: `Nn. ciliares longi` → `睫狀長神經` | `睫状长神经`；大陆术语 06.1063（PDF 368）直接记录单数词，解决来源数的差异。 |
| 采用 | `short ciliary nerve` | short ciliary nerves / nervi ciliares breves (6664) | 3993: `Nn. ciliares breves` → `睫狀短神經` | `睫状短神经`；大陆术语 06.1048（PDF 367）直接记录单数词，解决来源数的差异。 |
| 采用 | `supra-orbital nerve` | supra-orbital nerve / nervus supraorbitalis (6200) | —（NAER 只有眶上区与眶上静脉） | `眶上神经`；大陆术语 06.1059（PDF 367）直接记录该神经。 |
| 采用 | `flexor accessorius` | flexor accessorius muscle (syn.) / musculus quadratus plantae (2684) | 3611: `M. quadratus plantæ` → `蹠方肌` | `足底方肌`；TA2 将 flexor accessorius 列为同义词，大陆术语 02.1799（PDF 133）确认词形。 |
| 采用 | `gemellus inferior` | inferior gemellus muscle / musculus gemellus inferior (2607) | 626: `*M. gemellus tuberalis` → `孖結節肌` | `下孖肌`；大陆术语 02.1747（PDF 130）直接确认，TA2 保留旧称桥接。 |
| 采用 | `gemellus superior` | superior gemellus muscle / musculus gemellus superior (2606) | 625: `*M. gemellus spinalis` → `孖棘肌` | `上孖肌`；大陆术语 02.1746（PDF 130）直接确认，TA2 保留旧称桥接。 |
| 采用 | `gluteus maximus` | gluteus maximus muscle / musculus gluteus maximus (2598) | 3546: `M. glutæus maximus` → `臀大肌` | `臀大肌`；TA2 related term 支持旧拼法。 |
| 采用 | `gluteus medius` | gluteus medius muscle / musculus gluteus medius (2599) | 3547: `M. glutæus medius` → `臀中肌` | `臀中肌`；TA2 related term 支持旧拼法。 |
| 采用 | `gluteus minimus` | gluteus minimus muscle / musculus gluteus minimus (2600) | 3548: `M. glutæus minimus` → `臀小肌` | `臀小肌`；TA2 related term 支持旧拼法。 |
| 采用 | `iliacus` | iliacus muscle / musculus iliacus (2594) | 3553: `M. ilicus` → `髂肌` | `髂肌`；TA2 related term 明示来源拼法，不做模糊匹配。 |
| 采用 | `semimembranosus` | semimembranosus muscle / musculus semimembranosus (2642) | 3624: `M. semimembranaceus` → `半膜肌` | `半膜肌`；TA2 related term 支持旧词尾。 |
| 采用 | `semitendinosus` | semitendinosus muscle / musculus semitendinosus (2641) | 3628: `M. semitendineus` → `半腱肌` | `半腱肌`；TA2 related term 支持旧词尾。 |

## 覆盖率变化

历史基线保留为 490 / 2,234 已翻译、1,744 未解析。本批采用 27 个核心，覆盖 58 个实际网格条目；现为 **548 / 2,234 已翻译，1,686 未解析**。

| 系统 | 未解析 |
| --- | ---: |
| arterial | 577 |
| venous | 370 |
| muscular | 208 |
| skeletal | 169 |
| nervous | 83 |
| respiratory | 117 |
| digestive | 85 |
| sensory | 14 |
| connective | 31 |
| cardiac | 23 |
| reproductive | 5 |
| endocrine | 2 |
| lymphatic | 2 |
| integumentary | 0 |
| urinary | 0 |
