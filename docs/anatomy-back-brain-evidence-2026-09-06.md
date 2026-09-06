# 背部肌肉与脑部结构：名称对照证据

2026-09-06 核查。来源：复旦大学《系统解剖学》网站托管的[《人体解剖学名词》第二版](https://xtjp.fudan.edu.cn/Upload/Files/201804100314393640155.pdf)。本批只提取中英文名称事实，不复制定义、插图或整本资料。

主代理使用已有原始 PDF `/tmp/atlas-fudan-anatomy-terms.pdf`，提取正文定位后，将 PDF 页 116–118、339–341 渲染并逐页目视核对条目编号及中英文词形。Jina Reader 本轮亦成功读取原网址，确认标题、586 页及来源地址。页码为 PDF 页，不是书页。

以下 22 个核心名称与图谱名称完全相同；只剥离图谱已有的 Left/Right 前缀，每个对应 2 个实际网格，共 44 个待查证条目。本批没有采用泛化翻译、猜测同义词或新增模型分类。

| 图谱核心英文 | 中文 | 术语编号 | PDF 页 |
| --- | --- | --- | --- |
| levator scapulae | 肩胛提肌 | 02.1514 | 116 |
| serratus posterior inferior | 下后锯肌 | 02.1515 | 116 |
| serratus posterior superior | 上后锯肌 | 02.1516 | 116 |
| iliocostalis thoracis | 胸髂肋肌 | 02.1522 | 117 |
| longissimus thoracis | 胸最长肌 | 02.1525 | 117 |
| longissimus cervicis | 颈最长肌 | 02.1526 | 117 |
| spinalis thoracis | 胸棘肌 | 02.1529 | 117 |
| semispinalis thoracis | 胸半棘肌 | 02.1534 | 117 |
| semispinalis capitis | 头半棘肌 | 02.1536 | 118 |
| precentral gyrus | 中央前回 | 06.0586 | 339 |
| superior frontal gyrus | 额上回 | 06.0588 | 339 |
| middle frontal gyrus | 额中回 | 06.0590 | 339 |
| inferior frontal gyrus | 额下回 | 06.0591 | 339 |
| postcentral gyrus | 中央后回 | 06.0598 | 340 |
| superior parietal lobule | 顶上小叶 | 06.0600 | 340 |
| supramarginal gyrus | 缘上回 | 06.0603 | 340 |
| angular gyrus | 角回 | 06.0604 | 340 |
| occipital lobe | 枕叶 | 06.0605 | 340 |
| middle temporal gyrus | 颞中回 | 06.0613 | 340 |
| inferior temporal gyrus | 颞下回 | 06.0614 | 340 |
| cingulate gyrus | 扣带回 | 06.0626 | 341 |
| lamina terminalis | 终板 | 06.0634 | 341 |

这属于来源与名称对应核查，不代表医生逐网格审校。没有使用书中定义生成诊疗建议、针刺位置或考试解析。内容入库与最终覆盖率由测试另行确认。

## 本轮题库补充来源检查

- TCMBench 仓库 LICENSE API 本轮仍返回 404，不能据此推定允许复制其解析。
- MTCMB 的 TCM-ED-B 说明仍将商业教育题库称为官方题库；字段仅列 question/options/answer/source，没有解析。不能把代码/研究许可自动当作商业题目再发布授权。
- TCMLE 解析问题的既有审计仍保留；Jina 对 Hugging Face 请求返回临时 403，本轮未绕过限制，也未用未读取的内容作新增核查证据。
- agent-reach 的 Exa 后端在当前配置不可用（Unknown MCP server），改用可用网页搜索及 GitHub 官方 API，并对原始来源进行读取。

本轮没有将上述候选题库自动导入，也没有给 CMB 原数据编造解析。原有 4086 题保持不变。
