# 中医经穴内容来源与边界

## 核心定位来源

- [GB/T 12346—2021《经穴名称与定位》](https://www.ntcamsac.ac.cn/upload/std_info/202306192125376309.pdf)，第 4 章及附录 A。现行中国推荐性国家标准，规定 14 条经脉、362 个经穴的名称与定位；本项目 39 点的中文名称、编码和定位以此为主。
- [全国标准信息公共服务平台标准页](https://std.samr.gov.cn/gb/search/gbDetailed?id=D1E86BE73ADD430EE05397BE0A0A206B)，基础信息与标准状态。用于核验 GB/T 12346—2021 为现行标准、主管部门为国家中医药局。
- [WHO Standard Acupuncture Point Locations in the Western Pacific Region](https://iris.who.int/bitstream/handle/10665/353407/9789290613831-eng.pdf)，General Guidelines、各经穴条目。用于核对国际编码、英文解剖方向和骨度分寸方法。该标准收录 361 点，不能替代 2021 中国国标的 362 点口径。

## 安全来源

- [WHO benchmarks for the practice of acupuncture](https://www.who.int/publications/i/item/978-92-4-001688-0)，Safe practice，pp. 9–13。用于“应由受训人员实施、风险评估和安全边界”的总体原则。
- [美国 NCCIH：Acupuncture: Effectiveness and Safety](https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety)，Is acupuncture safe? 用于概括不当操作可能导致感染、器官损伤和中枢神经系统损伤；不作为穴位定位或传统主治来源。

## 内容策略与已知限制

- `location` 与三步 `landmarks` 是对定位标准的教学性改写，不包含针刺方向、深度、剂量或治疗承诺。
- `traditional` 明确标注“传统理论提要，待教师核对”。当前版本仅表达经脉归属，不把国家定位标准误当成临床疗效证据。
- `anatomy` 是面向 BodyParts3D 匹配的宽泛英文关键词，并非逐穴的组织穿刺层次；需在拿到实际模型词表后再校准。
- 胸背、颈项及孕期相关提醒是保守的学习界面提示，不能替代个体化医疗评估。
- 骨度分寸是相对测量体系；三维模型只用于辅助理解，不应把屏幕坐标理解为真人操作坐标。
