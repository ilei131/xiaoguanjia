import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Filter
} from 'lucide-react';

interface Item {
  id: number;
  name: string;
  category: string;
  location: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  name: string;
}

interface Location {
  id: number;
  name: string;
}

interface Batch {
  quantity: number;
  expiry_date: string;
}

interface ItemFormData {
  name: string;
  category_id: number | null;
  location_id: number | null;
  batches: Batch[];
}

const API_BASE = 'http://localhost:8080/api';

export default function Items() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    category_id: null,
    location_id: null,
    batches: [{ quantity: 1, expiry_date: '' }]
  });

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchLocations();
  }, [page, searchTerm, selectedCategory]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory.toString());
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', page.toString());
      params.append('limit', limit.toString());

      const response = await axios.get(`${API_BASE}/items?${params.toString()}`);
      setItems(response.data.items);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE}/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_BASE}/locations`);
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchItems();
  };

  const handleCategoryFilter = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || null,
      location_id: locations[0]?.id || null,
      batches: [{ quantity: 1, expiry_date: '' }]
    });
    setIsModalOpen(true);
  };

  const openEditModal = async (item: Item) => {
    setIsEditMode(true);
    setEditingItem(item);
    try {
      const response = await axios.get(`${API_BASE}/items/${item.id}`);
      const itemDetail = response.data;
      setFormData({
        name: itemDetail.name,
        category_id: categories.find(c => c.name === itemDetail.category)?.id || null,
        location_id: locations.find(l => l.name === itemDetail.location)?.id || null,
        batches: itemDetail.batches.map((b: any) => ({
          quantity: b.quantity,
          expiry_date: b.expiry_date
        }))
      });
    } catch (error) {
      console.error('Failed to fetch item details:', error);
      setFormData({
        name: item.name,
        category_id: categories.find(c => c.name === item.category)?.id || null,
        location_id: locations.find(l => l.name === item.location)?.id || null,
        batches: [{ quantity: item.quantity, expiry_date: '' }]
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个物品吗？')) return;
    try {
      await axios.delete(`${API_BASE}/items/${id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validBatches = formData.batches.filter(b => b.expiry_date && b.quantity > 0);
      const totalQuantity = validBatches.reduce((sum, b) => sum + b.quantity, 0);
      const payload = {
        name: formData.name,
        category_id: formData.category_id,
        location_id: formData.location_id,
        quantity: totalQuantity,
        batches: validBatches
      };

      if (isEditMode && editingItem) {
        await axios.put(`${API_BASE}/items/${editingItem.id}`, payload);
      } else {
        await axios.post(`${API_BASE}/items`, payload);
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  const addBatch = () => {
    setFormData({
      ...formData,
      batches: [...formData.batches, { quantity: 1, expiry_date: '' }]
    });
  };

  const removeBatch = (index: number) => {
    const newBatches = formData.batches.filter((_, i) => i !== index);
    setFormData({ ...formData, batches: newBatches });
  };

  const updateBatch = (index: number, field: 'quantity' | 'expiry_date', value: string | number) => {
    const newBatches = [...formData.batches];
    newBatches[index] = { ...newBatches[index], [field]: value };
    setFormData({ ...formData, batches: newBatches });
  };

  return (
    <Layout
      title="物品管理"
      actions={
        <button
          onClick={openAddModal}
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-soft"
        >
          <Plus size={16} />
          添加物品
        </button>
      }
    >
      <div className="p-6">
        {/* 搜索和筛选 */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="搜索物品名称..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-all duration-300"
              >
                搜索
              </button>
            </form>

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                value={selectedCategory || ''}
                onChange={(e) => handleCategoryFilter(e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 物品列表 */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">物品名称</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">分类</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">存放地点</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">数量</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">加载中...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">暂无物品</td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 font-medium text-gray-900">{item.name}</td>
                      <td className="py-4 px-6 text-gray-600">{item.category}</td>
                      <td className="py-4 px-6 text-gray-600">{item.location}</td>
                      <td className="py-4 px-6 text-gray-600">{item.quantity}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-all duration-200"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 分页 */}
          {total > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                共 {total} 条记录，第 {page} / {Math.ceil(total / limit)} 页
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(Math.ceil(total / limit), p + 1))}
                  disabled={page >= Math.ceil(total / limit)}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 添加/编辑物品模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditMode ? '编辑物品' : '添加物品'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">物品名称</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入物品名称"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    value={formData.category_id || ''}
                    onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">存放地点</label>
                  <select
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    value={formData.location_id || ''}
                    onChange={(e) => setFormData({ ...formData, location_id: Number(e.target.value) })}
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">批次信息</label>
                  <span className="text-sm text-gray-500">
                    总数量：<span className="font-semibold text-primary-600">
                      {formData.batches.reduce((sum, b) => sum + (b.quantity || 0), 0)}
                    </span>
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-3">添加不同保质期的物品批次，数量将自动汇总</p>
                <div className="space-y-3">
                  {formData.batches.map((batch, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">数量</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="数量"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                          value={batch.quantity}
                          onChange={(e) => updateBatch(index, 'quantity', Number(e.target.value))}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">保质期至</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                          value={batch.expiry_date}
                          onChange={(e) => updateBatch(index, 'expiry_date', e.target.value)}
                        />
                      </div>
                      {formData.batches.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBatch(index)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-200 mt-5"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addBatch}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-400 hover:text-primary-600 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} />
                    添加批次
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all duration-300"
                >
                  {isEditMode ? '保存' : '添加'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
