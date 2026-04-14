import { createFileRoute } from '@tanstack/react-router';
import { Camera } from 'lucide-react';

export const Route = createFileRoute('/post-item')({
  head: () => ({
    meta: [
      { title: 'Donate an Item — DaanPeti' },
      { name: 'description', content: 'Post an item you want to give away for free on DaanPeti.' },
    ],
  }),
  component: PostItemPage,
});

const categories = [
  { value: 'clothes', label: '👕 Kapde / Clothes' },
  { value: 'furniture', label: '🪑 Furniture' },
  { value: 'books', label: '📚 Kitaabein / Books' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'toys', label: '🧸 Khilone / Toys' },
  { value: 'other', label: '📦 Other' },
];

function PostItemPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-4 pb-24 lg:pb-8">
      <h1 className="text-xl font-extrabold text-foreground">
        Daan Karo 🎁
      </h1>
      <p className="text-sm text-muted-foreground mt-0.5">
        Give something you no longer need — make someone's day!
      </p>

      <form className="mt-5" onSubmit={(e) => e.preventDefault()}>
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-4 lg:space-y-0">
          {/* Left column: Photo upload */}
          <div>
            <label className="text-sm font-bold text-foreground">Photo *</label>
            <div className="mt-1.5 flex h-40 lg:h-[320px] items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
              <div className="text-center">
                <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-1 text-xs text-muted-foreground font-medium">Tap to add photo</p>
              </div>
            </div>
          </div>

          {/* Right column: Form fields */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-foreground">Item Name *</label>
              <input
                type="text"
                placeholder="e.g. Wooden Study Table"
                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-foreground">Category *</label>
              <select className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                <option value="">Category chuno...</option>
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground">Description</label>
              <textarea
                rows={3}
                placeholder="Item ke baare mein thoda batao..."
                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-foreground">Pickup Location (Pincode) *</label>
              <input
                type="text"
                placeholder="e.g. 400058"
                maxLength={6}
                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-foreground">WhatsApp Number *</label>
              <input
                type="tel"
                placeholder="e.g. 9876543210"
                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="mt-6 w-full lg:w-auto lg:px-12 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
        >
          🎁 Post Item — Daan Karo!
        </button>
      </form>
    </div>
  );
}
