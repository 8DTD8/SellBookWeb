package com.bookstore.service;

import com.bookstore.dto.SupplierDTO;
import com.bookstore.model.Supplier;
import com.bookstore.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SupplierService {
    private final SupplierRepository supplierRepository;

    public SupplierService(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    public SupplierDTO createSupplier(SupplierDTO supplierDTO) {
        Supplier supplier = new Supplier();
        supplier.setName(supplierDTO.getName());
        supplier.setEmail(supplierDTO.getEmail());
        supplier.setPhone(supplierDTO.getPhone());
        supplier.setAddress(supplierDTO.getAddress());
        supplier.setCity(supplierDTO.getCity());
        supplier.setCountry(supplierDTO.getCountry());
        supplier.setContactPerson(supplierDTO.getContactPerson());
        supplier.setBankAccount(supplierDTO.getBankAccount());
        supplier.setActive(supplierDTO.getActive() == null ? true : supplierDTO.getActive());
        supplier.setCreatedAt(LocalDateTime.now());
        supplier.setUpdatedAt(LocalDateTime.now());

        Supplier saved = supplierRepository.save(supplier);
        return convertToDTO(saved);
    }

    public SupplierDTO getSupplierById(String id) {
        return supplierRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    public List<SupplierDTO> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<SupplierDTO> getActiveSuppliers() {
        return supplierRepository.findByActive(true).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SupplierDTO updateSupplier(String id, SupplierDTO supplierDTO) {
        Supplier supplier = supplierRepository.findById(id).orElse(null);
        if (supplier == null) return null;

        supplier.setName(supplierDTO.getName());
        supplier.setEmail(supplierDTO.getEmail());
        supplier.setPhone(supplierDTO.getPhone());
        supplier.setAddress(supplierDTO.getAddress());
        supplier.setCity(supplierDTO.getCity());
        supplier.setCountry(supplierDTO.getCountry());
        supplier.setContactPerson(supplierDTO.getContactPerson());
        supplier.setBankAccount(supplierDTO.getBankAccount());
        supplier.setActive(supplierDTO.getActive() == null ? supplier.getActive() : supplierDTO.getActive());
        supplier.setUpdatedAt(LocalDateTime.now());

        Supplier updated = supplierRepository.save(supplier);
        return convertToDTO(updated);
    }

    public void deleteSupplier(String id) {
        supplierRepository.deleteById(id);
    }

    private SupplierDTO convertToDTO(Supplier supplier) {
        SupplierDTO dto = new SupplierDTO();
        dto.setId(supplier.getId());
        dto.setName(supplier.getName());
        dto.setEmail(supplier.getEmail());
        dto.setPhone(supplier.getPhone());
        dto.setAddress(supplier.getAddress());
        dto.setCity(supplier.getCity());
        dto.setCountry(supplier.getCountry());
        dto.setContactPerson(supplier.getContactPerson());
        dto.setBankAccount(supplier.getBankAccount());
        dto.setActive(supplier.getActive());
        return dto;
    }
}
