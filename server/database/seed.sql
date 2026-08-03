-- ============================================================
-- SAN DUKHAR — SEED DATA
-- Initial data for development and testing
-- ============================================================

-- Admin User (password: Admin123!Secure)
INSERT INTO users (id, email, password_hash, first_name, last_name, role, email_verified, is_active)
VALUES (
    uuid_generate_v4(),
    'admin@sandukhar.com',
    '$2b$12$uDjS6.F/TecqUVT3.OyOG.RXNvwt0NJqOHpgW/R5puolXbFHbK.dC',
    'Dukhar',
    'San',
    'admin',
    true,
    true
);

-- Categories
INSERT INTO categories (id, slug, name_ru, name_en, description_ru, description_en, sort_order) VALUES
(uuid_generate_v4(), 'jackets', 'Куртки', 'Jackets', 'Эксклюзивные куртки из экзотической кожи ручной работы', 'Exclusive handcrafted exotic leather jackets', 1),
(uuid_generate_v4(), 'shirts', 'Рубашки', 'Shirts', 'Рубашки из тонкой выделанной кожи', 'Shirts crafted from fine dressed leather', 2),
(uuid_generate_v4(), 'shoes', 'Обувь', 'Footwear', 'Обувь ручной работы из лучших сортов экзотической кожи', 'Handcrafted footwear from the finest exotic leathers', 3),
(uuid_generate_v4(), 'bags', 'Сумки и рюкзаки', 'Bags & Backpacks', 'Премиальные сумки и рюкзаки из крокодиловой кожи и других экзотических материалов', 'Premium bags and backpacks from crocodile leather and other exotic materials', 4),
(uuid_generate_v4(), 'belts', 'Ремни', 'Belts', 'Ремни из экзотической кожи с фирменной фурнитурой', 'Exotic leather belts with signature hardware', 5),
(uuid_generate_v4(), 'suitcases', 'Чемоданы', 'Suitcases', 'Дорожные чемоданы ручной работы', 'Handcrafted travel suitcases', 6),
(uuid_generate_v4(), 'gloves', 'Перчатки', 'Gloves', 'Перчатки из мягкой выделанной кожи', 'Gloves crafted from soft dressed leather', 7),
(uuid_generate_v4(), 'wallets', 'Кошельки и кредитницы', 'Wallets & Cardholders', 'Кошельки, кредитницы и другие малые кожаные изделия', 'Wallets, cardholders and other small leather goods', 8),
(uuid_generate_v4(), 'headwear', 'Головные уборы', 'Headwear', 'Головные уборы из экзотической кожи', 'Exotic leather headwear', 9),
(uuid_generate_v4(), 'accessories', 'Аксессуары', 'Accessories', 'Дополнительные аксессуары из экзотической кожи', 'Additional exotic leather accessories', 10);

-- Materials
INSERT INTO materials (id, slug, name_ru, name_en, scientific_name, description_ru, description_en, sort_order) VALUES
(uuid_generate_v4(), 'crocodile', 'Крокодил', 'Crocodile', 'Porosus & Niloticus', 'Кожа крокодила — король экзотических кож. Отличается регулярным прямоугольным рисунком чешуи.', 'Crocodile leather — the king of exotic leathers. Defined by its regular rectangular scale pattern.', 1),
(uuid_generate_v4(), 'python', 'Питон', 'Python', 'Reticulatus & Molurus', 'Кожа питона с её драматичным перекрывающимся рисунком чешуи. Каждая шкура уникальна.', 'Python skin with its dramatic overlapping scale pattern. Each skin is utterly unique.', 2),
(uuid_generate_v4(), 'ostrich', 'Страус', 'Ostrich', 'Struthio Camelus', 'Кожа страуса с характерным рисунком фолликулов — визитная карточка роскоши.', 'Ostrich leather with distinctive quill follicle pattern — a hallmark of luxury.', 3),
(uuid_generate_v4(), 'stingray', 'Скат', 'Stingray', 'Galuchat', 'Галюша — одна из самых прочных экзотических кож с мерцающей жемчужной поверхностью.', 'Galuchat — one of the most durable exotic leathers with a shimmering pearl-like surface.', 4),
(uuid_generate_v4(), 'suede', 'Замша', 'Suede', 'Nubuck & Suede', 'Мягкая, бархатистая кожа с благородной матовой фактурой.', 'Soft, velvety leather with a refined matte finish.', 5),
(uuid_generate_v4(), 'genuine-leather', 'Натуральная кожа', 'Genuine Leather', 'Bos Taurus', 'Изысканная кожа полного цикла выделки телёнка — гладкая, ровная, вневременная.', 'Refined full-grain calfskin — smooth, even, and timeless.', 6),
(uuid_generate_v4(), 'karakul', 'Каракуль', 'Karakul', 'Ovis Aries', 'Плотные, блестящие завитки — один из самых редких и тактильных материалов ателье.', 'Tight, lustrous curls — one of the rarest and most tactile materials in the atelier.', 7),
(uuid_generate_v4(), 'cashmere', 'Кашемир', 'Cashmere', 'Capra Hircus', 'Тончайший подшёрсток кашмирской козы — исключительная мягкость для подкладок и вязаных акцентов.', 'Fine undercoat of the Kashmir goat — exceptional softness for linings and knitwear accents.', 8);

-- Sample Products
INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, featured, stock)
SELECT
    uuid_generate_v4(), 'sovereign-briefcase', 'SD-SOV-BRF-001',
    'Портфель Sovereign', 'Sovereign Briefcase',
    'Портфель Sovereign — абсолютное воплощение силы и утончённости. Создан из цельной безупречной кожи нильского крокодила.',
    'The Sovereign Briefcase is the definitive statement of power and refinement. Crafted from a single flawless Nile crocodile skin.',
    18500.00,
    c.id, m.id,
    'active', true, 25
FROM categories c, materials m 
WHERE c.slug = 'bags' AND m.slug = 'crocodile';

INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, featured, stock)
SELECT 
    uuid_generate_v4(), 'sovereign-bifold-wallet', 'SD-SOV-WLT-002',
    'Бумажник Sovereign', 'Sovereign Bifold Wallet',
    'Бумажник из глазированной кожи нильского крокодила с серебряной фурнитурой.',
    'Bifold wallet in glazed Nile crocodile leather with silver hardware.',
    2200.00,
    c.id, m.id,
    'active', true, 50
FROM categories c, materials m
WHERE c.slug = 'wallets' AND m.slug = 'crocodile';

INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, featured, stock)
SELECT
    uuid_generate_v4(), 'sovereign-loafers', 'SD-SOV-LFR-003',
    'Лоферы Sovereign', 'Sovereign Loafers',
    'Лоферы из полированной кожи Porosus с пряжкой, покрытой золотом.',
    'Loafers in polished Porosus leather with gold-plated buckle.',
    6800.00,
    c.id, m.id,
    'active', true, 15
FROM categories c, materials m
WHERE c.slug = 'shoes' AND m.slug = 'crocodile';

-- More products
INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, made_to_order, stock)
SELECT
    uuid_generate_v4(), 'serpentine-jacket', 'SD-SRP-JKT-004',
    'Куртка Serpentine', 'Serpentine Jacket',
    'Куртка из натуральной кожи питона с роговыми пуговицами.',
    'Jacket in natural python leather with horn buttons.',
    12500.00,
    c.id, m.id,
    'active', true, 0
FROM categories c, materials m
WHERE c.slug = 'jackets' AND m.slug = 'python';

INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, stock)
SELECT
    uuid_generate_v4(), 'savanna-tote', 'SD-SAV-TOT-005',
    'Сумка Savanna', 'Savanna Tote',
    'Сумка из кожи страуса Full Quill с латунной фурнитурой.',
    'Tote bag in Full Quill ostrich leather with brass hardware.',
    9800.00,
    c.id, m.id,
    'active', 10
FROM categories c, materials m
WHERE c.slug = 'bags' AND m.slug = 'ostrich';

INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, stock)
SELECT
    uuid_generate_v4(), 'abyss-cardholder', 'SD-ABY-CRD-006',
    'Кардхолдер Abyss', 'Abyss Cardholder',
    'Кардхолдер из полированного галюша с серебряной отделкой.',
    'Cardholder in polished galuchat with silver finish.',
    1800.00,
    c.id, m.id,
    'active', 30
FROM categories c, materials m
WHERE c.slug = 'wallets' AND m.slug = 'stingray';

INSERT INTO products (id, slug, sku, name_ru, name_en, description_ru, description_en, price, category_id, material_id, status, stock)
SELECT
    uuid_generate_v4(), 'nocturne-jacket', 'SD-NOC-JKT-007',
    'Куртка Nocturne', 'Nocturne Jacket',
    'Куртка из кожи ящерицы Teju с серебряными молниями.',
    'Jacket in Teju lizard leather with silver zippers.',
    8900.00,
    c.id, m.id,
    'active', 10
FROM categories c, materials m
WHERE c.slug = 'jackets' AND m.slug = 'lizard';

-- Translations
INSERT INTO translations (key, locale, value, context) VALUES
('nav_home', 'en', 'Home', 'navigation'),
('nav_home', 'ru', 'Главная', 'navigation'),
('nav_collections', 'en', 'Collections', 'navigation'),
('nav_collections', 'ru', 'Коллекции', 'navigation'),
('nav_materials', 'en', 'Materials', 'navigation'),
('nav_materials', 'ru', 'Материалы', 'navigation'),
('nav_bespoke', 'en', 'Bespoke', 'navigation'),
('nav_bespoke', 'ru', 'Индивидуальный пошив', 'navigation'),
('nav_atelier', 'en', 'Atelier', 'navigation'),
('nav_atelier', 'ru', 'Ателье', 'navigation'),
('nav_contact', 'en', 'Contact', 'navigation'),
('nav_contact', 'ru', 'Контакты', 'navigation'),
('hero_line1', 'en', 'Where Nature Meets', 'hero'),
('hero_line1', 'ru', 'Там, где природа встречает', 'hero'),
('hero_line2', 'en', 'Centuries of Craft', 'hero'),
('hero_line2', 'ru', 'Многовековое мастерство', 'hero'),
('hero_explore', 'en', 'Explore The Collection', 'hero'),
('hero_explore', 'ru', 'Смотреть коллекцию', 'hero'),
('hero_bespoke', 'en', 'Bespoke Enquiry', 'hero'),
('hero_bespoke', 'ru', 'Заказать индивидуально', 'hero'),
('footer_copyright', 'en', '© 2026 SAN DUKHAR. All rights reserved. Handcrafted with pride in Turkey.', 'footer'),
('footer_copyright', 'ru', '© 2026 SAN DUKHAR. Все права защищены. С гордостью создано в Турции.', 'footer'),
('cart_added', 'en', 'Added to your selection', 'notifications'),
('cart_added', 'ru', 'Добавлено в корзину', 'notifications');

-- Settings
INSERT INTO settings (key, value, description) VALUES
('site_name', '{"en": "SAN DUKHAR", "ru": "SAN DUKHAR"}', 'Site name'),
('site_description', '{"en": "Luxury Exotic Leather Atelier", "ru": "Ателье экзотической кожи"}', 'Site description'),
('contact_email', '"sandukhar2@gmail.com"', 'Main contact email'),
('contact_phone', '"+90 212 345 67 89"', 'Main contact phone'),
('address', '{"line1": "Yenidoğan, Zübeyde Hanım Cd. No:80/B", "city": "İstanbul", "district": "Zeytinburnu", "postal_code": "34021", "country": "Turkey"}', 'Atelier address'),
('working_hours', '{"en": "Monday – Friday: 10:00 – 19:00 · Saturday: 10:00 – 15:00 · Sunday: Closed", "ru": "Понедельник – Пятница: 10:00 – 19:00 · Суббота: 10:00 – 15:00 · Воскресенье: Выходной"}', 'Working hours'),
('social_links', '{"instagram": "https://www.instagram.com/sandukhar", "facebook": "https://www.facebook.com/sandukhar", "pinterest": "https://www.pinterest.com/sandukhar"}', 'Social media links');