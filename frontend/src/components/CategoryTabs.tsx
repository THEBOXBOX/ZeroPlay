interface CategoryTabsProps {
  categories: Array<{ name: string; icon: string }>;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryTabs({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: CategoryTabsProps) {
  return (
    <div className="flex space-x-2 overflow-x-auto">
      {categories.map((category) => (
        <button
          key={category.name}
          onClick={() => onCategoryChange(category.name)}
          className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
            selectedCategory === category.name
              ? 'bg-black text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}