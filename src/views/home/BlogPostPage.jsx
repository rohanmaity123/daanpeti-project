import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Clock, Eye, Calendar, ArrowLeft, ArrowRight, Tag, Share2 } from 'lucide-react';
import { useBlogPost, useRelatedPosts } from '../../hooks/useBlog';
import { markdownToHtml } from '../../utils/markdownToHtml';
import { useState } from 'react';
import { Twitter } from '@mui/icons-material';
import { Facebook } from '@mui/icons-material';
import { Bloodtype } from '@mui/icons-material';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const fmtISO = (d) => d ? new Date(d).toISOString() : '';
const BASE_URL = 'https://www.daanguru.in';

/* ── Related post mini card ── */
function RelatedCard({ post }) {
    return (
        <Link to={`/blog/${post.slug}`}
            className="group flex gap-3 rounded-2xl p-3 transition-all hover:bg-white/5"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
            {post.cover_image && (
                <img src={post.cover_image} alt={post.title}
                    className="h-14 w-20 shrink-0 rounded-xl object-cover" />
            )}
            <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white leading-snug line-clamp-2 group-hover:text-green-400 transition-colors">
                    {post.title}
                </p>
                <p className="mt-1 text-[10px] text-white/40 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />{post.read_time} min
                </p>
            </div>
        </Link>
    );
}

/* ── Share buttons ── */
function ShareButtons({ url, title }) {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40 font-semibold uppercase tracking-wider mr-1">Share:</span>
            <a href={`https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: 'rgba(37,211,102,0.25)', border: '1px solid rgba(37,211,102,0.3)' }}>
                WhatsApp
            </a>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: 'rgba(29,155,240,0.2)', border: '1px solid rgba(29,155,240,0.3)' }}>
                <Twitter className="h-3 w-3" />Twitter
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: 'rgba(59,89,152,0.2)', border: '1px solid rgba(59,89,152,0.3)' }}>
                <Facebook className="h-3 w-3" />Facebook
            </a>
            <button onClick={copy}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                {copied ? '✅ Copied!' : '🔗 Copy Link'}
            </button>
        </div>
    );
}

/* ── Main post page ── */
export default function BlogPostPage() {
    const { slug } = useParams();
    const { post, loading, error } = useBlogPost(slug);
    const { posts: related } = useRelatedPosts(post?.blog_categories?.id, slug);

    /* ── SEO metadata ── */
    const pageTitle = post?.meta_title || `${post?.title} | DaanGuru Blog`;
    const pageDesc = post?.meta_desc || post?.excerpt || '';
    const pageImage = post?.og_image || post?.cover_image || `${BASE_URL}/images/og-default.png`;
    const canonicalUrl = `${BASE_URL}/blog/${slug}`;

    /* ── Loading skeleton ── */
    if (loading) return (
        <div className="mt-16 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-green-400" />
        </div>
    );

    if (error || !post) return (
        <div className="mx-auto max-w-3xl px-4 pt-16 pb-28 text-center">
            <p className="text-4xl mb-4">📄</p>
            <h1 className="text-xl font-extrabold text-white">Post nahi mili</h1>
            <p className="mt-2 text-sm text-white/50">Yeh post exist nahi karti ya unpublished hai.</p>
            <Link to="/blog" className="mt-5 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                <ArrowLeft className="h-4 w-4" />Back to Blog
            </Link>
        </div>
    );

    const htmlContent = markdownToHtml(post.content);

    return (
        <>
            {/* ── SEO Head ── */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta name="keywords" content={post.tags?.join(', ')} />
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:site_name" content="DaanGuru" />
                <meta property="og:locale" content="en_IN" />

                {/* Article meta */}
                <meta property="article:published_time" content={fmtISO(post.published_at)} />
                <meta property="article:modified_time" content={fmtISO(post.updated_at)} />
                {post.blog_authors?.name && (
                    <meta property="article:author" content={post.blog_authors.name} />
                )}
                {post.tags?.map(t => (
                    <meta key={t} property="article:tag" content={t} />
                ))}

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                <meta name="twitter:image" content={pageImage} />

                {/* JSON-LD structured data */}
                <script type="application/ld+json">{JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BlogPosting',
                    'headline': post.title,
                    'description': post.excerpt,
                    'image': pageImage,
                    'datePublished': fmtISO(post.published_at),
                    'dateModified': fmtISO(post.updated_at),
                    'author': post.blog_authors ? {
                        '@type': 'Person',
                        'name': post.blog_authors.name,
                    } : undefined,
                    'publisher': {
                        '@type': 'Organization',
                        'name': 'DaanGuru',
                        'url': BASE_URL,
                        'logo': { '@type': 'ImageObject', 'url': `${BASE_URL}/images/logo.png` },
                    },
                    'mainEntityOfPage': { '@type': 'WebPage', '@id': canonicalUrl },
                    'keywords': post.tags?.join(', '),
                    'url': canonicalUrl,
                })}</script>
            </Helmet>

            <div className="mx-auto max-w-7xl px-4 lg:px-6 pt-5 pb-28 lg:pb-10">
                <div className="lg:grid lg:grid-cols-[1fr_300px] lg:gap-10">

                    {/* ── Main content column ── */}
                    <article>
                        {/* Breadcrumb */}
                        <motion.nav initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center gap-2 text-xs text-white/40 mb-5">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                            <span>/</span>
                            <span className="text-white/70 truncate max-w-[160px]">{post.title}</span>
                        </motion.nav>

                        {/* Cover image */}
                        {post.cover_image && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className="overflow-hidden rounded-[28px] mb-6">
                                <img src={post.cover_image} alt={post.title}
                                    className="h-56 sm:h-72 lg:h-80 w-full object-cover" />
                            </motion.div>
                        )}

                        {/* Category + tags */}
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-2 mb-4">
                            {post.blog_categories && (
                                <Link to={`/blog?category=${post.blog_categories.slug}`}
                                    className="rounded-full px-3 py-1 text-xs font-bold text-white"
                                    style={{ background: post.blog_categories.color + 'cc' }}>
                                    {post.blog_categories.name}
                                </Link>
                            )}
                            {post.tags?.map(t => (
                                <span key={t} className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white/50"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                                    <Tag className="h-2.5 w-2.5" />{t}
                                </span>
                            ))}
                        </motion.div>

                        {/* Title */}
                        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12 }}
                            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-4">
                            {post.title}
                        </motion.h1>

                        {/* Meta row */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
                            className="flex flex-wrap items-center gap-4 mb-6 pb-6"
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.09)' }}>
                            {post.blog_authors && (
                                <div className="flex items-center gap-2">
                                    {post.blog_authors.avatar_url
                                        ? <img src={post.blog_authors.avatar_url} alt=""
                                            className="h-8 w-8 rounded-full object-cover" />
                                        : <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                                            style={{ background: 'rgba(29,158,117,0.35)' }}>
                                            {post.blog_authors.name?.[0]}
                                        </div>
                                    }
                                    <div>
                                        <p className="text-xs font-bold text-white">{post.blog_authors.name}</p>
                                        {post.blog_authors.twitter && (
                                            <a href={`https://twitter.com/${post.blog_authors.twitter}`}
                                                target="_blank" rel="noopener"
                                                className="text-[10px] text-blue-400 hover:underline">
                                                @{post.blog_authors.twitter}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center gap-3 text-xs text-white/40">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{fmt(post.published_at)}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_time} min read</span>
                                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{post.views} views</span>
                            </div>
                        </motion.div>

                        {/* ── Blog content ── */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="blog-content prose prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: htmlContent }}
                        />

                        {/* Share section */}
                        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="mt-10 rounded-2xl p-5"
                            style={{ background: 'rgba(29,158,117,0.10)', border: '1px solid rgba(29,158,117,0.2)' }}>
                            <p className="text-sm font-bold text-white mb-3">Pasand aayi? Share karo! 💚</p>
                            <ShareButtons url={canonicalUrl} title={post.title} />
                        </motion.div>

                        {/* Author bio card */}
                        {post.blog_authors?.bio && (
                            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="mt-6 flex gap-4 rounded-2xl p-5"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                {post.blog_authors.avatar_url
                                    ? <img src={post.blog_authors.avatar_url} alt=""
                                        className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
                                    : <div className="h-14 w-14 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-bold"
                                        style={{ background: 'rgba(29,158,117,0.3)' }}>
                                        {post.blog_authors.name?.[0]}
                                    </div>
                                }
                                <div>
                                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">Written by</p>
                                    <p className="text-sm font-extrabold text-white mt-0.5">{post.blog_authors.name}</p>
                                    <p className="text-xs text-white/55 mt-1 leading-relaxed">{post.blog_authors.bio}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Back to blog */}
                        <div className="mt-8 flex items-center justify-between">
                            <Link to="/blog"
                                className="flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white/70 hover:text-white transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                                <ArrowLeft className="h-4 w-4" />Back to Blog
                            </Link>
                            <Link to="/digital-blood-bank"
                                className="flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                                Donate Blood <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link to="/post-item"
                                className="flex items-center gap-1 rounded-2xl px-4 py-2.5 text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                Donate Item <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </article>

                    {/* ── Sidebar ── */}
                    <aside className="hidden lg:block space-y-5 mt-[52px]">

                        {/* Sticky wrapper */}
                        <div className="sticky top-[72px] space-y-5">
                            {/* Related posts */}
                            {related.length > 0 && (
                                <div className="rounded-[22px] p-4"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Related Posts</h3>
                                    <div className="space-y-2">
                                        {related.map(r => <RelatedCard key={r.id} post={r} />)}
                                    </div>
                                </div>
                            )}

                            {/* CTA card */}
                            <div className="rounded-[22px] p-5 text-center"
                                style={{ background: 'linear-gradient(135deg, rgba(19,136,8,0.3), rgba(29,158,117,0.2))', border: '1px solid rgba(29,158,117,0.3)' }}>
                                <p className="text-2xl mb-2">🎁</p>
                                <p className="text-sm font-extrabold text-white">Kuch donate karna hai?</p>
                                <p className="text-xs text-white/55 mt-1 mb-4 leading-relaxed">
                                    Apna purana samaan kisi zarooratmand tak pahunchao — bilkul free.
                                </p>
                                <Link to="/post-item"
                                    className="block w-full rounded-xl py-2.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-85"
                                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                    Post Item Free →
                                </Link>
                            </div>
                            <div className="rounded-[22px] p-5 text-center"
                                style={{ background: 'linear-gradient(135deg, rgba(19,136,8,0.3), rgba(29,158,117,0.2))', border: '1px solid rgba(29,158,117,0.3)' }}>
                                <p className="text-2xl mb-2">🩸</p>
                                <p className="text-sm font-extrabold text-white">Blood donate karna hai?</p>
                                <p className="text-xs text-white/55 mt-1 mb-4 leading-relaxed">
                                    Apna naam register karo as a blood donor !!
                                </p>
                                <Link to="/post-item"
                                    className="block w-full rounded-xl py-2.5 text-sm font-bold text-white text-center transition-opacity hover:opacity-85"
                                    style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                                    Register your name →
                                </Link>
                            </div>
                            {/* Tags cloud */}
                            {post.tags?.length > 0 && (
                                <div className="rounded-[22px] p-4"
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-wider mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map(t => (
                                            <span key={t} className="rounded-full px-2.5 py-1 text-[10px] font-semibold text-white/60"
                                                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}>
                                                #{t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
