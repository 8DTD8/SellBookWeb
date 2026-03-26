package com.bookstore.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import javax.validation.constraints.*;

/**
 * ✅ Book DTO với input validation
 */
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private String id;

    @NotNull(message = "Tiêu đề không được null")
    @NotBlank(message = "Tiêu đề không được trống")
    @Size(min = 3, max = 255, message = "Tiêu đề phải từ 3-255 ký tự")
    private String title;

    @NotNull(message = "Tác giả không được null")
    @NotBlank(message = "Tác giả không được trống")
    @Size(min = 2, max = 100, message = "Tác giả phải từ 2-100 ký tự")
    private String author;

    @Size(max = 1000, message = "Mô tả không được > 1000 ký tự")
    private String description;

    @NotNull(message = "Giá không được null")
    @PositiveOrZero(message = "Giá phải >= 0")
    @Max(value = 10000000, message = "Giá không được > 10 triệu")
    private Double price;

    @Min(value = 0, message = "Số lượng phải >= 0")
    @Max(value = 10000, message = "Số lượng không được > 10000")
    private Integer quantity;

    @NotNull(message = "Danh mục không được null")
    @NotBlank(message = "Danh mục không được trống")
    private String categoryId;

    private String image;

    @Min(value = 0, message = "Rating phải >= 0")
    @Max(value = 5, message = "Rating không được > 5")
    private Double rating;

    @Size(max = 100, message = "Tên nhà cung cấp không được > 100 ký tự")
    private String supplierName;

    @Size(max = 50, message = "Loại bìa không được > 50 ký tự")
    private String coverType;

    @Size(max = 100, message = "Tên dịch giả không được > 100 ký tự")
    private String translator;

    @Size(max = 100, message = "Tên nhà xuất bản không được > 100 ký tự")
    private String publisher;

    @PositiveOrZero(message = "Giảm giá phải >= 0")
    @Max(value = 100, message = "Giảm giá không được > 100%")
    private Double discount;

    @Size(max = 50, message = "Mã giảm giá không được > 50 ký tự")
    private String discountCode;

    @Min(value = 0, message = "Số lần bán phải >= 0")
    private Integer salesCount;

    private Boolean active;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public String getCoverType() {
        return coverType;
    }

    public void setCoverType(String coverType) {
        this.coverType = coverType;
    }

    public String getTranslator() {
        return translator;
    }

    public void setTranslator(String translator) {
        this.translator = translator;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getPublisher() {
        return publisher;
    }

    public void setPublisher(String publisher) {
        this.publisher = publisher;
    }

    public Double getDiscount() {
        return discount;
    }

    public void setDiscount(Double discount) {
        this.discount = discount;
    }

    public String getDiscountCode() {
        return discountCode;
    }

    public void setDiscountCode(String discountCode) {
        this.discountCode = discountCode;
    }

    public Integer getSalesCount() {
        return salesCount;
    }

    public void setSalesCount(Integer salesCount) {
        this.salesCount = salesCount;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
