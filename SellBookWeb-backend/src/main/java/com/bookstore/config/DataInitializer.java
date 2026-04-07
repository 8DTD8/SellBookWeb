package com.bookstore.config;

import com.bookstore.model.Category;
import com.bookstore.model.Book;
import com.bookstore.model.Coupon;
import com.bookstore.model.Supplier;
import com.bookstore.model.User;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import com.bookstore.repository.CouponRepository;
import com.bookstore.repository.SupplierRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.IndexInfo;
import org.springframework.security.crypto.password.PasswordEncoder;
import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataInitializer {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoryRepository categoryRepository;
    private final CouponRepository couponRepository;
    private final SupplierRepository supplierRepository;
    private final BookRepository bookRepository;
    private final MongoTemplate mongoTemplate;

    public DataInitializer(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            CategoryRepository categoryRepository,
            CouponRepository couponRepository,
            SupplierRepository supplierRepository,
            BookRepository bookRepository,
            MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.categoryRepository = categoryRepository;
        this.couponRepository = couponRepository;
        this.supplierRepository = supplierRepository;
        this.bookRepository = bookRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void initializeData() {
        dropStaleIndexes();
        initializeAdminUser();
        Map<String, String> categoryIds = initializeCategories();
        initializeCoupons();
        initializeSuppliers();
        initializeBooks(categoryIds);
    }

    private void dropStaleIndexes() {
        try {
            List<IndexInfo> indexes = mongoTemplate.indexOps("users").getIndexInfo();
            boolean hasUsernameIndex = indexes.stream()
                .anyMatch(idx -> idx.getName().equals("username_1"));
            if (hasUsernameIndex) {
                mongoTemplate.indexOps("users").dropIndex("username_1");
                System.out.println("✓ Dropped stale index username_1 from users collection");
            }
        } catch (Exception e) {
            System.out.println("⚠ Could not drop stale index username_1: " + e.getMessage());
        }
    }

    private void initializeAdminUser() {
        // Check if admin user already exists
        if (userRepository.findByEmail("admin@bookstore.com").isEmpty()) {
            User adminUser = new User();
            adminUser.setName("Admin User");
            adminUser.setEmail("admin@bookstore.com");
            adminUser.setPassword(passwordEncoder.encode("Admin@123456"));
            adminUser.setRole("SUPER_ADMIN");
            adminUser.setActive(true);
            adminUser.setCreatedAt(LocalDateTime.now());
            adminUser.setUpdatedAt(LocalDateTime.now());
            
            userRepository.save(adminUser);
            System.out.println("✓ Super admin account created successfully!");
            System.out.println("  Email: admin@bookstore.com");
            System.out.println("  Password: Admin@123456");
        } else {
            User adminUser = userRepository.findByEmail("admin@bookstore.com").orElse(null);
            if (adminUser != null && !"SUPER_ADMIN".equalsIgnoreCase(adminUser.getRole())) {
                adminUser.setRole("SUPER_ADMIN");
                adminUser.setUpdatedAt(LocalDateTime.now());
                userRepository.save(adminUser);
                System.out.println("✓ Upgraded admin@bookstore.com to SUPER_ADMIN");
            } else {
                System.out.println("✓ Super admin account already exists");
            }
        }
    }

    private Map<String, String> initializeCategories() {
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
        return categoryIds;
    }

    private void initializeSuppliers() {
        createSupplierIfNotExists(
            "Nha Nam",
            "contact@nhanam.vn",
            "024-35146876",
            "59 Do Quang, Trung Hoa, Cau Giay",
            "Ha Noi",
            "Viet Nam",
            "Phong doi tac Nha Nam",
            "NHANAM-VCB-001"
        );

        createSupplierIfNotExists(
            "Alpha Books",
            "info@alphabooks.vn",
            "024-73089895",
            "176 Thai Ha, Trung Liet, Dong Da",
            "Ha Noi",
            "Viet Nam",
            "Bo phan kinh doanh Alpha Books",
            "ALPHABOOKS-VCB-002"
        );

        System.out.println("✓ Suppliers initialized successfully!");
    }

    private void initializeBooks(Map<String, String> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            System.out.println("⚠ Skip book initialization because category IDs are unavailable");
            return;
        }

        createBookIfNotExists(
            "Nhà Giả Kim",
            "Paulo Coelho",
            "Tiểu thuyết nổi tiếng về hành trình theo đuổi giấc mơ và lắng nghe tiếng gọi nội tâm.",
            89000.0,
            35,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "Lê Chu Cầu",
            "Nhã Nam",
            10.0,
            "SALE10",
            215
        );

        createBookIfNotExists(
            "Rừng Na Uy",
            "Haruki Murakami",
            "Tác phẩm văn học Nhật Bản hiện đại, đào sâu cô đơn, ký ức và trưởng thành.",
            125000.0,
            22,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "Trịnh Lữ",
            "Nhã Nam",
            5.0,
            "SALE10",
            164
        );

        createBookIfNotExists(
            "1984",
            "George Orwell",
            "Tiểu thuyết phản địa đàng kinh điển về kiểm soát thông tin, quyền lực và tự do cá nhân.",
            99000.0,
            28,
            getCategoryId(categoryIds, "Kỳ ảo / Khoa học viễn tưởng"),
            "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Secker & Warburg",
            12.0,
            "SALE10",
            241
        );

        createBookIfNotExists(
            "Animal Farm",
            "George Orwell",
            "Truyện ngụ ngôn chính trị ngắn gọn nhưng sắc bén về quyền lực, tuyên truyền và tha hóa.",
            76000.0,
            30,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780451526342-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Penguin Books",
            0.0,
            "",
            187
        );

        createBookIfNotExists(
            "Dune",
            "Frank Herbert",
            "Sử thi khoa học viễn tưởng về quyền lực, sinh thái và vận mệnh trên hành tinh sa mạc Arrakis.",
            168000.0,
            18,
            getCategoryId(categoryIds, "Kỳ ảo / Khoa học viễn tưởng"),
            "https://covers.openlibrary.org/b/isbn/9780441172719-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Ace",
            15.0,
            "SALE20",
            143
        );

        createBookIfNotExists(
            "The Hobbit",
            "J.R.R. Tolkien",
            "Cuộc phiêu lưu kinh điển mở ra Trung Địa, cân bằng hoàn hảo giữa chất thơ và tinh thần khám phá.",
            145000.0,
            20,
            getCategoryId(categoryIds, "Kỳ ảo / Khoa học viễn tưởng"),
            "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "",
            "Mariner Books",
            8.0,
            "SALE10",
            129
        );

        createBookIfNotExists(
            "Murder on the Orient Express",
            "Agatha Christie",
            "Vụ án kinh điển của Hercule Poirot với cấu trúc trinh thám mẫu mực và cú chốt nổi tiếng.",
            92000.0,
            24,
            getCategoryId(categoryIds, "Trinh thám / Kinh dị"),
            "https://covers.openlibrary.org/b/isbn/9780062693662-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "",
            "HarperCollins",
            0.0,
            "",
            176
        );

        createBookIfNotExists(
            "The Little Prince",
            "Antoine de Saint-Exupéry",
            "Tác phẩm giàu chất thơ về tình bạn, trách nhiệm và cách người lớn đánh mất điều quan trọng.",
            84000.0,
            40,
            getCategoryId(categoryIds, "Văn học thiếu nhi"),
            "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "Nguyễn Thành Long",
            "Nhã Nam",
            5.0,
            "SALE10",
            302
        );

        createBookIfNotExists(
            "Atomic Habits",
            "James Clear",
            "Cuốn sách thực hành rõ ràng về xây dựng thói quen tốt và loại bỏ thói quen xấu bằng thay đổi nhỏ.",
            189000.0,
            26,
            getCategoryId(categoryIds, "Kỹ năng sống"),
            "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Avery",
            10.0,
            "SALE10",
            287
        );

        createBookIfNotExists(
            "Thinking, Fast and Slow",
            "Daniel Kahneman",
            "Công trình phổ biến khoa học nổi bật về hai hệ thống tư duy và các thiên kiến nhận thức thường gặp.",
            215000.0,
            16,
            getCategoryId(categoryIds, "Tâm lý học"),
            "https://covers.openlibrary.org/b/isbn/9780374533557-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Farrar, Straus and Giroux",
            12.0,
            "SALE20",
            121
        );

        createBookIfNotExists(
            "Sapiens",
            "Yuval Noah Harari",
            "Bức tranh lớn về lịch sử loài người, từ cách mạng nhận thức đến xã hội hiện đại.",
            205000.0,
            19,
            getCategoryId(categoryIds, "Lịch sử - Địa lý - Văn hóa"),
            "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Harper",
            7.0,
            "SALE10",
            198
        );

        createBookIfNotExists(
            "Clean Code",
            "Robert C. Martin",
            "Sách nền tảng về viết mã dễ đọc, dễ bảo trì và giảm chi phí kỹ thuật dài hạn.",
            245000.0,
            14,
            getCategoryId(categoryIds, "Khoa học - Kỹ thuật"),
            "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Prentice Hall",
            0.0,
            "",
            109
        );

        createBookIfNotExists(
            "To Kill a Mockingbird",
            "Harper Lee",
            "Tiểu thuyết kinh điển về công lý, định kiến và tuổi thơ tại miền Nam nước Mỹ.",
            118000.0,
            21,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "",
            "Harper Perennial Modern Classics",
            5.0,
            "SALE10",
            178
        );

        createBookIfNotExists(
            "Pride and Prejudice",
            "Jane Austen",
            "Chuyện tình kinh điển với giọng văn châm biếm sắc sảo về hôn nhân, giai cấp và định kiến.",
            95000.0,
            27,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "",
            "Penguin Classics",
            0.0,
            "",
            152
        );

        createBookIfNotExists(
            "The Catcher in the Rye",
            "J.D. Salinger",
            "Một trong những tiểu thuyết trưởng thành nổi tiếng nhất thế kỷ 20, giàu giọng kể và tâm trạng nổi loạn.",
            109000.0,
            19,
            getCategoryId(categoryIds, "Tiểu thuyết"),
            "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Little, Brown and Company",
            0.0,
            "",
            134
        );

        createBookIfNotExists(
            "Fahrenheit 451",
            "Ray Bradbury",
            "Tiểu thuyết cảnh báo nổi tiếng về kiểm duyệt, truyền thông và sự suy tàn của tư duy phản biện.",
            102000.0,
            25,
            getCategoryId(categoryIds, "Kỳ ảo / Khoa học viễn tưởng"),
            "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Simon & Schuster",
            8.0,
            "SALE10",
            166
        );

        createBookIfNotExists(
            "Brave New World",
            "Aldous Huxley",
            "Tác phẩm phản địa đàng kinh điển về xã hội tiêu dùng, kiểm soát sinh học và khoái cảm nhân tạo.",
            116000.0,
            17,
            getCategoryId(categoryIds, "Kỳ ảo / Khoa học viễn tưởng"),
            "https://covers.openlibrary.org/b/isbn/9780060850524-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Harper Perennial",
            10.0,
            "SALE10",
            127
        );

        createBookIfNotExists(
            "The Da Vinci Code",
            "Dan Brown",
            "Tiểu thuyết trinh thám ly kỳ xoay quanh biểu tượng học, mật mã và lịch sử tôn giáo.",
            132000.0,
            23,
            getCategoryId(categoryIds, "Trinh thám / Kinh dị"),
            "https://covers.openlibrary.org/b/isbn/9780307474278-L.jpg",
            "Nha Nam",
            "Bìa mềm",
            "",
            "Anchor",
            7.0,
            "SALE10",
            214
        );

        createBookIfNotExists(
            "The 7 Habits of Highly Effective People",
            "Stephen R. Covey",
            "Tác phẩm kinh điển về hiệu quả cá nhân dựa trên nguyên tắc và tư duy dài hạn.",
            175000.0,
            20,
            getCategoryId(categoryIds, "Kỹ năng sống"),
            "https://covers.openlibrary.org/b/isbn/9780743269513-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Free Press",
            10.0,
            "SALE10",
            248
        );

        createBookIfNotExists(
            "How to Win Friends and Influence People",
            "Dale Carnegie",
            "Cuốn sách kinh điển về giao tiếp, xây dựng quan hệ và tạo ảnh hưởng trong công việc lẫn đời sống.",
            148000.0,
            24,
            getCategoryId(categoryIds, "Kỹ năng sống"),
            "https://covers.openlibrary.org/b/isbn/9780671027032-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Pocket Books",
            5.0,
            "SALE10",
            271
        );

        createBookIfNotExists(
            "The Psychology of Money",
            "Morgan Housel",
            "Những bài học dễ đọc nhưng sâu sắc về hành vi tài chính, rủi ro, tiết kiệm và đầu tư.",
            165000.0,
            22,
            getCategoryId(categoryIds, "Tài chính - Đầu tư"),
            "https://covers.openlibrary.org/b/isbn/9780857197689-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Harriman House",
            10.0,
            "SALE10",
            233
        );

        createBookIfNotExists(
            "The Lean Startup",
            "Eric Ries",
            "Cuốn sách nổi bật về cách xây dựng startup bằng kiểm chứng giả thuyết, học hỏi nhanh và tối ưu tài nguyên.",
            172000.0,
            18,
            getCategoryId(categoryIds, "Khởi nghiệp"),
            "https://covers.openlibrary.org/b/isbn/9780307887894-L.jpg",
            "Alpha Books",
            "Bìa mềm",
            "",
            "Crown Business",
            12.0,
            "SALE20",
            145
        );

        System.out.println("✓ Books initialized successfully!");
    }

    private void initializeCoupons() {
        createCouponIfNotExists("SALE10", "Giảm 10% đơn hàng", 10.0, "PERCENTAGE");
        createCouponIfNotExists("SALE20", "Giảm 20% đơn hàng", 20.0, "PERCENTAGE");
        System.out.println("✓ Coupons initialized successfully!");
    }

    private void createCouponIfNotExists(String code, String description, Double discountValue, String discountType) {
        if (couponRepository.findByCode(code).isEmpty()) {
            Coupon coupon = new Coupon(code, description, discountValue, discountType);
            coupon.setMaxUsage(1000);
            coupon.setCurrentUsage(0);
            coupon.setMinimumAmount(0.0);
            couponRepository.save(coupon);
            System.out.println("  Created coupon: " + code);
        }
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

    private void createSupplierIfNotExists(
            String name,
            String email,
            String phone,
            String address,
            String city,
            String country,
            String contactPerson,
            String bankAccount) {
        boolean exists = supplierRepository.findAll().stream()
            .anyMatch(existing -> existing != null && existing.getName() != null && existing.getName().equalsIgnoreCase(name));

        if (exists) {
            return;
        }

        Supplier supplier = new Supplier();
        supplier.setName(name);
        supplier.setEmail(email);
        supplier.setPhone(phone);
        supplier.setAddress(address);
        supplier.setCity(city);
        supplier.setCountry(country);
        supplier.setContactPerson(contactPerson);
        supplier.setBankAccount(bankAccount);
        supplier.setActive(true);
        supplier.setCreatedAt(LocalDateTime.now());
        supplier.setUpdatedAt(LocalDateTime.now());
        supplierRepository.save(supplier);
        System.out.println("  ✓ Created supplier: " + name);
    }

    private void createBookIfNotExists(
            String title,
            String author,
            String description,
            Double price,
            Integer quantity,
            String categoryId,
            String image,
            String supplierName,
            String coverType,
            String translator,
            String publisher,
            Double discount,
            String discountCode,
            Integer salesCount) {
        boolean exists = bookRepository.findAll().stream()
            .anyMatch(existing -> existing != null && existing.getTitle() != null && existing.getTitle().equalsIgnoreCase(title));

        if (exists) {
            return;
        }

        Book book = new Book();
        book.setTitle(title);
        book.setAuthor(author);
        book.setDescription(description);
        book.setPrice(price);
        book.setQuantity(quantity);
        book.setCategoryId(categoryId);
        book.setImage(image);
        book.setRating(0.0);
        book.setSupplierName(supplierName);
        book.setCoverType(coverType);
        book.setTranslator(translator);
        book.setPublisher(publisher);
        book.setDiscount(discount);
        book.setDiscountCode(discountCode);
        book.setSalesCount(salesCount);
        book.setActive(true);
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());
        bookRepository.save(book);
        System.out.println("  ✓ Created book: " + title);
    }

    private String getCategoryId(Map<String, String> categoryIds, String categoryName) {
        String categoryId = categoryIds.get(categoryName);
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            return categoryId;
        }

        return categoryRepository.findAll().stream()
            .filter(category -> category != null && category.getName() != null && category.getName().equals(categoryName))
            .map(Category::getId)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Không tìm thấy category: " + categoryName));
    }
}
