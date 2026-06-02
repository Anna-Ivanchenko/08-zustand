'use client';
import 'modern-normalize/modern-normalize.css';

import { useState } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebouncedCallback } from 'use-debounce';
import { Toaster } from 'react-hot-toast';

import css from './Notes.module.css';

import Pagination from '../../../../components/Pagination/Pagination';
import SearchBox from '../../../../components/SearchBox/SearchBox';
import Modal from '../../../../components/Modal/Modal';
import NoteForm from '../../../../components/NoteForm/NoteForm';
import NoteList from '../../../../components/NoteList/NoteList';

import { fetchNotes } from '../../../../lib/api';
import { NoteTag } from '@/types/note';

type Props = {
  tag?: NoteTag;
};

function App({ tag }: Props) {
  const [createNoteThis, setCreateNoteThis] = useState(false);
  const [input, setInput] = useState('');
  const [querySe, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const debouncedSetQuery = useDebouncedCallback((value: string) => {
    setQuery(value);
    setPage(1);
  }, 500);

  const { data, isLoading, isSuccess, isFetching } = useQuery({
    queryKey: ['notes', { page, querySe, tag }],
    queryFn: () =>
      fetchNotes({
        page,
        search: querySe || undefined,
        perPage: 12,
        tag,
      }),
    placeholderData: keepPreviousData,
  });

  const openModal = () => {
    setCreateNoteThis(true);
  };

  const closeModal = () => {
    setCreateNoteThis(false);
  };

  const totalPages = data?.totalPages ?? 0;
  const notes = data?.notes ?? [];

  const isEmpty = isSuccess && notes.length === 0;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          value={input}
          onChange={(val) => {
            setInput(val);
            debouncedSetQuery(val);
          }}
        />

        {isSuccess && totalPages > 1 && (
          <Pagination
            totalPages={totalPages}
            page={page}
            setPage={setPage}
          />
        )}

        <button
          className={css.button}
          onClick={openModal}
        >
          Create note +
        </button>
      </header>

      {isEmpty ? (
        <p>
          {tag || querySe
            ? 'No notes found for this filter'
            : 'No notes yet'}
        </p>
      ) : (
        !isLoading &&
        !isFetching &&
        isSuccess &&
        notes.length > 0 && (
          <NoteList notes={notes} />
        )
      )}

      <Toaster
        position="top-center"
        reverseOrder={false}
      />

      {createNoteThis && (
        <Modal onClose={closeModal}>
          <NoteForm onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}

export default App;