package com.bookstore.service;

import com.bookstore.dto.CouponDTO;
import com.bookstore.model.Coupon;
import com.bookstore.repository.CouponRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CouponService {
    private final CouponRepository couponRepository;

    public CouponService(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    public CouponDTO createCoupon(CouponDTO couponDTO) {
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
        coupon.setActive(true);

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

        return couponRepository.findByCodeIgnoreCase(code.trim())
                .map(this::convertToDTO)
                .orElse(null);
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

        coupon.setCode(couponDTO.getCode() == null ? null : couponDTO.getCode().trim().toUpperCase());
        coupon.setDescription(couponDTO.getDescription());
        coupon.setDiscountValue(couponDTO.getDiscountValue());
        coupon.setDiscountType(couponDTO.getDiscountType());
        coupon.setMinimumAmount(couponDTO.getMinimumAmount());
        coupon.setMaxUsage(couponDTO.getMaxUsage());
        coupon.setActive(couponDTO.getActive());

        Coupon updatedCoupon = couponRepository.save(coupon);
        return convertToDTO(updatedCoupon);
    }

    public void deleteCoupon(String id) {
        couponRepository.deleteById(id);
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
