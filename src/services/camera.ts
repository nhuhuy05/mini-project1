import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

export async function takePhoto(): Promise<string | null> {
  try {
    const image = await Camera.getPhoto({
      quality: 85,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Prompt, // Cho phép người dùng chọn Chụp ảnh hoặc Chọn từ thư viện
      promptLabelHeader: 'Minh chứng hiện trường VKU',
      promptLabelPhoto: 'Chọn từ bộ sưu tập',
      promptLabelPicture: 'Chụp ảnh mới',
    });

    return image.dataUrl || null;
  } catch (error: unknown) {
    // Nếu người dùng hủy chụp (User cancelled)
    const err = error as Error;
    if (err && err.message && (err.message.includes('User cancelled') || err.message.includes('cancelled'))) {
      return null;
    }
    console.warn('Capacitor camera failed or unavailable, fallback to file input:', error);
    return null;
  }
}

/**
 * Chuyển đổi File đối tượng từ input HTML5 sang chuỗi Base64 DataUrl
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
