/**
 * BlogWidget — embeddable recent posts strip
 * Drop anywhere: home page, sidebar, profile page
 * Usage: <BlogWidget limit={3} />
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ArrowUpRight } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

export function BlogWidget({ limit = 3 }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    supabase.from('blog_posts')
      .select('slug,title,excerpt,read_time,category,cover_image')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(limit)
      .then(({ data }) => setPosts(data ?? []));
  }, [limit]);

  if (!posts.length) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-white">📝 DaanGuru Blog</h2>
        <Link to="/blog" className="text-xs font-semibold text-green-400 hover:text-green-300 flex items-center gap-1 transition-colors">
          Sab dekho <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {posts.map((post, i) => (
          <motion.div key={post.slug}
            initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}>
            <Link to={`/blog/${post.slug}`}
              className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-white/08 group"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}>
              {/* Thumbnail */}
              <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden">
                {post.cover_image
                  ? <img src={post.cover_image} alt={post.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  : <div className="h-full w-full flex items-center justify-center text-2xl" style={{ background: 'rgba(29,158,117,0.2)' }}>
                      {post.category === 'inspiration' ? '💡' : post.category === 'tips' ? '📋' : '📝'}
                    </div>
                }
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white line-clamp-2 leading-snug group-hover:text-green-300 transition-colors">{post.title}</p>
                <p className="mt-1 text-[10px] text-white/40 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />{post.read_time} min read
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-white/25 group-hover:text-green-400 transition-colors shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
