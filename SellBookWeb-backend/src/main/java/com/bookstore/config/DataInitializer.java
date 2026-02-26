package com.bookstore.config;

import com.bookstore.model.Category;
import com.bookstore.model.User;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Configuration
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, CategoryRepository categoryRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoryRepository = categoryRepository;
    }

    @PostConstruct
    public void initializeData() {
        initializeAdminUser();
        initializeCategories();
    }

    private void initializeAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@bookstore.com").isEmpty()) {
            User adminUser = new User();
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@bookstore.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123456"));
            adminUser.setRole("ADMIN");
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            System.out.println("✓ Admin user created successfully!");
            System.out.println("  Email: admin@bookstore.com");
            System.out.println("  Password: Admin@123456");
        } else {
            System.out.println("✓ Admin user already exists");
        }
    }

    private void initializeCategories() {
        LocalDateTime now = LocalDateTime.now();
        Map<String, String> categoryIds = new HashMap<>();
        
        // 1. Nhóm Sách Văn Học (Fiction)
        String fictionId = createCategoryIfNotExists("Sách Văn Học", 
            "Nhóm dành cho những người đọc để giải trí và thưởng thức nghệ thuật ngôn từ", 
            "fas fa-book", null, now, categoryIds);
        
        createCategoryIfNotExists("Tiểu thuyết", 
            "Văn học hiện đại, kinh điển", 
            "fas fa-book-open", fictionId, now, categoryIds);
        createCategoryIfNotExists("Truyện ngắn & Tản văn", 
            "Các tập truyện, bút ký", 
            "fas fa-scroll", fictionId, now, categoryIds);
        createCategoryIfNotExists("Trinh thám / Kinh dị", 
            "Kỳ bí, giật gân, tâm lý tội phạm", 
            "fas fa-mask", fictionId, now, categoryIds);
        createCategoryIfNotExists("Kỳ ảo / Khoa học viễn tưởng", 
            "Fantasy, Sci-fi", 
            "fas fa-rocket", fictionId, now, categoryIds);
        createCategoryIfNotExists("Ngôn tình / Lãng mạn", 
            "Tình yêu tuổi trẻ, đam mỹ, bách hợp", 
            "fas fa-heart", fictionId, now, categoryIds);
        createCategoryIfNotExists("Light Novel", 
            "Truyện tranh chữ phong cách Nhật Bản", 
            "fas fa-book-reader", fictionId, now, categoryIds);
        createCategoryIfNotExists("Thơ ca", 
            "Các tập thơ cổ điển và hiện đại", 
            "fas fa-feather-alt", fictionId, now, categoryIds);
        
        // 2. Nhóm Sách Thiếu Nhi (Children's Books)
        String childrenId = createCategoryIfNotExists("Sách Thiếu Nhi", 
            "Sách dành cho trẻ em, phân loại theo độ tuổi hoặc loại hình", 
            "fas fa-child", null, now, categoryIds);
        
        createCategoryIfNotExists("Truyện tranh", 
            "Manga, Comic, Comic Việt", 
            "fas fa-images", childrenId, now, categoryIds);
        createCategoryIfNotExists("Sách tranh (Picture Books)", 
            "Dành cho trẻ nhỏ", 
            "fas fa-palette", childrenId, now, categoryIds);
        createCategoryIfNotExists("Vừa học vừa chơi", 
            "Sách tương tác, tô màu, dán hình", 
            "fas fa-puzzle-piece", childrenId, now, categoryIds);
        createCategoryIfNotExists("Văn học thiếu nhi", 
            "Cổ tích, truyện ngụ ngôn, tiểu thuyết thiếu nhi", 
            "fas fa-fairy", childrenId, now, categoryIds);
        
        // 3. Nhóm Sách Kinh Tế & Kinh Doanh (Business)
        String businessId = createCategoryIfNotExists("Sách Kinh Tế & Kinh Doanh", 
            "Sách về quản trị, marketing, tài chính và khởi nghiệp", 
            "fas fa-briefcase", null, now, categoryIds);
        
        createCategoryIfNotExists("Quản trị - Lãnh đạo", 
            "Quản trị nhân sự, điều hành", 
            "fas fa-users-cog", businessId, now, categoryIds);
        createCategoryIfNotExists("Marketing - Bán hàng", 
            "Truyền thông, quảng cáo, sale", 
            "fas fa-bullhorn", businessId, now, categoryIds);
        createCategoryIfNotExists("Tài chính - Đầu tư", 
            "Chứng khoán, bất động sản, tiền tệ", 
            "fas fa-chart-line", businessId, now, categoryIds);
        createCategoryIfNotExists("Khởi nghiệp", 
            "Startup, bài học từ các doanh nhân", 
            "fas fa-lightbulb", businessId, now, categoryIds);
        
        // 4. Nhóm Sách Kỹ Năng - Phát Triển Bản Thân (Self-help)
        String selfHelpId = createCategoryIfNotExists("Sách Kỹ Năng - Phát Triển Bản Thân", 
            "Sách về kỹ năng sống, tâm lý học và phong cách sống", 
            "fas fa-user-graduate", null, now, categoryIds);
        
        createCategoryIfNotExists("Kỹ năng sống", 
            "Giao tiếp, quản lý thời gian, tư duy", 
            "fas fa-hands-helping", selfHelpId, now, categoryIds);
        createCategoryIfNotExists("Tâm lý học", 
            "Tâm lý học ứng dụng, chữa lành", 
            "fas fa-brain", selfHelpId, now, categoryIds);
        createCategoryIfNotExists("Phong cách sống", 
            "Minimalism, nghệ thuật sống, cẩm nang hạnh phúc", 
            "fas fa-spa", selfHelpId, now, categoryIds);
        
        // 5. Nhóm Sách Kiến Thức - Giáo Khoa (Non-fiction & Academic)
        String academicId = createCategoryIfNotExists("Sách Kiến Thức - Giáo Khoa", 
            "Sách giáo khoa, tham khảo, học ngoại ngữ và nghiên cứu", 
            "fas fa-graduation-cap", null, now, categoryIds);
        
        createCategoryIfNotExists("Giáo khoa - Tham khảo", 
            "Sách theo chương trình bộ GD-ĐT", 
            "fas fa-school", academicId, now, categoryIds);
        createCategoryIfNotExists("Học ngoại ngữ", 
            "Tiếng Anh, Nhật, Hàn, Trung, luyện thi IELTS/TOEIC", 
            "fas fa-language", academicId, now, categoryIds);
        createCategoryIfNotExists("Lịch sử - Địa lý - Văn hóa", 
            "Nghiên cứu, tư liệu", 
            "fas fa-globe", academicId, now, categoryIds);
        createCategoryIfNotExists("Khoa học - Kỹ thuật", 
            "Công nghệ thông tin, thiên văn, vật lý", 
            "fas fa-microscope", academicId, now, categoryIds);
        createCategoryIfNotExists("Chính trị - Triết học", 
            "Lý luận, tư tưởng", 
            "fas fa-balance-scale", academicId, now, categoryIds);
        
        // 6. Nhóm Sách Đời Sống & Gia Đình
        String lifestyleId = createCategoryIfNotExists("Sách Đời Sống & Gia Đình", 
            "Sách về nữ công gia chánh, nuôi dạy con, sức khỏe và tâm linh", 
            "fas fa-home", null, now, categoryIds);
        
        createCategoryIfNotExists("Nữ công gia chánh", 
            "Nấu ăn, cắm hoa, làm bánh", 
            "fas fa-utensils", lifestyleId, now, categoryIds);
        createCategoryIfNotExists("Nuôi dạy con cái", 
            "Thai giáo, chăm sóc trẻ", 
            "fas fa-baby", lifestyleId, now, categoryIds);
        createCategoryIfNotExists("Sức khỏe", 
            "Yoga, dinh dưỡng, y học thường thức", 
            "fas fa-heartbeat", lifestyleId, now, categoryIds);
        createCategoryIfNotExists("Tâm linh - Tôn giáo", 
            "Phật giáo, Thiên chúa giáo, thiền định", 
            "fas fa-pray", lifestyleId, now, categoryIds);
        
        System.out.println("✓ Categories initialized successfully!");
    }

    private String createCategoryIfNotExists(String name, String description, String icon, String parentId, LocalDateTime now, Map<String, String> categoryIds) {
        if (categoryRepository.existsByName(name)) {
            // Return existing category ID
            Category existing = categoryRepository.findAll().stream()
                .filter(c -> c.getName().equals(name) && (c.getActive() == null || c.getActive()))
                .findFirst()
                .orElse(null);
            if (existing != null) {
                categoryIds.put(name, existing.getId());
                return existing.getId();
            }
        }
        
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setIcon(icon);
        category.setParentId(parentId);
        category.setActive(true);
        category.setCreatedAt(now);
        category.setUpdatedAt(now);
        
        Category saved = categoryRepository.save(category);
        categoryIds.put(name, saved.getId());
        System.out.println("  ✓ Created category: " + name);
        return saved.getId();
    }
}
