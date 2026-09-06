# 中医经穴内容来源与边界

## 核心定位来源

- [GB/T 12346—2021《经穴名称与定位》上海中医药大学公开全文](https://zynj.shutcm.edu.cn/_upload/article/files/66/b4/b34a95604d04b0bf686251b2d317/368ea8b0-187c-48a7-a402-ffdf1e11bb99.pdf)，第 4 章定位方法、第 5 章逐经逐穴条目。现行中国推荐性国家标准，规定 14 条经脉、362 个经穴的名称与定位；本项目 39 点的中文名称、编码和定位以此为主，数据内逐穴标注第 5 章所属经脉小节。
- [全国标准信息公共服务平台标准页](https://std.samr.gov.cn/gb/search/gbDetailed?id=D1E86BE73ADD430EE05397BE0A0A206B)，基础信息与标准状态。用于核验 GB/T 12346—2021 为现行标准、主管部门为国家中医药局。
- [WHO Standard Acupuncture Point Locations in the Western Pacific Region](https://iris.who.int/bitstream/handle/10665/353407/9789290613831-eng.pdf)，General Guidelines、各经穴条目。用于核对国际编码、英文解剖方向和骨度分寸方法。该标准收录 361 点，不能替代 2021 中国国标的 362 点口径。

## 安全来源

- [WHO benchmarks for the practice of acupuncture](https://www.who.int/publications/i/item/978-92-4-001688-0)，Safe practice，pp. 9–13。用于“应由受训人员实施、风险评估和安全边界”的总体原则。
- [美国 NCCIH：Acupuncture: Effectiveness and Safety](https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety)，Is acupuncture safe? 用于概括不当操作可能导致感染、器官损伤和中枢神经系统损伤；不作为穴位定位或传统主治来源。

## 传统理论与特定穴分类来源

- [湖北中医药大学《经络腧穴学》参考书目](https://zybbg.hbucm.edu.cn/info/1017/1142.htm)，第二章“腧穴的作用及主治规律”“特定穴”及下篇各经腧穴各论。用于传统功用、常见主治范围及原穴、络穴、五输穴、背俞穴、募穴、八会穴、八脉交会穴等教学分类，不承担现代疗效证明。
- [广西中医药大学《针灸技术》教学设计](https://www.gxtcmu.edu.cn/zjtn/jysjs/zjtncfjfx/jxyhygl1/zjjs/88xsgzg23cj/jxsj18/content_70362)，腧穴作用、主治规律与特定穴教学目标。用于交叉核验分类框架与“近治、远治、特殊作用”的课程口径。

## 内容策略与已知限制

- `location` 与三步 `landmarks` 是对定位标准的教学性改写，不包含针刺方向、深度、剂量或治疗承诺。
- `traditional` 已逐穴给出精简传统功用与常见主治范围，并明确标注“未审阅”；它是课程理论摘要，不把定位标准误当成临床疗效证据。
- `tags` 收录本批穴位中可核验的特定穴类别，供筛选比较；没有特定类别的穴位不强加标签。
- `anatomy` 是逐穴体表标志附近的英文结构检索词，测试会验证它们能匹配当前 BodyParts3D 清单；它们并非组织穿刺层次。
- 胸背、颈项及孕期相关提醒是保守的学习界面提示，不能替代个体化医疗评估。
- 骨度分寸是相对测量体系；三维模型只用于辅助理解，不应把屏幕坐标理解为真人操作坐标。
