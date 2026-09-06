import type { Region } from './types.ts';
export interface StandardPoint {
  id: string; name: string; pinyin: string; meridian: string; region: Region;
  location: string; section: string; page: number;
}
export const STANDARD_POINTS: StandardPoint[] = [
  {
    "id": "LU1",
    "name": "中府",
    "pinyin": "Zhōngfǔ",
    "meridian": "LU",
    "region": "胸腹",
    "location": "前胸部，横平第1肋间隙，锁骨下窝外侧，前正中线旁开6寸。",
    "section": "5.1.1",
    "page": 13
  },
  {
    "id": "LU2",
    "name": "云门",
    "pinyin": "Yúnmén",
    "meridian": "LU",
    "region": "胸腹",
    "location": "前胸部，锁骨下窝凹陷中，肩胛骨喙突内缘，前正中线旁开6寸。",
    "section": "5.1.2",
    "page": 13
  },
  {
    "id": "LU3",
    "name": "天府",
    "pinyin": "Tiānfǔ",
    "meridian": "LU",
    "region": "上肢",
    "location": "臂前外侧，腋前纹头下3寸，肱二头肌桡侧缘处。",
    "section": "5.1.3",
    "page": 13
  },
  {
    "id": "LU4",
    "name": "侠白",
    "pinyin": "Xiábái",
    "meridian": "LU",
    "region": "上肢",
    "location": "臂前外侧，腋前纹头下4寸，肱二头肌桡侧缘处。",
    "section": "5.1.4",
    "page": 13
  },
  {
    "id": "LU5",
    "name": "尺泽",
    "pinyin": "Chǐzé",
    "meridian": "LU",
    "region": "上肢",
    "location": "肘前侧，肘横纹上，肱二头肌腱桡侧缘凹陷中。",
    "section": "5.1.5",
    "page": 13
  },
  {
    "id": "LU6",
    "name": "孔最",
    "pinyin": "Kǒngzuì",
    "meridian": "LU",
    "region": "上肢",
    "location": "前臂前外侧，腕掌侧远端横纹上7寸，尺泽（LU5）与太渊（LU9）连线上。",
    "section": "5.1.6",
    "page": 13
  },
  {
    "id": "LU7",
    "name": "列缺",
    "pinyin": "Lièquē",
    "meridian": "LU",
    "region": "上肢",
    "location": "前臂外侧，腕掌侧远端横纹上1.5寸，拇短伸肌腱与拇长展肌腱之间，拇长展肌腱沟的凹陷中。",
    "section": "5.1.7",
    "page": 13
  },
  {
    "id": "LU8",
    "name": "经渠",
    "pinyin": "Jīngqú",
    "meridian": "LU",
    "region": "上肢",
    "location": "前臂前外侧，腕掌侧远端横纹上1寸，桡骨茎突与桡动脉之间。",
    "section": "5.1.8",
    "page": 13
  },
  {
    "id": "LU9",
    "name": "太渊",
    "pinyin": "Tàiyuān",
    "meridian": "LU",
    "region": "上肢",
    "location": "腕前外侧，桡骨茎突与腕舟状骨之间，拇长展肌腱尺侧凹陷中。",
    "section": "5.1.9",
    "page": 13
  },
  {
    "id": "LU10",
    "name": "鱼际",
    "pinyin": "Yújì",
    "meridian": "LU",
    "region": "上肢",
    "location": "手掌，第1掌骨桡侧中点赤白肉际处。",
    "section": "5.1.10",
    "page": 13
  },
  {
    "id": "LU11",
    "name": "少商",
    "pinyin": "Shàoshāng",
    "meridian": "LU",
    "region": "上肢",
    "location": "手指，拇指末节桡侧，指甲根角侧上方0.1寸。",
    "section": "5.1.11",
    "page": 13
  },
  {
    "id": "LI1",
    "name": "商阳",
    "pinyin": "Shāngyáng",
    "meridian": "LI",
    "region": "上肢",
    "location": "手指，食指末节桡侧，指甲根角侧上方0.1寸。",
    "section": "5.2.1",
    "page": 13
  },
  {
    "id": "LI2",
    "name": "二间",
    "pinyin": "Èrjiān",
    "meridian": "LI",
    "region": "上肢",
    "location": "手指，第2掌指关节桡侧远端赤白肉际处。",
    "section": "5.2.2",
    "page": 13
  },
  {
    "id": "LI3",
    "name": "三间",
    "pinyin": "Sānjiān",
    "meridian": "LI",
    "region": "上肢",
    "location": "手背，第2掌指关节桡侧近端凹陷中。",
    "section": "5.2.3",
    "page": 14
  },
  {
    "id": "LI4",
    "name": "合谷",
    "pinyin": "Hégǔ",
    "meridian": "LI",
    "region": "上肢",
    "location": "手背，第一掌骨和第二掌骨之间，约平第2掌骨桡侧的中点。",
    "section": "5.2.4",
    "page": 14
  },
  {
    "id": "LI5",
    "name": "阳溪",
    "pinyin": "Yángxī",
    "meridian": "LI",
    "region": "上肢",
    "location": "腕后外侧，腕背侧远端横纹桡侧，桡骨茎突远端，解剖学“鼻烟窝”凹陷中。",
    "section": "5.2.5",
    "page": 14
  },
  {
    "id": "LI6",
    "name": "偏历",
    "pinyin": "Piānlì",
    "meridian": "LI",
    "region": "上肢",
    "location": "前臂后外侧，腕背侧远端横纹上3寸，阳溪（LI5）与曲池（LI11）连线上。",
    "section": "5.2.6",
    "page": 14
  },
  {
    "id": "LI7",
    "name": "温溜",
    "pinyin": "Wēnliū",
    "meridian": "LI",
    "region": "上肢",
    "location": "前臂后外侧，腕背侧远端横纹上5寸，阳溪（LI5）与曲池（LI11）连线上。",
    "section": "5.2.7",
    "page": 14
  },
  {
    "id": "LI8",
    "name": "下廉",
    "pinyin": "Xiàlián",
    "meridian": "LI",
    "region": "上肢",
    "location": "前臂后外侧，肘横纹下4寸，阳溪（LI5）与曲池（LI11）连线上。",
    "section": "5.2.8",
    "page": 14
  },
  {
    "id": "LI9",
    "name": "上廉",
    "pinyin": "Shànglián",
    "meridian": "LI",
    "region": "上肢",
    "location": "前臂后外侧，肘横纹下3寸，阳溪（LI5）与曲池（LI11）连线上。",
    "section": "5.2.9",
    "page": 14
  },
  {
    "id": "LI10",
    "name": "手三里",
    "pinyin": "Shǒusānlǐ",
    "meridian": "LI",
    "region": "上肢",
    "location": "前臂后外侧，肘横纹下2寸，阳溪（LI5）与曲池（LI11）连线上。",
    "section": "5.2.10",
    "page": 14
  },
  {
    "id": "LI11",
    "name": "曲池",
    "pinyin": "Qūchí",
    "meridian": "LI",
    "region": "上肢",
    "location": "肘外侧，尺泽（LU5）与肱骨外上髁连线的中点处。",
    "section": "5.2.11",
    "page": 14
  },
  {
    "id": "LI12",
    "name": "肘髎",
    "pinyin": "Zhǒuliáo",
    "meridian": "LI",
    "region": "上肢",
    "location": "肘后外侧，肱骨外上髁上缘，髁上嵴的前缘。",
    "section": "5.2.12",
    "page": 14
  },
  {
    "id": "LI13",
    "name": "手五里",
    "pinyin": "Shǒuwǔlǐ",
    "meridian": "LI",
    "region": "上肢",
    "location": "臂外侧，肘横纹上3寸，曲池（LI11）与肩髃（LI15）连线上。",
    "section": "5.2.13",
    "page": 14
  },
  {
    "id": "LI14",
    "name": "臂臑",
    "pinyin": "Bìnào",
    "meridian": "LI",
    "region": "上肢",
    "location": "臂外侧，在曲池（LI11）与肩髃（LI15）连线上，三角肌前缘处。",
    "section": "5.2.14",
    "page": 14
  },
  {
    "id": "LI15",
    "name": "肩髃",
    "pinyin": "Jiānyú",
    "meridian": "LI",
    "region": "上肢",
    "location": "肩带部，肩峰外侧缘前端与肱骨大结节两骨间凹陷中。",
    "section": "5.2.15",
    "page": 14
  },
  {
    "id": "LI16",
    "name": "巨骨",
    "pinyin": "Jùgǔ",
    "meridian": "LI",
    "region": "上肢",
    "location": "肩带部，锁骨肩峰端与肩胛冈之间凹陷中。",
    "section": "5.2.16",
    "page": 14
  },
  {
    "id": "LI17",
    "name": "天鼎",
    "pinyin": "Tiāndǐng",
    "meridian": "LI",
    "region": "头颈",
    "location": "颈前部，横平环状软骨，胸锁乳突肌后缘。",
    "section": "5.2.17",
    "page": 14
  },
  {
    "id": "LI18",
    "name": "扶突",
    "pinyin": "Fútū",
    "meridian": "LI",
    "region": "头颈",
    "location": "颈前部，横平甲状软骨上缘（约相当于喉结处），胸锁乳突肌前、后缘中间。",
    "section": "5.2.18",
    "page": 14
  },
  {
    "id": "LI19",
    "name": "口禾髎",
    "pinyin": "Kǒuhéliáo",
    "meridian": "LI",
    "region": "头颈",
    "location": "面部，横平人中沟上1/3与下2/3交点，鼻孔外缘直下。",
    "section": "5.2.19",
    "page": 14
  },
  {
    "id": "LI20",
    "name": "迎香",
    "pinyin": "Yíngxiāng",
    "meridian": "LI",
    "region": "头颈",
    "location": "面部，鼻翼外缘中点旁，鼻唇沟中。",
    "section": "5.2.20",
    "page": 15
  },
  {
    "id": "ST1",
    "name": "承泣",
    "pinyin": "Chéngqì",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，眼球与眶下缘之间，瞳孔直下。",
    "section": "5.3.1",
    "page": 15
  },
  {
    "id": "ST2",
    "name": "四白",
    "pinyin": "Sìbái",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，眶下孔处。",
    "section": "5.3.2",
    "page": 15
  },
  {
    "id": "ST3",
    "name": "巨髎",
    "pinyin": "Jùliáo",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，横平鼻翼下缘，瞳孔直下。",
    "section": "5.3.3",
    "page": 15
  },
  {
    "id": "ST4",
    "name": "地仓",
    "pinyin": "Dìcāng",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，口角旁开0.4寸。",
    "section": "5.3.4",
    "page": 15
  },
  {
    "id": "ST5",
    "name": "大迎",
    "pinyin": "Dàyíng",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，下颌角前方，咬肌附着部的前缘凹陷中，面动脉搏动处。",
    "section": "5.3.5",
    "page": 15
  },
  {
    "id": "ST6",
    "name": "颊车",
    "pinyin": "Jiáchē",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，下颌角前上方一横指。",
    "section": "5.3.6",
    "page": 15
  },
  {
    "id": "ST7",
    "name": "下关",
    "pinyin": "Xiàguān",
    "meridian": "ST",
    "region": "头颈",
    "location": "面部，颧弓下缘中央与下颌切迹之间凹陷中。",
    "section": "5.3.7",
    "page": 15
  },
  {
    "id": "ST8",
    "name": "头维",
    "pinyin": "Tóuwéi",
    "meridian": "ST",
    "region": "头颈",
    "location": "头部，额角发际直上0.5寸，头正中线旁开4.5寸。",
    "section": "5.3.8",
    "page": 15
  },
  {
    "id": "ST9",
    "name": "人迎",
    "pinyin": "Rényíng",
    "meridian": "ST",
    "region": "头颈",
    "location": "颈前部，横平甲状软骨上缘（约相当于喉结处），胸锁乳突肌前缘，颈总动脉搏动处。",
    "section": "5.3.9",
    "page": 15
  },
  {
    "id": "ST10",
    "name": "水突",
    "pinyin": "Shuǐtū",
    "meridian": "ST",
    "region": "头颈",
    "location": "颈前部，横平环状软骨，胸锁乳突肌前缘。",
    "section": "5.3.10",
    "page": 15
  },
  {
    "id": "ST11",
    "name": "气舍",
    "pinyin": "Qìshè",
    "meridian": "ST",
    "region": "头颈",
    "location": "颈前部，锁骨上小窝，锁骨胸骨端上缘，胸锁乳突肌胸骨头与锁骨头中间的凹陷中。",
    "section": "5.3.11",
    "page": 15
  },
  {
    "id": "ST12",
    "name": "缺盆",
    "pinyin": "Quēpén",
    "meridian": "ST",
    "region": "头颈",
    "location": "颈前部，锁骨上大窝，锁骨上缘凹陷中，前正中线旁开4寸。",
    "section": "5.3.12",
    "page": 15
  },
  {
    "id": "ST13",
    "name": "气户",
    "pinyin": "Qìhù",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，锁骨下缘，前正中线旁开4寸。",
    "section": "5.3.13",
    "page": 15
  },
  {
    "id": "ST14",
    "name": "库房",
    "pinyin": "Kùfáng",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，第1肋间隙，前正中线旁开4寸。",
    "section": "5.3.14",
    "page": 15
  },
  {
    "id": "ST15",
    "name": "屋翳",
    "pinyin": "Wūyì",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，第2肋间隙，前正中线旁开4寸。",
    "section": "5.3.15",
    "page": 15
  },
  {
    "id": "ST16",
    "name": "膺窗",
    "pinyin": "Yīngchuāng",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，第3肋间隙，前正中线旁开4寸。",
    "section": "5.3.16",
    "page": 15
  },
  {
    "id": "ST17",
    "name": "乳中",
    "pinyin": "Rǔzhōng",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，乳头中央。",
    "section": "5.3.17",
    "page": 16
  },
  {
    "id": "ST18",
    "name": "乳根",
    "pinyin": "Rǔgēn",
    "meridian": "ST",
    "region": "胸腹",
    "location": "前胸部，第5肋间隙，前正中线旁开4寸。",
    "section": "5.3.18",
    "page": 16
  },
  {
    "id": "ST19",
    "name": "不容",
    "pinyin": "Bùróng",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上6寸，前正中线旁开2寸。",
    "section": "5.3.19",
    "page": 16
  },
  {
    "id": "ST20",
    "name": "承满",
    "pinyin": "Chéngmǎn",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上5寸，前正中线旁开2寸。",
    "section": "5.3.20",
    "page": 16
  },
  {
    "id": "ST21",
    "name": "梁门",
    "pinyin": "Liángmén",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上4寸，前正中线旁开2寸。",
    "section": "5.3.21",
    "page": 16
  },
  {
    "id": "ST22",
    "name": "关门",
    "pinyin": "Guānmén",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上3寸，前正中线旁开2寸。",
    "section": "5.3.22",
    "page": 16
  },
  {
    "id": "ST23",
    "name": "太乙",
    "pinyin": "Tàiyǐ",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上2寸，前正中线旁开2寸。",
    "section": "5.3.23",
    "page": 16
  },
  {
    "id": "ST24",
    "name": "滑肉门",
    "pinyin": "Huáròumén",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，脐中上1寸，前正中线旁开2寸。",
    "section": "5.3.24",
    "page": 16
  },
  {
    "id": "ST25",
    "name": "天枢",
    "pinyin": "Tiānshū",
    "meridian": "ST",
    "region": "胸腹",
    "location": "上腹部，横平脐中，前正中线旁开2寸。",
    "section": "5.3.25",
    "page": 16
  },
  {
    "id": "ST26",
    "name": "外陵",
    "pinyin": "Wàilíng",
    "meridian": "ST",
    "region": "胸腹",
    "location": "下腹部，脐中下l寸，前正中线旁开2寸。",
    "section": "5.3.26",
    "page": 16
  },
  {
    "id": "ST27",
    "name": "大巨",
    "pinyin": "Dàjù",
    "meridian": "ST",
    "region": "胸腹",
    "location": "下腹部，脐中下2寸，前正中线旁开2寸。",
    "section": "5.3.27",
    "page": 16
  },
  {
    "id": "ST28",
    "name": "水道",
    "pinyin": "Shuǐdào",
    "meridian": "ST",
    "region": "胸腹",
    "location": "下腹部，脐中下3寸，前正中线旁开2寸。",
    "section": "5.3.28",
    "page": 16
  },
  {
    "id": "ST29",
    "name": "归来",
    "pinyin": "Guīlái",
    "meridian": "ST",
    "region": "胸腹",
    "location": "下腹部，脐中下4寸，前正中线旁开2寸。",
    "section": "5.3.29",
    "page": 16
  },
  {
    "id": "ST30",
    "name": "气冲",
    "pinyin": "Qìchōng",
    "meridian": "ST",
    "region": "下肢",
    "location": "腹股沟，耻骨联合上缘，前正中线旁开2寸，动脉搏动处。",
    "section": "5.3.30",
    "page": 16
  },
  {
    "id": "ST31",
    "name": "髀关",
    "pinyin": "Bìguān",
    "meridian": "ST",
    "region": "下肢",
    "location": "股前侧，股直肌近端、缝匠肌与阔筋膜张肌3条肌肉之间凹陷中。",
    "section": "5.3.31",
    "page": 16
  },
  {
    "id": "ST32",
    "name": "伏兔",
    "pinyin": "Fútù",
    "meridian": "ST",
    "region": "下肢",
    "location": "股前外侧，髌底上6寸，髂前上棘与髌底外侧端的连线上。",
    "section": "5.3.32",
    "page": 17
  },
  {
    "id": "ST33",
    "name": "阴市",
    "pinyin": "Yīnshì",
    "meridian": "ST",
    "region": "下肢",
    "location": "股前外侧，髌底上3寸，股直肌肌腱外侧缘。",
    "section": "5.3.33",
    "page": 17
  },
  {
    "id": "ST34",
    "name": "梁丘",
    "pinyin": "Liángqiū",
    "meridian": "ST",
    "region": "下肢",
    "location": "股前外侧，髌底上2寸，股外侧肌与股直肌肌腱之间。",
    "section": "5.3.34",
    "page": 17
  },
  {
    "id": "ST35",
    "name": "犊鼻",
    "pinyin": "Dúbí",
    "meridian": "ST",
    "region": "下肢",
    "location": "膝前侧，髌韧带外侧凹陷中。",
    "section": "5.3.35",
    "page": 17
  },
  {
    "id": "ST36",
    "name": "足三里",
    "pinyin": "Zúsānlǐ",
    "meridian": "ST",
    "region": "下肢",
    "location": "小腿外侧，犊鼻（ST35）下3寸，犊鼻（ST35）与解溪（ST41）连线上。",
    "section": "5.3.36",
    "page": 17
  },
  {
    "id": "ST37",
    "name": "上巨虚",
    "pinyin": "Shàngjùxū",
    "meridian": "ST",
    "region": "下肢",
    "location": "小腿外侧，犊鼻（ST35）下6寸，犊鼻（ST35）与解溪（ST41）连线上。",
    "section": "5.3.37",
    "page": 17
  },
  {
    "id": "ST38",
    "name": "条口",
    "pinyin": "Tiáokǒu",
    "meridian": "ST",
    "region": "下肢",
    "location": "小腿外侧，犊鼻（ST35）下8寸，犊鼻（ST35）与解溪（ST41）连线上。",
    "section": "5.3.38",
    "page": 17
  },
  {
    "id": "ST39",
    "name": "下巨虚",
    "pinyin": "Xiàjùxū",
    "meridian": "ST",
    "region": "下肢",
    "location": "小腿外侧，犊鼻（ST35）下9寸，犊鼻（ST35）与解溪（ST41）连线上。",
    "section": "5.3.39",
    "page": 17
  },
  {
    "id": "ST40",
    "name": "丰隆",
    "pinyin": "Fēnglóng",
    "meridian": "ST",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上8寸，胫骨前肌的外缘。",
    "section": "5.3.40",
    "page": 17
  },
  {
    "id": "ST41",
    "name": "解溪",
    "pinyin": "Jiěxī",
    "meridian": "ST",
    "region": "下肢",
    "location": "踝前侧，踝关节前面中央凹陷中，𧿹长伸肌腱与趾长伸肌腱之间。",
    "section": "5.3.41",
    "page": 17
  },
  {
    "id": "ST42",
    "name": "冲阳",
    "pinyin": "Chōngyáng",
    "meridian": "ST",
    "region": "下肢",
    "location": "足背，第2跖骨基底部与中间楔状骨关节处，可触及足背动脉。",
    "section": "5.3.42",
    "page": 17
  },
  {
    "id": "ST43",
    "name": "陷谷",
    "pinyin": "Xiàngǔ",
    "meridian": "ST",
    "region": "下肢",
    "location": "足背，第2、3跖骨间，第2跖趾关节近端凹陷中。",
    "section": "5.3.43",
    "page": 17
  },
  {
    "id": "ST44",
    "name": "内庭",
    "pinyin": "Nèitíng",
    "meridian": "ST",
    "region": "下肢",
    "location": "足背，第2、3趾间，趾蹼缘后方赤白肉际处。",
    "section": "5.3.44",
    "page": 17
  },
  {
    "id": "ST45",
    "name": "厉兑",
    "pinyin": "Lìduì",
    "meridian": "ST",
    "region": "下肢",
    "location": "足趾，第2趾末节外侧，趾甲根角侧后方0.1寸。",
    "section": "5.3.45",
    "page": 17
  },
  {
    "id": "SP1",
    "name": "隐白",
    "pinyin": "Yǐnbái",
    "meridian": "SP",
    "region": "下肢",
    "location": "足趾，大趾末节内侧，趾甲根角侧后方0.1寸。",
    "section": "5.4.1",
    "page": 17
  },
  {
    "id": "SP2",
    "name": "大都",
    "pinyin": "Dàdū",
    "meridian": "SP",
    "region": "下肢",
    "location": "足趾，第1跖趾关节远端赤白肉际凹陷中。",
    "section": "5.4.2",
    "page": 18
  },
  {
    "id": "SP3",
    "name": "太白",
    "pinyin": "Tàibái",
    "meridian": "SP",
    "region": "下肢",
    "location": "足内侧，第1跖趾关节近端赤白肉际凹陷中。",
    "section": "5.4.3",
    "page": 18
  },
  {
    "id": "SP4",
    "name": "公孙",
    "pinyin": "Gōngsūn",
    "meridian": "SP",
    "region": "下肢",
    "location": "足内侧，第1跖骨底的前下缘赤白肉际处。",
    "section": "5.4.4",
    "page": 18
  },
  {
    "id": "SP5",
    "name": "商丘",
    "pinyin": "Shāngqiū",
    "meridian": "SP",
    "region": "下肢",
    "location": "足内侧，内踝前下方，舟骨粗隆与内踝尖连线中点凹陷中。",
    "section": "5.4.5",
    "page": 18
  },
  {
    "id": "SP6",
    "name": "三阴交",
    "pinyin": "Sānyīnjiāo",
    "meridian": "SP",
    "region": "下肢",
    "location": "小腿内侧，内踝尖上3寸，胫骨内侧缘后际。",
    "section": "5.4.6",
    "page": 18
  },
  {
    "id": "SP7",
    "name": "漏谷",
    "pinyin": "Lòugǔ",
    "meridian": "SP",
    "region": "下肢",
    "location": "小腿内侧，内踝尖上6寸，胫骨内侧缘后际。",
    "section": "5.4.7",
    "page": 18
  },
  {
    "id": "SP8",
    "name": "地机",
    "pinyin": "Dìjī",
    "meridian": "SP",
    "region": "下肢",
    "location": "小腿内侧，阴陵泉（SP9）下3寸，胫骨内侧缘后际。",
    "section": "5.4.8",
    "page": 18
  },
  {
    "id": "SP9",
    "name": "阴陵泉",
    "pinyin": "Yīnlíngquán",
    "meridian": "SP",
    "region": "下肢",
    "location": "小腿内侧，由胫骨内侧髁下缘与胫骨内侧缘形成的凹陷中。",
    "section": "5.4.9",
    "page": 18
  },
  {
    "id": "SP10",
    "name": "血海",
    "pinyin": "Xuèhǎi",
    "meridian": "SP",
    "region": "下肢",
    "location": "股前内侧，髌底内侧端上2寸，股内侧肌隆起处。",
    "section": "5.4.10",
    "page": 18
  },
  {
    "id": "SP11",
    "name": "箕门",
    "pinyin": "Jīmén",
    "meridian": "SP",
    "region": "下肢",
    "location": "股内侧，髌底内侧端与冲门（SP12）的连线上1/3与下2/3交点，长收肌和缝匠肌交角的动脉搏动处。",
    "section": "5.4.11",
    "page": 18
  },
  {
    "id": "SP12",
    "name": "冲门",
    "pinyin": "Chōngmén",
    "meridian": "SP",
    "region": "下肢",
    "location": "腹股沟，腹股沟斜纹中，髂外动脉搏动处的外侧。",
    "section": "5.4.12",
    "page": 18
  },
  {
    "id": "SP13",
    "name": "府舍",
    "pinyin": "Fǔshè",
    "meridian": "SP",
    "region": "胸腹",
    "location": "下腹部，脐中下4.3寸，前正中线旁开4寸。",
    "section": "5.4.13",
    "page": 18
  },
  {
    "id": "SP14",
    "name": "腹结",
    "pinyin": "Fùjié",
    "meridian": "SP",
    "region": "胸腹",
    "location": "下腹部，脐中下1.3寸，前正中线旁开4寸。",
    "section": "5.4.14",
    "page": 18
  },
  {
    "id": "SP15",
    "name": "大横",
    "pinyin": "Dàhéng",
    "meridian": "SP",
    "region": "胸腹",
    "location": "上腹部，脐中旁开4寸。",
    "section": "5.4.15",
    "page": 18
  },
  {
    "id": "SP16",
    "name": "腹哀",
    "pinyin": "Fù'āi",
    "meridian": "SP",
    "region": "胸腹",
    "location": "上腹部，脐中上3寸，前正中线旁开4寸。",
    "section": "5.4.16",
    "page": 18
  },
  {
    "id": "SP17",
    "name": "食窦",
    "pinyin": "Shídòu",
    "meridian": "SP",
    "region": "胸腹",
    "location": "前胸部，第5肋间隙，前正中线旁开6寸。",
    "section": "5.4.17",
    "page": 18
  },
  {
    "id": "SP18",
    "name": "天溪",
    "pinyin": "Tiānxī",
    "meridian": "SP",
    "region": "胸腹",
    "location": "前胸部，第4肋间隙，前正中线旁开6寸。",
    "section": "5.4.18",
    "page": 19
  },
  {
    "id": "SP19",
    "name": "胸乡",
    "pinyin": "Xiōngxiāng",
    "meridian": "SP",
    "region": "胸腹",
    "location": "前胸部，第3肋间隙，前正中线旁开6寸。",
    "section": "5.4.19",
    "page": 19
  },
  {
    "id": "SP20",
    "name": "周荣",
    "pinyin": "Zhōuróng",
    "meridian": "SP",
    "region": "胸腹",
    "location": "前胸部，第2肋间隙，前正中线旁开6寸。",
    "section": "5.4.20",
    "page": 19
  },
  {
    "id": "SP21",
    "name": "大包",
    "pinyin": "Dàbāo",
    "meridian": "SP",
    "region": "胸腹",
    "location": "侧胸部，第6肋间隙，腋中线上。",
    "section": "5.4.21",
    "page": 19
  },
  {
    "id": "HT1",
    "name": "极泉",
    "pinyin": "Jíquán",
    "meridian": "HT",
    "region": "上肢",
    "location": "腋窝中央，腋动脉搏动处。",
    "section": "5.5.1",
    "page": 19
  },
  {
    "id": "HT2",
    "name": "青灵",
    "pinyin": "Qīnglíng",
    "meridian": "HT",
    "region": "上肢",
    "location": "臂内侧，肘横纹上3寸，肱二头肌的内侧沟中。",
    "section": "5.5.2",
    "page": 19
  },
  {
    "id": "HT3",
    "name": "少海",
    "pinyin": "Shàohǎi",
    "meridian": "HT",
    "region": "上肢",
    "location": "肘前内侧，横平肘横纹，肱骨内上髁前缘。",
    "section": "5.5.3",
    "page": 19
  },
  {
    "id": "HT4",
    "name": "灵道",
    "pinyin": "Língdào",
    "meridian": "HT",
    "region": "上肢",
    "location": "前臂前内侧，腕掌侧远端横纹上1.5寸，尺侧腕屈肌腱的桡侧缘。",
    "section": "5.5.4",
    "page": 19
  },
  {
    "id": "HT5",
    "name": "通里",
    "pinyin": "Tōnglǐ",
    "meridian": "HT",
    "region": "上肢",
    "location": "前臂前内侧，腕掌侧远端横纹上1寸，尺侧腕屈肌腱的桡侧缘。",
    "section": "5.5.5",
    "page": 19
  },
  {
    "id": "HT6",
    "name": "阴郄",
    "pinyin": "Yīnxì",
    "meridian": "HT",
    "region": "上肢",
    "location": "前臂前内侧，腕掌侧远端横纹上0.5寸，尺侧腕屈肌腱的桡侧缘。",
    "section": "5.5.6",
    "page": 19
  },
  {
    "id": "HT7",
    "name": "神门",
    "pinyin": "Shénmén",
    "meridian": "HT",
    "region": "上肢",
    "location": "腕前内侧，腕掌侧远端横纹尺侧端，尺侧腕屈肌腱的桡侧缘。",
    "section": "5.5.7",
    "page": 19
  },
  {
    "id": "HT8",
    "name": "少府",
    "pinyin": "Shàofǔ",
    "meridian": "HT",
    "region": "上肢",
    "location": "手掌，横平第5掌指关节近端，第4、5掌骨之间。",
    "section": "5.5.8",
    "page": 19
  },
  {
    "id": "HT9",
    "name": "少冲",
    "pinyin": "Shàochōng",
    "meridian": "HT",
    "region": "上肢",
    "location": "手指，小指末节桡侧，指甲根角侧上方0.1寸。",
    "section": "5.5.9",
    "page": 20
  },
  {
    "id": "SI1",
    "name": "少泽",
    "pinyin": "Shàozé",
    "meridian": "SI",
    "region": "上肢",
    "location": "手指，小指末节尺侧，指甲根角侧上方0.1寸。",
    "section": "5.6.1",
    "page": 20
  },
  {
    "id": "SI2",
    "name": "前谷",
    "pinyin": "Qiángǔ",
    "meridian": "SI",
    "region": "上肢",
    "location": "手指，第5掌指关节尺侧远端赤白肉际凹陷中。",
    "section": "5.6.2",
    "page": 20
  },
  {
    "id": "SI3",
    "name": "后溪",
    "pinyin": "Hòuxī",
    "meridian": "SI",
    "region": "上肢",
    "location": "手背，第5掌指关节尺侧近端赤白肉际凹陷中。",
    "section": "5.6.3",
    "page": 20
  },
  {
    "id": "SI4",
    "name": "腕骨",
    "pinyin": "Wàngǔ",
    "meridian": "SI",
    "region": "上肢",
    "location": "腕后内侧，第5掌骨底与三角骨之间的赤白肉际凹陷中。",
    "section": "5.6.4",
    "page": 20
  },
  {
    "id": "SI5",
    "name": "阳谷",
    "pinyin": "Yánggǔ",
    "meridian": "SI",
    "region": "上肢",
    "location": "腕后内侧，尺骨茎突与三角骨之间的凹陷中。",
    "section": "5.6.5",
    "page": 20
  },
  {
    "id": "SI6",
    "name": "养老",
    "pinyin": "Yǎnglǎo",
    "meridian": "SI",
    "region": "上肢",
    "location": "前臂后侧，腕背横纹上１寸，尺骨头桡侧凹陷中。",
    "section": "5.6.6",
    "page": 20
  },
  {
    "id": "SI7",
    "name": "支正",
    "pinyin": "Zhīzhèng",
    "meridian": "SI",
    "region": "上肢",
    "location": "前臂外侧，腕背侧远端横纹上5寸，尺骨尺侧与尺侧腕屈肌之间。",
    "section": "5.6.7",
    "page": 20
  },
  {
    "id": "SI8",
    "name": "小海",
    "pinyin": "Xiǎohǎi",
    "meridian": "SI",
    "region": "上肢",
    "location": "肘后内侧，尺骨鹰嘴（即肘尖）与肱骨内上髁之间凹陷中。",
    "section": "5.6.8",
    "page": 20
  },
  {
    "id": "SI9",
    "name": "肩贞",
    "pinyin": "Jiānzhēn",
    "meridian": "SI",
    "region": "上肢",
    "location": "肩带部，肩关节后下方，腋后纹头直上1寸。",
    "section": "5.6.9",
    "page": 20
  },
  {
    "id": "SI10",
    "name": "臑俞",
    "pinyin": "Nàoshū",
    "meridian": "SI",
    "region": "上肢",
    "location": "肩带部，腋后纹头直上，肩胛冈下缘凹陷中。",
    "section": "5.6.10",
    "page": 20
  },
  {
    "id": "SI11",
    "name": "天宗",
    "pinyin": "Tiānzōng",
    "meridian": "SI",
    "region": "上肢",
    "location": "肩带部，肩胛冈中点与肩胛骨下角连线上1/3与下2/3交点凹陷中。",
    "section": "5.6.11",
    "page": 20
  },
  {
    "id": "SI12",
    "name": "秉风",
    "pinyin": "Bǐngfēng",
    "meridian": "SI",
    "region": "上肢",
    "location": "肩带部，肩胛冈中点上方冈上窝中。",
    "section": "5.6.12",
    "page": 20
  },
  {
    "id": "SI13",
    "name": "曲垣",
    "pinyin": "Qūyuán",
    "meridian": "SI",
    "region": "上肢",
    "location": "肩带部，肩胛冈内侧端上缘凹陷中。",
    "section": "5.6.13",
    "page": 20
  },
  {
    "id": "SI14",
    "name": "肩外俞",
    "pinyin": "Jiānwàishū",
    "meridian": "SI",
    "region": "背腰",
    "location": "背部，第1胸椎棘突下，后正中线旁开3寸。",
    "section": "5.6.14",
    "page": 20
  },
  {
    "id": "SI15",
    "name": "肩中俞",
    "pinyin": "Jiānzhōngshū",
    "meridian": "SI",
    "region": "背腰",
    "location": "背部，第7颈椎棘突下，后正中线旁开2寸。",
    "section": "5.6.15",
    "page": 21
  },
  {
    "id": "SI16",
    "name": "天窗",
    "pinyin": "Tiānchuāng",
    "meridian": "SI",
    "region": "头颈",
    "location": "颈前部，横平甲状软骨上缘（约相当于喉结处），胸锁乳突肌的后缘。",
    "section": "5.6.16",
    "page": 21
  },
  {
    "id": "SI17",
    "name": "天容",
    "pinyin": "Tiānróng",
    "meridian": "SI",
    "region": "头颈",
    "location": "颈前部，下颌角后方，胸锁乳突肌的前缘凹陷中。",
    "section": "5.6.17",
    "page": 21
  },
  {
    "id": "SI18",
    "name": "颧髎",
    "pinyin": "Quánliáo",
    "meridian": "SI",
    "region": "头颈",
    "location": "面部，颧骨下缘，目外眦直下凹陷中。",
    "section": "5.6.18",
    "page": 21
  },
  {
    "id": "SI19",
    "name": "听宫",
    "pinyin": "Tīnggōng",
    "meridian": "SI",
    "region": "头颈",
    "location": "面部，耳屏正中与下颌骨髁突之间的凹陷中。",
    "section": "5.6.19",
    "page": 21
  },
  {
    "id": "BL1",
    "name": "睛明",
    "pinyin": "Jīngmíng",
    "meridian": "BL",
    "region": "头颈",
    "location": "面部，目内眦内上方眶内侧壁凹陷中。",
    "section": "5.7.1",
    "page": 21
  },
  {
    "id": "BL2",
    "name": "攒竹",
    "pinyin": "Cuánzhú",
    "meridian": "BL",
    "region": "头颈",
    "location": "面部，眉头凹陷中，额切迹处。",
    "section": "5.7.2",
    "page": 21
  },
  {
    "id": "BL3",
    "name": "眉冲",
    "pinyin": "Méichōng",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，额切迹直上入发际0.5寸。",
    "section": "5.7.3",
    "page": 21
  },
  {
    "id": "BL4",
    "name": "曲差",
    "pinyin": "Qūchā",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，前发际正中直上0.5寸，旁开1.5寸。",
    "section": "5.7.4",
    "page": 21
  },
  {
    "id": "BL5",
    "name": "五处",
    "pinyin": "Wǔchù",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，前发际正中直上1寸，旁开1.5寸。",
    "section": "5.7.5",
    "page": 21
  },
  {
    "id": "BL6",
    "name": "承光",
    "pinyin": "Chéngguāng",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，前发际正中直上2.5寸，旁开1.5寸。",
    "section": "5.7.6",
    "page": 21
  },
  {
    "id": "BL7",
    "name": "通天",
    "pinyin": "Tōngtiān",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，前发际正中直上4寸，旁开1.5寸。",
    "section": "5.7.7",
    "page": 21
  },
  {
    "id": "BL8",
    "name": "络却",
    "pinyin": "Luòquè",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，前发际正中直上5.5寸，旁开1.5寸。",
    "section": "5.7.8",
    "page": 21
  },
  {
    "id": "BL9",
    "name": "玉枕",
    "pinyin": "Yùzhěn",
    "meridian": "BL",
    "region": "头颈",
    "location": "头部，横平枕外隆凸上缘，后发际正中旁开1.3寸。",
    "section": "5.7.9",
    "page": 22
  },
  {
    "id": "BL10",
    "name": "天柱",
    "pinyin": "Tiānzhù",
    "meridian": "BL",
    "region": "头颈",
    "location": "颈后部，横平第２颈椎棘突上际，斜方肌外缘凹陷中。",
    "section": "5.7.10",
    "page": 22
  },
  {
    "id": "BL11",
    "name": "大杼",
    "pinyin": "Dàzhù",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第1胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.11",
    "page": 22
  },
  {
    "id": "BL12",
    "name": "风门",
    "pinyin": "Fēngmén",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第2胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.12",
    "page": 22
  },
  {
    "id": "BL13",
    "name": "肺俞",
    "pinyin": "Fèishū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第3胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.13",
    "page": 22
  },
  {
    "id": "BL14",
    "name": "厥阴俞",
    "pinyin": "Juéyīnshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第4胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.14",
    "page": 22
  },
  {
    "id": "BL15",
    "name": "心俞",
    "pinyin": "Xīnshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第5胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.15",
    "page": 22
  },
  {
    "id": "BL16",
    "name": "督俞",
    "pinyin": "Dūshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第6胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.16",
    "page": 22
  },
  {
    "id": "BL17",
    "name": "膈俞",
    "pinyin": "Géshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第7胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.17",
    "page": 22
  },
  {
    "id": "BL18",
    "name": "肝俞",
    "pinyin": "Gānshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第9胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.18",
    "page": 22
  },
  {
    "id": "BL19",
    "name": "胆俞",
    "pinyin": "Dǎnshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第10胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.19",
    "page": 22
  },
  {
    "id": "BL20",
    "name": "脾俞",
    "pinyin": "Píshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第11胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.20",
    "page": 22
  },
  {
    "id": "BL21",
    "name": "胃俞",
    "pinyin": "Wèishū",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第12胸椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.21",
    "page": 22
  },
  {
    "id": "BL22",
    "name": "三焦俞",
    "pinyin": "Sānjiāoshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第1腰椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.22",
    "page": 22
  },
  {
    "id": "BL23",
    "name": "肾俞",
    "pinyin": "Shènshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第2腰椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.23",
    "page": 22
  },
  {
    "id": "BL24",
    "name": "气海俞",
    "pinyin": "Qìhǎishū",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第3腰椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.24",
    "page": 22
  },
  {
    "id": "BL25",
    "name": "大肠俞",
    "pinyin": "Dàchángshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第4腰椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.25",
    "page": 22
  },
  {
    "id": "BL26",
    "name": "关元俞",
    "pinyin": "Guānyuánshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第5腰椎棘突下，后正中线旁开1.5寸。",
    "section": "5.7.26",
    "page": 22
  },
  {
    "id": "BL27",
    "name": "小肠俞",
    "pinyin": "Xiǎochángshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，横平第1骶后孔，骶正中嵴旁开1.5寸。",
    "section": "5.7.27",
    "page": 22
  },
  {
    "id": "BL28",
    "name": "膀胱俞",
    "pinyin": "Pángguāngshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，横平第2骶后孔，骶正中嵴旁开1.5寸。",
    "section": "5.7.28",
    "page": 22
  },
  {
    "id": "BL29",
    "name": "中膂俞",
    "pinyin": "Zhōnglǚshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，横平第3骶后孔，骶正中嵴旁开1.5寸。",
    "section": "5.7.29",
    "page": 23
  },
  {
    "id": "BL30",
    "name": "白环俞",
    "pinyin": "Báihuánshū",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，横平第4骶后孔，骶正中嵴旁开1.5寸。",
    "section": "5.7.30",
    "page": 23
  },
  {
    "id": "BL31",
    "name": "上髎",
    "pinyin": "Shàngliáo",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，正对第1骶后孔中。",
    "section": "5.7.31",
    "page": 23
  },
  {
    "id": "BL32",
    "name": "次髎",
    "pinyin": "Cìliáo",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，第2骶后孔中。",
    "section": "5.7.32",
    "page": 23
  },
  {
    "id": "BL33",
    "name": "中髎",
    "pinyin": "Zhōngliáo",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，正对第3骶后孔中。",
    "section": "5.7.33",
    "page": 23
  },
  {
    "id": "BL34",
    "name": "下髎",
    "pinyin": "Xiàliáo",
    "meridian": "BL",
    "region": "背腰",
    "location": "骶部，正对第4骶后孔中。",
    "section": "5.7.34",
    "page": 23
  },
  {
    "id": "BL35",
    "name": "会阳",
    "pinyin": "Huìyáng",
    "meridian": "BL",
    "region": "背腰",
    "location": "臀部，尾骨端旁开0.5寸。",
    "section": "5.7.35",
    "page": 23
  },
  {
    "id": "BL36",
    "name": "承扶",
    "pinyin": "Chéngfú",
    "meridian": "BL",
    "region": "背腰",
    "location": "臀部，臀沟的中点。",
    "section": "5.7.36",
    "page": 23
  },
  {
    "id": "BL37",
    "name": "殷门",
    "pinyin": "Yīnmén",
    "meridian": "BL",
    "region": "下肢",
    "location": "股后侧，臀沟下6寸，股二头肌与半腱肌之间。",
    "section": "5.7.37",
    "page": 23
  },
  {
    "id": "BL38",
    "name": "浮郄",
    "pinyin": "Fúxì",
    "meridian": "BL",
    "region": "下肢",
    "location": "膝后侧，腘横纹上1寸，股二头肌腱的内侧缘。",
    "section": "5.7.38",
    "page": 23
  },
  {
    "id": "BL39",
    "name": "委阳",
    "pinyin": "Wěiyáng",
    "meridian": "BL",
    "region": "下肢",
    "location": "膝后外侧，腘横纹上，股二头肌腱的内侧缘。",
    "section": "5.7.39",
    "page": 23
  },
  {
    "id": "BL40",
    "name": "委中",
    "pinyin": "Wěizhōng",
    "meridian": "BL",
    "region": "下肢",
    "location": "膝后侧，腘横纹中点。",
    "section": "5.7.40",
    "page": 23
  },
  {
    "id": "BL41",
    "name": "附分",
    "pinyin": "Fùfēn",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第2胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.41",
    "page": 23
  },
  {
    "id": "BL42",
    "name": "魄户",
    "pinyin": "Pòhù",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第3胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.42",
    "page": 23
  },
  {
    "id": "BL43",
    "name": "膏肓",
    "pinyin": "Gāohuāng",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第4胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.43",
    "page": 23
  },
  {
    "id": "BL44",
    "name": "神堂",
    "pinyin": "Shéntáng",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第5胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.44",
    "page": 24
  },
  {
    "id": "BL45",
    "name": "譩譆",
    "pinyin": "Yìxǐ",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第6胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.45",
    "page": 24
  },
  {
    "id": "BL46",
    "name": "膈关",
    "pinyin": "Géguān",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第7胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.46",
    "page": 24
  },
  {
    "id": "BL47",
    "name": "魂门",
    "pinyin": "Húnmén",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第9胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.47",
    "page": 24
  },
  {
    "id": "BL48",
    "name": "阳纲",
    "pinyin": "Yánggāng",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第10胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.48",
    "page": 24
  },
  {
    "id": "BL49",
    "name": "意舍",
    "pinyin": "Yìshè",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第11胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.49",
    "page": 24
  },
  {
    "id": "BL50",
    "name": "胃仓",
    "pinyin": "Wèicāng",
    "meridian": "BL",
    "region": "背腰",
    "location": "背部，第12胸椎棘突下，后正中线旁开3寸。",
    "section": "5.7.50",
    "page": 24
  },
  {
    "id": "BL51",
    "name": "肓门",
    "pinyin": "Huāngmén",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第1腰椎棘突下，后正中线旁开3寸。",
    "section": "5.7.51",
    "page": 24
  },
  {
    "id": "BL52",
    "name": "志室",
    "pinyin": "Zhìshì",
    "meridian": "BL",
    "region": "背腰",
    "location": "腰部，第2腰椎棘突下，后正中线旁开3寸。",
    "section": "5.7.52",
    "page": 24
  },
  {
    "id": "BL53",
    "name": "胞肓",
    "pinyin": "Bāohuāng",
    "meridian": "BL",
    "region": "背腰",
    "location": "臀部，横平第2骶后孔，骶正中嵴旁开3寸。",
    "section": "5.7.53",
    "page": 24
  },
  {
    "id": "BL54",
    "name": "秩边",
    "pinyin": "Zhìbiān",
    "meridian": "BL",
    "region": "背腰",
    "location": "臀部，横平第4骶后孔，骶正中嵴旁开3寸。",
    "section": "5.7.54",
    "page": 24
  },
  {
    "id": "BL55",
    "name": "合阳",
    "pinyin": "Héyáng",
    "meridian": "BL",
    "region": "下肢",
    "location": "小腿后侧，腘横纹下2寸，腓肠肌内、外侧头之间。",
    "section": "5.7.55",
    "page": 24
  },
  {
    "id": "BL56",
    "name": "承筋",
    "pinyin": "Chéngjīn",
    "meridian": "BL",
    "region": "下肢",
    "location": "小腿后侧，腘横纹下5寸，腓肠肌两肌腹之间。",
    "section": "5.7.56",
    "page": 24
  },
  {
    "id": "BL57",
    "name": "承山",
    "pinyin": "Chéngshān",
    "meridian": "BL",
    "region": "下肢",
    "location": "小腿后侧，腓肠肌两肌腹与跟腱交角处。",
    "section": "5.7.57",
    "page": 24
  },
  {
    "id": "BL58",
    "name": "飞扬",
    "pinyin": "Fēiyáng",
    "meridian": "BL",
    "region": "下肢",
    "location": "小腿后外侧，腓肠肌外下缘与跟腱移行处，约当昆仑（BL60）直上7寸。",
    "section": "5.7.58",
    "page": 25
  },
  {
    "id": "BL59",
    "name": "跗阳",
    "pinyin": "Fūyáng",
    "meridian": "BL",
    "region": "下肢",
    "location": "小腿后外侧，昆仑（BL60）直上3寸，腓骨与跟腱之间。",
    "section": "5.7.59",
    "page": 25
  },
  {
    "id": "BL60",
    "name": "昆仑",
    "pinyin": "Kūnlún",
    "meridian": "BL",
    "region": "下肢",
    "location": "踝后外侧，外踝尖与跟腱之间的凹陷中。",
    "section": "5.7.60",
    "page": 25
  },
  {
    "id": "BL61",
    "name": "仆参",
    "pinyin": "Púcān",
    "meridian": "BL",
    "region": "下肢",
    "location": "足外侧，昆仑（BL60）直下，跟骨外侧，赤白肉际处。",
    "section": "5.7.61",
    "page": 25
  },
  {
    "id": "BL62",
    "name": "申脉",
    "pinyin": "Shēnmài",
    "meridian": "BL",
    "region": "下肢",
    "location": "足外侧，外踝尖直下，外踝下缘与跟骨之间凹陷中。",
    "section": "5.7.62",
    "page": 25
  },
  {
    "id": "BL63",
    "name": "金门",
    "pinyin": "Jīnmén",
    "meridian": "BL",
    "region": "下肢",
    "location": "足背，外踝前缘直下，第5跖骨粗隆后方，骰骨下缘凹陷中。",
    "section": "5.7.63",
    "page": 25
  },
  {
    "id": "BL64",
    "name": "京骨",
    "pinyin": "Jīnggǔ",
    "meridian": "BL",
    "region": "下肢",
    "location": "足外侧，第5跖骨粗隆前下方，赤白肉际处。",
    "section": "5.7.64",
    "page": 25
  },
  {
    "id": "BL65",
    "name": "束骨",
    "pinyin": "Shùgǔ",
    "meridian": "BL",
    "region": "下肢",
    "location": "足外侧，第5跖趾关节的近端，赤白肉际处。",
    "section": "5.7.65",
    "page": 25
  },
  {
    "id": "BL66",
    "name": "足通谷",
    "pinyin": "Zútōnggǔ",
    "meridian": "BL",
    "region": "下肢",
    "location": "足趾，第5跖趾关节的远端，赤白肉际处。",
    "section": "5.7.66",
    "page": 25
  },
  {
    "id": "BL67",
    "name": "至阴",
    "pinyin": "Zhìyīn",
    "meridian": "BL",
    "region": "下肢",
    "location": "足趾，小趾末节外侧，趾甲根角侧后方0.1寸。",
    "section": "5.7.67",
    "page": 25
  },
  {
    "id": "KI1",
    "name": "涌泉",
    "pinyin": "Yǒngquán",
    "meridian": "KI",
    "region": "下肢",
    "location": "足底，屈足卷趾时足心最凹陷中。",
    "section": "5.8.1",
    "page": 25
  },
  {
    "id": "KI2",
    "name": "然谷",
    "pinyin": "Rángǔ",
    "meridian": "KI",
    "region": "下肢",
    "location": "足内侧，足舟骨粗隆下方，赤白肉际处。",
    "section": "5.8.2",
    "page": 25
  },
  {
    "id": "KI3",
    "name": "太溪",
    "pinyin": "Tàixī",
    "meridian": "KI",
    "region": "下肢",
    "location": "踝后内侧，内踝尖与跟腱之间的凹陷中。",
    "section": "5.8.3",
    "page": 25
  },
  {
    "id": "KI4",
    "name": "大钟",
    "pinyin": "Dàzhōng",
    "meridian": "KI",
    "region": "下肢",
    "location": "足内侧，内踝后下方，跟骨上缘，跟腱附着部内侧前缘凹陷中。",
    "section": "5.8.4",
    "page": 25
  },
  {
    "id": "KI5",
    "name": "水泉",
    "pinyin": "Shuǐquán",
    "meridian": "KI",
    "region": "下肢",
    "location": "足内侧，太溪（KI3）直下1寸，跟骨结节内侧凹陷中。",
    "section": "5.8.5",
    "page": 25
  },
  {
    "id": "KI6",
    "name": "照海",
    "pinyin": "Zhàohǎi",
    "meridian": "KI",
    "region": "下肢",
    "location": "足内侧，内踝尖下1寸，内踝下缘边际凹陷中。",
    "section": "5.8.6",
    "page": 25
  },
  {
    "id": "KI7",
    "name": "复溜",
    "pinyin": "Fùliū",
    "meridian": "KI",
    "region": "下肢",
    "location": "小腿后内侧，内踝尖上2寸，跟腱的前缘。",
    "section": "5.8.7",
    "page": 25
  },
  {
    "id": "KI8",
    "name": "交信",
    "pinyin": "Jiāoxìn",
    "meridian": "KI",
    "region": "下肢",
    "location": "小腿内侧，内踝尖上2寸，胫骨内侧缘后际凹陷中。",
    "section": "5.8.8",
    "page": 26
  },
  {
    "id": "KI9",
    "name": "筑宾",
    "pinyin": "Zhùbīn",
    "meridian": "KI",
    "region": "下肢",
    "location": "小腿后内侧，太溪（KI3）直上5寸，比目鱼肌与跟腱之间。",
    "section": "5.8.9",
    "page": 26
  },
  {
    "id": "KI10",
    "name": "阴谷",
    "pinyin": "Yīngǔ",
    "meridian": "KI",
    "region": "下肢",
    "location": "膝后内侧，腘横纹上，半腱肌肌腱外侧缘。",
    "section": "5.8.10",
    "page": 26
  },
  {
    "id": "KI11",
    "name": "横骨",
    "pinyin": "Hénggǔ",
    "meridian": "KI",
    "region": "胸腹",
    "location": "下腹部，脐中下5寸，前正中线旁开0.5寸。",
    "section": "5.8.11",
    "page": 26
  },
  {
    "id": "KI12",
    "name": "大赫",
    "pinyin": "Dàhè",
    "meridian": "KI",
    "region": "胸腹",
    "location": "下腹部，脐中下4寸，前正中线旁开0.5寸。",
    "section": "5.8.12",
    "page": 26
  },
  {
    "id": "KI13",
    "name": "气穴",
    "pinyin": "Qìxué",
    "meridian": "KI",
    "region": "胸腹",
    "location": "下腹部，脐中下3寸，前正中线旁开0.5寸。",
    "section": "5.8.13",
    "page": 26
  },
  {
    "id": "KI14",
    "name": "四满",
    "pinyin": "Sìmǎn",
    "meridian": "KI",
    "region": "胸腹",
    "location": "下腹部，脐中下2寸，前正中线旁开0.5寸。",
    "section": "5.8.14",
    "page": 26
  },
  {
    "id": "KI15",
    "name": "中注",
    "pinyin": "Zhōngzhù",
    "meridian": "KI",
    "region": "胸腹",
    "location": "下腹部，脐中下1寸，前正中线旁开0.5寸。",
    "section": "5.8.15",
    "page": 26
  },
  {
    "id": "KI16",
    "name": "肓俞",
    "pinyin": "Huāngshū",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中旁开0.5寸。",
    "section": "5.8.16",
    "page": 26
  },
  {
    "id": "KI17",
    "name": "商曲",
    "pinyin": "Shāngqū",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中上2寸，前正中线旁开0.5寸。",
    "section": "5.8.17",
    "page": 26
  },
  {
    "id": "KI18",
    "name": "石关",
    "pinyin": "Shíguān",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中上3寸，前正中线旁开0.5寸。",
    "section": "5.8.18",
    "page": 26
  },
  {
    "id": "KI19",
    "name": "阴都",
    "pinyin": "Yīndū",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中上4寸，前正中线旁开0.5寸。",
    "section": "5.8.19",
    "page": 26
  },
  {
    "id": "KI20",
    "name": "腹通谷",
    "pinyin": "Fùtōnggǔ",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中上5寸，前正中线旁开0.5寸。",
    "section": "5.8.20",
    "page": 26
  },
  {
    "id": "KI21",
    "name": "幽门",
    "pinyin": "Yōumén",
    "meridian": "KI",
    "region": "胸腹",
    "location": "上腹部，脐中上6寸，前正中线旁开0.5寸。",
    "section": "5.8.21",
    "page": 26
  },
  {
    "id": "KI22",
    "name": "步廊",
    "pinyin": "Bùláng",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，第5肋间隙，前正中线旁开2寸。",
    "section": "5.8.22",
    "page": 26
  },
  {
    "id": "KI23",
    "name": "神封",
    "pinyin": "Shénfēng",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，第4肋间隙，前正中线旁开2寸。",
    "section": "5.8.23",
    "page": 26
  },
  {
    "id": "KI24",
    "name": "灵墟",
    "pinyin": "Língxū",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，第3肋间隙，前正中线旁开2寸。",
    "section": "5.8.24",
    "page": 26
  },
  {
    "id": "KI25",
    "name": "神藏",
    "pinyin": "Shéncáng",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，第2肋间隙，前正中线旁开2寸。",
    "section": "5.8.25",
    "page": 26
  },
  {
    "id": "KI26",
    "name": "彧中",
    "pinyin": "Yùzhōng",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，第1肋间隙，前正中线旁开2寸。",
    "section": "5.8.26",
    "page": 26
  },
  {
    "id": "KI27",
    "name": "俞府",
    "pinyin": "Shūfǔ",
    "meridian": "KI",
    "region": "胸腹",
    "location": "前胸部，锁骨下缘，前正中线旁开2寸。",
    "section": "5.8.27",
    "page": 26
  },
  {
    "id": "PC1",
    "name": "天池",
    "pinyin": "Tiānchí",
    "meridian": "PC",
    "region": "胸腹",
    "location": "前胸部，第4肋间隙，前正中线旁开5寸。",
    "section": "5.9.1",
    "page": 27
  },
  {
    "id": "PC2",
    "name": "天泉",
    "pinyin": "Tiānquán",
    "meridian": "PC",
    "region": "上肢",
    "location": "臂前侧，腋前纹头下2寸，肱二头肌的长、短头之间。",
    "section": "5.9.2",
    "page": 27
  },
  {
    "id": "PC3",
    "name": "曲泽",
    "pinyin": "Qūzé",
    "meridian": "PC",
    "region": "上肢",
    "location": "肘前侧，肘横纹上，肱二头肌腱的尺侧缘凹陷中。",
    "section": "5.9.3",
    "page": 27
  },
  {
    "id": "PC4",
    "name": "郄门",
    "pinyin": "Xìmén",
    "meridian": "PC",
    "region": "上肢",
    "location": "前臂前侧，腕掌侧远端横纹上5寸，掌长肌腱与桡侧腕屈肌腱之间。",
    "section": "5.9.4",
    "page": 27
  },
  {
    "id": "PC5",
    "name": "间使",
    "pinyin": "Jiānshǐ",
    "meridian": "PC",
    "region": "上肢",
    "location": "前臂前侧，腕掌侧远端横纹上3寸，掌长肌腱与桡侧腕屈肌腱之间。",
    "section": "5.9.5",
    "page": 27
  },
  {
    "id": "PC6",
    "name": "内关",
    "pinyin": "Nèiguān",
    "meridian": "PC",
    "region": "上肢",
    "location": "前臂前侧，腕掌侧远端横纹上2寸，掌长肌腱与桡侧腕屈肌腱之间。",
    "section": "5.9.6",
    "page": 27
  },
  {
    "id": "PC7",
    "name": "大陵",
    "pinyin": "Dàlíng",
    "meridian": "PC",
    "region": "上肢",
    "location": "腕前侧，腕掌侧远端横纹中，掌长肌腱与桡侧腕屈肌腱之间。",
    "section": "5.9.7",
    "page": 27
  },
  {
    "id": "PC8",
    "name": "劳宫",
    "pinyin": "Láogōng",
    "meridian": "PC",
    "region": "上肢",
    "location": "手掌，横平第3掌指关节近端，第2、3掌骨之间偏于第3掌骨。",
    "section": "5.9.8",
    "page": 27
  },
  {
    "id": "PC9",
    "name": "中冲",
    "pinyin": "Zhōngchōng",
    "meridian": "PC",
    "region": "上肢",
    "location": "手指，中指末端最高点。",
    "section": "5.9.9",
    "page": 27
  },
  {
    "id": "TE1",
    "name": "关冲",
    "pinyin": "Guānchōng",
    "meridian": "TE",
    "region": "上肢",
    "location": "手指，第4指末节尺侧，指甲根角侧上方0.1寸。",
    "section": "5.10.1",
    "page": 27
  },
  {
    "id": "TE2",
    "name": "液门",
    "pinyin": "Yèmén",
    "meridian": "TE",
    "region": "上肢",
    "location": "手背，第4、5指间，指蹼缘上方赤白肉际凹陷中。",
    "section": "5.10.2",
    "page": 27
  },
  {
    "id": "TE3",
    "name": "中渚",
    "pinyin": "Zhōngzhǔ",
    "meridian": "TE",
    "region": "上肢",
    "location": "手背，第4、5掌骨间，第4掌指关节近端凹陷中。",
    "section": "5.10.3",
    "page": 27
  },
  {
    "id": "TE4",
    "name": "阳池",
    "pinyin": "Yángchí",
    "meridian": "TE",
    "region": "上肢",
    "location": "腕后侧，腕背侧远端横纹上，指伸肌腱的尺侧缘凹陷中。",
    "section": "5.10.4",
    "page": 27
  },
  {
    "id": "TE5",
    "name": "外关",
    "pinyin": "Wàiguān",
    "meridian": "TE",
    "region": "上肢",
    "location": "前臂后侧，腕背侧远端横纹上2寸，尺骨与桡骨间隙中点。",
    "section": "5.10.5",
    "page": 28
  },
  {
    "id": "TE6",
    "name": "支沟",
    "pinyin": "Zhīgōu",
    "meridian": "TE",
    "region": "上肢",
    "location": "前臂后侧，腕背侧远端横纹上3寸，尺骨与桡骨间隙中点。",
    "section": "5.10.6",
    "page": 28
  },
  {
    "id": "TE7",
    "name": "会宗",
    "pinyin": "Huìzōng",
    "meridian": "TE",
    "region": "上肢",
    "location": "前臂后侧，腕背侧远端横纹上3寸，尺骨的桡侧缘。",
    "section": "5.10.7",
    "page": 28
  },
  {
    "id": "TE8",
    "name": "三阳络",
    "pinyin": "Sānyángluò",
    "meridian": "TE",
    "region": "上肢",
    "location": "前臂后侧，腕背侧远端横纹上4寸，尺骨与桡骨间隙中点。",
    "section": "5.10.8",
    "page": 28
  },
  {
    "id": "TE9",
    "name": "四渎",
    "pinyin": "Sìdú",
    "meridian": "TE",
    "region": "上肢",
    "location": "前臂后侧，尺骨鹰嘴尖下5寸，尺骨与桡骨间隙中点。",
    "section": "5.10.9",
    "page": 28
  },
  {
    "id": "TE10",
    "name": "天井",
    "pinyin": "Tiānjǐng",
    "meridian": "TE",
    "region": "上肢",
    "location": "肘后侧，尺骨鹰嘴尖上1寸凹陷中。",
    "section": "5.10.10",
    "page": 28
  },
  {
    "id": "TE11",
    "name": "清泠渊",
    "pinyin": "Qīnglíngyuān",
    "meridian": "TE",
    "region": "上肢",
    "location": "臂后侧，尺骨鹰嘴尖与肩峰角连线上，尺骨鹰嘴尖上2寸。",
    "section": "5.10.11",
    "page": 28
  },
  {
    "id": "TE12",
    "name": "消泺",
    "pinyin": "Xiāoluò",
    "meridian": "TE",
    "region": "上肢",
    "location": "臂后侧，尺骨鹰嘴尖与肩峰角连线上，鹰嘴尖上5寸。",
    "section": "5.10.12",
    "page": 28
  },
  {
    "id": "TE13",
    "name": "臑会",
    "pinyin": "Nàohuì",
    "meridian": "TE",
    "region": "上肢",
    "location": "臂后侧，在尺骨鹰嘴尖与肩峰角连线上，与三角肌后缘相交处。",
    "section": "5.10.13",
    "page": 28
  },
  {
    "id": "TE14",
    "name": "肩髎",
    "pinyin": "Jiānliáo",
    "meridian": "TE",
    "region": "上肢",
    "location": "肩带部，肩峰角与肱骨大结节两骨间凹陷中。",
    "section": "5.10.14",
    "page": 28
  },
  {
    "id": "TE15",
    "name": "天髎",
    "pinyin": "Tiānliáo",
    "meridian": "TE",
    "region": "上肢",
    "location": "肩带部，肩胛骨上角骨际凹陷中。",
    "section": "5.10.15",
    "page": 28
  },
  {
    "id": "TE16",
    "name": "天牖",
    "pinyin": "Tiānyǒu",
    "meridian": "TE",
    "region": "头颈",
    "location": "颈前部，横平下颌角，胸锁乳突肌的后缘凹陷中。",
    "section": "5.10.16",
    "page": 28
  },
  {
    "id": "TE17",
    "name": "翳风",
    "pinyin": "Yìfēng",
    "meridian": "TE",
    "region": "头颈",
    "location": "颈部，耳垂后方，乳突下端前方凹陷中。",
    "section": "5.10.17",
    "page": 28
  },
  {
    "id": "TE18",
    "name": "瘈脉",
    "pinyin": "Chìmài",
    "meridian": "TE",
    "region": "头颈",
    "location": "头部，乳突中央，角孙（TE20）与翳风（TE17）沿耳轮弧形连线的上2/3与下1/3的交点处。",
    "section": "5.10.18",
    "page": 28
  },
  {
    "id": "TE19",
    "name": "颅息",
    "pinyin": "Lúxī",
    "meridian": "TE",
    "region": "头颈",
    "location": "头部，角孙（TE20）与翳风（TE17）沿耳轮弧形连线的上1/3与下2/3的交点处。",
    "section": "5.10.19",
    "page": 28
  },
  {
    "id": "TE20",
    "name": "角孙",
    "pinyin": "Jiǎosūn",
    "meridian": "TE",
    "region": "头颈",
    "location": "头部，耳尖正对发际处。",
    "section": "5.10.20",
    "page": 28
  },
  {
    "id": "TE21",
    "name": "耳门",
    "pinyin": "Ěrmén",
    "meridian": "TE",
    "region": "头颈",
    "location": "面部，耳屏上切迹与下颌骨髁突之间的凹陷中。",
    "section": "5.10.21",
    "page": 29
  },
  {
    "id": "TE22",
    "name": "耳和髎",
    "pinyin": "Ěrhéliáo",
    "meridian": "TE",
    "region": "头颈",
    "location": "头部，鬓发后缘，耳郭根的前方，颞浅动脉的后缘。",
    "section": "5.10.22",
    "page": 29
  },
  {
    "id": "TE23",
    "name": "丝竹空",
    "pinyin": "Sīzhúkōng",
    "meridian": "TE",
    "region": "头颈",
    "location": "头部，眉梢凹陷中。",
    "section": "5.10.23",
    "page": 29
  },
  {
    "id": "GB1",
    "name": "瞳子髎",
    "pinyin": "Tóngzǐliáo",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，目外眦外侧0.5寸凹陷中。",
    "section": "5.11.1",
    "page": 29
  },
  {
    "id": "GB2",
    "name": "听会",
    "pinyin": "Tīnghuì",
    "meridian": "GB",
    "region": "头颈",
    "location": "面部，耳屏间切迹与下颌骨髁突之间的凹陷中。",
    "section": "5.11.2",
    "page": 29
  },
  {
    "id": "GB3",
    "name": "上关",
    "pinyin": "Shàngguān",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，颧弓上缘中央凹陷中。",
    "section": "5.11.3",
    "page": 29
  },
  {
    "id": "GB4",
    "name": "颔厌",
    "pinyin": "Hànyàn",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，从头维（ST8）至曲鬓（GB7）的弧形连线（其弧度与鬓发弧度相应）的上1/4与下3/4的交点处。",
    "section": "5.11.4",
    "page": 29
  },
  {
    "id": "GB5",
    "name": "悬颅",
    "pinyin": "Xuánlú",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，从头维（ST8）至曲鬓（GB7）的弧形连线（其弧度与鬓发弧度相应）的中点处。",
    "section": "5.11.5",
    "page": 29
  },
  {
    "id": "GB6",
    "name": "悬厘",
    "pinyin": "Xuánlí",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，从头维（ST8）至曲鬓（GB7）的弧形连线（其弧度与鬓发弧度相应）的上3/4与下1/4的交点处。",
    "section": "5.11.6",
    "page": 29
  },
  {
    "id": "GB7",
    "name": "曲鬓",
    "pinyin": "Qūbìn",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，鬓角发际后缘与耳尖水平线的交点处。",
    "section": "5.11.7",
    "page": 29
  },
  {
    "id": "GB8",
    "name": "率谷",
    "pinyin": "Shuàigǔ",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，耳尖直上入发际1.5寸。",
    "section": "5.11.8",
    "page": 29
  },
  {
    "id": "GB9",
    "name": "天冲",
    "pinyin": "Tiānchōng",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，耳根后缘直上，入发际2寸。",
    "section": "5.11.9",
    "page": 29
  },
  {
    "id": "GB10",
    "name": "浮白",
    "pinyin": "Fúbái",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，耳后乳突的后上方，从天冲（GB9）至完骨（GB12）的弧形连线（其弧度与耳郭弧度相应）的上1/3与下2/3交点处。",
    "section": "5.11.10",
    "page": 29
  },
  {
    "id": "GB11",
    "name": "头窍阴",
    "pinyin": "Tóuqiàoyīn",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，耳后乳突的后上方，从天冲（GB9）到完骨（GB12）的弧形连线（其弧度与耳郭弧度相应）的上2/3与下1/3交点处。",
    "section": "5.11.11",
    "page": 29
  },
  {
    "id": "GB12",
    "name": "完骨",
    "pinyin": "Wángǔ",
    "meridian": "GB",
    "region": "头颈",
    "location": "颈部，耳后乳突的后下方凹陷中。",
    "section": "5.11.12",
    "page": 29
  },
  {
    "id": "GB13",
    "name": "本神",
    "pinyin": "Běnshén",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，前发际上0.5寸，头正中线旁开3寸。",
    "section": "5.11.13",
    "page": 29
  },
  {
    "id": "GB14",
    "name": "阳白",
    "pinyin": "Yángbái",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，眉上1寸，瞳孔直上。",
    "section": "5.11.14",
    "page": 30
  },
  {
    "id": "GB15",
    "name": "头临泣",
    "pinyin": "Tóulínqì",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，前发际上0.5寸，瞳孔直上。",
    "section": "5.11.15",
    "page": 30
  },
  {
    "id": "GB16",
    "name": "目窗",
    "pinyin": "Mùchuāng",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，前发际上1.5寸，瞳孔直上。",
    "section": "5.11.16",
    "page": 30
  },
  {
    "id": "GB17",
    "name": "正营",
    "pinyin": "Zhèngyíng",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，前发际上2.5寸，瞳孔直上。",
    "section": "5.11.17",
    "page": 30
  },
  {
    "id": "GB18",
    "name": "承灵",
    "pinyin": "Chénglíng",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，前发际上4寸，瞳孔直上。",
    "section": "5.11.18",
    "page": 30
  },
  {
    "id": "GB19",
    "name": "脑空",
    "pinyin": "Nǎokōng",
    "meridian": "GB",
    "region": "头颈",
    "location": "头部，横平枕外隆凸的上缘，风池（GB20）直上。",
    "section": "5.11.19",
    "page": 30
  },
  {
    "id": "GB20",
    "name": "风池",
    "pinyin": "Fēngchí",
    "meridian": "GB",
    "region": "头颈",
    "location": "项部，枕骨之下，胸锁乳突肌上端与斜方肌上端之间的凹陷中。",
    "section": "5.11.20",
    "page": 30
  },
  {
    "id": "GB21",
    "name": "肩井",
    "pinyin": "Jiānjǐng",
    "meridian": "GB",
    "region": "头颈",
    "location": "颈后部，第7颈椎棘突与肩峰最外侧点连线的中点。",
    "section": "5.11.21",
    "page": 30
  },
  {
    "id": "GB22",
    "name": "渊腋",
    "pinyin": "Yuānyè",
    "meridian": "GB",
    "region": "胸腹",
    "location": "侧胸部，第4肋间隙中，在腋中线上。",
    "section": "5.11.22",
    "page": 30
  },
  {
    "id": "GB23",
    "name": "辄筋",
    "pinyin": "Zhéjīn",
    "meridian": "GB",
    "region": "胸腹",
    "location": "侧胸部，第4肋间隙中，腋中线前1寸。",
    "section": "5.11.23",
    "page": 30
  },
  {
    "id": "GB24",
    "name": "日月",
    "pinyin": "Rìyuè",
    "meridian": "GB",
    "region": "胸腹",
    "location": "前胸部，第7肋间隙中，前正中线旁开4寸。",
    "section": "5.11.24",
    "page": 30
  },
  {
    "id": "GB25",
    "name": "京门",
    "pinyin": "Jīngmén",
    "meridian": "GB",
    "region": "胸腹",
    "location": "侧腹部，第12肋骨游离端的下际。",
    "section": "5.11.25",
    "page": 30
  },
  {
    "id": "GB26",
    "name": "带脉",
    "pinyin": "Dàimài",
    "meridian": "GB",
    "region": "胸腹",
    "location": "侧腹部，第11肋骨游离端垂线与脐水平线的交点上。",
    "section": "5.11.26",
    "page": 30
  },
  {
    "id": "GB27",
    "name": "五枢",
    "pinyin": "Wǔshū",
    "meridian": "GB",
    "region": "胸腹",
    "location": "下腹部，横平脐下3寸，髂前上棘内侧。",
    "section": "5.11.27",
    "page": 30
  },
  {
    "id": "GB28",
    "name": "维道",
    "pinyin": "Wéidào",
    "meridian": "GB",
    "region": "胸腹",
    "location": "下腹部，髂前上棘内下0.5寸。",
    "section": "5.11.28",
    "page": 30
  },
  {
    "id": "GB29",
    "name": "居髎",
    "pinyin": "Jūliáo",
    "meridian": "GB",
    "region": "背腰",
    "location": "臀部，髂前上棘与股骨大转子最凸点连线的中点处。",
    "section": "5.11.29",
    "page": 31
  },
  {
    "id": "GB30",
    "name": "环跳",
    "pinyin": "Huántiào",
    "meridian": "GB",
    "region": "背腰",
    "location": "臀部，股骨大转子最凸点与骶管裂孔连线的外1/3与内2/3交点处。",
    "section": "5.11.30",
    "page": 31
  },
  {
    "id": "GB31",
    "name": "风市",
    "pinyin": "Fēngshì",
    "meridian": "GB",
    "region": "下肢",
    "location": "股外侧，腘横纹上9寸，髂胫束后缘。",
    "section": "5.11.31",
    "page": 31
  },
  {
    "id": "GB32",
    "name": "中渎",
    "pinyin": "Zhōngdú",
    "meridian": "GB",
    "region": "下肢",
    "location": "股外侧，腘横纹上7寸，髂胫束后缘。",
    "section": "5.11.32",
    "page": 31
  },
  {
    "id": "GB33",
    "name": "膝阳关",
    "pinyin": "Xīyángguān",
    "meridian": "GB",
    "region": "下肢",
    "location": "膝外侧，股骨外上髁后上缘，股二头肌腱与髂胫束之间的凹陷中。",
    "section": "5.11.33",
    "page": 31
  },
  {
    "id": "GB34",
    "name": "阳陵泉",
    "pinyin": "Yánglíngquán",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，腓骨头前下方凹陷中。",
    "section": "5.11.34",
    "page": 31
  },
  {
    "id": "GB35",
    "name": "阳交",
    "pinyin": "Yángjiāo",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上7寸，腓骨后缘。",
    "section": "5.11.35",
    "page": 31
  },
  {
    "id": "GB36",
    "name": "外丘",
    "pinyin": "Wàiqiū",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上7寸，腓骨前缘。",
    "section": "5.11.36",
    "page": 31
  },
  {
    "id": "GB37",
    "name": "光明",
    "pinyin": "Guāngmíng",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上5寸，腓骨前缘。",
    "section": "5.11.37",
    "page": 31
  },
  {
    "id": "GB38",
    "name": "阳辅",
    "pinyin": "Yángfǔ",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上4寸，腓骨前缘。",
    "section": "5.11.38",
    "page": 31
  },
  {
    "id": "GB39",
    "name": "悬钟",
    "pinyin": "Xuánzhōng",
    "meridian": "GB",
    "region": "下肢",
    "location": "小腿外侧，外踝尖上3寸，腓骨前缘。",
    "section": "5.11.39",
    "page": 31
  },
  {
    "id": "GB40",
    "name": "丘墟",
    "pinyin": "Qiūxū",
    "meridian": "GB",
    "region": "下肢",
    "location": "踝前外侧，外踝的前下方，趾长伸肌腱的外侧凹陷中。",
    "section": "5.11.40",
    "page": 31
  },
  {
    "id": "GB41",
    "name": "足临泣",
    "pinyin": "Zúlínqì",
    "meridian": "GB",
    "region": "下肢",
    "location": "足背，第4、5跖骨底结合部的前方，第5趾长伸肌腱外侧凹陷中。",
    "section": "5.11.41",
    "page": 31
  },
  {
    "id": "GB42",
    "name": "地五会",
    "pinyin": "Dìwǔhuì",
    "meridian": "GB",
    "region": "下肢",
    "location": "足背，第4、5跖骨间，第4跖趾关节近端凹陷中。",
    "section": "5.11.42",
    "page": 31
  },
  {
    "id": "GB43",
    "name": "侠溪",
    "pinyin": "Xiáxī",
    "meridian": "GB",
    "region": "下肢",
    "location": "足背，第4、5趾间，趾蹼缘后方赤白肉际处。",
    "section": "5.11.43",
    "page": 31
  },
  {
    "id": "GB44",
    "name": "足窍阴",
    "pinyin": "Zúqiàoyīn",
    "meridian": "GB",
    "region": "下肢",
    "location": "足趾，第4趾末节外侧，趾甲根角侧后方0.1寸。",
    "section": "5.11.44",
    "page": 31
  },
  {
    "id": "LR1",
    "name": "大敦",
    "pinyin": "Dàdūn",
    "meridian": "LR",
    "region": "下肢",
    "location": "足趾，大趾末节外侧，趾甲根角侧后方0.1寸。",
    "section": "5.12.1",
    "page": 31
  },
  {
    "id": "LR2",
    "name": "行间",
    "pinyin": "Xíngjiān",
    "meridian": "LR",
    "region": "下肢",
    "location": "足背，第1、2趾间，趾蹼缘后方赤白肉际处。",
    "section": "5.12.2",
    "page": 32
  },
  {
    "id": "LR3",
    "name": "太冲",
    "pinyin": "Tàichōng",
    "meridian": "LR",
    "region": "下肢",
    "location": "足背，第1、2跖骨间，跖骨底结合部前方凹陷中，或触及动脉搏动。",
    "section": "5.12.3",
    "page": 32
  },
  {
    "id": "LR4",
    "name": "中封",
    "pinyin": "Zhōngfēng",
    "meridian": "LR",
    "region": "下肢",
    "location": "踝前内侧，足内踝前，胫骨前肌肌腱的内侧缘凹陷中。",
    "section": "5.12.4",
    "page": 32
  },
  {
    "id": "LR5",
    "name": "蠡沟",
    "pinyin": "Lígōu",
    "meridian": "LR",
    "region": "下肢",
    "location": "小腿前内侧，内踝尖上5寸，胫骨内侧面的中央。",
    "section": "5.12.5",
    "page": 32
  },
  {
    "id": "LR6",
    "name": "中都",
    "pinyin": "Zhōngdū",
    "meridian": "LR",
    "region": "下肢",
    "location": "小腿前内侧，内踝尖上7寸，胫骨内侧面的中央。",
    "section": "5.12.6",
    "page": 32
  },
  {
    "id": "LR7",
    "name": "膝关",
    "pinyin": "Xīguān",
    "meridian": "LR",
    "region": "下肢",
    "location": "小腿内侧，胫骨内侧髁的下方，阴陵泉（SP9）后1寸。",
    "section": "5.12.7",
    "page": 32
  },
  {
    "id": "LR8",
    "name": "曲泉",
    "pinyin": "Qūquán",
    "meridian": "LR",
    "region": "下肢",
    "location": "膝内侧，腘横纹内侧端，半腱肌肌腱内缘凹陷中。",
    "section": "5.12.8",
    "page": 32
  },
  {
    "id": "LR9",
    "name": "阴包",
    "pinyin": "Yīnbāo",
    "meridian": "LR",
    "region": "下肢",
    "location": "股内侧，髌底上4寸，股薄肌与缝匠肌之间。",
    "section": "5.12.9",
    "page": 32
  },
  {
    "id": "LR10",
    "name": "足五里",
    "pinyin": "Zúwǔlǐ",
    "meridian": "LR",
    "region": "下肢",
    "location": "股内侧，气冲（ST30）直下3寸，动脉搏动处。",
    "section": "5.12.10",
    "page": 32
  },
  {
    "id": "LR11",
    "name": "阴廉",
    "pinyin": "Yīnlián",
    "meridian": "LR",
    "region": "下肢",
    "location": "股内侧，气冲（ST30）直下2寸。",
    "section": "5.12.11",
    "page": 32
  },
  {
    "id": "LR12",
    "name": "急脉",
    "pinyin": "Jímài",
    "meridian": "LR",
    "region": "下肢",
    "location": "腹股沟，横平耻骨联合上缘，前正中线旁开2.5寸。",
    "section": "5.12.12",
    "page": 32
  },
  {
    "id": "LR13",
    "name": "章门",
    "pinyin": "Zhāngmén",
    "meridian": "LR",
    "region": "胸腹",
    "location": "侧腹部，在第11肋游离端的下际。",
    "section": "5.12.13",
    "page": 32
  },
  {
    "id": "LR14",
    "name": "期门",
    "pinyin": "Qīmén",
    "meridian": "LR",
    "region": "胸腹",
    "location": "前胸部，第６肋间隙，前正中线旁开４寸。",
    "section": "5.12.14",
    "page": 32
  },
  {
    "id": "GV1",
    "name": "长强",
    "pinyin": "Chángqiáng",
    "meridian": "GV",
    "region": "胸腹",
    "location": "会阴部，尾骨下方，尾骨端与肛门连线的中点处。",
    "section": "5.13.1",
    "page": 32
  },
  {
    "id": "GV2",
    "name": "腰俞",
    "pinyin": "Yāoshū",
    "meridian": "GV",
    "region": "背腰",
    "location": "骶部，正对骶管裂孔，后正中线上。",
    "section": "5.13.2",
    "page": 32
  },
  {
    "id": "GV3",
    "name": "腰阳关",
    "pinyin": "Yāoyángguān",
    "meridian": "GV",
    "region": "背腰",
    "location": "腰部，第4腰椎棘突下凹陷中，后正中线上。",
    "section": "5.13.3",
    "page": 33
  },
  {
    "id": "GV4",
    "name": "命门",
    "pinyin": "Mìngmén",
    "meridian": "GV",
    "region": "背腰",
    "location": "腰部，第2腰椎棘突下凹陷中，后正中线上。",
    "section": "5.13.4",
    "page": 33
  },
  {
    "id": "GV5",
    "name": "悬枢",
    "pinyin": "Xuánshū",
    "meridian": "GV",
    "region": "背腰",
    "location": "腰部，第1腰椎棘突下凹陷中，后正中线上。",
    "section": "5.13.5",
    "page": 33
  },
  {
    "id": "GV6",
    "name": "脊中",
    "pinyin": "Jǐzhōng",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第11胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.6",
    "page": 33
  },
  {
    "id": "GV7",
    "name": "中枢",
    "pinyin": "Zhōngshū",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第10胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.7",
    "page": 33
  },
  {
    "id": "GV8",
    "name": "筋缩",
    "pinyin": "Jīnsuō",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第9胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.8",
    "page": 33
  },
  {
    "id": "GV9",
    "name": "至阳",
    "pinyin": "Zhìyáng",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第7胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.9",
    "page": 33
  },
  {
    "id": "GV10",
    "name": "灵台",
    "pinyin": "Língtái",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第6胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.10",
    "page": 33
  },
  {
    "id": "GV11",
    "name": "神道",
    "pinyin": "Shéndào",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第5胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.11",
    "page": 33
  },
  {
    "id": "GV12",
    "name": "身柱",
    "pinyin": "Shēnzhù",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第3胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.12",
    "page": 33
  },
  {
    "id": "GV13",
    "name": "陶道",
    "pinyin": "Táodào",
    "meridian": "GV",
    "region": "背腰",
    "location": "背部，第1胸椎棘突下凹陷中，后正中线上。",
    "section": "5.13.13",
    "page": 33
  },
  {
    "id": "GV14",
    "name": "大椎",
    "pinyin": "Dàzhuī",
    "meridian": "GV",
    "region": "头颈",
    "location": "颈后部，第7颈椎棘突下凹陷中，后正中线上。",
    "section": "5.13.14",
    "page": 33
  },
  {
    "id": "GV15",
    "name": "哑门",
    "pinyin": "Yǎmén",
    "meridian": "GV",
    "region": "头颈",
    "location": "颈后部，第2颈椎棘突上际凹陷中，后正中线上。",
    "section": "5.13.15",
    "page": 33
  },
  {
    "id": "GV16",
    "name": "风府",
    "pinyin": "Fēngfǔ",
    "meridian": "GV",
    "region": "头颈",
    "location": "颈后部，枕外隆凸直下，两侧斜方肌之间凹陷中。",
    "section": "5.13.16",
    "page": 33
  },
  {
    "id": "GV17",
    "name": "脑户",
    "pinyin": "Nǎohù",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，枕外隆凸的上缘凹陷中。",
    "section": "5.13.17",
    "page": 33
  },
  {
    "id": "GV18",
    "name": "强间",
    "pinyin": "Qiángjiān",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，后发际正中直上4寸。",
    "section": "5.13.18",
    "page": 33
  },
  {
    "id": "GV19",
    "name": "后顶",
    "pinyin": "Hòudǐng",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，后发际正中直上5.5寸。",
    "section": "5.13.19",
    "page": 34
  },
  {
    "id": "GV20",
    "name": "百会",
    "pinyin": "Bǎihuì",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，前发际正中直上5寸。",
    "section": "5.13.20",
    "page": 34
  },
  {
    "id": "GV21",
    "name": "前顶",
    "pinyin": "Qiándǐng",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，前发际正中直上3.5寸。",
    "section": "5.13.21",
    "page": 34
  },
  {
    "id": "GV22",
    "name": "囟会",
    "pinyin": "Xìnhuì",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，前发际正中直上2寸。",
    "section": "5.13.22",
    "page": 34
  },
  {
    "id": "GV23",
    "name": "上星",
    "pinyin": "Shàngxīng",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，前发际正中直上1寸。",
    "section": "5.13.23",
    "page": 34
  },
  {
    "id": "GV24",
    "name": "神庭",
    "pinyin": "Shéntíng",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，前发际正中直上0.5寸。",
    "section": "5.13.24",
    "page": 34
  },
  {
    "id": "GV24+",
    "name": "印堂",
    "pinyin": "Yìntáng",
    "meridian": "GV",
    "region": "头颈",
    "location": "头部，两眉毛内侧端中间的凹陷中。",
    "section": "5.13.25",
    "page": 34
  },
  {
    "id": "GV25",
    "name": "素髎",
    "pinyin": "Sùliáo",
    "meridian": "GV",
    "region": "头颈",
    "location": "面部，鼻尖的正中央。",
    "section": "5.13.26",
    "page": 34
  },
  {
    "id": "GV26",
    "name": "水沟",
    "pinyin": "Shuǐgōu",
    "meridian": "GV",
    "region": "头颈",
    "location": "面部，人中沟的上1/3与中1/3交点处。",
    "section": "5.13.27",
    "page": 34
  },
  {
    "id": "GV27",
    "name": "兑端",
    "pinyin": "Duìduān",
    "meridian": "GV",
    "region": "头颈",
    "location": "面部，上唇结节的中点。",
    "section": "5.13.28",
    "page": 34
  },
  {
    "id": "GV28",
    "name": "龈交",
    "pinyin": "Yínjiāo",
    "meridian": "GV",
    "region": "头颈",
    "location": "上唇内，上唇系带与上牙龈的交点。",
    "section": "5.13.29",
    "page": 34
  },
  {
    "id": "CV1",
    "name": "会阴",
    "pinyin": "Huìyīn",
    "meridian": "CV",
    "region": "胸腹",
    "location": "会阴部，男性在阴囊根部与肛门连线的中点，女性在大阴唇后联合与肛门连线的中点。",
    "section": "5.14.1",
    "page": 34
  },
  {
    "id": "CV2",
    "name": "曲骨",
    "pinyin": "Qūgǔ",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，耻骨联合上缘，前正中线上。",
    "section": "5.14.2",
    "page": 34
  },
  {
    "id": "CV3",
    "name": "中极",
    "pinyin": "Zhōngjí",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，脐中下4寸，前正中线上。",
    "section": "5.14.3",
    "page": 34
  },
  {
    "id": "CV4",
    "name": "关元",
    "pinyin": "Guānyuán",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，脐中下3寸，前正中线上。",
    "section": "5.14.4",
    "page": 34
  },
  {
    "id": "CV5",
    "name": "石门",
    "pinyin": "Shímén",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，脐中下2寸，前正中线上。",
    "section": "5.14.5",
    "page": 34
  },
  {
    "id": "CV6",
    "name": "气海",
    "pinyin": "Qìhǎi",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，脐中下1.5寸，前正中线上。",
    "section": "5.14.6",
    "page": 34
  },
  {
    "id": "CV7",
    "name": "阴交",
    "pinyin": "Yīnjiāo",
    "meridian": "CV",
    "region": "胸腹",
    "location": "下腹部，脐中下1寸，前正中线上。",
    "section": "5.14.7",
    "page": 35
  },
  {
    "id": "CV8",
    "name": "神阙",
    "pinyin": "Shénquè",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中央。",
    "section": "5.14.8",
    "page": 35
  },
  {
    "id": "CV9",
    "name": "水分",
    "pinyin": "Shuǐfēn",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上1寸，前正中线上。",
    "section": "5.14.9",
    "page": 35
  },
  {
    "id": "CV10",
    "name": "下脘",
    "pinyin": "Xiàwǎn",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上2寸，前正中线上。",
    "section": "5.14.10",
    "page": 35
  },
  {
    "id": "CV11",
    "name": "建里",
    "pinyin": "Jiànlǐ",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上3寸，前正中线上。",
    "section": "5.14.11",
    "page": 35
  },
  {
    "id": "CV12",
    "name": "中脘",
    "pinyin": "Zhōngwǎn",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上4寸，前正中线上。",
    "section": "5.14.12",
    "page": 35
  },
  {
    "id": "CV13",
    "name": "上脘",
    "pinyin": "Shàngwǎn",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上5寸，前正中线上。",
    "section": "5.14.13",
    "page": 35
  },
  {
    "id": "CV14",
    "name": "巨阙",
    "pinyin": "Jùquè",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，脐中上6寸，前正中线上。",
    "section": "5.14.14",
    "page": 35
  },
  {
    "id": "CV15",
    "name": "鸠尾",
    "pinyin": "Jiūwěi",
    "meridian": "CV",
    "region": "胸腹",
    "location": "上腹部，剑胸结合下1寸，前正中线上。",
    "section": "5.14.15",
    "page": 35
  },
  {
    "id": "CV16",
    "name": "中庭",
    "pinyin": "Zhōngtíng",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，剑胸结合中点处，前正中线上。",
    "section": "5.14.16",
    "page": 35
  },
  {
    "id": "CV17",
    "name": "膻中",
    "pinyin": "Dànzhōng",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，横平第4肋间隙，前正中线上。",
    "section": "5.14.17",
    "page": 35
  },
  {
    "id": "CV18",
    "name": "玉堂",
    "pinyin": "Yùtáng",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，横平第3肋间隙，前正中线上。",
    "section": "5.14.18",
    "page": 35
  },
  {
    "id": "CV19",
    "name": "紫宫",
    "pinyin": "Zǐgōng",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，横平第2肋间隙，前正中线上。",
    "section": "5.14.19",
    "page": 35
  },
  {
    "id": "CV20",
    "name": "华盖",
    "pinyin": "Huágài",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，横平第1肋间隙，前正中线上。",
    "section": "5.14.20",
    "page": 35
  },
  {
    "id": "CV21",
    "name": "璇玑",
    "pinyin": "Xuánjī",
    "meridian": "CV",
    "region": "胸腹",
    "location": "前胸部，胸骨上窝下1寸，前正中线上。",
    "section": "5.14.21",
    "page": 35
  },
  {
    "id": "CV22",
    "name": "天突",
    "pinyin": "Tiāntū",
    "meridian": "CV",
    "region": "头颈",
    "location": "颈前部，胸骨上窝中央，前正中线上。",
    "section": "5.14.22",
    "page": 35
  },
  {
    "id": "CV23",
    "name": "廉泉",
    "pinyin": "Liánquán",
    "meridian": "CV",
    "region": "头颈",
    "location": "颈前部，甲状软骨上缘（约相当于喉结处）上方，舌骨上缘凹陷中，前正中线上。",
    "section": "5.14.23",
    "page": 35
  },
  {
    "id": "CV24",
    "name": "承浆",
    "pinyin": "Chéngjiāng",
    "meridian": "CV",
    "region": "头颈",
    "location": "面部，颏唇沟的正中凹陷处。",
    "section": "5.14.24",
    "page": 35
  }
];
