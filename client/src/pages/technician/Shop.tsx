import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { sparePartService } from '../../services/sparePart.service';
import { useCartStore } from '../../store';
import { SparePart } from '../../types';
import { Input } from '../../components/shared/Input';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export const Shop: React.FC = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [filteredParts, setFilteredParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart } = useCartStore();

  useEffect(() => {
    loadSpareParts();
  }, []);

  useEffect(() => {
    filterParts();
  }, [searchQuery, selectedCategory, spareParts]);

  const loadSpareParts = async () => {
    try {
      const data = await sparePartService.getSpareParts();
      setSpareParts(data);
      setFilteredParts(data);
    } catch (error) {
      console.error('Error loading spare parts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterParts = () => {
    let filtered = spareParts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((part) => part.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (part) =>
          part.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          part.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredParts(filtered);
  };

  const categories = ['all', ...Array.from(new Set(spareParts.map((p) => p.category)))];

  const handleAddToCart = (part: SparePart) => {
    addToCart(part, 1);
    alert('Added to cart!');
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Spare Parts Shop</h1>

        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search spare parts..."
              className="pl-10"
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-emerald-900 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {filteredParts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No spare parts found</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredParts.map((part) => (
              <Card key={part._id}>
                {part.image && (
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{part.name}</h3>
                <Badge variant="info" size="sm" className="mb-2">
                  {part.category}
                </Badge>
                {part.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {part.description}
                  </p>
                )}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-2xl font-bold text-emerald-900">
                    ₹{part.price}
                  </span>
                  <span
                    className={`text-sm ${
                      part.stock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {part.stock > 0 ? `${part.stock} in stock` : 'Out of stock'}
                  </span>
                </div>
                <Button
                  onClick={() => handleAddToCart(part)}
                  disabled={part.stock === 0}
                  className="w-full"
                  size="sm"
                >
                  Add to Cart
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};
