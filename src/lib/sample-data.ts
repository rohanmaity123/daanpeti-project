export type Category = 'clothes' | 'furniture' | 'books' | 'electronics' | 'toys' | 'other';

export type ItemStatus = 'available' | 'claimed';

export interface DonationItem {
  id: string;
  name: string;
  description: string;
  category: Category;
  image: string;
  location: string;
  pincode: string;
  donorName: string;
  whatsappNumber: string;
  timePosted: string;
  status: ItemStatus;
  claimedBy?: string;
}

export const categoryLabels: Record<Category, string> = {
  clothes: '👕 Kapde',
  furniture: '🪑 Furniture',
  books: '📚 Kitaabein',
  electronics: '📱 Electronics',
  toys: '🧸 Khilone',
  other: '📦 Other',
};

export const categoryColors: Record<Category, string> = {
  clothes: 'bg-tag-clothes text-foreground',
  furniture: 'bg-tag-furniture text-foreground',
  books: 'bg-tag-books text-foreground',
  electronics: 'bg-tag-electronics text-foreground',
  toys: 'bg-tag-toys text-foreground',
  other: 'bg-tag-other text-foreground',
};

export const filterCategories: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: '🔥 Sab' },
  { value: 'clothes', label: '👕 Kapde' },
  { value: 'furniture', label: '🪑 Furniture' },
  { value: 'books', label: '📚 Books' },
  { value: 'electronics', label: '📱 Electronics' },
  { value: 'toys', label: '🧸 Toys' },
  { value: 'other', label: '📦 Other' },
];

export const sampleItems: DonationItem[] = [
  {
    id: '1',
    name: 'Wooden Study Table',
    description: 'Solid wood study table in great condition. Perfect for students. Minor scratches but very sturdy. Used for 2 years. Legs are all intact.',
    category: 'furniture',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    location: 'Andheri West, Mumbai',
    pincode: '400058',
    donorName: 'Rahul S.',
    whatsappNumber: '919876543210',
    timePosted: '2 ghante pehle',
    status: 'available',
  },
  {
    id: '2',
    name: 'Kids Winter Jacket (Age 4-6)',
    description: 'Warm winter jacket for kids, hardly worn. Bright red color, perfect for chilly winters. Washed and ready to give away.',
    category: 'clothes',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=300&fit=crop',
    location: 'Koramangala, Bangalore',
    pincode: '560034',
    donorName: 'Priya M.',
    whatsappNumber: '919876543211',
    timePosted: '5 ghante pehle',
    status: 'claimed',
    claimedBy: 'Anita V.',
  },
  {
    id: '3',
    name: 'NCERT Books Class 10 (Full Set)',
    description: 'Complete set of NCERT textbooks for Class 10. All subjects included. Some highlighting inside but all pages intact. Best for students who need them.',
    category: 'books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop',
    location: 'Dwarka, Delhi',
    pincode: '110075',
    donorName: 'Amit K.',
    whatsappNumber: '919876543212',
    timePosted: '1 din pehle',
    status: 'available',
  },
  {
    id: '4',
    name: 'Samsung Galaxy J7 (Working)',
    description: 'Old Samsung J7 in working condition. Battery holds charge for about 4-5 hours. Screen has a small crack on the corner but touch works fine.',
    category: 'electronics',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop',
    location: 'Salt Lake, Kolkata',
    pincode: '700091',
    donorName: 'Suman D.',
    whatsappNumber: '919876543213',
    timePosted: '3 ghante pehle',
    status: 'claimed',
    claimedBy: 'Ravi T.',
  },
  {
    id: '5',
    name: 'Teddy Bear (Large)',
    description: 'Large fluffy teddy bear, about 3 feet tall. Clean and in excellent condition. My daughter has outgrown it. Would make some child very happy! 🧸',
    category: 'toys',
    image: 'https://images.unsplash.com/photo-1559715541-5daf8a0296d0?w=400&h=300&fit=crop',
    location: 'Baner, Pune',
    pincode: '411045',
    donorName: 'Neha R.',
    whatsappNumber: '919876543214',
    timePosted: '6 ghante pehle',
    status: 'available',
  },
  {
    id: '6',
    name: 'Pressure Cooker 5L',
    description: 'Prestige pressure cooker, 5 litre capacity. Works perfectly, just bought a new one. Gasket is new. Comes with lid and whistle.',
    category: 'other',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    location: 'Vastrapur, Ahmedabad',
    pincode: '380015',
    donorName: 'Kiran P.',
    whatsappNumber: '919876543215',
    timePosted: '30 min pehle',
    status: 'available',
  },
];

// Sample data for "My Items" tabs
export const myGivenItems: DonationItem[] = [
  sampleItems[0],
  { ...sampleItems[1], donorName: 'You' },
  sampleItems[5],
];

export const myReceivedItems: DonationItem[] = [
  { ...sampleItems[3], status: 'claimed', claimedBy: 'You' },
];
