import { fsrs, createEmptyCard, Rating } from "ts-fsrs";
import { cardKey } from "./mapping";
const scheduler = fsrs({ request_retention: 0.9, enable_fuzz: false });
export const gradeMap = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy];
export function reviewCard(card, previous, grade, now = new Date()) {
  const old = previous?.card
    ? {
        ...previous.card,
        due: new Date(previous.card.due),
        last_review: previous.card.last_review
          ? new Date(previous.card.last_review)
          : undefined,
      }
    : createEmptyCard(now);
  const result = scheduler.next(old, now, gradeMap[grade]);
  return {
    key: cardKey(card),
    card: result.card,
    log: result.log,
    subject: card.subject,
    updatedAt: now.toISOString(),
    correct: grade > 0,
    question: card.q.slice(0, 160),
  };
}
export function isDue(record, now = Date.now()) {
  return !!record && new Date(record.card.due).getTime() <= now;
}
