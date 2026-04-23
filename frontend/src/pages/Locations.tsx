import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '@/components/Layout';
import {
  Plus,
  Edit,
  Trash2,
  X
} from 'lucide-react';

interface Location {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface LocationFormData {
  name: string;
}

const API_BASE = 'http://localhost:8080/api';

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<LocationFormData>({
    name: ''
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/locations`);
      setLocations(response.data.locations || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingLocation(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (location: Location) => {
    setIsEditMode(true);
    setEditingLocation(location);
    setFormData({ name: location.name });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个地点吗？')) return;
    try {
      await axios.delete(`${API_BASE}/locations/${id}`);
      fetchLocations();
    } catch (error) {
      console.error('Failed to delete location:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditMode && editingLocation) {
        await axios.put(`${API_BASE}/locations/${editingLocation.id}`, formData);
      } else {
        await axios.post(`${API_BASE}/locations`, formData);
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  return (
    <Layout
      title="地点管理"
      actions={
        <button
          onClick={openAddModal}
          className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-soft"
        >
          <Plus size={16} />
          添加地点
        </button>
      }
    >
      <div className="p-6">
        {/* 地点列表 */}
        <div className="bg-white rounded-xl shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">地点名称</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">创建时间</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold">操作</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">加载中...</td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">暂无地点</td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
                      <td className="py-4 px-6 font-medium text-gray-900">{location.name}</td>
                      <td className="py-4 px-6 text-gray-600">{new Date(location.created_at).toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(location)}
                            className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-all duration-200"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(location.id)}
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
        </div>
      </div>

      {/* 添加/编辑地点模态框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                {isEditMode ? '编辑地点' : '添加地点'}
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
                <label className="block text-sm font-medium text-gray-700 mb-2">地点名称</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="请输入地点名称"
                />
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
