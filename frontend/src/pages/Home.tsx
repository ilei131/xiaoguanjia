import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Package,
  Plus,
  AlertTriangle,
  Clock
} from 'lucide-react';

interface ExpiringItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  location: string;
  expiry: string;
  status: string;
}

interface Stat {
  title: string;
  value: string;
  icon: any;
  color: string;
}

export default function Home() {
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  const recentItems: ExpiringItem[] = [
    { id: 1, name: '牛奶', category: '食品', quantity: 2, location: '冰箱', expiry: '2024-01-15', status: 'warning' },
    { id: 2, name: '鸡蛋', category: '食品', quantity: 10, location: '冰箱', expiry: '2024-01-20', status: 'success' },
    { id: 3, name: '面包', category: '食品', quantity: 1, location: '面包箱', expiry: '2024-01-10', status: 'danger' },
    { id: 4, name: '洗发水', category: '日用品', quantity: 1, location: '浴室', expiry: '2024-06-01', status: 'success' },
  ];

  const stats: Stat[] = [
    { title: '总物品数', value: '128', icon: Package, color: 'primary' },
    { title: '临期物品', value: '5', icon: AlertTriangle, color: 'warning' },
    { title: '过期物品', value: '2', icon: DangerIcon, color: 'danger' },
    { title: '分类数', value: '8', icon: BarChart3, color: 'accent' },
  ];

  return (
    <Layout title="仪表盘">
      <div className="p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl shadow-soft p-6 transition-transform duration-300 hover:scale-105">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100 text-${stat.color}-500`}>
                    <Icon size={24} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 最近物品 */}
        <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">最近物品</h3>
            <button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-soft">
              <Plus size={16} />
              <span>添加物品</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">物品名称</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">分类</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">数量</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">存放地点</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">保质期</th>
                  <th className="text-left py-3 px-4 text-gray-500 font-medium">状态</th>
                </tr>
              </thead>
              <tbody>
                {recentItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-300"
                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                  >
                    <td className="py-4 px-4 text-gray-900 font-medium">{item.name}</td>
                    <td className="py-4 px-4 text-gray-600">{item.category}</td>
                    <td className="py-4 px-4 text-gray-600">{item.quantity}</td>
                    <td className="py-4 px-4 text-gray-600">{item.location}</td>
                    <td className="py-4 px-4 text-gray-600">{item.expiry}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.status === 'success' ? 'bg-green-100 text-green-800' : item.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {item.status === 'success' && '正常'}
                        {item.status === 'warning' && '临期'}
                        {item.status === 'danger' && '过期'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 临期提醒 */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">临期提醒</h3>
            <a href="#" className="text-primary-500 hover:text-primary-600 text-sm font-medium">查看全部</a>
          </div>

          <div className="space-y-4">
            {recentItems.filter(item => item.status === 'warning' || item.status === 'danger').map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-soft transition-all duration-300">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'danger' ? 'bg-red-100 text-red-500' : 'bg-yellow-100 text-yellow-500'}`}>
                  {item.status === 'danger' ? <AlertTriangle size={20} /> : <Clock size={20} />}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{item.name}</p>
                  <p className="text-gray-500 text-sm">{item.category} · {item.location}</p>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${item.status === 'danger' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {item.status === 'danger' ? '已过期' : '即将过期'}
                  </p>
                  <p className="text-gray-500 text-sm">{item.expiry}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DangerIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}

function BarChart3(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3v18h18"></path>
      <path d="M18 17V9"></path>
      <path d="M13 17V5"></path>
      <path d="M8 17v-3"></path>
    </svg>
  );
}
