package com.bookstore.service;

import com.bookstore.dto.PurchaseOrderDTO;
import com.bookstore.model.Supplier;
import com.bookstore.model.PurchaseOrder;
import com.bookstore.repository.PurchaseOrderRepository;
import com.bookstore.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Locale;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final BookService bookService;

    public PurchaseOrderService(
            PurchaseOrderRepository purchaseOrderRepository,
            SupplierRepository supplierRepository,
            BookService bookService) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.supplierRepository = supplierRepository;
        this.bookService = bookService;
    }

    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO purchaseOrderDTO) {
        Supplier supplier = validateSupplier(purchaseOrderDTO.getSupplierId());
        List<PurchaseOrder.OrderItem> normalizedItems = mapAndValidateItems(purchaseOrderDTO.getItems());

        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setSupplierId(supplier.getId());
        purchaseOrder.setItems(normalizedItems);
        purchaseOrder.setTotalAmount(calculateTotalAmount(normalizedItems));
        purchaseOrder.setStatus("PENDING");
        purchaseOrder.setOrderDate(LocalDateTime.now());
        purchaseOrder.setExpectedDate(purchaseOrderDTO.getExpectedDate());
        purchaseOrder.setNotes(normalizeNotes(purchaseOrderDTO.getNotes()));
        purchaseOrder.setCreatedAt(LocalDateTime.now());
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        PurchaseOrder saved = purchaseOrderRepository.save(purchaseOrder);
        return convertToDTO(saved);
    }

    public PurchaseOrderDTO getPurchaseOrderById(String id) {
        return purchaseOrderRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<PurchaseOrderDTO> getAllPurchaseOrders() {
        return purchaseOrderRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PurchaseOrderDTO> getPurchaseOrdersBySupplier(String supplierId) {
        return purchaseOrderRepository.findBySupplierId(supplierId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<PurchaseOrderDTO> getPurchaseOrdersByStatus(String status) {
        return purchaseOrderRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public PurchaseOrderDTO updatePurchaseOrderStatus(String id, String status) {
        PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id).orElse(null);
        if (purchaseOrder == null) return null;

        String normalizedStatus = normalizeStatus(status);
        String currentStatus = normalizeStatus(purchaseOrder.getStatus());

        if (normalizedStatus == null) {
            throw new IllegalArgumentException("Trạng thái phiếu nhập không hợp lệ");
        }

        if (!currentStatus.equals(normalizedStatus) && "RECEIVED".equals(normalizedStatus)) {
            receivePurchaseOrderItems(purchaseOrder);
            purchaseOrder.setReceivedDate(LocalDateTime.now());
        }

        if (!"RECEIVED".equals(normalizedStatus)) {
            purchaseOrder.setReceivedDate(null);
        }

        purchaseOrder.setStatus(normalizedStatus);
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        PurchaseOrder updated = purchaseOrderRepository.save(purchaseOrder);
        return convertToDTO(updated);
    }

    public void deletePurchaseOrder(String id) {
        purchaseOrderRepository.deleteById(id);
    }

    private Supplier validateSupplier(String supplierId) {
        if (supplierId == null || supplierId.trim().isEmpty()) {
            throw new IllegalArgumentException("Không thể tạo phiếu nhập khi chưa chọn nhà cung cấp");
        }

        Supplier supplier = supplierRepository.findById(supplierId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Nhà cung cấp không tồn tại"));

        if (!Boolean.TRUE.equals(supplier.getActive())) {
            throw new IllegalArgumentException("Nhà cung cấp đang bị vô hiệu hóa");
        }

        return supplier;
    }

    private List<PurchaseOrder.OrderItem> mapAndValidateItems(List<PurchaseOrderDTO.PurchaseOrderItemDTO> itemDTOs) {
        if (itemDTOs == null || itemDTOs.isEmpty()) {
            throw new IllegalArgumentException("Phiếu nhập phải có ít nhất một sách");
        }

        List<PurchaseOrder.OrderItem> items = new ArrayList<>();
        for (PurchaseOrderDTO.PurchaseOrderItemDTO itemDTO : itemDTOs) {
            if (itemDTO == null || itemDTO.getBookId() == null || itemDTO.getBookId().trim().isEmpty()) {
                throw new IllegalArgumentException("Mỗi dòng nhập hàng phải có sách hợp lệ");
            }
            int quantity = itemDTO.getQuantity() == null ? 0 : itemDTO.getQuantity();
            double unitPrice = itemDTO.getUnitPrice() == null ? 0 : itemDTO.getUnitPrice();
            if (quantity <= 0) {
                throw new IllegalArgumentException("Số lượng nhập phải lớn hơn 0");
            }
            if (unitPrice < 0) {
                throw new IllegalArgumentException("Đơn giá nhập không được âm");
            }

            PurchaseOrder.OrderItem item = new PurchaseOrder.OrderItem();
            item.setBookId(itemDTO.getBookId().trim());
            item.setQuantity(quantity);
            item.setUnitPrice(unitPrice);
            item.setTotalPrice(quantity * unitPrice);
            items.add(item);
        }

        return items;
    }

    private double calculateTotalAmount(List<PurchaseOrder.OrderItem> items) {
        return items.stream()
                .mapToDouble(item -> item.getTotalPrice() == null ? 0 : item.getTotalPrice())
                .sum();
    }

    private String normalizeNotes(String notes) {
        if (notes == null) {
            return null;
        }
        String normalized = notes.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }

        String normalized = status.trim().toUpperCase(Locale.ROOT);
        if (!List.of("PENDING", "RECEIVED", "CANCELLED").contains(normalized)) {
            return null;
        }
        return normalized;
    }

    private void receivePurchaseOrderItems(PurchaseOrder purchaseOrder) {
        if (purchaseOrder.getItems() == null || purchaseOrder.getItems().isEmpty()) {
            throw new IllegalStateException("Phiếu nhập không có sách để nhập kho");
        }

        for (PurchaseOrder.OrderItem item : purchaseOrder.getItems()) {
            bookService.increaseBookStock(item.getBookId(), item.getQuantity());
        }
    }

    private PurchaseOrderDTO convertToDTO(PurchaseOrder purchaseOrder) {
        PurchaseOrderDTO dto = new PurchaseOrderDTO();
        dto.setId(purchaseOrder.getId());
        dto.setSupplierId(purchaseOrder.getSupplierId());
        dto.setItems(purchaseOrder.getItems().stream()
                .map(item -> {
                    PurchaseOrderDTO.PurchaseOrderItemDTO itemDTO = new PurchaseOrderDTO.PurchaseOrderItemDTO();
                    itemDTO.setBookId(item.getBookId());
                    itemDTO.setQuantity(item.getQuantity());
                    itemDTO.setUnitPrice(item.getUnitPrice());
                    itemDTO.setTotalPrice(item.getTotalPrice());
                    return itemDTO;
                })
                .collect(Collectors.toList()));
        dto.setTotalAmount(purchaseOrder.getTotalAmount());
        dto.setStatus(purchaseOrder.getStatus());
        dto.setOrderDate(purchaseOrder.getOrderDate());
        dto.setExpectedDate(purchaseOrder.getExpectedDate());
        dto.setReceivedDate(purchaseOrder.getReceivedDate());
        dto.setNotes(purchaseOrder.getNotes());
        return dto;
    }
}
