/**
 * BlogWidget — embeddable recent posts strip
 * Drop anywhere: home page, sidebar, profile page
 * Usage: <BlogWidget limit={3} />
 */

import { Link } from 'react-router-dom';
import { Clock, ArrowUpRight } from 'lucide-react';
import { useState } from 'react';
import { useBlogPosts } from '../../hooks/useBlog';
import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

const BASE_URL = 'https://www.daanguru.in';

export function BlogWidget({ limit = 3 }) {
  const [activeCategory, setActiveCategory] = useState(null);
  const { posts, loading, error } = useBlogPosts({ category: activeCategory });

  if (!posts.length) return null;

  const regular = posts?.slice(0, limit) ?? [];

  return (
    <section className="mx-4 lg:mx-0 mt-10 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-white">📝 DaanGuru Blog's</h2>
        <Link to="/blog" className="text-xs font-semibold text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
          view all <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {regular?.map((post, index) => (
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
        ))}
      </div>
    </section>
  );
}
