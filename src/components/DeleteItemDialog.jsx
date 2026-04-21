import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export function DeleteItemDialog({ item, open, onClose, onDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState('');

    const handleDelete = async () => {
        setLoading(true);
        setError('');
        try {
            /* Delete image from storage first if it exists */
            if (item.image_url) {
                const path = item.image_url.split('/item-images/')[1];
                if (path) {
                    await supabase.storage.from('item-images').remove([path]);
                }
            }
            /* Delete the row */
            const { error: err } = await supabase
                .from('donation_items')
                .delete()
                .eq('id', item.id);
            if (err) throw err;
            onDeleted(item.id);
            onClose();
        } catch (e) {
            setError(e.message ?? 'Delete failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0 z-[80]"
                        style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    >
                        <motion.div
                            initial={{ scale: 0.92, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, y: 20 }}
                            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                            className="w-full max-w-sm rounded-[28px] p-6 mx-auto"
                            style={{
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.13), rgba(255,255,255,0.07))',
                                backdropFilter: 'blur(24px)',
                                border: '1px solid rgba(255,255,255,0.16)',
                                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Icon */}
                            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(255,92,92,0.15)', border: '1px solid rgba(255,92,92,0.3)' }}>
                                <Trash2 className="h-7 w-7" style={{ color: '#ff5c5c' }} />
                            </div>

                            <h3 className="text-center text-base font-extrabold text-white mb-1">
                                Delete This Item?
                            </h3>
                            <p className="text-center text-sm text-white/55 mb-2">
                                "<span className="text-white/80 font-semibold">{item?.name}</span>" permanently delete ho jayega.
                                Yeh action undo nahi ho sakta.
                            </p>

                            {error && (
                                <p className="mb-3 text-xs text-center font-semibold" style={{ color: '#ff5c5c' }}>
                                    <AlertTriangle className="inline h-3 w-3 mr-1" />{error}
                                </p>
                            )}

                            <div className="flex gap-3 mt-5">
                                <button onClick={onClose} disabled={loading}
                                    className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white/70 hover:text-white transition-colors disabled:opacity-50"
                                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                    Cancel
                                </button>
                                <button onClick={handleDelete} disabled={loading}
                                    className="flex-1 rounded-2xl py-3 text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-50 flex items-center justify-center gap-2"
                                    style={{ background: 'rgba(255,92,92,0.75)', border: '1px solid rgba(255,92,92,0.4)' }}>
                                    {loading
                                        ? <><Loader2 className="h-4 w-4 animate-spin" />Deleting...</>
                                        : <><Trash2 className="h-4 w-4" />Delete</>
                                    }
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
