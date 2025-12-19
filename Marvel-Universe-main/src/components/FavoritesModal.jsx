import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { IoClose, IoArrowBack } from 'react-icons/io5';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const FavoritesModal = ({ isOpen, onClose }) => {
  const { favorites, removeFavorite, updateTheories, updateNotes } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('favorites'); // 'favorites' or 'notes'
  const [editingFilmId, setEditingFilmId] = useState(null);
  const [editingType, setEditingType] = useState(null); // 'theories' or 'notes'
  const [editText, setEditText] = useState('');
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  useGSAP(() => {
    if (isOpen && modalRef.current) {
      gsap.from(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, { scope: modalRef, dependencies: [isOpen] });

  useGSAP(() => {
    if (isOpen && contentRef.current) {
      gsap.from(contentRef.current.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        stagger: 0.1,
        ease: 'power2.out',
        delay: 0.1,
      });
    }
  }, { scope: contentRef, dependencies: [isOpen, favorites] });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setEditingFilmId(null);
      setEditingType(null);
      setEditText('');
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleStartEdit = (film, type) => {
    setEditingFilmId(film.id);
    setEditingType(type);
    setEditText(film[type] || '');
  };

  const handleSaveEdit = (filmId) => {
    if (editingType === 'theories') {
      updateTheories(filmId, editText);
    } else if (editingType === 'notes') {
      updateNotes(filmId, editText);
    }
    setEditingFilmId(null);
    setEditingType(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingFilmId(null);
    setEditingType(null);
    setEditText('');
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-10 backdrop-blur-sm md:py-14"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-6xl overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/95 to-violet-300/10 shadow-2xl backdrop-blur-md"
        style={{ maxHeight: '82vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/20 bg-black/70 p-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="rounded-full p-2 text-blue-50 transition-colors hover:bg-white/10"
              title="Go back"
            >
              <IoArrowBack className="text-2xl" />
            </button>
            <div>
              <h2 className="special-font font-zentry text-3xl font-black uppercase text-blue-50 md:text-4xl">
                <b>My Favorites</b>
              </h2>
              <p className="mt-1 font-circular-web text-sm text-blue-50/70">
                {favorites.length} {favorites.length === 1 ? 'film' : 'films'} saved
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-blue-50 transition-colors hover:bg-white/20"
            title="Close"
          >
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Tabs */}
        <div className="sticky top-[76px] z-10 flex border-b border-white/10 bg-black/60 backdrop-blur">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-6 py-4 font-general text-sm uppercase transition-colors ${
              activeTab === 'favorites'
                ? 'border-b-2 border-violet-300 text-violet-300'
                : 'text-blue-50/60 hover:text-blue-50'
            }`}
          >
            Favorites
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 px-6 py-4 font-general text-sm uppercase transition-colors ${
              activeTab === 'notes'
                ? 'border-b-2 border-violet-300 text-violet-300'
                : 'text-blue-50/60 hover:text-blue-50'
            }`}
          >
            Notes & Theories
          </button>
        </div>

        {/* Content */}
        <div ref={contentRef} className="max-h-[calc(82vh-160px)] overflow-y-auto p-6">
          {!isAuthenticated ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <AiOutlineHeart className="mb-4 text-6xl text-blue-50/30" />
              <p className="font-circular-web text-lg text-blue-50/70">
                Please login to view your favorites
              </p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <AiOutlineHeart className="mb-4 text-6xl text-blue-50/30" />
              <p className="font-circular-web text-lg text-blue-50/70">
                No favorites yet. Start adding films to your favorites!
              </p>
              <p className="mt-2 text-sm text-blue-50/60">
                Tip: click the heart on any upcoming film to save it here.
              </p>
            </div>
          ) : activeTab === 'favorites' ? (
            <div className="flex justify-center">
              <div className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {favorites.map((film) => (
                <div
                  key={film.id}
                  className="group relative overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/90 to-violet-300/10 transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_30px_rgba(87,36,255,0.3)]"
                >
                  {/* Poster */}
                  <div className="relative h-64 w-full overflow-hidden">
                    <img
                      src={film.poster_url}
                      alt={film.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Marvel';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    
                    {/* Remove Favorite Button */}
                    <button
                      onClick={() => removeFavorite(film.id)}
                      className="absolute top-2 right-2 rounded-full bg-red-500/90 p-2 backdrop-blur-sm transition-all hover:bg-red-500"
                      title="Remove from favorites"
                    >
                      <AiFillHeart className="text-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="special-font mb-2 font-zentry text-xl font-black uppercase text-blue-50">
                      <b>{film.title}</b>
                    </h3>
                    <p className="mb-2 font-circular-web text-xs text-blue-50/80">
                      {formatDate(film.release_date)}
                    </p>
                    <p className="line-clamp-2 font-circular-web text-xs text-blue-50/70">
                      {film.overview}
                    </p>
                  </div>
                </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl space-y-6">
                {favorites.map((film) => (
                <div
                  key={film.id}
                  className="rounded-lg border border-white/20 bg-black/50 p-6"
                >
                  <div className="mb-4 flex items-start gap-4">
                    <img
                      src={film.poster_url}
                      alt={film.title}
                      className="h-32 w-24 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Marvel';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="special-font mb-2 font-zentry text-2xl font-black uppercase text-blue-50">
                        <b>{film.title}</b>
                      </h3>
                      <p className="font-circular-web text-sm text-blue-50/70">
                        {formatDate(film.release_date)}
                      </p>
                    </div>
                  </div>

                  {/* Theories Section */}
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <label className="font-general text-sm uppercase text-violet-300">
                        Theories
                      </label>
                      {editingFilmId === film.id && editingType === 'theories' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(film.id)}
                            className="rounded px-3 py-1 font-circular-web text-xs text-violet-300 hover:bg-violet-300/20"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(film, 'theories')}
                          className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                        >
                          {film.theories ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                    {editingFilmId === film.id && editingType === 'theories' ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Share your theories about this film..."
                        className="w-full rounded-lg border border-white/20 bg-black/50 p-3 font-circular-web text-sm text-blue-50 placeholder-blue-50/40 focus:border-violet-300 focus:outline-none"
                        rows={4}
                      />
                    ) : (
                      <div className="min-h-[80px] rounded-lg border border-white/10 bg-black/30 p-3">
                        {film.theories ? (
                          <p className="font-circular-web text-sm text-blue-50/80 whitespace-pre-wrap">
                            {film.theories}
                          </p>
                        ) : (
                          <p className="font-circular-web text-sm text-blue-50/40 italic">
                            No theories added yet. Click "Add" to share your thoughts!
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="font-general text-sm uppercase text-violet-300">
                        Notes
                      </label>
                      {editingFilmId === film.id && editingType === 'notes' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(film.id)}
                            className="rounded px-3 py-1 font-circular-web text-xs text-violet-300 hover:bg-violet-300/20"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEdit(film, 'notes')}
                          className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                        >
                          {film.notes ? 'Edit' : 'Add'}
                        </button>
                      )}
                    </div>
                    {editingFilmId === film.id && editingType === 'notes' ? (
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        placeholder="Add your personal notes about this film..."
                        className="w-full rounded-lg border border-white/20 bg-black/50 p-3 font-circular-web text-sm text-blue-50 placeholder-blue-50/40 focus:border-violet-300 focus:outline-none"
                        rows={4}
                      />
                    ) : (
                      <div className="min-h-[80px] rounded-lg border border-white/10 bg-black/30 p-3">
                        {film.notes ? (
                          <p className="font-circular-web text-sm text-blue-50/80 whitespace-pre-wrap">
                            {film.notes}
                          </p>
                        ) : (
                          <p className="font-circular-web text-sm text-blue-50/40 italic">
                            No notes added yet. Click "Add" to jot down your thoughts!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating close button for easy access */}
      <button
        onClick={onClose}
        className="absolute right-6 top-6 rounded-full bg-white/15 p-3 text-blue-50 shadow-lg backdrop-blur hover:bg-white/25"
        title="Close favorites"
      >
        <IoClose className="text-2xl" />
      </button>
    </div>,
    document.body
  );
};

export default FavoritesModal;

