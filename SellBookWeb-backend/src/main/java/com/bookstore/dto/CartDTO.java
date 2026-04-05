package com.bookstore.dto;

import java.util.List;

public class CartDTO {
    private String id;
    private String userId;
    private List<CartItemDTO> items;
    private Double totalPrice;

    public CartDTO() {
    }

    public static class CartItemDTO {
        private String bookId;
        private String title;
        private Double price;
        private Integer quantity;

        public CartItemDTO() {}

        public String getBookId() { return bookId; }
        public void setBookId(String bookId) { this.bookId = bookId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public Double getPrice() { return price; }
        public void setPrice(Double price) { this.price = price; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<CartItemDTO> getItems() { return items; }
    public void setItems(List<CartItemDTO> items) { this.items = items; }

    public Double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(Double totalPrice) { this.totalPrice = totalPrice; }
}
