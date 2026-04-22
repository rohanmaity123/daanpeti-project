import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const POST_FIELDS = `
  id, slug, title, excerpt, cover_image, tags,
  read_time, views, published_at, featured,
  meta_title, meta_desc, og_image,
  blog_authors ( id, name, avatar_url, bio, twitter ),
  blog_categories ( id, name, slug, color )
`;

const POST_FULL_FIELDS = POST_FIELDS + ', content';

/* ── All published posts (listing) ── */
export function useBlogPosts({ category = null, limit = 20, featured = false } = {}) {
    const [posts,   setPosts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            let q = supabase
                .from('blog_posts')
                .select(POST_FIELDS)
                .eq('published', true)
                .order('published_at', { ascending: false })
                .limit(limit);

            if (category) q = q.eq('blog_categories.slug', category);
            if (featured)  q = q.eq('featured', true);

            const { data, error: err } = await q;
            if (err) setError(err.message);
            else setPosts(data ?? []);
            setLoading(false);
        };
        fetch();
    }, [category, limit, featured]);

    return { posts, loading, error };
}

/* ── Single post by slug ── */
export function useBlogPost(slug) {
    const [post,    setPost]    = useState(null);
    const [loading, setLoading] = useState(true);
    const [error,   setError]   = useState('');

    useEffect(() => {
        if (!slug) return;
        const fetch = async () => {
            setLoading(true);

            const { data, error: err } = await supabase
                .from('blog_posts')
                .select(POST_FULL_FIELDS)
                .eq('slug', slug)
                .eq('published', true)
                .single();

            if (err) setError(err.message);
            else {
                setPost(data);
                /* Increment view count (fire and forget) */
                supabase.rpc('increment_post_views', { p_slug: slug });
            }
            setLoading(false);
        };
        fetch();
    }, [slug]);

    return { post, loading, error };
}

/* ── Related posts (same category, exclude current) ── */
export function useRelatedPosts(categoryId, currentSlug, limit = 3) {
    const [posts,   setPosts]   = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!categoryId) { setLoading(false); return; }
        const fetch = async () => {
            const { data } = await supabase
                .from('blog_posts')
                .select(POST_FIELDS)
                .eq('published', true)
                .eq('category_id', categoryId)
                .neq('slug', currentSlug)
                .order('published_at', { ascending: false })
                .limit(limit);
            setPosts(data ?? []);
            setLoading(false);
        };
        fetch();
    }, [categoryId, currentSlug]);

    return { posts, loading };
}

/* ── All categories ── */
export function useBlogCategories() {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        supabase.from('blog_categories').select('*').then(({ data }) => setCategories(data ?? []));
    }, []);
    return categories;
}
