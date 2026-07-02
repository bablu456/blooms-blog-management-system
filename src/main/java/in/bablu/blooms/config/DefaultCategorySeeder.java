package in.bablu.blooms.config;

import in.bablu.blooms.models.Category;
import in.bablu.blooms.models.Status;
import in.bablu.blooms.repositories.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DefaultCategorySeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    public DefaultCategorySeeder(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        List<Category> defaults = List.of(
                build("Technology", "Software, tools, and product engineering insights",
                        "https://images.unsplash.com/photo-1518770660439-4636190af475"),
                build("Programming", "Code tutorials, architecture patterns, and best practices",
                        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6"),
                build("AI & ML", "Artificial intelligence, machine learning, and data stories",
                        "https://images.unsplash.com/photo-1677442136019-21780ecad995"),
                build("Design", "UI, UX, product design, and creative workflows",
                        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8"),
                build("Startups", "Founder journeys, growth strategies, and business lessons",
                        "https://images.unsplash.com/photo-1552664730-d307ca884978"),
                build("Productivity", "Time management, systems, and personal effectiveness",
                        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b")
        );

        categoryRepository.saveAll(defaults);
        System.out.println("Seeded default categories: " + defaults.size());
    }

    private Category build(String name, String description, String imageUrl) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        category.setImageUrl(imageUrl);
        category.setStatus(Status.PUBLISHED.getDisplayName());
        category.setActive(true);
        category.setCreatedBy("System");
        category.setCreatedDTTM(LocalDateTime.now());
        return category;
    }
}
