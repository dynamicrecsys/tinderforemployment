import { eq, and, desc, lt, sql } from 'drizzle-orm';
import { db } from '../../config/db';
import { messages, matches } from '../../db/schema';
import { CHAT_PAGE_SIZE } from '@tfe/shared';

export async function getMessages(matchId: string, userId: string, before?: string) {
  // Verify user is part of this match
  const [match] = await db.select().from(matches).where(eq(matches.id, matchId));
  if (!match || (match.workerId !== userId && match.employerId !== userId)) {
    throw new Error('Unauthorized');
  }

  const conditions = [eq(messages.matchId, matchId)];
  if (before) {
    conditions.push(lt(messages.createdAt, new Date(before)));
  }

  return db.select().from(messages)
    .where(and(...conditions))
    .orderBy(desc(messages.createdAt))
    .limit(CHAT_PAGE_SIZE);
}

export async function saveMessage(matchId: string, senderId: string, body: string) {
  const [msg] = await db.insert(messages).values({
    matchId,
    senderId,
    body,
  }).returning();
  return msg;
}

export async function markMessagesRead(matchId: string, readerId: string) {
  await db.update(messages).set({ isRead: true })
    .where(and(
      eq(messages.matchId, matchId),
      sql`${messages.senderId} != ${readerId}`,
      eq(messages.isRead, false),
    ));
}
