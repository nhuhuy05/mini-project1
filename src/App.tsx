import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Send, Check } from 'lucide-react';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { Step1Location } from './components/Step1Location';
import { Step2Category } from './components/Step2Category';
import { Step3Condition } from './components/Step3Condition';
import { Step4MediaReview } from './components/Step4MediaReview';
import { SyncQueueModal } from './components/SyncQueueModal';

import {
  saveDraft,
  loadDraft,
  clearDraft,
  saveSurvey,
  getPendingSurveys,
} from './services/db';
import { networkService } from './services/network';
import { syncEngine } from './services/sync';
import type { SurveyFormData, SurveyRecord, NetworkState } from './types/survey';

const INITIAL_FORM_DATA: SurveyFormData = {
  building: '',
  floor: '',
  room: '',
  category: '',
  rating: 0,
  defectNotes: '',
  photoBase64: undefined,
};

export default function App() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<SurveyFormData>(INITIAL_FORM_DATA);
  const [network, setNetwork] = useState<NetworkState>({
    connected: true,
    connectionType: 'wifi',
  });
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);
  const [draftToastVisible, setDraftToastVisible] = useState<boolean>(false);

  // 1. Khởi tạo theo dõi mạng và hàng đợi đồng bộ
  useEffect(() => {
    networkService.init().then((state) => setNetwork(state));

    const unsubscribeNetwork = networkService.subscribe((state) => {
      setNetwork(state);
    });

    const unsubscribeSync = syncEngine.subscribe((syncing, count) => {
      setIsSyncing(syncing);
      setPendingCount(count);
    });

    // Cập nhật số lượng phiếu chờ ban đầu
    getPendingSurveys().then((list) => setPendingCount(list.length));

    return () => {
      unsubscribeNetwork();
      unsubscribeSync();
    };
  }, []);

  // 2. Khôi phục bản nháp từ IndexedDB khi mở ứng dụng (F5 không mất dữ liệu)
  useEffect(() => {
    loadDraft().then((saved) => {
      if (saved && saved.data) {
        setFormData(saved.data);
        if (saved.step >= 1 && saved.step <= 4) {
          setCurrentStep(saved.step);
        }
      }
    });
  }, []);

  // 3. Tự động lưu bản nháp vào IndexedDB theo thời gian thực (Real-time Persistence)
  const persistDraft = useCallback(async (data: SurveyFormData, step: number) => {
    // Chỉ lưu nếu người dùng đã bắt đầu nhập bất kỳ trường nào
    const hasData =
      data.building ||
      data.floor ||
      data.room ||
      data.category ||
      data.rating > 0 ||
      data.defectNotes ||
      data.photoBase64;

    if (hasData) {
      await saveDraft(data, step);
      setDraftToastVisible(true);
      const timer = setTimeout(() => setDraftToastVisible(false), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleUpdateForm = (fields: Partial<SurveyFormData>) => {
    setFormData((prev) => {
      const next = { ...prev, ...fields };
      persistDraft(next, currentStep);
      return next;
    });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    persistDraft(formData, newStep);
  };

  // 4. Kiểm tra hợp lệ dữ liệu của từng bước (Validation)
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.building && formData.floor && formData.room.trim());
      case 2:
        return Boolean(formData.category);
      case 3:
        return Boolean(formData.rating > 0 && formData.defectNotes.trim());
      case 4:
        return true; // Bước 4 cho phép gửi (ảnh là tùy chọn hoặc đã đính kèm)
      default:
        return false;
    }
  };

  // 5. Xử lý nộp phiếu khảo sát (Submit Survey)
  const handleSubmitSurvey = async () => {
    const surveyId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `vku-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const newRecord: SurveyRecord = {
      ...formData,
      id: surveyId,
      createdAt: new Date().toISOString(),
      status: 'PENDING_SYNC',
    };

    // Lưu vào IndexedDB
    await saveSurvey(newRecord);

    // Xóa bản nháp đã nộp thành công
    await clearDraft();
    setFormData(INITIAL_FORM_DATA);
    setCurrentStep(1);

    // Cập nhật số lượng pending
    const pendingList = await getPendingSurveys();
    setPendingCount(pendingList.length);

    // Nếu đang có kết nối mạng, kích hoạt đồng bộ tự động ngay
    if (network.connected) {
      syncEngine.syncPending();
    }

    alert(
      network.connected
        ? '🎉 Phiếu khảo sát đã được gửi và đang đồng bộ lên hệ thống!'
        : '📥 Bạn đang Offline. Phiếu khảo sát đã được lưu an toàn vào Hàng đợi IndexedDB và sẽ tự gửi khi có mạng!'
    );
  };

  return (
    <>
      <Header
        network={network}
        pendingCount={pendingCount}
        isSyncing={isSyncing}
        onOpenQueue={() => setIsQueueOpen(true)}
      />

      <StepIndicator
        currentStep={currentStep}
        totalSteps={4}
        onSelectStep={(step) => handleStepChange(step)}
      />

      {/* Nội dung form theo từng bước */}
      {currentStep === 1 && (
        <Step1Location data={formData} onChange={handleUpdateForm} />
      )}
      {currentStep === 2 && (
        <Step2Category data={formData} onChange={handleUpdateForm} />
      )}
      {currentStep === 3 && (
        <Step3Condition data={formData} onChange={handleUpdateForm} />
      )}
      {currentStep === 4 && (
        <Step4MediaReview
          data={formData}
          network={network}
          onChange={handleUpdateForm}
        />
      )}

      {/* Thông báo lưu nháp IndexedDB mượt mà */}
      {draftToastVisible && (
        <div className="draft-toast">
          <Check size={14} color="#10b981" />
          <span>Đã lưu nháp IndexedDB</span>
        </div>
      )}

      {/* Thanh điều hướng dưới cùng */}
      <footer className="bottom-nav">
        {currentStep > 1 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleStepChange(currentStep - 1)}
          >
            <ChevronLeft size={18} />
            <span>Quay lại</span>
          </button>
        )}

        {currentStep < 4 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!isStepValid(currentStep)}
            onClick={() => handleStepChange(currentStep + 1)}
          >
            <span>Tiếp theo</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmitSurvey}
          >
            <Send size={18} />
            <span>{network.connected ? 'Gửi khảo sát' : 'Lưu vào hàng đợi'}</span>
          </button>
        )}
      </footer>

      {/* Modal xem danh sách hàng đợi đồng bộ */}
      <SyncQueueModal
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        onSurveysChanged={() => {
          getPendingSurveys().then((list) => setPendingCount(list.length));
        }}
      />
    </>
  );
}
