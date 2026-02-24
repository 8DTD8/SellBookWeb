package com.bookstore.dto;

import java.util.List;

public class WishlistDTO {
    private String id;
    private String userId;
    private List<String> bookIds;

    public WishlistDTO() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public List<String> getBookIds() { return bookIds; }
    public void setBookIds(List<String> bookIds) { this.bookIds = bookIds; }
}
