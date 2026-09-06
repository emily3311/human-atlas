import type { Acupoint, LearningCase, Meridian, Region, Source } from './types.ts';

const GB_URL = 'https://zynj.shutcm.edu.cn/_upload/article/files/66/b4/b34a95604d04b0bf686251b2d317/368ea8b0-187c-48a7-a402-ffdf1e11bb99.pdf';
const GB: Source = { title:'GB/T 12346—2021 经穴名称与定位', url:GB_URL, section:'第4章定位方法；第5章经穴名称与定位' };
const WHO: Source = { title: 'WHO Standard Acupuncture Point Locations in the Western Pacific Region', url: 'https://iris.who.int/bitstream/handle/10665/353407/9789290613831-eng.pdf', section: 'General Guidelines; point-specific entries' };
const SAFETY: Source = { title: 'WHO benchmarks for the practice of acupuncture', url: 'https://www.who.int/publications/i/item/978-92-4-001688-0', section: 'Safe practice, pp. 9–13' };
const NCCIH: Source = { title: 'Acupuncture: Effectiveness and Safety', url: 'https://www.nccih.nih.gov/health/acupuncture-effectiveness-and-safety', section: 'Is acupuncture safe?' };
const CLASSIFICATION: Source = { title:'广西中医药大学《针灸学》教学大纲', url:'https://www.gxtcmu.edu.cn/zjtn/jysjs/zjtncfjfx/jxyhygl1/zjx/88xszyctzydwzyzxyxl/jxdg12/content_26039', section:'特定穴分类；八脉交会穴、八会穴及下合穴教学内容' };
const BUCM_SHU_MU: Source = { title:'北京中医药大学远程教育《针灸学》课程', url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c1/c1_62a.htm', section:'背俞穴、募穴及俞募配穴正文' };
const AHTCM_CLASSES: Source = { title:'安徽中医药大学《神灸经纶》灸法选穴规律研究', url:'https://xinan.ahtcm.edu.cn/xiaran.pdf', section:'表3 特定穴分类：原穴、络穴、下合穴、八脉交会穴等' };

export const MERIDIANS: Meridian[] = [
  ['LU','手太阴肺经','肺经','#60a5fa'],['LI','手阳明大肠经','大肠经','#f59e0b'],['ST','足阳明胃经','胃经','#eab308'],
  ['SP','足太阴脾经','脾经','#f97316'],['HT','手少阴心经','心经','#ef4444'],['SI','手太阳小肠经','小肠经','#fb7185'],
  ['BL','足太阳膀胱经','膀胱经','#2563eb'],['KI','足少阴肾经','肾经','#6366f1'],['PC','手厥阴心包经','心包经','#dc2626'],
  ['TE','手少阳三焦经','三焦经','#14b8a6'],['GB','足少阳胆经','胆经','#22c55e'],['LR','足厥阴肝经','肝经','#16a34a'],
  ['GV','督脉','督脉','#8b5cf6'],['CV','任脉','任脉','#ec4899'],
].map(([id,name,shortName,color]) => ({ id, name, shortName, color, description: `${name}学习路径；传统经络分类，不等同于现代解剖结构。` }));

type Seed = [string,string,string,string,Region,string,string[]];
const seeds: Seed[] = [
 ['LU1','中府','Zhōngfǔ','LU','胸腹','前胸外上方，第1肋间隙，锁骨下窝外侧，前正中线旁开6寸。',['找到锁骨外端与锁骨下窝','向下确认第1肋间隙','在前正中线旁开6寸处辨认']],
 ['LU5','尺泽','Chǐzé','LU','上肢','肘前区，肘横纹上，肱二头肌腱桡侧缘凹陷中。',['屈肘显露肘横纹','触认肱二头肌腱','取肌腱桡侧缘凹陷']],
 ['LU7','列缺','Lièquē','LU','上肢','前臂掌面桡侧，桡骨茎突上方，腕掌侧远端横纹上1.5寸。',['找到腕掌侧远端横纹','触认桡骨茎突','沿桡侧向近端量1.5寸']],
 ['LU9','太渊','Tàiyuān','LU','上肢','腕前区，桡骨茎突与舟状骨之间，拇长展肌腱尺侧凹陷中。',['找到腕掌侧横纹','触认桡骨茎突','在桡动脉搏动处附近辨认凹陷']],
 ['LI4','合谷','Hégǔ','LI','上肢','手背，第2掌骨桡侧中点处。',['找到第2掌骨','沿桡侧缘触摸','取掌骨中点附近']],
 ['LI10','手三里','Shǒusānlǐ','LI','上肢','前臂后外侧，肘横纹下2寸，阳溪与曲池连线上。',['屈肘找到曲池','确定阳溪至曲池连线','自曲池向远端量2寸']],
 ['LI11','曲池','Qūchí','LI','上肢','肘外侧，尺泽与肱骨外上髁连线中点。',['屈肘显露肘横纹','找到肱骨外上髁','取尺泽与外上髁连线中点']],
 ['LI20','迎香','Yíngxiāng','LI','头颈','面部，鼻翼外缘中点旁，鼻唇沟中。',['找到鼻翼外缘','确定鼻翼外缘中点','在同水平鼻唇沟取点']],
 ['ST25','天枢','Tiānshū','ST','胸腹','腹部，脐中央旁开2寸。',['找到脐中央','建立水平线','向外量2寸']],
 ['ST36','足三里','Zúsānlǐ','ST','下肢','小腿外侧，犊鼻下3寸，犊鼻与解溪连线上。',['屈膝找到犊鼻','沿犊鼻与解溪连线向下量3寸','在胫骨前肌上核对']],
 ['ST40','丰隆','Fēnglóng','ST','下肢','小腿外侧，外踝尖上8寸，胫骨前肌外缘。',['找到外踝尖','向上量8寸','触认胫骨前肌外缘']],
 ['ST44','内庭','Nèitíng','ST','下肢','足背，第2、3趾间，趾蹼缘后方赤白肉际。',['找到第2与第3趾','沿趾间隙向近端','在趾蹼缘后方取点']],
 ['SP6','三阴交','Sānyīnjiāo','SP','下肢','小腿内侧，内踝尖上3寸，胫骨内侧缘后际。',['找到内踝尖','向上量3寸','触认胫骨内侧缘后际']],
 ['SP9','阴陵泉','Yīnlíngquán','SP','下肢','小腿内侧，胫骨内侧髁后下方凹陷中。',['找到胫骨内侧髁','沿髁后缘向下','取后下方凹陷']],
 ['SP10','血海','Xuèhǎi','SP','下肢','股前内侧，髌底内侧端上2寸，股内侧肌隆起处。',['找到髌底内侧端','向上量2寸','在股内侧肌隆起处取点']],
 ['HT7','神门','Shénmén','HT','上肢','腕前内侧，尺侧腕屈肌腱桡侧缘，腕掌侧远端横纹上。',['找到腕掌侧远端横纹','触认尺侧腕屈肌腱','取肌腱桡侧缘']],
 ['SI3','后溪','Hòuxī','SI','上肢','手内侧，第5掌指关节尺侧近端赤白肉际凹陷中。',['轻握拳显露掌指关节','找到第5掌指关节','取尺侧近端赤白肉际凹陷']],
 ['SI11','天宗','Tiānzōng','SI','背腰','肩胛区，肩胛冈中点与肩胛骨下角连线上1/3与下2/3交点凹陷。',['找到肩胛冈中点','找到肩胛骨下角','取连线上1/3与下2/3交点']],
 ['BL13','肺俞','Fèishū','BL','背腰','上背部，第3胸椎棘突下，后正中线旁开1.5寸。',['定位第3胸椎棘突','取其棘突下水平','向外量1.5寸']],
 ['BL20','脾俞','Píshū','BL','背腰','背部，第11胸椎棘突下，后正中线旁开1.5寸。',['定位第11胸椎棘突','取其棘突下水平','向外量1.5寸']],
 ['BL23','肾俞','Shènshū','BL','背腰','腰部，第2腰椎棘突下，后正中线旁开1.5寸。',['以髂嵴线辅助定位L4','向上辨认第2腰椎','棘突下旁开1.5寸']],
 ['BL40','委中','Wěizhōng','BL','下肢','膝后区，腘横纹中点。',['屈膝显露腘横纹','确定横纹两端','取其中点']],
 ['BL60','昆仑','Kūnlún','BL','下肢','踝后外侧，外踝尖与跟腱之间凹陷中。',['找到外踝尖','触认跟腱','取两者之间凹陷']],
 ['KI1','涌泉','Yǒngquán','KI','下肢','足底，屈足卷趾时足心最凹陷处，约足底前1/3。',['辨认足底前后轴','屈趾显出足心凹陷','核对位于足底前1/3']],
 ['KI3','太溪','Tàixī','KI','下肢','踝后内侧，内踝尖与跟腱之间凹陷中。',['找到内踝尖','触认跟腱','取两者之间凹陷']],
 ['PC6','内关','Nèiguān','PC','上肢','前臂前区，腕掌侧远端横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间。',['找到腕掌侧远端横纹','向近端量2寸','取两条屈肌腱之间']],
 ['PC7','大陵','Dàlíng','PC','上肢','腕前区，腕掌侧远端横纹上，掌长肌腱与桡侧腕屈肌腱之间。',['找到腕掌侧远端横纹','触认两条屈肌腱','取横纹与肌腱间交点']],
 ['TE5','外关','Wàiguān','TE','上肢','前臂后区，腕背侧远端横纹上2寸，尺骨与桡骨间隙中点。',['找到腕背侧远端横纹','向近端量2寸','取尺桡骨间隙中点']],
 ['TE14','肩髎','Jiānliáo','TE','上肢','肩胛区，肩峰角与肱骨大结节之间凹陷中。',['外展上臂','找到肩峰角','取其后下方与大结节间凹陷']],
 ['GB20','风池','Fēngchí','GB','头颈','颈后区，枕骨下，胸锁乳突肌上端与斜方肌上端之间凹陷中。',['找到枕骨下缘','触认胸锁乳突肌与斜方肌','取两肌上端之间凹陷']],
 ['GB21','肩井','Jiānjǐng','GB','上肢','肩胛区，第7颈椎棘突与肩峰最外侧点连线中点。',['低头找到C7棘突','找到肩峰最外侧点','取两点连线中点']],
 ['GB34','阳陵泉','Yánglíngquán','GB','下肢','小腿外侧，腓骨头前下方凹陷中。',['找到腓骨头','沿前缘向下','取前下方凹陷']],
 ['LR3','太冲','Tàichōng','LR','下肢','足背，第1、2跖骨间，跖骨底结合部前方凹陷中。',['找到第1与第2跖骨','沿骨间隙向近端','取跖骨底结合部前凹陷']],
 ['GV14','大椎','Dàzhuī','GV','头颈','脊柱区，第7颈椎棘突下凹陷中，后正中线上。',['低头辨认突起明显的颈胸交界','以转头法辅助鉴别C7','取C7棘突下正中凹陷']],
 ['GV20','百会','Bǎihuì','GV','头颈','头顶部，前发际正中直上5寸，或两耳尖连线与头正中线交点。',['建立头正中线','连接两耳尖','取两线交点并核对前发际5寸']],
 ['CV4','关元','Guānyuán','CV','胸腹','下腹部，脐中下3寸，前正中线上。',['找到脐中央','沿前正中线向下','量3寸取点']],
 ['CV6','气海','Qìhǎi','CV','胸腹','下腹部，脐中下1.5寸，前正中线上。',['找到脐中央','沿前正中线向下','量1.5寸取点']],
 ['CV12','中脘','Zhōngwǎn','CV','胸腹','上腹部，脐中上4寸，前正中线上。',['找到脐中央','找到剑突尖','在脐中与剑突尖连线中点取点']],
 ['CV17','膻中','Dànzhōng','CV','胸腹','前胸部，横平第4肋间隙，前正中线上。',['找到胸骨正中线','辨认第4肋间隙水平','取该水平与正中线交点']],
];

const sensitive = new Set(['LU1','GB20','GB21','CV17','BL13','BL20','BL23']);
const pregnancy = new Set(['LI4','SP6','GB21','CV4','CV6']);
const traditional: Record<string,string> = {
 LU1:'宣肺止咳、清泻肺热；传统常用于咳嗽、气喘及胸部胀满。', LU5:'清肺泻火、降逆止咳；传统常用于咳嗽、气喘及肘臂不利。', LU7:'宣肺解表、利咽通络；传统常用于咳嗽、头项不适及腕痛。', LU9:'补肺益气、止咳化痰；传统常用于咳嗽、气喘及腕痛。',
 LI4:'疏风解表、通络止痛；传统常用于头面五官不适及手部疼痛。', LI10:'疏经通络、调理肠胃；传统常用于肘臂疼痛及腹部不适。', LI11:'清热疏风、调和气血；传统常用于发热、皮肤不适及肘臂疼痛。', LI20:'宣通鼻窍、疏散风热；传统常用于鼻塞、鼻部及面部不适。',
 ST25:'调理肠腑、理气消滞；传统常用于腹痛、腹胀及排便异常。', ST36:'健脾和胃、补益气血；传统常用于胃肠不适、下肢不利及虚弱。', ST40:'健脾化痰、和胃降逆；传统常用于痰多、眩晕及下肢不适。', ST44:'清胃泄热、理气止痛；传统常用于齿痛、面部及胃肠不适。',
 SP6:'健脾化湿、调补肝肾；传统常用于腹部、泌尿生殖及下肢不适。', SP9:'健脾利湿、通利水道；传统常用于水湿、膝胫及腹部不适。', SP10:'活血化瘀、凉血调血；传统常用于皮肤、月经及股膝不适。',
 HT7:'养心安神、清心调气；传统常用于心悸、失眠及腕部不适。', SI3:'通督舒筋、清心安神；传统常用于头项、腰背及手部不适。', SI11:'舒筋通络、理气止痛；传统常用于肩胛及上肢活动不利。',
 BL13:'宣肺理气、止咳平喘；传统常用于咳嗽、气喘及背部不适。', BL20:'健脾益气、和胃化湿；传统常用于食少、腹胀及背部不适。', BL23:'补肾强腰、调利水道；传统常用于腰部、泌尿及生殖系统不适。', BL40:'舒筋活络、清热利湿；传统常用于腰背、膝后及下肢不适。', BL60:'舒筋活络、清利头目；传统常用于头项、腰背及踝部不适。',
 KI1:'苏厥开窍、清降虚火；传统常用于神志、头面及足底不适。', KI3:'滋肾益阴、强腰健骨；传统常用于腰膝、耳及泌尿生殖不适。', PC6:'宁心安神、和胃降逆；传统常用于胸闷心悸、恶心及腕臂不适。', PC7:'宁心安神、清心和胃；传统常用于心悸、失眠及腕部不适。',
 TE5:'疏风解表、通络止痛；传统常用于头面五官、发热及前臂不适。', TE14:'舒筋利节、通络止痛；传统常用于肩臂疼痛及活动受限。', GB20:'疏风清热、清利头目；传统常用于头痛、眩晕及颈项不适。', GB21:'舒筋通络、理气散结；传统常用于颈肩不适。', GB34:'疏肝利胆、舒筋通络；传统常用于胁肋、膝腿及筋脉不适。',
 LR3:'疏肝理气、平息肝阳；传统常用于头目、情志及足部不适。', GV14:'清热解表、振奋阳气；传统常用于发热、头项及脊背不适。', GV20:'醒脑开窍、升阳举陷；传统常用于头痛、眩晕及神志不适。',
 CV4:'培补元气、温肾固本；传统常用于下腹、泌尿生殖及虚弱。', CV6:'益气固本、调理下焦；传统常用于下腹、气虚及泌尿生殖不适。', CV12:'和胃健脾、降逆化痰；传统常用于上腹胀痛、恶心及食欲不振。', CV17:'宽胸理气、调畅气机；传统常用于胸闷、气短及乳部不适。',
};
const traditionalSources: Partial<Record<string,Source[]>> = {
 LU5:[{title:'北京中医药大学远程教育《针灸学》课程',url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c1/c1_61a.htm',section:'五输穴临床应用：尺泽与肺实证喘咳、胸满、咽痛'}],
 LU9:[{title:'北京中医药大学远程教育《针灸学》课程',url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c1/c1_61a.htm',section:'五输穴临床应用：太渊与肺虚证喘咳、胸满、少气'}],
 LI4:[{title:'上海中医药大学护理学院：吃吃喝喝的春节到了',url:'https://hl.shutcm.edu.cn/2018/0705/c2501a28044/page.htm',section:'“牙疼：按揉合谷和偏历穴”合谷条目'}],
 PC6:[{title:'上海中医药大学创新创业学院：中医药文化探索之旅',url:'https://cxy.shutcm.edu.cn/2023/1205/c3664a157123/page.htm',section:'内关穴：心慌、晕车、呕吐、胃痛等传统保健用途'}],
 KI1:[{title:'上海中医药大学创新创业学院：中医药文化探索之旅',url:'https://cxy.shutcm.edu.cn/2023/1205/c3664a157123/page.htm',section:'涌泉穴：劳累、头晕、潮热、腰痛等传统保健用途'}],
 ST36:[{title:'香港中文大学中医学院：Staff Appreciation Day 2025',url:'https://www.hro.cuhk.edu.hk/en-gb/about/events-highlights/823-staff-appreciation-day-2025',section:'Qi and Blood Activation Technique—Zusanli (ST36)'}],
 GV20:[{title:'上海中医药大学国际教育学院：趣味穴位课',url:'https://iec.shutcm.edu.cn/2026/0611/c179a174108/page.htm',section:'百会穴：提神醒脑的传统保健用途'}],
 BL13:[{title:'清华大学附属北京清华长庚医院中医科：过敏性鼻炎科普',url:'https://www.btch.edu.cn/ksdh/zkb/zyk/jkjy_zyk/b8dfd41993d74b65a8e083c92609fdff.htm',section:'肺俞、脾俞等背俞穴的传统配伍说明'}],
 BL20:[{title:'清华大学附属北京清华长庚医院中医科：过敏性鼻炎科普',url:'https://www.btch.edu.cn/ksdh/zkb/zyk/jkjy_zyk/b8dfd41993d74b65a8e083c92609fdff.htm',section:'肺俞、脾俞等背俞穴的传统配伍说明'}],
 BL23:[{title:'清华大学附属北京清华长庚医院中医科：过敏性鼻炎科普',url:'https://www.btch.edu.cn/ksdh/zkb/zyk/jkjy_zyk/b8dfd41993d74b65a8e083c92609fdff.htm',section:'肾俞温补肾阳的传统理论说明'}],
 SP9:[{title:'北京中医药大学远程教育《针灸学》课程',url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c2/c2_9b_2.htm',section:'胁痛辨证配穴：阴陵泉健脾除湿'}],
 GB34:[{title:'北京中医药大学远程教育《针灸学》课程',url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c2/c2_9b_2.htm',section:'阳陵泉疏理肝胆、调理气血'}],
 LR3:[{title:'北京中医药大学远程教育《针灸学》课程',url:'https://jxjyxb.bucm.edu.cn/BZYAttachs/courseware/zhenjiuxue/c2/c2_9b_2.htm',section:'太冲疏肝解郁的传统配穴说明'}],
 CV4:[{title:'湖北中医药大学王华名老中医传承工作室',url:'https://www.hbucm.edu.cn/wanghua/info/1004/1047.htm',section:'足三里、关元配伍：关元益精补气、扶助人体之本'}],
};
const classSources: Partial<Record<string,Source[]>> = {
 LU1:[BUCM_SHU_MU],ST25:[BUCM_SHU_MU],CV4:[BUCM_SHU_MU],BL13:[BUCM_SHU_MU],BL20:[BUCM_SHU_MU],BL23:[BUCM_SHU_MU],
 LU7:[CLASSIFICATION,AHTCM_CLASSES],SI3:[CLASSIFICATION,AHTCM_CLASSES],PC6:[CLASSIFICATION,AHTCM_CLASSES],TE5:[CLASSIFICATION,AHTCM_CLASSES],
 LU9:[CLASSIFICATION,AHTCM_CLASSES],GB34:[CLASSIFICATION,AHTCM_CLASSES],CV12:[BUCM_SHU_MU,CLASSIFICATION],CV17:[CLASSIFICATION],
 LI4:[AHTCM_CLASSES],HT7:[AHTCM_CLASSES],KI3:[AHTCM_CLASSES],PC7:[AHTCM_CLASSES],LR3:[AHTCM_CLASSES],ST36:[AHTCM_CLASSES],ST40:[AHTCM_CLASSES],BL40:[AHTCM_CLASSES],
};
const classes: Record<string,string[]> = {
 LU1:['募穴'],LU5:['合穴'],LU7:['络穴','八脉交会穴'],LU9:['输穴','原穴','八会穴'], LI4:['原穴'],LI11:['合穴'],LI20:['交会穴'],
 ST25:['募穴'],ST36:['合穴','下合穴'],ST40:['络穴'],ST44:['荥穴'], SP6:['交会穴'],SP9:['合穴'], HT7:['输穴','原穴'],SI3:['输穴','八脉交会穴'],
 BL13:['背俞穴'],BL20:['背俞穴'],BL23:['背俞穴'],BL40:['合穴','下合穴'],BL60:['经穴'], KI1:['井穴'],KI3:['输穴','原穴'],
 PC6:['络穴','八脉交会穴'],PC7:['输穴','原穴'],TE5:['络穴','八脉交会穴'], GB20:['交会穴'],GB21:['交会穴'],GB34:['合穴','下合穴','八会穴'],
 LR3:['输穴','原穴'],GV14:['交会穴'],GV20:['交会穴'],CV4:['募穴','交会穴'],CV12:['募穴','八会穴'],CV17:['募穴','八会穴'],
};
const anatomy: Record<string,string[]> = {
 LU1:['clavicle','pectoralis major','first rib'],LU5:['biceps brachii','radius'],LU7:['radius','brachioradialis'],LU9:['radius','radial artery'],
 LI4:['second metacarpal bone'],LI10:['radius','brachioradialis'],LI11:['humerus','brachioradialis'],LI20:['nasal bone','lateral nasal cartilage'],
 ST25:['external oblique','abdominal aorta'],ST36:['tibia','tibialis anterior','patella'],ST40:['tibia','tibialis anterior','fibula'],ST44:['second metatarsal bone','third metatarsal bone'],
 SP6:['tibia','tibialis posterior'],SP9:['tibia','gastrocnemius'],SP10:['patella','vastus medialis'],HT7:['ulna','flexor carpi ulnaris'],SI3:['fifth metacarpal bone'],SI11:['scapula','infraspinatus'],
 BL13:['third thoracic vertebra','rib'],BL20:['eleventh thoracic vertebra'],BL23:['second lumbar vertebra'],BL40:['gastrocnemius','popliteal artery'],BL60:['fibula','calcaneus','calcaneal tendon'],
 KI1:['second metatarsal bone','long plantar ligament'],KI3:['tibia','calcaneus','calcaneal tendon'],PC6:['radius','ulna','palmaris longus'],PC7:['radius','flexor carpi radialis'],TE5:['radius','ulna'],TE14:['scapula','humerus','deltoid'],
 GB20:['occipital bone','trapezius','sternocleidomastoid'],GB21:['seventh cervical vertebra','scapula','trapezius'],GB34:['fibula','tibialis anterior'],LR3:['first metatarsal bone','second metatarsal bone'],
 GV14:['seventh cervical vertebra','first thoracic vertebra'],GV20:['parietal bone'],CV4:['external oblique','urinary bladder'],CV6:['external oblique','abdominal aorta'],CV12:['body of sternum','stomach'],CV17:['body of sternum','fourth rib'],
};
const chapter: Record<string,number> = {LU:1,LI:2,ST:3,SP:4,HT:5,SI:6,BL:7,KI:8,PC:9,TE:10,GB:11,LR:12,GV:13,CV:14};

export const ACUPOINTS: Acupoint[] = seeds.map(([id,name,pinyin,meridian,region,location,landmarks]) => ({
  id,name,pinyin,meridian,region,location,landmarks,
  bilateral: !['GV','CV'].includes(meridian),
  traditional: `${traditionalSources[id] ? '传统功用（机构资料已交叉核对，仍未经课程教师审阅）' : '传统教材常见提要（待逐条来源核验、未经课程教师审阅）'}：${traditional[id]}仅作理论学习，不代表现代临床疗效结论。`,
  caution: `${sensitive.has(id) ? '邻近重要深部结构，仅作体表定位学习；' : ''}${pregnancy.has(id) ? '孕期相关操作须先由合格专业人员评估；' : ''}本资料不提供针刺深度或操作建议，请勿自行针刺。`,
  tags: [MERIDIANS.find((m)=>m.id===meridian)!.shortName,region,...(classes[id] ?? [])],
  anatomy: anatomy[id],
  sources: [
    { title:'GB/T 12346—2021 经穴名称与定位', url:GB_URL, section:`第5.${chapter[meridian]}节 ${id} ${name}` },
    { ...WHO, section:`Point ${id} ${name}; general location guidelines` },
    ...(classSources[id] ?? []),
    ...(traditionalSources[id] ?? []),
    ...(sensitive.has(id)||pregnancy.has(id)?[SAFETY,NCCIH]:[]),
  ],
}));

export const CASES: LearningCase[] = [
  { id:'case-landmark', title:'骨度分寸与固定标志', level:'入门', prompt:'学习定位足三里时，哪种做法最符合本应用的教学顺序？', options:['先找犊鼻，再量3寸并核对胫骨前嵴','直接按自己的三横指固定换算所有人','只看三维坐标，不触认标志','根据症状猜位置'], answer:0, explanation:'原创、未审阅教学案例。国标定位强调体表解剖标志与骨度分寸；个体比例不能被固定厘米数替代。', pointIds:['ST36'], sources:[GB,WHO] },
  { id:'case-classification', title:'经脉编码辨析', level:'入门', prompt:'以下哪组全部属于奇经中的任、督二脉，且位于正中线？', options:['GV14、CV12','LI4、LU9','ST36、SP6','PC6、TE5'], answer:0, explanation:'原创、未审阅教学案例。GV/CV 分别用于督脉和任脉；本数据中两者为正中单穴，其余所列十二经穴按双侧学习。', pointIds:['GV14','CV12'], sources:[GB,WHO] },
  { id:'case-safety', title:'安全边界判断', level:'进阶', prompt:'在胸背或颈项穴位的自学界面中，最合适的行动是什么？', options:['只做体表标志辨认，不自行进针','按图估算深度后自行针刺','认为定位标准已经证明疗效','忽略个体差异'], answer:0, explanation:'原创、未审阅安全推理案例。定位材料不等于操作训练或疗效证据；不当针刺可能造成感染、脏器穿刺或神经系统损伤。', pointIds:['LU1','BL13','GB20','CV17'], sources:[SAFETY,NCCIH,GB] },
];
