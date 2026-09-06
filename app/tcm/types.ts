export type Region = '头颈' | '胸腹' | '背腰' | '上肢' | '下肢';
export interface Source { title: string; url: string; section?: string }
export interface Meridian { id: string; name: string; shortName: string; color: string; description: string }
export interface Acupoint {
  id: string; name: string; pinyin: string; meridian: string; region: Region;
  bilateral: boolean; location: string; landmarks: string[];
  traditional: string; caution: string; tags: string[]; anatomy: string[];
  sources: Source[];
}
export interface LearningCase {
  id: string; title: string; level: string; prompt: string;
  options: string[]; answer: number; explanation: string; pointIds: string[]; sources: Source[];
}
