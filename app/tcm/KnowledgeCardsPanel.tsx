import { useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Part } from '../anatomy';
import type { Acupoint, Meridian, PlacementDisplayMode } from './types';
import { buildAnatomyCards, buildPointCards, buildPointEffectCards, type KnowledgeDeck } from './knowledge-cards';
import { deckEmptyCopy, flipKeyAction, knowledgeDeckOptions, KnowledgeCardFace, visibleCardFace } from './knowledge-card-ui';
import { loadWrongCardResources } from './knowledge-card-resources';
import { KNOWLEDGE_REVIEW_KEY, knowledgeReviewQueue, mergeKnowledgeReviewForPersistence, parseKnowledgeReviewStore, rateKnowledgeCard, type KnowledgeReviewStore } from './knowledge-review';
import type { Rating } from './study';

export default function KnowledgeCardsPanel({ points, cataloguePoints, meridians, parts, placementDisplayMode, pointPanel, deck, onDeck }: {
  points: readonly Acupoint[]; cataloguePoints: readonly Acupoint[]; meridians: readonly Meridian[]; parts: readonly Part[] | null;
  placementDisplayMode: PlacementDisplayMode; pointPanel: ReactNode;
  deck: KnowledgeDeck; onDeck: (deck: KnowledgeDeck) => void;
}) {
  const [wrong, setWrong] = useState<Awaited<ReturnType<typeof loadWrongCardResources>>>({ cards: [], warning: '', status: 'ready', validCardIds: null });
  const [loading, setLoading] = useState(true);
  const [storageWarning, setStorageWarning] = useState('');
  const [store, setStore] = useState<KnowledgeReviewStore>({ version: 1, reviews: {} });
  const [activeId, setActiveId] = useState('');
  const [flippedId, setFlippedId] = useState('');
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      const result = await loadWrongCardResources(url => fetch(url), { getItem: key => localStorage.getItem(key) });
      if (active) { setWrong(result); setLoading(false); }
    };
    void refresh();
    const onStorage = (event: StorageEvent) => { if (!event.key || event.key === 'jingwei-cmb-progress-v1') void refresh(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => { active = false; window.removeEventListener('storage', onStorage); window.removeEventListener('focus', refresh); };
  }, []);
  const cardsByDeck = useMemo(() => ({
    point: buildPointCards(points, meridians, placementDisplayMode),
    anatomy: buildAnatomyCards(parts ?? []),
    'exam-wrong': wrong.cards,
    'point-effects': buildPointEffectCards(points),
  }), [points, meridians, parts, placementDisplayMode, wrong.cards]);
  const availableIds = useMemo(() => new Set(Object.values(cardsByDeck).flat().filter(card => card.deck !== 'point').map(card => card.id)), [cardsByDeck]);
  const knownIds = useMemo(() => new Set([
    ...cardsByDeck.anatomy.map(card => card.id),
    ...buildPointEffectCards(cataloguePoints).map(card => card.id),
    ...(wrong.validCardIds ?? []),
  ]), [cardsByDeck.anatomy, cataloguePoints, wrong.validCardIds]);
  const unresolvedDecks = new Set<KnowledgeDeck>();
  if (parts === null) unresolvedDecks.add('anatomy');
  if (wrong.validCardIds === null) unresolvedDecks.add('exam-wrong');
  useEffect(() => {
    try {
      const saved = parseKnowledgeReviewStore(localStorage.getItem(KNOWLEDGE_REVIEW_KEY), [...knownIds]);
      setStore(current => ({ ...current, reviews: { ...saved.reviews, ...current.reviews } }));
    } catch { setStorageWarning('浏览器无法读取知识卡记录；仍可在当前会话学习。'); }
  }, [knownIds]);
  const cards = cardsByDeck[deck];
  const card = cards.find(item => item.id === activeId) ?? cards[0];
  const flipped = !!card && flippedId === card.id;
  const next = (rating?: Rating) => {
    if (!card) return;
    setFlippedId('');
    const ids = cards.map(item => item.id);
    if (rating) {
      const updated = rateKnowledgeCard(store, card.id, rating, availableIds);
      setStore(updated);
      try {
        const persisted = mergeKnowledgeReviewForPersistence(localStorage.getItem(KNOWLEDGE_REVIEW_KEY), updated, knownIds, unresolvedDecks);
        localStorage.setItem(KNOWLEDGE_REVIEW_KEY, JSON.stringify(persisted));
      }
      catch { setStorageWarning('浏览器未能保存知识卡记录；当前会话仍保留评分。'); }
      setActiveId(knowledgeReviewQueue(ids, updated.reviews)[0] ?? ids[(ids.indexOf(card.id) + 1) % ids.length]);
    } else setActiveId(ids[(ids.indexOf(card.id) + 1) % ids.length]);
  };
  return <section className="knowledge-cards-panel">
    <div className="knowledge-decks" role="group" aria-label="知识卡组">
      {knowledgeDeckOptions(cardsByDeck).map(option => <button key={option.id} aria-pressed={deck === option.id} onClick={() => { onDeck(option.id); setActiveId(''); setFlippedId(''); }}>{option.label} <span>{option.count}</span></button>)}
    </div>
    {deck === 'exam-wrong' && loading ? <p role="status">正在读取本机错题…</p> : null}
    {deck === 'exam-wrong' && wrong.warning && <p role="status" className="quiet-note">{wrong.warning}</p>}
    {storageWarning && <p role="status" className="quiet-note">{storageWarning}</p>}
    {!card ? (deck !== 'exam-wrong' || (!loading && wrong.status === 'ready')) && <p className="knowledge-empty">{deckEmptyCopy[deck]}</p> : deck === 'point' ? pointPanel : <div className="study-panel">
      <div className="section-kicker">主动回忆</div><h2>先想一想，再翻面。</h2>
      <div className="card-counter"><span>学习卡 {cards.indexOf(card) + 1} / {cards.length}</span><span>{store.reviews[card.id] ? `已练习 ${store.reviews[card.id].repetitions} 次` : '初次学习'}</span></div>
      <button className={`flip-card ${flipped ? 'flipped' : ''}`} aria-label={flipped ? '翻回题目' : '翻面查看答案'} aria-pressed={flipped}
        onClick={() => setFlippedId(flipped ? '' : card.id)}
        onKeyDown={event => { if (flipKeyAction(event.key, event.currentTarget === event.target)) { event.preventDefault(); setFlippedId(flipped ? '' : card.id); } }}>
        <KnowledgeCardFace face={visibleCardFace(card, flipped)} />
      </button>
      {flipped ? <><p className="rating-caption">这次记得怎么样？</p><div className="rating-buttons">
        <button onClick={() => next('again')}>不会<small>10 分钟后</small></button>
        <button onClick={() => next('hard')}>模糊<small>明天复习</small></button>
        <button onClick={() => next('good')}>记住了<small>逐步延长间隔</small></button>
      </div></> : <p className="quiet-note">翻面后，可标记掌握程度并安排复习。</p>}
      <div className="study-actions"><button className="text-button" onClick={() => next()}>下一张</button></div>
      {flipped && card.sourceLinks.map(source => <a key={`${source.url}-${source.section ?? ''}`} className="small-source" href={source.url} target="_blank" rel="noreferrer">答案依据：{source.title}</a>)}
    </div>}
  </section>;
}
