import React from 'react';
import { Star, AlertCircle, FileText } from 'lucide-react';
import type { SurveyFormData } from '../types/survey';

interface Step3ConditionProps {
  data: SurveyFormData;
  onChange: (fields: Partial<SurveyFormData>) => void;
}

const RATING_DESCRIPTIONS: Record<number, { text: string; color: string }> = {
  1: { text: '1 Sao: Hỏng hoàn toàn (Nguy hiểm / Không thể sử dụng)', color: '#ef4444' },
  2: { text: '2 Sao: Tình trạng kém (Cần sửa chữa / Thay linh kiện)', color: '#f97316' },
  3: { text: '3 Sao: Trung bình (Dùng tạm được, có hao mòn)', color: '#eab308' },
  4: { text: '4 Sao: Tốt (Hoạt động ổn định, trầy xước nhẹ)', color: '#10b981' },
  5: { text: '5 Sao: Rất tốt (Thiết bị mới, hoạt động hoàn hảo)', color: '#059669' },
};

const COMMON_DEFECTS = [
  'Mất nguồn / Không bật được',
  'Chập chờn tín hiệu',
  'Mất remote điều khiển',
  'Tiếng ồn / Quạt kêu to',
  'Gãy chân / Lỏng ốc vít',
  'Bóng mờ / Hết mực đèn',
  'Rò rỉ nước / Chảy dầu',
];

export const Step3Condition: React.FC<Step3ConditionProps> = ({ data, onChange }) => {
  const currentRatingDesc = data.rating > 0 ? RATING_DESCRIPTIONS[data.rating] : null;

  const handleAddDefectTag = (tag: string) => {
    if (!data.defectNotes.includes(tag)) {
      const newNotes = data.defectNotes ? `${data.defectNotes}, ${tag}` : tag;
      onChange({ defectNotes: newNotes });
    }
  };

  return (
    <div className="form-content">
      <div>
        <h2 className="section-title">Đánh giá tình trạng</h2>
        <p className="section-subtitle">Chấm điểm chất lượng và ghi chú các hư hỏng phát hiện</p>
      </div>

      {/* 1-5 Star Rating Box */}
      <div className="star-rating-box">
        <label className="form-label">
          <AlertCircle size={16} className="text-primary" />
          <span>Mức độ hoạt động & Tình trạng</span>
          <span className="required">*</span>
        </label>

        <div className="stars-row">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = star <= data.rating;
            return (
              <button
                key={star}
                type="button"
                className="star-btn"
                onClick={() => onChange({ rating: star })}
                title={`${star} sao`}
              >
                <Star
                  size={34}
                  fill={isFilled ? '#f59e0b' : 'none'}
                  stroke={isFilled ? '#f59e0b' : 'var(--text-light)'}
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>

        {currentRatingDesc ? (
          <span className="star-text" style={{ color: currentRatingDesc.color }}>
            {currentRatingDesc.text}
          </span>
        ) : (
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Chạm vào sao để đánh giá từ 1 đến 5
          </span>
        )}
      </div>

      {/* Ghi chú lỗi chi tiết */}
      <div className="form-group">
        <label className="form-label">
          <FileText size={16} className="text-primary" />
          <span>Ghi chú lỗi kỹ thuật / Khuyết tật thiết bị</span>
          <span className="required">*</span>
        </label>
        <textarea
          className="form-textarea"
          placeholder="Mô tả cụ thể triệu chứng lỗi, vị trí hư hại, yêu cầu thay thế vật tư..."
          value={data.defectNotes}
          onChange={(e) => onChange({ defectNotes: e.target.value })}
        />
      </div>

      {/* Thẻ lỗi phổ biến chèn nhanh */}
      <div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Gợi ý triệu chứng nhanh:
        </p>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {COMMON_DEFECTS.map((defect) => (
            <button
              key={defect}
              type="button"
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '9999px' }}
              onClick={() => handleAddDefectTag(defect)}
            >
              + {defect}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
