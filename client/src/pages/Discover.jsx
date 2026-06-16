import { useState, useEffect, useCallback, useRef } from 'react';
import Footer from '../components/Footer';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Search, X, Users, Code2, CheckCircle2, Heart, Zap, ChevronDown, Loader2, TrendingUp, Clock, Star, Filter } from 'lucide-react';
import LeftSidebar from '../components/LeftSidebar';
import MobileBottomNav from '../components/MobileBottomNav';

// ─── constants ────────────────────────────────────────────────
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', icon: Clock },
  { value: 'popular', label: 'Most Solved', icon: TrendingUp },
  { value: 'most_liked', label: 'Most Liked', icon: Star },
  { value: 'most_attempted', label: 'Most Attempted', icon: Zap },
];

const DIFF_STYLE = {
  Easy: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Medium: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Hard: 'border-red-500/30 bg-red-500/10 text-red-400',
};

const POPULAR_TAGS = [
  'Arrays',
  'Strings',
  'Stack',
  'Queue',
  'Binary Search',
  'Graphs',
  'Trees',
  'Sliding Window',
  'Greedy',
  'BFS',
  'DFS',
  'Dynamic Programming',
  'Recursion',
  'Hash Map',
];

// ─── helpers ─────────────────────────────────────────────────
const solveRate = p => (p.totalAttempts > 0 ? Math.round((p.successfulSolves / p.totalAttempts) * 100) : 0);

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

// ─── ProblemCard ──────────────────────────────────────────────
const ProblemCard = ({ problem }) => {
  const navigate = useNavigate();
  const rate = solveRate(problem);

  return (
    <div
      onClick={() => navigate(`/problem/${problem.id}`)}
      className='group cursor-pointer rounded-xl border border-white/10 bg-[#0a0a0a] p-5 transition-all duration-200 hover:border-red-500/40 hover:bg-[#0f0f0f] hover:shadow-lg hover:shadow-red-500/5'
    >
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-base font-semibold text-white transition-colors group-hover:text-red-400'>{problem.title}</h3>
          <p className='mt-1 line-clamp-2 text-sm text-slate-400'>{problem.summary}</p>
        </div>
        <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs font-semibold ${DIFF_STYLE[problem.difficulty]}`}>{problem.difficulty}</span>
      </div>

      {/* tags */}
      <div className='mt-3 flex flex-wrap gap-1.5'>
        {problem.tags.slice(0, 4).map(tag => (
          <span key={tag} className='rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-400'>
            #{tag}
          </span>
        ))}
        {problem.tags.length > 4 && <span className='text-xs text-slate-500'>+{problem.tags.length - 4}</span>}
      </div>

      {/* stats row */}
      <div className='mt-4 flex items-center justify-between'>
        <div className='flex items-center gap-4 text-xs text-slate-400'>
          <span className='flex items-center gap-1.5'>
            <CheckCircle2 size={12} className='text-emerald-400' />
            {problem.successfulSolves.toLocaleString()} solved
          </span>
          <span className='flex items-center gap-1.5'>
            <Heart size={12} className='text-red-400' />
            {problem.likesCount}
          </span>
          <span className='flex items-center gap-1.5'>
            <Zap size={12} className='text-amber-400' />
            {problem.totalAttempts.toLocaleString()} attempts
          </span>
        </div>

        {/* solve rate bar */}
        <div className='flex items-center gap-2'>
          <div className='h-1.5 w-16 overflow-hidden rounded-full bg-white/10'>
            <div className='h-full rounded-full bg-linear-to-r from-red-600 to-red-400' style={{ width: `${rate}%` }} />
          </div>
          <span className='text-xs font-medium text-slate-400'>{rate}%</span>
        </div>
      </div>

      {/* author */}
      <div className='mt-4 flex items-center gap-2 border-t border-white/8 pt-3'>
        <img src={problem.author.avatarUrl} alt={problem.author.displayName} className='h-5 w-5 rounded-full border border-white/20' />
        <span className='text-xs text-slate-400'>by @{problem.author.username}</span>
      </div>
    </div>
  );
};

// ─── UserCard ─────────────────────────────────────────────────
const UserCard = ({ user }) => (
  <Link
    to={`/profile/${user.username}`}
    className='group cursor-pointer flex items-center gap-4 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 transition-all duration-200 hover:border-red-500/40 hover:bg-[#0f0f0f] hover:shadow-lg hover:shadow-red-500/5'
  >
    <img
      src={user.avatarUrl}
      alt={user.displayName}
      className='h-12 w-12 rounded-full border-2 border-white/10 object-cover transition-colors group-hover:border-red-500/30'
    />
    <div className='min-w-0 flex-1'>
      <p className='truncate font-semibold text-white transition-colors group-hover:text-red-400'>{user.displayName}</p>
      <p className='text-sm text-slate-400'>@{user.username}</p>
    </div>
    <div className='shrink-0 text-right'>
      <p className='text-sm font-bold text-white'>
        {user.eloRating} <span className='text-xs font-medium text-slate-400'>ELO</span>
      </p>
      <p className='mt-1 text-xs text-slate-400'>{user.followersCount} followers</p>
    </div>
  </Link>
);

// ─── FilterPanel ──────────────────────────────────────────────
const FilterPanel = ({ filters, setFilters, onClear }) => {
  const hasFilters = filters.difficulty || filters.tags.length > 0 || filters.sort !== 'newest';

  return (
    <div className='rounded-xl border border-white/10 bg-[#0a0a0a] p-5 space-y-5'>
      <div className='flex items-center justify-between'>
        <span className='flex items-center gap-2 text-sm font-semibold text-white'>
          <Filter size={14} className='text-red-400' /> Filters
        </span>
        {hasFilters && (
          <button onClick={onClear} className='cursor-pointer text-xs font-medium text-slate-400 transition hover:text-red-400'>
            Clear all
          </button>
        )}
      </div>

      {/* sort */}
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Sort by</p>
        <div className='space-y-1'>
          {SORT_OPTIONS.map(opt => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.value}
                onClick={() => setFilters(f => ({ ...f, sort: opt.value }))}
                className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  filters.sort === opt.value
                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon size={14} />
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* difficulty */}
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Difficulty</p>
        <div className='flex flex-col gap-1.5'>
          {DIFFICULTIES.map(d => (
            <button
              key={d}
              onClick={() => setFilters(f => ({ ...f, difficulty: f.difficulty === d ? '' : d }))}
              className={`cursor-pointer rounded-lg border px-3 py-1.5 text-left text-sm font-medium transition-all ${
                filters.difficulty === d
                  ? DIFF_STYLE[d] + ' border-opacity-50'
                  : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* tags */}
      <div className='space-y-2'>
        <p className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Popular Tags</p>
        <div className='flex flex-wrap gap-1.5'>
          {POPULAR_TAGS.map(tag => {
            const active = filters.tags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() =>
                  setFilters(f => ({
                    ...f,
                    tags: active ? f.tags.filter(t => t !== tag) : [...f.tags, tag],
                  }))
                }
                className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${
                  active
                    ? 'border-red-500/40 bg-red-500/15 text-red-300'
                    : 'border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Discover ─────────────────────────────────────────────────
const Discover = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'all');
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [filters, setFilters] = useState({
    difficulty: searchParams.get('difficulty') || '',
    tags: searchParams.get('tags') ? searchParams.get('tags').split(',') : [],
    sort: searchParams.get('sort') || 'newest',
  });

  const debouncedQuery = useDebounce(query, 400);
  const debouncedFilters = useDebounce(filters, 300);
  const inputRef = useRef(null);

  // Sync state changes to the URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (activeTab !== 'all') params.set('type', activeTab);
    if (debouncedFilters.difficulty) params.set('difficulty', debouncedFilters.difficulty);
    if (debouncedFilters.tags.length > 0) params.set('tags', debouncedFilters.tags.join(','));
    if (debouncedFilters.sort !== 'newest') params.set('sort', debouncedFilters.sort);

    setSearchParams(params, { replace: true });
  }, [debouncedQuery, activeTab, debouncedFilters, setSearchParams]);

  // ── fetch ────────────────────────────────────────────────────
  const fetchResults = useCallback(async () => {
    const isBlank = !debouncedQuery && !debouncedFilters.difficulty && debouncedFilters.tags.length === 0 && debouncedFilters.sort === 'newest';

    if (isBlank) {
      setProblems([]);
      setUsers([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams();
    if (debouncedQuery) params.set('q', debouncedQuery);
    if (activeTab !== 'all') params.set('type', activeTab);
    if (debouncedFilters.difficulty) params.set('difficulty', debouncedFilters.difficulty);
    if (debouncedFilters.tags.length) params.set('tags', debouncedFilters.tags.join(','));
    if (debouncedFilters.sort) params.set('sort', debouncedFilters.sort);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setProblems(data.problems);
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery, activeTab, debouncedFilters]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const clearFilters = () => setFilters({ difficulty: '', tags: [], sort: 'newest' });

  const hasFilters = filters.difficulty || filters.tags.length > 0 || filters.sort !== 'newest';

  const showProblems = activeTab !== 'users';
  const showUsers = activeTab !== 'problems';

  return (
    <div className='flex h-screen bg-black text-white'>
      {/* LEFT SIDEBAR */}
      <aside className='hidden lg:block shrink-0'>
        <LeftSidebar />
      </aside>

      {/* MAIN */}
      <div className='min-w-0 flex-1 overflow-y-auto pb-20 lg:pb-0'>
        <div className='mx-auto min-h-full w-full max-w-7xl px-6 py-8'>
          {/* ── PAGE HEADER ── */}
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-white'>Discover</h1>
            <p className='mt-2 text-sm text-slate-400'>Search problems and users across the platform.</p>
          </div>

          {/* ── SEARCH BAR ── */}
          <div className='relative mb-6'>
            <Search size={18} className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500' />
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder='Search problems, users, tags…'
              className='w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10'
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-slate-300'
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* ── TYPE TABS ── */}
          <div className='mb-6 flex items-center gap-2'>
            {[
              { id: 'all', label: 'All' },
              { id: 'problems', label: 'Problems' },
              { id: 'users', label: 'People' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'border border-white/10 text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}

            {hasFilters && (
              <span className='ml-auto flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400'>
                <Filter size={10} />
                Filtered
                <button onClick={clearFilters} className='cursor-pointer ml-0.5 rounded-full p-0.5 hover:bg-red-500/20 hover:text-red-300'>
                  <X size={10} />
                </button>
              </span>
            )}
          </div>

          {/* ── CONTENT: FILTERS + RESULTS ── */}
          <div className='flex gap-6'>
            {/* FILTER PANEL — only shown for problems/all tabs */}
            {activeTab !== 'users' && (
              <aside className='hidden w-60 shrink-0 xl:block'>
                <div className='sticky top-6'>
                  <FilterPanel filters={filters} setFilters={setFilters} onClear={clearFilters} />
                </div>
              </aside>
            )}

            {/* RESULTS */}
            <div className='min-w-0 flex-1'>
              {loading ? (
                <div className='flex items-center justify-center py-20'>
                  <Loader2 size={24} className='animate-spin text-red-400' />
                </div>
              ) : (
                <div className='space-y-8'>
                  {/* ── PROBLEMS ── */}
                  {showProblems && (
                    <div>
                      {activeTab === 'all' && (
                        <div className='mb-4 flex items-center justify-between'>
                          <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-300'>
                            <Code2 size={15} className='text-red-400' />
                            Problems
                            <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400'>{problems.length}</span>
                          </h2>
                          {problems.length > 0 && (
                            <button
                              onClick={() => setActiveTab('problems')}
                              className='cursor-pointer text-xs font-medium text-slate-400 transition hover:text-red-400'
                            >
                              View all →
                            </button>
                          )}
                        </div>
                      )}

                      {problems.length === 0 ? (
                        <div className='rounded-xl border border-white/10 bg-[#0a0a0a] p-12 text-center'>
                          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5'>
                            <Code2 size={24} className='text-slate-600' />
                          </div>
                          <p className='text-sm font-medium text-slate-400'>
                            {!searched
                              ? 'Enter a search term or apply filters to discover problems'
                              : query
                                ? `No problems found for "${query}"`
                                : 'No problems match your filters'}
                          </p>
                        </div>
                      ) : (
                        <div className='grid gap-4 sm:grid-cols-2'>
                          {(activeTab === 'all' ? problems.slice(0, 4) : problems).map(p => (
                            <ProblemCard key={p.id} problem={p} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── USERS ── */}
                  {showUsers && activeTab !== 'problems' && (
                    <div>
                      {activeTab === 'all' && (
                        <div className='mb-4 flex items-center justify-between'>
                          <h2 className='flex items-center gap-2 text-sm font-semibold text-slate-300'>
                            <Users size={15} className='text-red-400' />
                            People
                            <span className='rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-slate-400'>{users.length}</span>
                          </h2>
                          {users.length > 0 && (
                            <button
                              onClick={() => setActiveTab('users')}
                              className='cursor-pointer text-xs font-medium text-slate-400 transition hover:text-red-400'
                            >
                              View all →
                            </button>
                          )}
                        </div>
                      )}

                      {users.length === 0 ? (
                        <div className='rounded-xl border border-white/10 bg-[#0a0a0a] p-12 text-center'>
                          <div className='mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5'>
                            <Users size={24} className='text-slate-600' />
                          </div>
                          <p className='text-sm font-medium text-slate-400'>
                            {!searched
                              ? 'Search for a username or display name'
                              : query
                                ? `No users found for "${query}"`
                                : 'No users match your search'}
                          </p>
                        </div>
                      ) : (
                        <div className='grid gap-4 sm:grid-cols-2'>
                          {(activeTab === 'all' ? users.slice(0, 4) : users).map(u => (
                            <UserCard key={u.id} user={u} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
};

export default Discover;
