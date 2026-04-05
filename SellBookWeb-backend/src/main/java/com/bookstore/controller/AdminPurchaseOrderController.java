package com.bookstore.controller;

import com.bookstore.dto.PurchaseOrderDTO;
import com.bookstore.service.PurchaseOrderService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/admin/purchase-orders")
public class AdminPurchaseOrderController {
    private final PurchaseOrderService purchaseOrderService;

    public AdminPurchaseOrderController(PurchaseOrderService purchaseOrderService) {
        this.purchaseOrderService = purchaseOrderService;
    }

    @GetMapping
    public ResponseEntity<List<PurchaseOrderDTO>> getAllPurchaseOrders() {
        return ResponseEntity.ok(purchaseOrderService.getAllPurchaseOrders());
    }

    @PostMapping
    public ResponseEntity<?> createPurchaseOrder(@RequestBody PurchaseOrderDTO purchaseOrderDTO) {
        try {
            PurchaseOrderDTO created = purchaseOrderService.createPurchaseOrder(purchaseOrderDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurchaseOrderDTO> getPurchaseOrderById(@PathVariable String id) {
        PurchaseOrderDTO order = purchaseOrderService.getPurchaseOrderById(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<PurchaseOrderDTO>> getPurchaseOrdersBySupplier(@PathVariable String supplierId) {
        List<PurchaseOrderDTO> orders = purchaseOrderService.getPurchaseOrdersBySupplier(supplierId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PurchaseOrderDTO>> getPurchaseOrdersByStatus(@PathVariable String status) {
        List<PurchaseOrderDTO> orders = purchaseOrderService.getPurchaseOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updatePurchaseOrderStatus(
            @PathVariable String id,
            @RequestParam String status) {
        try {
            PurchaseOrderDTO updated = purchaseOrderService.updatePurchaseOrderStatus(id, status);
            if (updated == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException | IllegalStateException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePurchaseOrder(@PathVariable String id) {
        purchaseOrderService.deletePurchaseOrder(id);
        return ResponseEntity.ok("Purchase order deleted successfully");
    }
}
