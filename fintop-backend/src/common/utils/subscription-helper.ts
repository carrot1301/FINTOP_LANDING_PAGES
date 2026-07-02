import { SUBSCRIPTION_TIER } from '@prisma/client';

export function isFeatureAllowed(userFeatures: string[] | undefined | null, requiredTier: SUBSCRIPTION_TIER): boolean {
  if (!userFeatures || userFeatures.length === 0) return false;

  const standardFeatures = ['Tra cứu cổ phiếu', 'Phân tích cơ bản', 'FinTop AI phân tích', 'Tool & dữ liệu cơ bản'];
  const silverFeatures = ['Bộ lọc cổ phiếu chuyên nghiệp', 'Nghiên cứu & phân tích chuyên sâu', 'Tool & dữ liệu nâng cao', 'PRO Data và PRO Analysis', 'Full đặc quyền PRO'];
  const goldFeatures = ['Full đặc quyền PRO', 'Kết nối chuyên gia', 'Phân tích chuyên gia', 'Liên kết tài khoản chứng khoán', 'Full đặc quyền V.I.P'];
  const diamondFeatures = ['Full đặc quyền V.I.P', 'Cố vấn 1-1 chuyên gia', 'Hỗ trợ chiến lược danh mục'];

  if (requiredTier === SUBSCRIPTION_TIER.STANDARD) {
    return userFeatures.some(f => 
      standardFeatures.includes(f) || 
      silverFeatures.includes(f) || 
      goldFeatures.includes(f) || 
      diamondFeatures.includes(f)
    );
  }

  if (requiredTier === SUBSCRIPTION_TIER.SILVER) {
    return userFeatures.some(f => 
      silverFeatures.includes(f) || 
      goldFeatures.includes(f) || 
      diamondFeatures.includes(f)
    );
  }

  if (requiredTier === SUBSCRIPTION_TIER.GOLD) {
    return userFeatures.some(f => 
      goldFeatures.includes(f) || 
      diamondFeatures.includes(f)
    );
  }

  if (requiredTier === SUBSCRIPTION_TIER.DIAMOND) {
    return userFeatures.some(f => 
      diamondFeatures.includes(f)
    );
  }

  return false;
}

export function getFeaturesByTier(tier: SUBSCRIPTION_TIER): string[] {
  const standardFeatures = ['Tra cứu cổ phiếu', 'Phân tích cơ bản', 'FinTop AI phân tích', 'Tool & dữ liệu cơ bản'];
  const silverFeatures = [...standardFeatures, 'Bộ lọc cổ phiếu chuyên nghiệp', 'Nghiên cứu & phân tích chuyên sâu', 'Tool & dữ liệu nâng cao', 'PRO Data và PRO Analysis', 'Full đặc quyền PRO'];
  const goldFeatures = [...silverFeatures, 'Kết nối chuyên gia', 'Phân tích chuyên gia', 'Liên kết tài khoản chứng khoán', 'Full đặc quyền V.I.P'];
  const diamondFeatures = [...goldFeatures, 'Cố vấn 1-1 chuyên gia', 'Hỗ trợ chiến lược danh mục'];

  if (tier === SUBSCRIPTION_TIER.DIAMOND) return diamondFeatures;
  if (tier === SUBSCRIPTION_TIER.GOLD) return goldFeatures;
  if (tier === SUBSCRIPTION_TIER.SILVER) return silverFeatures;
  return standardFeatures;
}
