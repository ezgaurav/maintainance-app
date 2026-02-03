import React, { useEffect, useState } from 'react';
import { Card } from '../../components/shared/Card';
import { Badge } from '../../components/shared/Badge';
import { Loading } from '../../components/shared/Loading';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Textarea } from '../../components/shared/Textarea';
import { Modal } from '../../components/shared/Modal';
import { AdminSidebar } from '../../components/shared/AdminSidebar';
import { sparePartService } from '../../services/sparePart.service';
import { SparePart } from '../../types';
import { SPARE_PART_CATEGORIES } from '../../utils/constants';

export const Inventory: React.FC = () => {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    stock: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSpareParts();
  }, []);

  const loadSpareParts = async () => {
    try {
      const data = await sparePartService.getSpareParts();
      setSpareParts(data);
    } catch (error) {
      console.error('Error loading spare parts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (part?: SparePart) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        name: part.name,
        category: part.category,
        description: part.description || '',
        price: part.price.toString(),
        stock: part.stock.toString(),
      });
    } else {
      setEditingPart(null);
      setFormData({
        name: '',
        category: '',
        description: '',
        price: '',
        stock: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (editingPart) {
        await sparePartService.updateSparePart(editingPart._id, data);
      } else {
        await sparePartService.createSparePart(data);
      }

      await loadSpareParts();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving spare part:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this spare part?')) return;
    try {
      await sparePartService.deleteSparePart(id);
      await loadSpareParts();
    } catch (error) {
      console.error('Error deleting spare part:', error);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <Button
              onClick={() => handleOpenModal()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Add Spare Part
            </Button>
          </div>

          {spareParts.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No spare parts found</p>
              </div>
            </Card>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg overflow-hidden">
                <thead className="bg-indigo-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Price</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Stock</th>
                    <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {spareParts.map((part) => (
                    <tr key={part._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{part.name}</p>
                          {part.description && (
                            <p className="text-xs text-gray-600">{part.description}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge variant="info">{part.category}</Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ₹{part.price}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <Badge
                          variant={part.stock > 10 ? 'success' : part.stock > 0 ? 'warning' : 'danger'}
                        >
                          {part.stock}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenModal(part)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(part._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingPart ? 'Edit Spare Part' : 'Add Spare Part'}
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select category</option>
              {SPARE_PART_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <Input
            label="Price (₹)"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
          <Button
            onClick={handleSubmit}
            isLoading={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            {editingPart ? 'Update' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};
