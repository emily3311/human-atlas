import type { Acupoint, Region } from './types.ts';
const SOURCE='https://zynj.shutcm.edu.cn/_upload/article/files/66/b4/b34a95604d04b0bf686251b2d317/72823dbe-8f55-4e2b-b98b-ff106160f598.pdf';
type ExtraSeed=[string,string,string,Region,string,string,number,string];
const seeds:ExtraSeed[]=[
 ['EX-HN1','四神聪','Sìshéncōng','头颈','百会前、后、左、右各旁开1寸。','7.1.1',6,'4点穴组'],
 ['EX-HN5','太阳','Tàiyáng','头颈','眉梢与目外眦之间，向后约一横指的凹陷中。','7.1.4',6,'双侧穴'],
 ['EX-HN12','金津','Jīnjīn','头颈','口腔内，舌下系带左侧静脉上。','7.1.11',6,'口内左侧；与玉液合列国标条目'],
 ['EX-HN13','玉液','Yùyè','头颈','口腔内，舌下系带右侧静脉上。','7.1.11',6,'口内右侧；与金津合列国标条目'],
 ['LOCAL-QIANZHENG','牵正','Qiānzhèng','头颈','面颊部，耳垂前方0.5～1寸，与耳垂中点相平。','7.1.14',7,'双侧穴'],
 ['LOCAL-ANMIAN','安眠','Ānmián','头颈','项部，翳风与风池连线的中点。','7.1.13',7,'双侧穴'],
 ['EX-B1','定喘','Dìngchuǎn','背腰','第7颈椎棘突下水平，后正中线旁开0.5寸。','7.3.1',8,'双侧穴'],
 ['EX-B2','夹脊','Jiájǐ','背腰','第1胸椎至第5腰椎棘突下两侧，后正中线旁开0.5寸；每侧17穴。','7.3.2',8,'34点穴组'],
 ['EX-B3','胃脘下俞','Wèiwǎnxiàshū','背腰','第8胸椎棘突下水平，后正中线旁开1.5寸。','7.3.3',8,'双侧穴'],
 ['EX-B7','腰眼','Yāoyǎn','背腰','第4腰椎棘突下水平，后正中线旁开约3.5寸凹陷。','7.3.7',9,'双侧穴'],
 ['EX-B8','十七椎','Shíqīzhuī','背腰','第5腰椎棘突下凹陷中。','7.3.8',9,'正中单点'],
 ['EX-UE7','腰痛点','Yāotòngdiǎn','上肢','手背第2、3掌骨间及第4、5掌骨间，腕背侧远端横纹与掌指关节的中点水平。','7.5.7',10,'每手2点，共4点'],
 ['EX-UE8','外劳宫','Wàiláogōng','上肢','手背第2、3掌骨间，掌指关节后0.5指寸凹陷。','7.5.8',10,'每手1点'],
 ['EX-UE9','八邪','Bāxié','上肢','手背各指间，指蹼缘后方赤白肉际。','7.5.9',10,'左右共8点；含液门重合点'],
 ['EX-UE10','四缝','Sìfèng','上肢','第2～5指掌面的近侧指间关节横纹中央。','7.5.10',10,'每手4点，共8点'],
 ['EX-UE11','十宣','Shíxuān','上肢','十指尖端，距指甲游离缘0.1指寸。','7.5.11',10,'共10点；中指尖与中冲重合'],
 ['EX-LE4','内膝眼','Nèixīyǎn','下肢','膝部，髌韧带内侧凹陷中央。','7.6.4',10,'双侧穴'],
 ['EX-LE6','胆囊','Dǎnnáng','下肢','小腿外侧，腓骨小头直下2寸。','7.6.5',10,'双侧穴'],
 ['EX-LE7','阑尾','Lánwěi','下肢','小腿外侧，髌韧带外侧凹陷下5寸，胫骨前嵴外一横指。','7.6.6',10,'双侧穴'],
 ['EX-LE10','八风','Bāfēng','下肢','足背各趾间，趾蹼缘后方赤白肉际。','7.6.9',11,'左右共8点；含行间、内庭、侠溪重合点'],
];
export const EXTRA_POINTS:Acupoint[]=seeds.map(([id,name,pinyin,region,location,section,page,groupNote])=>({
 id,name,pinyin,meridian:'EX',region,location,groupNote,bilateral:!['EX-HN1','EX-HN12','EX-HN13','EX-B8'].includes(id),
 catalogueKind:'extra',annotationsReady:false,landmarks:[],traditional:'',anatomy:[],
 caution:'多点穴组、口内穴及个体体表标志不能用一个随意的三维坐标代替。此条目不提供针刺或施灸操作方案。',
 tags:['经外奇穴',region],classificationEvidence:[],pendingClassificationTags:[],
 ...(id.startsWith('LOCAL-')?{displayCode:'未赋标准码',codeNote:'所引标准文本没有为本穴赋英文代码；内部条目ID不是国标编码。'}:{}),
 sources:[{title:'GB/T40997—2021 经外奇穴名称与定位（大学公开文本，待正式版对校）',url:`${SOURCE}#page=${page}`,section:`第${section}条；PDF第${page}页。公开文本有排印残留，尚待与正式排印版核对。${name==='安眠'?'原文“连7线”按“连线”整理。':''}`}],
}));
EXTRA_POINTS.push({
 id:'LOCAL-SANJIAOJIU',name:'三角灸',pinyin:'Sānjiǎojiǔ',meridian:'EX',region:'胸腹',location:'',bilateral:false,
 catalogueKind:'extra',annotationsReady:false,displayCode:'定位待核验',groupNote:'考纲明列条目 · 未开放定位练习',
 codeNote:'当前仅核实考试大纲收录。未核实标准代码与定位依据，不编造国标编码或模型坐标。',
 landmarks:[],traditional:'',anatomy:[],caution:'请依据考试指定教材并在教师指导下核对本条目，不以资料占位条目作为操作依据。',
 tags:['经外奇穴','胸腹'],classificationEvidence:[],pendingClassificationTags:[],
 sources:[{title:'中医执业医师2025版医学综合考试大纲',url:'https://www.tcmtest.org.cn/ueditor/jsp/upload/file/20250122/1737513338350050128.pdf#page=64',section:'印刷第56页奇穴名单；仅支持考纲收录，不支持定位或操作答案。'}],
});
