package com.bookstore.service;

import com.bookstore.dto.CouponDTO;
import com.bookstore.model.Coupon;
import com.bookstore.repository.CouponRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public CouponDTO createCoupon(CouponDTO couponDTO) {
        validateCouponDateRange(couponDTO.getStartDate(), couponDTO.getEndDate());

        Coupon coupon = new Coupon();
        coupon.setCode(couponDTO.getCode() == null ? null : couponDTO.getCode().trim().toUpperCase());
        coupon.setDescription(couponDTO.getDescription());
        coupon.setDiscountValue(couponDTO.getDiscountValue());
        coupon.setDiscountType(couponDTO.getDiscountType());
        coupon.setMinimumAmount(couponDTO.getMinimumAmount());
        coupon.setMaxUsage(couponDTO.getMaxUsage());
        coupon.setCurrentUsage(0);
        coupon.setStartDate(couponDTO.getStartDate());
        coupon.setEndDate(couponDTO.getEndDate());
        coupon.setActive(couponDTO.getActive() == null ? true : couponDTO.getActive());

        Coupon savedCoupon = couponRepository.save(coupon);
        return convertToDTO(savedCoupon);
    }

    public CouponDTO getCouponById(String id) {
        return couponRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public CouponDTO getCouponByCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            return null;
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElse(null);
        if (coupon == null) {
            return null;
        }

        validateCouponAvailability(coupon);
        return convertToDTO(coupon);
    }

    public void consumeCouponUsage(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("Mã giảm giá không hợp lệ");
        }

        Coupon coupon = couponRepository.findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không tồn tại"));

        validateCouponAvailability(coupon);

        int currentUsage = coupon.getCurrentUsage() == null ? 0 : coupon.getCurrentUsage();
        coupon.setCurrentUsage(currentUsage + 1);
        couponRepository.save(coupon);
    }

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public CouponDTO updateCoupon(String id, CouponDTO couponDTO) {
        Coupon coupon = couponRepository.findById(id).orElse(null);
        if (coupon == null) return null;

        validateCouponDateRange(couponDTO.getStartDate(), couponDTO.getEndDate());

        coupon.setCode(couponDTO.getCode() == null ? null : couponDTO.getCode().trim().toUpperCase());
        coupon.setDescription(couponDTO.getDescription());
        coupon.setDiscountValue(couponDTO.getDiscountValue());
        coupon.setDiscountType(couponDTO.getDiscountType());
        coupon.setMinimumAmount(couponDTO.getMinimumAmount());
        coupon.setMaxUsage(couponDTO.getMaxUsage());
        coupon.setStartDate(couponDTO.getStartDate());
        coupon.setEndDate(couponDTO.getEndDate());
        coupon.setActive(couponDTO.getActive());

        Coupon updatedCoupon = couponRepository.save(coupon);
        return convertToDTO(updatedCoupon);
    }

    public void deleteCoupon(String id) {
        couponRepository.deleteById(id);
    }

    private void validateCouponDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Ngày kết thúc không được trước ngày bắt đầu");
        }
    }

    private void validateCouponAvailability(Coupon coupon) {
        if (coupon == null) {
            throw new IllegalArgumentException("Mã giảm giá không tồn tại");
        }

        if (!Boolean.TRUE.equals(coupon.getActive())) {
            throw new IllegalArgumentException("Mã giảm giá đã bị vô hiệu hóa");
        }

        LocalDateTime now = LocalDateTime.now();
        if (coupon.getStartDate() != null && now.isBefore(coupon.getStartDate())) {
            throw new IllegalArgumentException("Mã giảm giá chưa đến thời gian sử dụng");
        }

        if (coupon.getEndDate() != null && now.isAfter(coupon.getEndDate())) {
            throw new IllegalArgumentException("Mã giảm giá đã hết hạn");
        }

        Integer maxUsage = coupon.getMaxUsage();
        if (maxUsage != null && maxUsage > 0) {
            int currentUsage = coupon.getCurrentUsage() == null ? 0 : coupon.getCurrentUsage();
            if (currentUsage >= maxUsage) {
                throw new IllegalArgumentException("Mã giảm giá đã hết lượt sử dụng");
            }
        }
    }

    private CouponDTO convertToDTO(Coupon coupon) {
        CouponDTO dto = new CouponDTO();
        dto.setId(coupon.getId());
        dto.setCode(coupon.getCode());
        dto.setDescription(coupon.getDescription());
        dto.setDiscountValue(coupon.getDiscountValue());
        dto.setDiscountType(coupon.getDiscountType());
        dto.setMinimumAmount(coupon.getMinimumAmount());
        dto.setMaxUsage(coupon.getMaxUsage());
        dto.setCurrentUsage(coupon.getCurrentUsage());
        dto.setStartDate(coupon.getStartDate());
        dto.setEndDate(coupon.getEndDate());
        dto.setActive(coupon.getActive());
        return dto;
    }
}
