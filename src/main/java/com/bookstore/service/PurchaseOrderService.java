package com.bookstore.service;

import com.bookstore.dto.PurchaseOrderDTO;
import com.bookstore.model.PurchaseOrder;
import com.bookstore.repository.PurchaseOrderRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PurchaseOrderService {
    private final PurchaseOrderRepository purchaseOrderRepository;

    public PurchaseOrderService(PurchaseOrderRepository purchaseOrderRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
    }

    public PurchaseOrderDTO createPurchaseOrder(PurchaseOrderDTO purchaseOrderDTO) {
        PurchaseOrder purchaseOrder = new PurchaseOrder();
        purchaseOrder.setSupplierId(purchaseOrderDTO.getSupplierId());
        purchaseOrder.setItems(purchaseOrderDTO.getItems().stream()
                .map(itemDTO -> {
                    PurchaseOrder.OrderItem item = new PurchaseOrder.OrderItem();
                    item.setBookId(itemDTO.getBookId());
                    item.setQuantity(itemDTO.getQuantity());
                    item.setUnitPrice(itemDTO.getUnitPrice());
                    item.setTotalPrice(itemDTO.getTotalPrice());
                    return item;
                })
                .collect(Collectors.toList()));
        purchaseOrder.setTotalAmount(purchaseOrderDTO.getTotalAmount());
        purchaseOrder.setExpectedDate(purchaseOrderDTO.getExpectedDate());
        purchaseOrder.setNotes(purchaseOrderDTO.getNotes());

        PurchaseOrder saved = purchaseOrderRepository.save(purchaseOrder);
        return convertToDTO(saved);
    }

    public PurchaseOrderDTO getPurchaseOrderById(String id) {
        return purchaseOrderRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
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

        purchaseOrder.setStatus(status);
        if (status.equals("RECEIVED")) {
            purchaseOrder.setReceivedDate(LocalDateTime.now());
        }
        purchaseOrder.setUpdatedAt(LocalDateTime.now());

        PurchaseOrder updated = purchaseOrderRepository.save(purchaseOrder);
        return convertToDTO(updated);
    }

    public void deletePurchaseOrder(String id) {
        purchaseOrderRepository.deleteById(id);
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
