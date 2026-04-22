import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Eye, Tag, ArrowRight, Rss } from 'lucide-react';
import { useBlogPosts, useBlogCategories } from '../../hooks/useBlog';

/* ── Helpers ── */
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

/* ── Featured hero card ── */
function HeroCard({ post }) {
    return (
        <Link to={`/blog/${post.slug}`} className="group block">
            <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className="relative w-full overflow-hidden rounded-[28px]"
                style={{
                    background: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.14)',
                }}
            >
                {/* Cover image */}
                {post.cover_image && (
                    <div className="relative h-56 sm:h-72 lg:h-80 overflow-hidden">
                        <img src={post.cover_image} alt={post.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Category badge */}
                        {post.blog_categories && (
                            <span className="absolute top-4 left-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                                style={{ background: post.blog_categories.color + 'cc' }}>
                                {post.blog_categories.name}
                            </span>
                        )}
                        <span className="absolute top-4 right-4 rounded-full px-3 py-1 text-xs font-bold text-white"
                            style={{ background: 'rgba(239,159,39,0.85)' }}>
                            ✨ Featured
                        </span>
                    </div>
                )}

                {/* Content */}
                <div className="p-5 lg:p-6">
                    <h2 className="text-xl lg:text-2xl font-extrabold text-white leading-snug group-hover:text-green-400 transition-colors">
                        {post.title}
                    </h2>
                    <p className="mt-2 text-sm text-white/60 leading-relaxed line-clamp-2">{post.excerpt}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs text-white/45">
                            {post.blog_authors && (
                                <span className="flex items-center gap-1.5">
                                    {post.blog_authors.avatar_url
                                        ? <img src={post.blog_authors.avatar_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                                        : <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                                            style={{ background: 'rgba(29,158,117,0.4)' }}>{post.blog_authors.name?.[0]}</div>
                                    }
                                    {post.blog_authors.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time} min</span>
                            <span>{fmt(post.published_at)}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-400">
                            Read More <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

/* ── Regular post card ── */
function PostCard({ post, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
        >
            <Link to={`/blog/${post.slug}`} className="group block h-full">
                <div className="h-full flex flex-col overflow-hidden rounded-[22px] transition-all duration-200"
                    style={{
                        background: 'rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(18px)',
                        border: '1px solid rgba(255,255,255,0.11)',
                    }}>

                    {/* Cover */}
                    {post.cover_image && (
                        <div className="h-44 overflow-hidden shrink-0">
                            <img src={post.cover_image} alt={post.title}
                                className="h-full w-full object-cover transition-transform duration-400 group-hover:scale-[1.06]" />
                        </div>
                    )}

                    <div className="p-4 flex flex-col flex-1 gap-2">
                        {/* Category + read time */}
                        <div className="flex items-center gap-2">
                            {post.blog_categories && (
                                <span className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                                    style={{ background: post.blog_categories.color + 'bb' }}>
                                    {post.blog_categories.name}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-[10px] text-white/40">
                                <Clock className="h-3 w-3" />{post.read_time} min
                            </span>
                        </div>

                        <h3 className="font-extrabold text-sm text-white leading-snug line-clamp-2 group-hover:text-green-400 transition-colors">
                            {post.title}
                        </h3>
                        <p className="text-xs text-white/55 leading-relaxed line-clamp-2 flex-1">{post.excerpt}</p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/[0.07]">
                            <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                                {post.blog_authors && (
                                    <>
                                        {post.blog_authors.avatar_url
                                            ? <img src={post.blog_authors.avatar_url} alt="" className="h-4 w-4 rounded-full" />
                                            : <div className="h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                                                style={{ background: 'rgba(29,158,117,0.4)' }}>{post.blog_authors.name?.[0]}</div>
                                        }
                                        <span>{post.blog_authors.name}</span>
                                        <span>·</span>
                                    </>
                                )}
                                <span>{fmt(post.published_at)}</span>
                            </div>
                            <span className="flex items-center gap-1 text-[10px] text-white/30">
                                <Eye className="h-3 w-3" />{post.views}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

/* ── Main page ── */
export default function BlogListPage() {
    const [activeCategory, setActiveCategory] = useState(null);
    const categories = useBlogCategories();
    const { posts, loading, error } = useBlogPosts({ category: activeCategory });

    const featured   = posts.filter(p => p.featured);
    const regular    = posts.filter(p => !p.featured);

    return (
        <>
            <Helmet>
                <title>Blog — DaanGuru | Donation Tips, Stories & Impact</title>
                <meta name="description" content="DaanGuru Blog — donation tips, community impact stories, sustainability guides aur bahut kuch. India ke free donation platform ka official blog." />
                <meta name="keywords" content="donation blog, free items India, community stories, sustainability tips, DaanGuru blog" />
                <meta property="og:title" content="DaanGuru Blog — Donation Tips & Community Stories" />
                <meta property="og:description" content="India ke leading free donation platform DaanGuru ka blog. Tips, stories, aur impact." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.daanguru.in/blog" />
                <link rel="canonical" href="https://www.daanguru.in/blog" />
                {/* RSS feed link */}
                <link rel="alternate" type="application/rss+xml" title="DaanGuru Blog RSS" href="https://www.daanguru.in/blog/rss.xml" />
            </Helmet>

            <div className="mx-auto max-w-[1100px] px-4 lg:px-6 pt-5 pb-28 lg:pb-10">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                    className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="rounded-full px-3 py-1 text-[11px] font-bold text-white"
                                style={{ background: 'rgba(29,158,117,0.25)', border: '1px solid rgba(29,158,117,0.35)' }}>
                                📝 DaanGuru Blog
                            </span>
                        </div>
                        <h1 className="text-2xl lg:text-3xl font-extrabold text-white">Stories, Tips & Impact</h1>
                        <p className="text-sm text-white/55 mt-0.5">Donation se related sab kuch — guides, community stories, sustainability.</p>
                    </div>
                    <a href="/blog/rss.xml" target="_blank" rel="noopener"
                        className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white/50 hover:text-white transition-colors"
                        style={{ background: 'rgba(239,159,39,0.10)', border: '1px solid rgba(239,159,39,0.2)' }}>
                        <Rss className="h-3.5 w-3.5 text-amber-400" />RSS Feed
                    </a>
                </motion.div>

                {/* Category filter pills */}
                {categories.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="mt-5 flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        <button onClick={() => setActiveCategory(null)}
                            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                                !activeCategory ? 'text-white' : 'text-white/50 hover:text-white'
                            }`}
                            style={!activeCategory ? { background: 'rgba(29,158,117,0.8)' } : { background: 'rgba(255,255,255,0.07)' }}>
                            All Posts
                        </button>
                        {categories.map(cat => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.slug)}
                                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                                    activeCategory === cat.slug ? 'text-white' : 'text-white/50 hover:text-white'
                                }`}
                                style={activeCategory === cat.slug
                                    ? { background: cat.color + 'cc' }
                                    : { background: 'rgba(255,255,255,0.07)' }}>
                                {cat.name}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="mt-16 flex justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-green-400" />
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-10 text-center text-sm text-red-400 font-semibold">{error}</div>
                )}

                {/* Featured post */}
                {!loading && !error && featured.length > 0 && (
                    <div className="mt-8">
                        <HeroCard post={featured[0]} />
                    </div>
                )}

                {/* Regular posts grid */}
                {!loading && !error && regular.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4">
                            {featured.length > 0 ? 'More Posts' : 'All Posts'}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                            {regular.map((post, i) => (
                                <PostCard key={post.id} post={post} index={i} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && posts.length === 0 && (
                    <div className="mt-20 text-center">
                        <p className="text-4xl mb-4">📝</p>
                        <p className="text-base font-bold text-white">Abhi koi post nahi hai</p>
                        <p className="text-sm text-white/50 mt-1">Jaldi aayenge — stay tuned!</p>
                    </div>
                )}
            </div>
        </>
    );
}
