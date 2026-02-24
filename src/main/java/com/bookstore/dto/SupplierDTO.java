package com.bookstore.dto;

import java.time.LocalDateTime;

public class SupplierDTO {
    private String id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String country;
    private String contactPerson;
    private String bankAccount;
    private Boolean active;

    public SupplierDTO() {
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getBankAccount() { return bankAccount; }
    public void setBankAccount(String bankAccount) { this.bankAccount = bankAccount; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
