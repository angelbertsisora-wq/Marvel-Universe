import React, { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';
import AnimatedTitle from './AnimatedTitle';

gsap.registerPlugin(ScrollTrigger);

// Lazy loading video component
const LazyVideo = ({ src, poster, className, ...props }) => {
  const videoRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '200px' } // Start loading earlier for hero videos
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (shouldLoad && videoRef.current && src) {
      videoRef.current.src = src;
      videoRef.current.load();
      videoRef.current.play().catch(() => {
        // Ignore autoplay errors
      });
    }
  }, [shouldLoad, src]);

  return (
    <div ref={containerRef} className={`absolute inset-0 ${className || ''}`}>
      {shouldLoad ? (
        <video
          ref={videoRef}
          poster={poster}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          className="pointer-events-none h-full w-full object-cover"
          {...props}
        />
      ) : (
        poster && (
          <img
            src={poster}
            alt=""
            className="pointer-events-none h-full w-full object-cover"
            loading="lazy"
          />
        )
      )}
    </div>
  );
};

const formatFullDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Live countdown that updates every second
const LiveCountdown = ({ releaseDate, isCompact = false }) => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculate = () => {
      const now = Date.now();
      const target = new Date(releaseDate).getTime();
      const diff = target - now;

      if (Number.isNaN(target) || diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining({ days, hours, minutes, seconds });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [releaseDate]);

  if (isCompact) {
    if (timeRemaining.days > 0) {
      return (
        <span className="font-robert-medium text-xs uppercase text-black">
          {timeRemaining.days} {timeRemaining.days === 1 ? 'day' : 'days'}
        </span>
      );
    }
    if (timeRemaining.hours > 0) {
      return (
        <span className="font-robert-medium text-xs uppercase text-black">
          {timeRemaining.hours}h {timeRemaining.minutes}m
        </span>
      );
    }
    if (timeRemaining.minutes > 0) {
      return (
        <span className="font-robert-medium text-xs uppercase text-black">
          {timeRemaining.minutes}m {timeRemaining.seconds}s
        </span>
      );
    }
    return (
      <span className="font-robert-medium text-xs uppercase text-black">
        {timeRemaining.seconds}s
      </span>
    );
  }

  const block = (value, label) => (
    <div className="text-center">
      <p className="special-font font-zentry text-4xl font-black text-violet-300 md:text-5xl">
        <b>{value}</b>
      </p>
      <p className="font-circular-web text-xs uppercase text-blue-50/70">{label}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 md:gap-2">
      <div className="flex items-center gap-4">
        {block(String(timeRemaining.days).padStart(2, '0'), timeRemaining.days === 1 ? 'Day' : 'Days')}
        <span className="text-2xl text-violet-300/50">:</span>
        {block(String(timeRemaining.hours).padStart(2, '0'), 'Hours')}
        <span className="text-2xl text-violet-300/50">:</span>
        {block(String(timeRemaining.minutes).padStart(2, '0'), 'Minutes')}
        <span className="text-2xl text-violet-300/50">:</span>
        {block(String(timeRemaining.seconds).padStart(2, '0'), 'Seconds')}
      </div>
    </div>
  );
};

// Mock data - will be replaced with API fetch later
const mockFilmsData = {
  "days_until": 233,
  "following_production": {
    "days_until": 374,
    "id": 1003596,
    "overview": "The Avengers, Wakandans, Fantastic Four, Thunderbolts, and X-Men all fight against Doctor Doom. Plot TBA.",
    "poster_url": "https://image.tmdb.org/t/p/w500/6eB2oh1SplddsZYCdayrIdrIGLd.jpg",
    "release_date": "2026-12-17",
    "title": "Avengers: Doomsday",
    "type": "Movie"
  },
  "id": 969681,
  "overview": "The fourth installment in the Spider-Man franchise and part of Phase Six of the Marvel Cinematic Universe (MCU). Plot TBA.",
  "poster_url": "https://image.tmdb.org/t/p/w500/9JCQtDCSpPR2ld55yNlEg1VwcQo.jpg",
  "release_date": "2026-07-29",
  "title": "Spider-Man: Brand New Day",
  "type": "Movie",
  // Video stored on Cloudinary
  "video_url": "https://res.cloudinary.com/djef7fggp/video/upload/v1765630197/SPIDER-MAN__BRAND_NEW_DAY_1080p_eiys40.mp4"
};

// Tilt effect component similar to BentoTilt
const FilmCardTilt = ({ children, className = '', onHoverChange }) => {
  const [transformStyle, setTransformStyle] = useState('');
  const itemRef = useRef();

  const handleMouseMove = (e) => {
    if (!itemRef.current) return;

    const { left, top, width, height } = itemRef.current.getBoundingClientRect();
    const relativeX = (e.clientX - left) / width;
    const relativeY = (e.clientY - top) / height;

    const tiltX = (relativeY - 0.5) * 20;
    const tiltY = (relativeX - 0.5) * -20;

    const newTransform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    setTransformStyle(newTransform);
    if (onHoverChange) onHoverChange(true);
  };

  const handleMouseLeave = () => {
    setTransformStyle('');
    if (onHoverChange) onHoverChange(false);
  };

  return (
    <div
      className={className}
      ref={itemRef}
      onMouseEnter={() => onHoverChange && onHoverChange(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform: transformStyle, transition: 'transform 0.1s ease-out' }}
    >
      {children}
    </div>
  );
};

// Film Card Component
const FilmCard = ({ film, isNext, onSelect }) => {
  const cardRef = useRef();
  const videoRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useGSAP(() => {
    if (cardRef.current) {
      gsap.from(cardRef.current, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: cardRef });

  // Lazy load video when card enters viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoadVideo(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '100px' } // Start loading 100px before entering viewport
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Play/pause trailer when hovering the card
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !shouldLoadVideo) return;

    if (isHovered) {
      // Load video source if not already loaded
      if (!videoEl.src && film.video_url) {
        videoEl.src = film.video_url;
        videoEl.load();
      }
      videoEl
        .play()
        .catch(() => {
          // Ignore autoplay errors; browsers may block if conditions aren't met
        });
    } else {
      videoEl.pause();
      videoEl.currentTime = 0;
    }
  }, [isHovered, shouldLoadVideo, film.video_url]);

  return (
    <FilmCardTilt
      className="relative h-full w-full overflow-hidden rounded-lg border border-white/20 bg-gradient-to-br from-black/90 to-violet-300/10 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:shadow-[0_0_30px_rgba(87,36,255,0.3)]"
      onHoverChange={setIsHovered}
    >
      <div
        ref={cardRef}
        className="relative h-full w-full cursor-pointer"
        onClick={() => onSelect?.(film)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect?.(film);
          }
        }}
      >
        {/* Poster Image */}
        <div className="relative h-[60%] w-full overflow-hidden">
          {film.video_url && shouldLoadVideo && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              poster={film.poster_url}
              className={`pointer-events-none absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-500 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            />
          )}

          <img
            src={film.poster_url}
            alt={film.title}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Marvel';
            }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          
          {/* Days Until Badge - live */}
          <div className="absolute top-4 right-4 z-30 rounded-full bg-violet-300/90 px-4 py-2 backdrop-blur-sm">
            <LiveCountdown releaseDate={film.release_date} isCompact />
          </div>

          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isAuthenticated) {
                setShowAuthPrompt(true);
                setTimeout(() => setShowAuthPrompt(false), 2000);
                return;
              }
              try {
                toggleFavorite(film);
              } catch (error) {
                console.error('Error toggling favorite:', error);
              }
            }}
            className={`absolute bottom-4 right-4 z-30 flex items-center justify-center rounded-full p-3 backdrop-blur-sm transition-all duration-300 ${
              isFavorite(film.id)
                ? 'bg-red-500/90 text-white shadow-lg shadow-red-500/50'
                : 'bg-black/60 text-blue-50 hover:bg-black/80'
            }`}
            title={isAuthenticated ? (isFavorite(film.id) ? 'Remove from favorites' : 'Add to favorites') : 'Login to add favorites'}
          >
            {isFavorite(film.id) ? (
              <AiFillHeart className="text-xl" />
            ) : (
              <AiOutlineHeart className="text-xl" />
            )}
          </button>

          {/* Auth Prompt */}
          {showAuthPrompt && (
            <div className="absolute bottom-20 right-4 z-30 animate-fadeIn rounded-lg bg-violet-300/95 px-4 py-2 backdrop-blur-sm">
              <p className="font-robert-medium text-xs text-black">
                Please login to add favorites
              </p>
            </div>
          )}

          {/* Next Badge */}
          {isNext && (
            <div className="absolute top-4 left-4 z-30 rounded-full bg-yellow-300/90 px-4 py-2 backdrop-blur-sm">
              <span className="font-robert-medium text-xs uppercase text-black">
                Next
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex h-[40%] flex-col justify-between p-6">
          <div>
            <h3 className="special-font mb-2 font-zentry text-2xl font-black uppercase text-blue-50 md:text-3xl">
              <b>{film.title}</b>
            </h3>
            <p className="mb-3 font-circular-web text-xs text-blue-50/80 md:text-sm">
              {formatFullDate(film.release_date)}
            </p>
            <p className="line-clamp-3 font-circular-web text-xs text-blue-50/70 md:text-sm">
              {film.overview}
            </p>
          </div>

          {/* Hover Effect Indicator */}
          <div className={`mt-4 flex items-center gap-2 transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-violet-300 to-transparent" />
            <span className="font-general text-xs uppercase text-violet-300">
              Learn More
            </span>
            <div className="h-[2px] w-8 bg-gradient-to-l from-violet-300 to-transparent" />
          </div>
        </div>

        {/* Shine Effect on Hover */}
        <div
          className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            transform: isHovered ? 'translateX(100%)' : 'translateX(-100%)',
            transition: 'transform 0.6s ease-in-out, opacity 0.3s',
          }}
        />
      </div>
    </FilmCardTilt>
  );
};

const FilmDetailsModal = ({ film, isOpen, onClose }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentInput, setCommentInput] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);

  useEffect(() => {
    if (!film) return;
    try {
      const stored = JSON.parse(localStorage.getItem(`film_comments_${film.id}`) || '[]');
      setComments(Array.isArray(stored) ? stored : []);
    } catch {
      setComments([]);
    }
    setCommentInput('');
    setEditingId(null);
    setFeedback('');
  }, [film]);

  const persistComments = (next) => {
    setComments(next);
    if (film) {
      localStorage.setItem(`film_comments_${film.id}`, JSON.stringify(next));
    }
  };

  const handleSubmit = () => {
    if (!isAuthenticated) {
      setFeedback('Please log in to share your theory.');
      return;
    }

    const text = commentInput.trim();
    if (!text) return;

    if (editingId) {
      const updated = comments.map((c) =>
        c.id === editingId ? { ...c, text, updatedAt: new Date().toISOString() } : c
      );
      persistComments(updated);
    } else {
      const newComment = {
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        userId: user?.id,
        userName: user?.name || user?.email || 'Fan',
        text,
        createdAt: new Date().toISOString(),
      };
      persistComments([...comments, newComment]);
    }

    setCommentInput('');
    setEditingId(null);
    setFeedback('');
  };

  const handleEdit = (id) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;
    setCommentInput(target.text);
    setEditingId(id);
    setFeedback('');
  };

  const handleDelete = (id) => {
    const target = comments.find((c) => c.id === id);
    if (!target) return;
    if (!isAuthenticated || target.userId !== user?.id) {
      setFeedback('You can only delete your own theory.');
      return;
    }
    if (confirmingDeleteId !== id) {
      setConfirmingDeleteId(id);
      setFeedback('Click delete again to confirm.');
      return;
    }
    const filtered = comments.filter((c) => c.id !== id);
    persistComments(filtered);
    if (editingId === id) {
      setEditingId(null);
      setCommentInput('');
    }
    setConfirmingDeleteId(null);
    setFeedback('');
  };

  if (!isOpen || !film) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-[#0a0a0f] shadow-2xl">
        {/* Sticky header with close */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-black/80 px-6 py-4 backdrop-blur">
          <div>
            <p className="font-general text-[11px] uppercase text-blue-50/60">Film details</p>
            <h3 className="special-font text-2xl font-black uppercase text-blue-50 md:text-3xl">
              <b>{film.title}</b>
            </h3>
          </div>
        <button
          onClick={onClose}
          className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-blue-50 transition hover:bg-white/20"
        >
          Close
        </button>
        </div>

        {/* Scrollable content */}
        <div className="grid max-h-[calc(90vh-72px)] gap-6 overflow-y-auto p-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-white/15">
              <img
                src={film.poster_url}
                alt={film.title}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.target.src =
                    'https://via.placeholder.com/500x750/1a1a1a/ffffff?text=Marvel';
                }}
              />
            </div>
            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <p className="font-general text-xs uppercase text-blue-50/70">Countdown</p>
              <div className="mt-2">
                <LiveCountdown releaseDate={film.release_date} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-general text-xs uppercase text-blue-50/70">Marvel Studios</p>
              <h3 className="special-font text-3xl font-black uppercase text-blue-50 md:text-4xl">
                <b>{film.title}</b>
              </h3>
              <p className="mt-2 font-circular-web text-sm text-blue-50/70">
                {formatFullDate(film.release_date)}
              </p>
            </div>
            <p className="font-circular-web text-sm leading-relaxed text-blue-50/80">
              {film.overview}
            </p>

            <div className="rounded-xl border border-white/15 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <p className="font-general text-sm uppercase text-blue-50/80">
                  Fan Theories ({comments.length})
                </p>
                {editingId && (
                  <span className="text-xs text-violet-200">
                    Editing your theory...
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-col gap-3">
                {!isAuthenticated && (
                  <p className="rounded-lg border border-white/10 bg-red-500/10 px-3 py-2 text-xs text-red-200">
                    Login required to add or manage theories.
                  </p>
                )}
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder={
                    isAuthenticated
                      ? 'Share your theory...'
                      : 'Log in to share your theory'
                  }
                  className="min-h-[96px] w-full rounded-lg border border-white/15 bg-black/40 p-3 text-sm text-blue-50 placeholder:text-blue-50/40 focus:border-violet-300 focus:outline-none"
                  disabled={!isAuthenticated}
                />
                <div className="flex items-center justify-between">
                    {feedback && (
                    <p className="text-xs text-yellow-200">{feedback}</p>
                  )}
                  <div className="flex gap-2">
                    {editingId && (
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setCommentInput('');
                          setFeedback('');
                        }}
                        className="rounded-lg px-3 py-2 text-xs text-blue-50 transition hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handleSubmit}
                      disabled={!isAuthenticated}
                      className="rounded-lg bg-violet-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-violet-300 disabled:cursor-not-allowed disabled:bg-violet-400/50"
                    >
                      {editingId ? 'Save changes' : 'Add theory'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {comments.length === 0 && (
                  <p className="text-sm text-blue-50/60">
                    No theories yet. Be the first to share!
                  </p>
                )}
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-white/10 bg-black/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-50">
                          {comment.userName}
                        </p>
                        <p className="text-[11px] text-blue-50/60">
                          {formatFullDate(comment.createdAt || new Date())}
                        </p>
                      </div>
                      {isAuthenticated && comment.userId === user?.id && (
                        <div className="flex items-center gap-2 text-xs">
                          <button
                            onClick={() => handleEdit(comment.id)}
                            className="rounded bg-white/10 px-2 py-1 text-blue-50 transition hover:bg-white/20"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(comment.id)}
                            className={`rounded px-2 py-1 text-white transition ${
                              confirmingDeleteId === comment.id
                                ? 'bg-red-700 hover:bg-red-700'
                                : 'bg-red-500/70 hover:bg-red-500'
                            }`}
                          >
                            {confirmingDeleteId === comment.id ? 'Confirm' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-blue-50/80">{comment.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const UpcomingFilms = () => {
  const sectionRef = useRef();
  const titleRef = useRef();
  const featureFrameRef = useRef(null);
  const [selectedFilm, setSelectedFilm] = useState(null);

  useGSAP(() => {
    if (titleRef.current) {
      gsap.from(titleRef.current.children, {
        opacity: 0,
        y: 30,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: titleRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    }
  }, { scope: sectionRef });

  const resetTilt = () => {
    const el = featureFrameRef.current;
    if (!el) return;

    gsap.to(el, {
      duration: 0.12,
      rotateX: 0,
      rotateY: 0,
      ease: 'power1.inOut',
    });
  };

  const handleFeatureMove = (e) => {
    const el = featureFrameRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    gsap.to(el, {
      duration: 0.12,
      rotateX,
      rotateY,
      transformPerspective: 800,
      ease: 'power1.inOut',
    });
  };

  // Prepare films array (current next film + following production)
  const films = [
    { ...mockFilmsData, isNext: true },
    { ...mockFilmsData.following_production, isNext: false },
  ];

  return (
    <section
      ref={sectionRef}
      id="upcoming-films"
      className="relative min-h-screen w-screen bg-black py-20 text-blue-50"
    >
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-violet-300 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-blue-300 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto px-5 md:px-10">
        {/* Spotlight animation header */}
        <div className="mb-16 flex flex-col items-center gap-10 md:flex-row md:gap-14">
          <div className="flex-1">
            <AnimatedTitle
              title="<b>Next in the</b><br />Multiverse"
              containerClass="pointer-events-none mix-blend-difference md:items-start"
            />
            <p className="mt-6 max-w-xl text-center font-circular-web text-base text-blue-50/70 md:text-left md:text-lg">
              Hover over the spotlight reel to feel the tilt just like the Epic-Tales Marvel Comics frame.
              The glow syncs with your cursor for a playful preview of what is coming next.
            </p>
          </div>

          <div className="relative flex-1">
            <div
              ref={featureFrameRef}
              onMouseMove={handleFeatureMove}
              onMouseLeave={resetTilt}
              className="group relative min-h-[400px] overflow-hidden rounded-2xl border border-white/25 bg-gradient-to-br from-violet-300/15 via-black/60 to-blue-300/15 shadow-[0_0_40px_rgba(87,36,255,0.25)] transition-transform duration-150 md:min-h-[500px]"
            >
              <LazyVideo
                src={mockFilmsData.video_url}
                poster={mockFilmsData.poster_url}
                className="pointer-events-none h-full w-full object-cover opacity-80 transition duration-500 group-hover:opacity-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-general text-xs uppercase text-blue-50/70">Next in the MCU</p>
                <h3 className="special-font mt-2 text-3xl font-black uppercase text-blue-50 md:text-4xl">
                  <b>{mockFilmsData.title}</b>
                </h3>
                <div className="mt-3 inline-flex items-center gap-3 rounded-full bg-violet-300/90 px-4 py-2 text-black backdrop-blur">
                  <span className="font-robert-medium text-xs uppercase">Releasing</span>
                  <span className="font-circular-web text-sm">{new Date(mockFilmsData.release_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="mt-4">
                  <LiveCountdown releaseDate={mockFilmsData.release_date} isCompact />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div ref={titleRef} className="mb-16 text-center">
          <p className="mb-4 font-general text-sm uppercase text-blue-50/60 md:text-base">
            Marvel Cinematic Universe
          </p>
          <h2 className="special-font mb-6 font-zentry text-5xl font-black uppercase text-blue-50 md:text-7xl lg:text-8xl">
            <b>UPCOMING FILMS</b> 
          </h2>
          <p className="mx-auto max-w-2xl font-circular-web text-base text-blue-50/70 md:text-lg">
            Get ready for the next epic adventures in the Marvel Cinematic Universe.
            Mark your calendars and prepare for action!
          </p>
        </div>

        {/* Films Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
          {films.map((film, index) => (
            <div key={film.id || index} className="h-[600px] md:h-[700px]">
              <FilmCard
                film={film}
                isNext={film.isNext}
                onSelect={(selected) => setSelectedFilm(selected)}
              />
            </div>
          ))}
        </div>

        {/* Countdown Section - live */}
        <div className="mt-20 text-center">
          <div className="mx-auto inline-block rounded-lg border border-white/20 bg-black/50 px-8 py-6 backdrop-blur-sm">
            <p className="mb-4 font-general text-xs uppercase text-blue-50/60">
              Next Release In
            </p>
            <LiveCountdown releaseDate={mockFilmsData.release_date} />
          </div>
        </div>
      </div>

      <FilmDetailsModal
        film={selectedFilm}
        isOpen={Boolean(selectedFilm)}
        onClose={() => setSelectedFilm(null)}
      />
    </section>
  );
};

export default UpcomingFilms;

