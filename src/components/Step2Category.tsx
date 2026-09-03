import React from 'react';
import { Monitor, Projector as ProjectorIcon, Snowflake, Zap, Armchair } from 'lucide-react';
import type { FacilityCategory, SurveyFormData } from '../types/survey';

interface Step2CategoryProps {
  data: SurveyFormData;
  onChange: (fields: Partial<SurveyFormData>) => void;
}

interface CategoryOption {
  id: FacilityCategory;
  name: string;
  description: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryOption[] = [
  {
    id: 'Hardware',
    name: 'Hardware / Máy tính',
    description: 'PC bàn, Màn hình, Chuột, Bàn phím phòng Lab',
    icon: <Monitor size={24} />,
  },
  {
    id: 'Projector',
    name: 'Máy chiếu / Màn chiếu',
    description: 'Projector, Điều khiển, Cáp HDMI/VGA, Màn cuộn',
    icon: <ProjectorIcon size={24} />,
  },
  {
    id: 'AC',
    name: 'Điều hòa / Thông gió',
    description: 'Máy lạnh cassette, Remote, Quạt đảo trần',
    icon: <Snowflake size={24} />,
  },
  {
    id: 'Electrical',
    name: 'Hệ thống điện',
    description: 'Ổ cắm điện, Công tắc, Bóng đèn LED, Aptomat',
    icon: <Zap size={24} />,
  },
  {
    id: 'Furniture',
    name: 'Bàn ghế / Nội thất',
    description: 'Bàn học, Ghế gấp, Bục giảng, Bảng từ viết bút',
    icon: <Armchair size={24} />,
  },
];

export const Step2Category: React.FC<Step2CategoryProps> = ({ data, onChange }) => {
  return (
    <div className="form-content">
      <div>
        <h2 className="section-title">Phân loại cơ sở vật chất</h2>
        <p className="section-subtitle">Chọn nhóm thiết bị đang được kiểm tra thực tế</p>
      </div>

      <div className="category-grid">
        {CATEGORIES.map((cat) => {
          const isSelected = data.category === cat.id;

          return (
            <div
              key={cat.id}
              className={`category-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onChange({ category: cat.id })}
            >
              <div className="category-icon-wrapper">{cat.icon}</div>
              <span className="category-title">{cat.name}</span>
              <span className="category-desc">{cat.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
