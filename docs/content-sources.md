# 中医经穴内容来源与边界

## 核心定位来源

- [GB/T 12346—2021《经穴名称与定位》上海中医药大学公开全文](https://zynj.shutcm.edu.cn/_upload/article/files/66/b4/b34a95604d04b0bf686251b2d317/368ea8b0-187c-48a7-a402-ffdf1e11bb99.pdf)，第 4 章定位方法、第 5 章逐经逐穴条目。现行中国推荐性国家标准，规定 14 条经脉、362 个经穴的名称与定位；本项目 39 点的中文名称、编码和定位以此为主，数据内逐穴标注第 5 章所属经脉小节。
- [全国标准信息公共服务平台标准页](https://std.samr.gov.cn/gb/search/gbDetailed?id=D1E86BE73ADD430EE05397BE0A0A206B)，基础信息与标准状态。用于核验 GB/T 12346—2021 为现行标准、主管部门为国家中医药局。
- [WHO Standard Acupuncture Point Locations in the Western Pacific Region](https://iris.who.int/bitstream/handle/10665/353407/9789290613831-eng.pdf)，General Guidelines、各经穴条目。用于核对国际编码、英文解剖方向和骨度分寸方法。该标准收录 361 点，不能替代 2021 中国国标的 362 点口径。

## 安全来源

- [WHO benchmarks for the practice of acupuncture](https://www.who.int/publications/i/item/978-92-4-001688-0)，Safe practice，pp. 9–13。用于“应由受训人员实施、风险评估和安全边界”的总体原则。
- [美国 NCCIH：Acupuncture: Effectiveness and Safety](https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety)，Is acupuncture safe? 用于概括不当操作可能导致感染、器官损伤和中枢神经系统损伤；不作为穴位定位或传统主治来源。

## 传统理论与特定穴分类来源

- [广西中医药大学《针灸学》教学大纲](https://www.gxtcmu.edu.cn/zjtn/jysjs/zjtncfjfx/jxyhygl1/zjx/88xszyctzydwzyzxyxl/jxdg12/content_26039)，特定穴分类及八脉交会穴、八会穴、下合穴正文。它直接列出列缺、内关、后溪、外关等八脉交会穴，以及太渊、中脘、膻中、阳陵泉等八会穴。[北京中医药大学课程正文](https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c1/c1_62a.htm)直接说明肺俞、脾俞、肾俞等背俞穴及中府、天枢、关元、中脘等募穴。[安徽中医药大学论文表 3](https://xinan.ahtcm.edu.cn/xiaran.pdf)直接列出原穴、络穴、下合穴与八脉交会穴的具体穴名。数据仅在相应点附上实际覆盖它的分类来源；其余类别仍待教材逐项复核。
- [上海中医药大学护理学院：合谷条目](https://hl.shutcm.edu.cn/2018/0705/c2501a28044/page.htm)、[上海中医药大学社区课程：内关与涌泉](https://cxy.shutcm.edu.cn/2023/1205/c3664a157123/page.htm)、[香港中文大学中医学院：足三里](https://www.hro.cuhk.edu.hk/en-gb/about/events-highlights/823-staff-appreciation-day-2025)、[上海中医药大学国际教育学院：百会](https://iec.shutcm.edu.cn/2026/0611/c179a174108/page.htm)、[清华大学附属北京清华长庚医院中医科：肺俞、脾俞、肾俞](https://www.btch.edu.cn/ksdh/zkb/zyk/jkjy_zyk/b8dfd41993d74b65a8e083c92609fdff.htm)。这些页面正文直接描述相应穴位的传统用途；数据内只对其明确覆盖的 14 个穴位标记“机构资料已交叉核对”。

## 内容策略与已知限制

- `location` 与三步 `landmarks` 是对定位标准的教学性改写，不包含针刺方向、深度、剂量或治疗承诺。
- `traditional` 已逐穴给出精简传统功用与常见主治范围。14 个有可直接访问机构正文的穴位标为“机构资料已交叉核对”；其余 25 个明确标为“待逐条来源核验”。全部内容仍未经课程教师审阅，且不把定位标准误当成疗效证据。
- `tags` 收录特定穴类别供筛选比较。八脉交会穴与八会穴有大学课程正文直接列名；原穴、络穴、五输穴、背俞穴、募穴和交会穴映射属于传统教材分类，尚待教师依据指定教材逐条签核。
- `anatomy` 是逐穴体表标志附近的英文结构检索词，测试会验证它们能匹配当前 BodyParts3D 清单；它们并非组织穿刺层次。
- 胸背、颈项及孕期相关提醒是保守的学习界面提示，不能替代个体化医疗评估。
- 骨度分寸是相对测量体系；三维模型只用于辅助理解，不应把屏幕坐标理解为真人操作坐标。
- 国标核对记录：ST36 采用“犊鼻下 3 寸，犊鼻与解溪连线上”；CV17 国标拼音为 `Dànzhōng`，不是 `Shānzhōng`。
