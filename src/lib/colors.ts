export const colorMap: { [key: string]: string } = {
    // Vietnamese colors
    'Đỏ': '#ef4444',
    'Xanh dương': '#3b82f6',
    'Xanh nhạt': '#93c5fd',
    'Xanh lá': '#22c55e',
    'Vàng': '#eab308',
    'Hồng': '#ec4899',
    'Tím': '#a855f7',
    'Cam': '#f97316',
    'Nâu': '#a16207',
    'Đen': '#000000',
    'Trắng': '#ffffff',
    'Xám': '#6b7280',
    'Xám đậm': '#374151',
    'Xám nhạt': '#d1d5db',
    'Bạc': '#c0c0c0',
    'Vàng kim': '#ffd700',

    // English colors
    'Red': '#ef4444',
    'Blue': '#3b82f6',
    'Light Blue': '#93c5fd',
    'Green': '#22c55e',
    'Yellow': '#eab308',
    'Pink': '#ec4899',
    'Purple': '#a855f7',
    'Orange': '#f97316',
    'Brown': '#a16207',
    'Black': '#000000',
    'White': '#ffffff',
    'Gray': '#6b7280',
    'Dark Gray': '#374151',
    'Light Gray': '#d1d5db',
    'Silver': '#c0c0c0',
    'Gold': '#ffd700',

    // Japanese colors
    '赤': '#ef4444',
    '青': '#3b82f6',
    '薄い青': '#93c5fd',
    '緑': '#22c55e',
    '黄色': '#eab308',
    'ピンク': '#ec4899',
    '紫': '#a855f7',
    'オレンジ': '#f97316',
    '茶色': '#a16207',
    '黒': '#000000',
    '白': '#ffffff',
    'グレー': '#6b7280',
    '濃いグレー': '#374151',
    '薄いグレー': '#d1d5db',
    'シルバー': '#c0c0c0',
    'ゴールド': '#ffd700',
};

// Helper function to get hex color from color name
export const getColorHex = (colorName: string): string => {
    // Check if it's already a hex color
    if (colorName.startsWith('#')) {
        return colorName;
    }

    // Return mapped color or default gray
    return colorMap[colorName] || '#6b7280';
};
