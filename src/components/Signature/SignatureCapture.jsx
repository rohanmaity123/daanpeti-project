import { memo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import SignatureCanvas from 'react-signature-canvas';
import { supabase } from '../../utils/supabaseClient';

const SignaturePad = ({ school, onSaved }) => {
    const sigRef = useRef(null);
    const [saving, setSaving] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    const clear = () => {
        sigRef.current?.clear();
        setIsEmpty(true);
    };
    // Manually trims transparent/blank space around the signature, replacing the
    // library's getTrimmedCanvas() which breaks under Vite due to a trim-canvas
    // CJS/ESM interop bug (fails with "is not a function").
    function trimCanvas(sourceCanvas) {
        const ctx = sourceCanvas.getContext('2d');
        const { width, height } = sourceCanvas;
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let top = null, bottom = null, left = null, right = null;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const alpha = data[(y * width + x) * 4 + 3];
                if (alpha !== 0) {
                    if (top === null) top = y;
                    bottom = y;
                    if (left === null || x < left) left = x;
                    if (right === null || x > right) right = x;
                }
            }
        }

        // Nothing drawn — return the original canvas untouched
        if (top === null) return sourceCanvas;

        const trimmedWidth = right - left + 1;
        const trimmedHeight = bottom - top + 1;

        const trimmed = document.createElement('canvas');
        trimmed.width = trimmedWidth;
        trimmed.height = trimmedHeight;
        trimmed.getContext('2d').drawImage(
            sourceCanvas,
            left, top, trimmedWidth, trimmedHeight,
            0, 0, trimmedWidth, trimmedHeight
        );
        return trimmed;
    }
    const save = async () => {
        if (!sigRef.current || sigRef.current.isEmpty()) {
            return toast.error('Draw a signature before saving.');
        }
        setSaving(true);
        try {
            // Use getCanvas() instead of getTrimmedCanvas() — the latter breaks under Vite
            const rawCanvas = sigRef.current.getCanvas();
            const canvas = trimCanvas(rawCanvas);

            const dataUrl = canvas.toDataURL('image/png');
            const blob = await (await fetch(dataUrl)).blob();

            const filePath = `signatures/${school.id}-${Date.now()}.png`;
            const { error: uploadErr } = await supabase.storage
                .from('school-assets')
                .upload(filePath, blob, { upsert: true, contentType: 'image/png' });
            if (uploadErr) throw uploadErr;

            const { data: urlData } = supabase.storage.from('school-assets').getPublicUrl(filePath);

            const { error: updateErr } = await supabase
                .from('schools')
                .update({ signature_url: urlData.publicUrl })
                .eq('id', school.id);
            if (updateErr) throw updateErr;

            toast.success('Signature saved. It will now appear on certificates.');
            onSaved?.(urlData.publicUrl);
        } catch (err) {
            console.error('Signature save failed:', err);
            toast.error('Could not save signature: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <div
                style={{ background: '#fff', borderRadius: 12, border: '1px solid rgba(255,255,255,0.15)', display: 'inline-block' }}
            >
                <SignatureCanvas
                    ref={sigRef}
                    penColor="#132848"
                    canvasProps={{ width: 290, height: 150, className: 'sigCanvas', style: { borderRadius: 12 } }}
                    onEnd={() => setIsEmpty(sigRef.current?.isEmpty() ?? true)}
                />
            </div>
            <div className="flex gap-2 mt-3">
                <button
                    type="button"
                    onClick={clear}
                    disabled={isEmpty}
                    className="rounded-xl px-4 py-2 text-xs font-bold border border-white/10 text-slate-300 hover:bg-white/[0.1] disabled:opacity-40"
                >
                    Clear
                </button>
                <button
                    type="button"
                    onClick={save}
                    disabled={saving || isEmpty}
                    className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#132848,#2c4a7c)' }}
                >
                    {saving ? 'Saving...' : 'Save Signature'}
                </button>
            </div>
        </div>
    );
}
export default memo(SignaturePad);