import { useDatabase } from '@/composables/database';
import { useSessionVault } from '@/composables/session-vault';
import { TastingNote } from '@/models';

const { getHandle } = useDatabase();
const { getSession } = useSessionVault();

const getAll = async (includeDeleted = false): Promise<Array<TastingNote>> => {
  const notes: Array<TastingNote> = [];
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      const predicate = includeDeleted
        ? 'userId = ? ORDER BY name'
        : "coalesce(syncStatus, '') != 'DELETE' AND userId = ? ORDER BY brand, name";
      await handle.transaction((tx) =>
        tx.executeSql(
          `SELECT id, name, brand, notes, rating, teaCategoryId, syncStatus FROM TastingNotes WHERE ${predicate}`,
          [session.user.id],
          // tslint:disable-next-line:variable-name
          (_t: any, r: any) => {
            for (let i = 0; i < r.rows.length; i++) {
              notes.push(r.rows.item(i));
            }
          }
        )
      );
    }
  }
  return notes;
};

const reset = async (): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          "UPDATE TastingNotes SET syncStatus = null WHERE syncStatus = 'UPDATE' AND userId = ?",
          [session.user.id],
          () => {
            null;
          }
        );
        tx.executeSql(
          "DELETE FROM TastingNotes WHERE syncStatus in ('DELETE', 'INSERT') AND userId = ?",
          [session.user.id],
          () => {
            null;
          }
        );
      });
    }
  }
};

const remove = async (note: TastingNote): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          "UPDATE TastingNotes SET syncStatus = 'DELETE' WHERE userId = ? AND id = ?",
          [session.user.id, note.id],
          () => {
            null;
          }
        );
      });
    }
  }
};

const params = (length: number): string => {
  let str = '';
  for (let i = 0; i < length; i++) {
    str += `${i ? ', ' : ''}?`;
  }
  return str;
};

const trim = async (idsToKeep: Array<number>): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM TastingNotes WHERE userId = ? AND id not in (${params(idsToKeep.length)})`,
          [session.user.id, ...idsToKeep],
          () => {
            null;
          }
        );
      });
    }
  }
};

const add = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          'SELECT COALESCE(MAX(id), 0) + 1 AS newId FROM TastingNotes',
          [],
          // tslint:disable-next-line:variable-name
          (_t: any, r: any) => {
            note.id = r.rows.item(0).newId;
            tx.executeSql(
              'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId, syncStatus)' +
                " VALUES (?, ?, ?, ?, ?, ?, ?, 'INSERT')",
              [note.id, note.name, note.brand, note.notes, note.rating, note.teaCategoryId, session.user.id],
              () => {
                null;
              }
            );
          }
        );
      });
    }
    return note;
  }
};

const update = async (note: TastingNote): Promise<TastingNote | undefined> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          'UPDATE TastingNotes SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?,' +
            " syncStatus = CASE syncStatus WHEN 'INSERT' THEN 'INSERT' else 'UPDATE' end" +
            ' WHERE userId = ? AND id = ?',
          [note.name, note.brand, note.notes, note.rating, note.teaCategoryId, session.user.id, note.id],
          () => {
            null;
          }
        );
      });
    }
    return note;
  }
};

const save = async (note: TastingNote): Promise<TastingNote> => {
  return (await (note.id ? update(note) : add(note))) || note;
};

const upsert = async (note: TastingNote): Promise<void> => {
  const handle = await getHandle();
  if (handle) {
    const session = await getSession();
    if (session) {
      await handle.transaction((tx) => {
        tx.executeSql(
          'INSERT INTO TastingNotes (id, name, brand, notes, rating, teaCategoryId, userId) VALUES (?, ?, ?, ?, ?, ?, ?)' +
            ' ON CONFLICT(id) DO' +
            ' UPDATE SET name = ?, brand = ?, notes = ?, rating = ?, teaCategoryId = ?' +
            ' WHERE syncStatus is NULL AND userId = ? AND id = ?',
          [
            note.id,
            note.name,
            note.brand,
            note.notes,
            note.rating,
            note.teaCategoryId,
            session.user.id,
            note.name,
            note.brand,
            note.notes,
            note.rating,
            note.teaCategoryId,
            session.user.id,
            note.id,
          ],
          () => {
            null;
          }
        );
      });
    }
  }
};

export const useTastingNotesDatabase = () => ({
  getAll,
  save,
  remove,

  reset,
  trim,
  upsert,
});
