import type { SystemId } from "../anatomy";
export const SYSTEM_ZH: Record<SystemId, string> = {
  skeletal: "骨骼",
  muscular: "肌肉",
  cardiac: "心脏",
  sensory: "感觉器官",
  arterial: "动脉",
  venous: "静脉",
  nervous: "神经",
  respiratory: "呼吸系统",
  digestive: "消化系统",
  urinary: "泌尿系统",
  lymphatic: "淋巴系统",
  endocrine: "内分泌",
  reproductive: "生殖系统",
  integumentary: "体表",
  connective: "结缔组织",
};
const terms: Record<string, string> = {
  skin: "皮肤",
  eyebrow: "眉毛",
  "hair of head": "头发",
  lip: "唇",
  "pubic hair": "阴毛",
  heart: "心脏",
  brain: "脑",
  liver: "肝",
  stomach: "胃",
  spleen: "脾",
  pancreas: "胰",
  trachea: "气管",
  diaphragm: "膈",
  "urinary bladder": "膀胱",
  patella: "髌骨",
  tibia: "胫骨",
  fibula: "腓骨",
  humerus: "肱骨",
  radius: "桡骨",
  ulna: "尺骨",
  femur: "股骨",
  talus: "距骨",
  calcaneus: "跟骨",
  scapula: "肩胛骨",
  clavicle: "锁骨",
  "body of sternum": "胸骨体",
  "rectus abdominis": "腹直肌",
  "tibialis anterior": "胫骨前肌",
  "tibialis posterior": "胫骨后肌",
  deltoid: "三角肌",
  trapezius: "斜方肌",
  "biceps brachii": "肱二头肌",
  "triceps brachii": "肱三头肌",
  brachioradialis: "肱桡肌",
  "pectoralis major": "胸大肌",
  "median nerve": "正中神经",
  "ulnar nerve": "尺神经",
  "radial nerve": "桡神经",
  "sciatic nerve": "坐骨神经",
  "femoral nerve": "股神经",
  "spinal cord": "脊髓",
  "rectus femoris": "股直肌",
  "vastus medialis": "股内侧肌",
  "vastus lateralis": "股外侧肌",
  gastrocnemius: "腓肠肌",
  soleus: "比目鱼肌",
  "achilles tendon": "跟腱",
};
export function anatomyZh(name: string): string {
  const lower = name.toLowerCase();
  if (terms[lower]) return terms[lower];
  const side = lower.startsWith("left ") ? "左" : lower.startsWith("right ") ? "右" : "";
  const core = side ? lower.slice(side === "左" ? 5 : 6) : lower;
  if (terms[core]) return side + terms[core];
  const digits: Record<string, string> = {
    first: "第1",
    second: "第2",
    third: "第3",
    fourth: "第4",
    fifth: "第5",
    sixth: "第6",
    seventh: "第7",
    eighth: "第8",
    ninth: "第9",
    tenth: "第10",
    eleventh: "第11",
    twelfth: "第12",
  };
  for (const [en, zh] of Object.entries(digits)) {
    if (core === `${en} metacarpal bone`) return `${side}${zh}掌骨`;
    if (core === `${en} metatarsal bone`) return `${side}${zh}跖骨`;
    if (core === `${en} rib`) return `${side}${zh}肋骨`;
    for (const [part, chinese] of [
      ["cervical", "颈"],
      ["thoracic", "胸"],
      ["lumbar", "腰"],
    ])
      if (core === `${en} ${part} vertebra`) return `${zh}${chinese}椎`;
  }
  return name;
}
