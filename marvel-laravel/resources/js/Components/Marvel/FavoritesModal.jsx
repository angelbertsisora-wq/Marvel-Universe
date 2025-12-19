import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFavorites } from '../../context/FavoritesContext';
import { useAuth } from '../../context/AuthContext';
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
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { filmId, type }
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const confirmModalRef = useRef(null);

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

  useGSAP(() => {
    if (deleteConfirm && confirmModalRef.current) {
      gsap.from(confirmModalRef.current, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        ease: 'power2.out',
      });
    }
  }, { scope: confirmModalRef, dependencies: [deleteConfirm] });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setEditingFilmId(null);
      setEditingType(null);
      setEditText('');
      setIsSaving(false);
      setDeleteConfirm(null);
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

  // Validate user input
  const validateInput = (text, type) => {
    if (!text || typeof text !== 'string') {
      return { valid: false, error: `${type} cannot be empty` };
    }
    
    // Trim whitespace
    const trimmed = text.trim();
    
    if (trimmed.length === 0) {
      return { valid: false, error: `${type} cannot be empty` };
    }
    
    // Maximum length validation
    const MAX_LENGTH = 5000;
    if (trimmed.length > MAX_LENGTH) {
      return { valid: false, error: `${type} cannot exceed ${MAX_LENGTH} characters` };
    }
    
    // Check for potentially malicious content (basic XSS prevention)
    const dangerousPatterns = /<script|javascript:|onerror=|onload=/i;
    if (dangerousPatterns.test(trimmed)) {
      return { valid: false, error: 'Invalid characters detected. Please remove any script tags or event handlers.' };
    }
    
    return { valid: true, cleaned: trimmed };
  };

  const handleSaveEdit = async (filmId) => {
    const validation = validateInput(editText, editingType === 'theories' ? 'Theory' : 'Note');
    
    if (!validation.valid) {
      // Show error message to user (you could add a toast/alert here)
      alert(validation.error);
      return;
    }
    
    setIsSaving(true);
    try {
      if (editingType === 'theories') {
        await updateTheories(filmId, validation.cleaned);
      } else if (editingType === 'notes') {
        await updateNotes(filmId, validation.cleaned);
      }
      // Only reset editing state after successful save
      setEditingFilmId(null);
      setEditingType(null);
      setEditText('');
    } catch (error) {
      console.error('Error saving:', error);
      alert(`Failed to save ${editingType === 'theories' ? 'theory' : 'note'}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingFilmId(null);
    setEditingType(null);
    setEditText('');
  };

  const handleDeleteClick = (filmId, type) => {
    setDeleteConfirm({ filmId, type });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    const { filmId, type } = deleteConfirm;
    setIsSaving(true);
    setDeleteConfirm(null);
    
    try {
      if (type === 'theories') {
        await updateTheories(filmId, '');
      } else if (type === 'notes') {
        await updateNotes(filmId, '');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert(`Failed to delete ${type === 'theories' ? 'theory' : 'note'}. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  if (!isOpen) {
    return deleteConfirm ? createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4 backdrop-blur-sm"
        onClick={handleDeleteCancel}
      >
        <div
          ref={confirmModalRef}
          className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/95 to-violet-300/10 shadow-2xl backdrop-blur-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="border-b border-white/20 bg-black/70 p-6">
            <h3 className="special-font font-zentry text-2xl font-black uppercase text-blue-50">
              <b>Confirm Delete</b>
            </h3>
          </div>
          <div className="p-6">
            <p className="font-circular-web text-base text-blue-50/90 mb-6">
              Are you sure you want to delete this {deleteConfirm.type === 'theories' ? 'theory' : 'note'}? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={isSaving}
                className="rounded px-4 py-2 font-circular-web text-sm text-blue-50/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isSaving}
                className="rounded px-4 py-2 font-circular-web text-sm text-white bg-red-500/90 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    ) : null;
  }

  return (
    <>
      {createPortal(
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
                            disabled={isSaving}
                            className="rounded px-3 py-1 font-circular-web text-xs text-violet-300 hover:bg-violet-300/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isSaving ? (
                              <>
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(film, 'theories')}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                          >
                            {film.theories ? 'Edit' : 'Add'}
                          </button>
                          {film.theories && (
                            <button
                              onClick={() => handleDeleteClick(film.id, 'theories')}
                              disabled={isSaving}
                              className="rounded px-3 py-1 font-circular-web text-xs text-red-400 hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete theory"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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
                            No theories added yet. Click \"Add\" to share your thoughts!
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
                            disabled={isSaving}
                            className="rounded px-3 py-1 font-circular-web text-xs text-violet-300 hover:bg-violet-300/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                          >
                            {isSaving ? (
                              <>
                                <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleStartEdit(film, 'notes')}
                            className="rounded px-3 py-1 font-circular-web text-xs text-blue-50/60 hover:bg-white/10"
                          >
                            {film.notes ? 'Edit' : 'Add'}
                          </button>
                          {film.notes && (
                            <button
                              onClick={() => handleDeleteClick(film.id, 'notes')}
                              disabled={isSaving}
                              className="rounded px-3 py-1 font-circular-web text-xs text-red-400 hover:bg-red-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete note"
                            >
                              Delete
                            </button>
                          )}
                        </div>
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
                            No notes added yet. Click \"Add\" to jot down your thoughts!
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
      )}

      {/* Custom Confirmation Modal */}
      {deleteConfirm && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 px-4 backdrop-blur-sm"
          onClick={handleDeleteCancel}
        >
          <div
            ref={confirmModalRef}
            className="relative w-full max-w-md overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/95 to-violet-300/10 shadow-2xl backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="border-b border-white/20 bg-black/70 p-6">
              <h3 className="special-font font-zentry text-2xl font-black uppercase text-blue-50">
                <b>Confirm Delete</b>
              </h3>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="font-circular-web text-base text-blue-50/90 mb-6">
                Are you sure you want to delete this {deleteConfirm.type === 'theories' ? 'theory' : 'note'}? This action cannot be undone.
              </p>

              {/* Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isSaving}
                  className="rounded px-4 py-2 font-circular-web text-sm text-blue-50/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isSaving}
                  className="rounded px-4 py-2 font-circular-web text-sm text-white bg-red-500/90 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default FavoritesModal;
