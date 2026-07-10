/**
 * ============================================================
 * SAN DUKHAR — INTERNATIONALIZATION MODULE (FULLY FIXED)
 * Complete Multi-language Support: English & Russian
 * Version: 2.0 — All Translation Issues Resolved
 * ============================================================
 */

'use strict';

const SD_I18N = {
    currentLocale: 'en',
    supportedLocales: ['en', 'ru'],
    translations: {},
    initialized: false,
    observer: null,

    /**
     * Complete translation dictionaries.
     * EVERY text element on the site has a corresponding key.
     */
    dictionaries: {
        en: {
            // === HEADER ===
            'nav_home': 'Home',
            'nav_collections': 'Collections',
            'nav_materials': 'Materials',
            'nav_bespoke': 'Bespoke',
            'nav_atelier': 'Atelier',
            'nav_contact': 'Contact',
            'nav_search_placeholder': 'Search for leather, products, materials...',
            'nav_by_product': 'By Product',
            'nav_by_material': 'By Material',
            'nav_jackets': 'Leather Jackets',
            'nav_bags': 'Bags & Briefcases',
            'nav_shoes': 'Footwear',
            'nav_accessories': 'Small Leather Goods',
            'nav_crocodile': 'Crocodile Leather',
            'nav_python': 'Python Leather',
            'nav_ostrich': 'Ostrich Leather',
            'nav_stingray': 'Stingray Leather',
            'nav_lizard': 'Lizard Leather',
            'nav_new_arrivals': 'The Croco Collection — Limited Series',

            // === HERO ===
            'hero_line1': 'Where Nature Meets',
            'hero_line2': 'Centuries of Craft',
            'hero_subtitle': 'The finest exotic leather goods, handcrafted in the heart of Istanbul. From our atelier to the world, each piece is a statement of timeless luxury and individuality.',
            'hero_explore': 'Explore The Collection',
            'hero_bespoke': 'Bespoke Enquiry',
            'hero_discover': 'Discover',

            // === SECTIONS ===
            'section_featured': 'Collection',
            'section_featured_desc': 'A study in power and precision. Crafted from the rarest Nile crocodile skins, each piece is a testament to nature\'s artistry and human skill. Limited to a series of 25 worldwide.',
            'section_view_collection': 'View Full Collection',
            'section_materials': 'Exquisite Materials',
            'section_materials_desc': 'We travel the globe to source only the finest, ethically farmed exotic leathers. Each material has a distinct character, texture, and story.',
            'section_bespoke_cta': 'Bespoke Tailoring',
            'section_bespoke_desc': 'A garment crafted solely for you. Experience the ultimate in personal expression with our master tailors.',
            'section_begin_journey': 'Begin Your Journey',
            'section_lookbook': 'The Visual Diary',
            'section_lookbook_desc': 'Follow @sandukhar for a glimpse into our world of craft, travel, and timeless style.',
            'section_testimonials': 'Words from Our Patrons',
            'section_newsletter': 'A Glimpse into Our World',
            'section_newsletter_desc': 'Receive exclusive previews of new collections, invitations to private events, and stories from our Istanbul atelier.',
            'section_newsletter_placeholder': 'Your Email Address',
            'section_subscribe': 'Subscribe',
            'section_privacy_note': 'We respect your privacy. Unsubscribe anytime.',

            // === BRAND STORY ===
            'brand_title': 'The Atelier of Silent Luxury',
            'brand_desc1': 'SAN DUKHAR was born from a profound respect for nature\'s most exquisite materials. Founded in Istanbul in 2008, our maison bridges the ancient traditions of Anatolian craftsmanship with a relentless pursuit of perfection.',
            'brand_desc2': 'Every stitch, every cut, and every polish is performed by a master artisan whose hands have spent decades perfecting a single skill.',
            'brand_discover': 'Discover Our Philosophy',

            // === PROMISE ===
            'promise_handmade_title': 'Handcrafted in Istanbul',
            'promise_handmade_desc': 'Over 80 hours of meticulous labor by a single master artisan goes into every major piece.',
            'promise_certificate_title': 'Certificate of Authenticity',
            'promise_certificate_desc': 'Each creation arrives with a signed certificate and a hand-numbered identification plate.',
            'promise_repair_title': 'Lifetime Restoration',
            'promise_repair_desc': 'We offer complimentary cleaning and discounted restoration for the lifetime of your SAN DUKHAR piece.',
            'promise_limited_title': 'Limited Production',
            'promise_limited_desc': 'We intentionally limit our collections to ensure exclusivity and uncompromised quality control.',

            // === TESTIMONIALS ===
            'testimonial_1': '"The Imperium Briefcase is not merely an accessory; it is a companion for life. The scent of the leather, the sound of the lock — it\'s pure mechanical poetry."',
            'testimonial_1_author': '— A. R. Voss, Zurich',
            'testimonial_2': '"Commissioning a bespoke jacket from SAN DUKHAR was one of the most personal and rewarding experiences I\'ve ever had. The fit is, predictably, flawless."',
            'testimonial_2_author': '— L. E. Moreau, Paris',
            'testimonial_3': '"I inherited a SAN DUKHAR wallet from my father. It\'s 15 years old and looks as magnificent as the day he bought it. This is what true luxury means."',
            'testimonial_3_author': '— K. Tanaka, Tokyo',

            // === CATALOG ===
            'catalog_title': 'The Collections',
            'catalog_subtitle': 'Each piece is a dialogue between nature\'s finest materials and human artistry.',
            'catalog_filters': 'Filters',
            'catalog_refine': 'Refine Selection',
            'catalog_clear_all': 'Clear All',
            'catalog_sort': 'Sort by',
            'catalog_featured': 'Featured',
            'catalog_newest': 'Newest Arrivals',
            'catalog_price_low': 'Price: Low to High',
            'catalog_price_high': 'Price: High to Low',
            'catalog_name': 'Name: A to Z',
            'catalog_results': 'Creations',
            'catalog_empty_title': 'No creations found',
            'catalog_empty_desc': 'We couldn\'t find any pieces matching your current filters.',
            'catalog_empty_btn': 'View All Collections',
            'catalog_category': 'Category',
            'catalog_material_filter': 'Material',
            'catalog_color': 'Color',
            'catalog_price_range': 'Price Range',
            'catalog_availability': 'Availability',
            'catalog_in_stock': 'In Stock',
            'catalog_made_to_order': 'Made to Order',
            'catalog_limited': 'Limited Edition',
            'catalog_apply_price': 'Apply',

            // === PRODUCT ===
            'product_breadcrumb_home': 'Home',
            'product_breadcrumb_collections': 'Collections',
            'product_collection_label': 'Collection',
            'product_limited_notice': 'Limited production — Only 25 pieces worldwide',
            'product_color': 'Color',
            'product_hardware': 'Hardware',
            'product_personalization': 'Personalization',
            'product_add_monogram': 'Add Monogram (+$450)',
            'product_monogram_hint': 'Up to 4 characters, hand-embossed',
            'product_add_to_cart': 'Add to Cart',
            'product_added_to_cart': 'Added to Cart',
            'product_bespoke_link': 'Prefer a bespoke version?',
            'product_bespoke_span': 'Commission a custom piece →',
            'product_description': 'Description & Details',
            'product_shipping': 'Shipping & Delivery',
            'product_care': 'Care & Guarantee',
            'product_video_title': 'The Art of Creation',
            'product_video_desc': 'Witness the journey of the Imperium Briefcase — from the selection of the skin to the final polish.',
            'product_reviews': 'Patron Reviews',
            'product_related': 'Complete the Ensemble',
            'product_verified': 'Verified Purchase',
            'product_360_view': '360° View',
            'product_watch_video': 'Watch Product Video',
            'product_unique_handmade': 'Handmade by a Single Artisan',
            'product_unique_handmade_desc': 'Over 120 hours of uninterrupted craftsmanship',
            'product_unique_certificate': 'Certificate of Authenticity',
            'product_unique_certificate_desc': 'Signed and hand-numbered',
            'product_unique_repair': 'Lifetime Restoration',
            'product_unique_repair_desc': 'Complimentary maintenance program',
            'product_unique_limited': 'Limited Production',
            'product_unique_limited_desc': 'Only 25 pieces in existence',
            'product_price_note': 'Taxes & duties included',

            // === CART ===
            'cart_title': 'Your Selection',
            'cart_empty_title': 'Your Cart Awaits',
            'cart_empty_desc': 'You haven\'t added any creations to your selection yet.',
            'cart_empty_btn': 'Explore Collections',
            'cart_summary': 'Order Summary',
            'cart_subtotal': 'Subtotal',
            'cart_shipping': 'Shipping',
            'cart_shipping_value': 'Complimentary',
            'cart_tax': 'Taxes & Duties',
            'cart_tax_value': 'Included',
            'cart_total': 'Total',
            'cart_checkout': 'Proceed to Checkout',
            'cart_promo': 'Promo Code',
            'cart_secure': 'Secure payment · Complimentary shipping',
            'remove': 'Remove',

            // === CHECKOUT ===
            'checkout_title': 'Complete Your Order',
            'checkout_shipping_info': 'Shipping Information',
            'checkout_first_name': 'First Name',
            'checkout_last_name': 'Last Name',
            'checkout_email': 'Email Address',
            'checkout_phone': 'Phone Number',
            'checkout_address': 'Address',
            'checkout_city': 'City',
            'checkout_postal': 'Postal Code',
            'checkout_country': 'Country',
            'checkout_shipping_method': 'Shipping Method',
            'checkout_white_glove': 'Complimentary White-Glove Delivery',
            'checkout_white_glove_desc': 'Armored courier · 4-6 weeks · Fully insured',
            'checkout_express': 'Express Delivery (+$450)',
            'checkout_express_desc': 'Priority handling · 2-3 weeks · Fully insured',
            'checkout_payment_method': 'Payment Method',
            'checkout_card': 'Credit Card',
            'checkout_card_desc': 'Visa, Mastercard, American Express',
            'checkout_transfer': 'Bank Transfer',
            'checkout_transfer_desc': 'Wire transfer details provided after order confirmation',
            'checkout_card_number': 'Card Number',
            'checkout_expiry': 'Expiry Date',
            'checkout_cvc': 'CVC',
            'checkout_card_name': 'Name on Card',
            'checkout_place_order': 'Place Order Securely',
            'checkout_secure': 'Secured by 256-bit SSL encryption',
            'checkout_order_summary': 'Order Summary',
            'checkout_select_country': 'Select country',

            // === ACCOUNT ===
            'account_title': 'My Account',
            'account_orders': 'Order History',
            'account_wishlist': 'Wishlist',
            'account_addresses': 'Addresses',
            'account_measurements': 'Measurements',
            'account_profile': 'Profile',
            'account_empty_wishlist': 'Your wishlist is currently empty.',
            'account_primary_address': 'Primary Address',
            'account_add_address': 'Add New Address',
            'account_save_measurements': 'Save Measurements',
            'account_update_profile': 'Update Profile',
            'account_chest': 'Chest (cm)',
            'account_waist': 'Waist (cm)',
            'account_shoulder': 'Shoulder Width (cm)',
            'account_sleeve': 'Sleeve Length (cm)',
            'account_first_name': 'First Name',
            'account_last_name': 'Last Name',
            'account_email': 'Email Address',
            'account_phone': 'Phone Number',
            'account_track_order': 'Track Order',
            'account_status_production': 'In Production',
            'account_status_delivered': 'Delivered',

            // === WISHLIST ===
            'wishlist_title': 'Your Curated Selection',
            'wishlist_count_zero': '0 pieces saved',
            'wishlist_count_one': '1 piece saved',
            'wishlist_count_many': 'pieces saved',
            'wishlist_empty_title': 'Your Collection Awaits',
            'wishlist_empty_desc': 'Pieces you save will appear here — a personal gallery of creations that inspire you.',
            'wishlist_empty_btn': 'Explore Collections',

            // === TRACK ORDER ===
            'track_title': 'Track Your Creation',
            'track_subtitle': 'Enter your order number to follow the journey of your piece.',
            'track_placeholder': 'Order number (e.g., SD-2026-001)',
            'track_button': 'Track Order',
            'track_not_found_title': 'Order Not Found',
            'track_not_found_desc': 'We couldn\'t locate an order with that number.',
            'track_contact': 'Contact Concierge',
            'track_step_confirmed': 'Order Confirmed',
            'track_step_confirmed_desc': 'Your order has been received and confirmed.',
            'track_step_material': 'Material Selection',
            'track_step_material_desc': 'Our master cutter has selected the finest skin.',
            'track_step_crafting': 'Artisan Crafting',
            'track_step_crafting_desc': 'Your piece is being handcrafted in our Istanbul atelier.',
            'track_step_inspection': 'Quality Inspection',
            'track_step_inspection_desc': 'Every creation undergoes a rigorous 47-point quality inspection.',
            'track_step_delivery': 'White-Glove Delivery',
            'track_step_delivery_desc': 'Your piece will be delivered by armored courier.',
            'track_status_pending': 'Pending',
            'track_status_progress': 'In Progress',
            'track_searching': 'Searching...',

            // === FOOTER ===
            'footer_brand_desc': 'The pinnacle of genuine exotic leather craftsmanship. Since 2008, Istanbul.',
            'footer_customer_care': 'Customer Care',
            'footer_contact_faq': 'Contact & FAQ',
            'footer_shipping_delivery': 'Shipping & Delivery',
            'footer_returns': 'Returns & Exchanges',
            'footer_track': 'Track Your Order',
            'footer_care_guide': 'Care Guide',
            'footer_maison': 'Our Maison',
            'footer_brand_story': 'Brand Story',
            'footer_materials': 'Materials',
            'footer_bespoke': 'Bespoke',
            'footer_careers': 'Careers',
            'footer_legal': 'Legal',
            'footer_privacy': 'Privacy Policy',
            'footer_terms': 'Terms & Conditions',
            'footer_cookies': 'Cookie Policy',
            'footer_istanbul': 'Istanbul Atelier',
            'footer_copyright': '© 2026 SAN DUKHAR. All rights reserved. Handcrafted with pride in Turkey.',

            // === CONTACT ===
            'concierge': 'Concierge',
            'concierge_subtitle': 'We are at your service. Whether you seek a bespoke commission, have a question, or wish to visit — we welcome your enquiry.',
            'contact_telephone': 'Telephone',
            'contact_email': 'Email',
            'contact_press': 'Press & Partnerships',
            'contact_istanbul_atelier': 'Istanbul Atelier',
            'contact_atelier_hours': 'Monday – Saturday: 10:00 – 19:00',
            'contact_atelier_sunday': 'Sunday: By appointment only',
            'contact_available_hours': 'Available during atelier hours.',
            'contact_respond_time': 'We respond to all emails within 24 hours.',
            'contact_nature_enquiry': 'Nature of Enquiry',
            'contact_bespoke_commission': 'Bespoke Commission',
            'contact_product_information': 'Product Information',
            'contact_order_status': 'Order Status',
            'contact_atelier_visit': 'Atelier Visit',
            'contact_press_media': 'Press & Media',
            'contact_other': 'Other',
            'contact_your_message': 'Your message...',
            'contact_send_enquiry': 'Send Enquiry',
            'contact_enquiry_sent': 'Enquiry Sent',
            'contact_phone_placeholder': '+90 555 123 45 67',

            // === TAILORING ===
            'tailoring_title': 'Bespoke Atelier',
            'tailoring_subtitle': 'A creation that exists only because you imagined it.',
            'tailoring_process_title': 'The Commission Process',
            'tailoring_process_desc': 'Each bespoke commission is a collaboration between you and our master artisan. The process takes 6–10 weeks.',
            'tailoring_step_product': 'Product',
            'tailoring_step_material': 'Material',
            'tailoring_step_color': 'Color',
            'tailoring_step_lining': 'Lining',
            'tailoring_step_hardware': 'Hardware',
            'tailoring_step_size': 'Size',
            'tailoring_step_notes': 'Notes',
            'tailoring_select_creation': 'Select Your Creation',
            'tailoring_choose_leather': 'Choose Your Leather',
            'tailoring_select_color': 'Select Color',
            'tailoring_interior_lining': 'Interior Lining',
            'tailoring_hardware_finish': 'Hardware Finish',
            'tailoring_size_measurements': 'Size & Measurements',
            'tailoring_final_details': 'Final Details',
            'tailoring_additional_notes': 'Additional Notes',
            'tailoring_describe_vision': 'Describe any specific details, inspiration, or requirements...',
            'tailoring_submit_enquiry': 'Submit Enquiry',
            'tailoring_enquiry_sent': 'Enquiry Sent',
            'tailoring_continue': 'Continue →',
            'tailoring_back': '← Back',
            'tailoring_jacket': 'Leather Jacket',
            'tailoring_bag': 'Bag / Briefcase',
            'tailoring_shoes': 'Footwear',
            'tailoring_accessory': 'Accessory',
            'tailoring_other': 'Other',
            'tailoring_standard_size': 'Standard Size',
            'tailoring_custom_measure': 'Custom Measurements',
            'tailoring_atelier_visit': 'Atelier Visit',

            // === TOASTS / NOTIFICATIONS ===
            'cart_added': 'Added to your selection',
            'promo_applied': 'Promo code applied',
            'wishlist_added': 'Added to wishlist',
            'wishlist_removed': 'Removed from wishlist',

            // === MISC ===
            'quick_view': 'Quick View',
            'view_details': 'View Full Details',
            'limited_edition': 'Limited Edition',
            'made_to_order': 'Made to Order',
            'in_stock': 'In Stock',
            'price_upon_request': 'Price upon request',
            'apply': 'Apply',
            'save': 'Save',
            'cancel': 'Cancel',
            'close': 'Close',
            'loading': 'Loading...',
            'no_image': 'No image',
            'continue_shopping': 'Continue Shopping',
            'explore_btn': 'Explore Collections',
            'send_enquiry': 'Send Enquiry',
            'enquiry_sent': 'Enquiry Sent',
            'your_message': 'Your message...',
            'additional_notes': 'Additional Notes',
            'submit_enquiry': 'Submit Enquiry',
            'select_country': 'Select country',
            'newsletter_email_placeholder': 'Your Email Address',

            // === Попытки ===
            'materials-hero-content': 'Natures most extraordinary skins, ethically sourced and transformed by human hands into objects of enduring beauty.',

        },

        ru: {

            // === Попытки ===
            'materials-hero-content': 'Ты лох бро',

            // === HEADER ===
            'nav_home': 'Главная',
            'nav_collections': 'Коллекции',
            'nav_materials': 'Материалы',
            'nav_bespoke': 'Индив. пошив',
            'nav_atelier': 'Ателье',
            'nav_contact': 'Контакты',
            'nav_search_placeholder': 'Поиск по коже, изделиям, материалам...',
            'nav_by_product': 'По типу изделия',
            'nav_by_material': 'По материалу',
            'nav_jackets': 'Кожаные куртки',
            'nav_bags': 'Сумки и портфели',
            'nav_shoes': 'Обувь',
            'nav_accessories': 'Малые кожаные изделия',
            'nav_crocodile': 'Кожа крокодила',
            'nav_python': 'Кожа питона',
            'nav_ostrich': 'Кожа страуса',
            'nav_stingray': 'Кожа ската',
            'nav_lizard': 'Кожа ящерицы',
            'nav_new_arrivals': 'Коллекция Imperium — Лимитированная серия',

            // === HERO ===
            'hero_line1': 'Там, где природа встречает',
            'hero_line2': 'Многовековое мастерство',
            'hero_subtitle': 'Изысканные изделия из экзотической кожи, созданные вручную в самом сердце Стамбула. От нашего ателье — всему миру. Каждое изделие — воплощение вечной роскоши и индивидуальности.',
            'hero_explore': 'Смотреть коллекцию',
            'hero_bespoke': 'Заказать индивидуально',
            'hero_discover': 'Узнать больше',

            // === SECTIONS ===
            'section_featured': 'Коллекция',
            'section_featured_desc': 'Исследование силы и точности. Создано из редчайшей кожи нильского крокодила. Каждое изделие — свидетельство искусства природы и человеческого мастерства. Лимитированная серия из 25 экземпляров.',
            'section_view_collection': 'Смотреть всю коллекцию',
            'section_materials': 'Изысканные материалы',
            'section_materials_desc': 'Мы путешествуем по всему миру в поисках лучшей, этично выращенной экзотической кожи. Каждый материал обладает уникальным характером, текстурой и историей.',
            'section_bespoke_cta': 'Индивидуальный пошив',
            'section_bespoke_desc': 'Изделие, созданное исключительно для вас. Испытайте высшую степень самовыражения с нашими мастерами.',
            'section_begin_journey': 'Начать путешествие',
            'section_lookbook': 'Визуальный дневник',
            'section_lookbook_desc': 'Подпишитесь на @sandukhar, чтобы заглянуть в наш мир мастерства, путешествий и вечного стиля.',
            'section_testimonials': 'Слова наших клиентов',
            'section_newsletter': 'Окно в наш мир',
            'section_newsletter_desc': 'Получайте эксклюзивные превью новых коллекций, приглашения на частные мероприятия и истории из нашего стамбульского ателье.',
            'section_newsletter_placeholder': 'Ваш email',
            'section_subscribe': 'Подписаться',
            'section_privacy_note': 'Мы уважаем вашу конфиденциальность. Отписка в любое время.',

            // === BRAND STORY ===
            'brand_title': 'Ателье тихой роскоши',
            'brand_desc1': 'SAN DUKHAR родился из глубокого уважения к самым изысканным материалам природы. Основанный в Стамбуле в 2008 году, наш Дом соединяет древние традиции анатолийского мастерства с неустанным стремлением к совершенству.',
            'brand_desc2': 'Каждый стежок, каждый срез и каждая полировка выполняются мастером, чьи руки десятилетиями оттачивали одно-единственное умение.',
            'brand_discover': 'Узнать нашу философию',

            // === PROMISE ===
            'promise_handmade_title': 'Ручная работа в Стамбуле',
            'promise_handmade_desc': 'Более 80 часов кропотливого труда одного мастера вложено в каждое крупное изделие.',
            'promise_certificate_title': 'Сертификат подлинности',
            'promise_certificate_desc': 'Каждое изделие сопровождается подписанным сертификатом и номерной идентификационной табличкой.',
            'promise_repair_title': 'Пожизненная реставрация',
            'promise_repair_desc': 'Мы предлагаем бесплатную чистку и льготную реставрацию на весь срок службы вашего изделия SAN DUKHAR.',
            'promise_limited_title': 'Ограниченное производство',
            'promise_limited_desc': 'Мы намеренно ограничиваем тираж коллекций, чтобы гарантировать эксклюзивность и бескомпромиссный контроль качества.',

            // === TESTIMONIALS ===
            'testimonial_1': '«Портфель Imperium — не просто аксессуар, это спутник жизни. Аромат кожи, звук замка — это чистая механическая поэзия.»',
            'testimonial_1_author': '— А. Р. Восс, Цюрих',
            'testimonial_2': '«Заказ индивидуальной куртки в SAN DUKHAR стал одним из самых личных и впечатляющих событий в моей жизни. Посадка, как и ожидалось, безупречна.»',
            'testimonial_2_author': '— Л. Э. Моро, Париж',
            'testimonial_3': '«Я унаследовал бумажник SAN DUKHAR от отца. Ему 15 лет, и он выглядит так же великолепно, как в день покупки. Вот что значит истинная роскошь.»',
            'testimonial_3_author': '— К. Танака, Токио',

            // === CATALOG ===
            'catalog_title': 'Коллекции',
            'catalog_subtitle': 'Каждое изделие — диалог между лучшими материалами природы и человеческим мастерством.',
            'catalog_filters': 'Фильтры',
            'catalog_refine': 'Уточнить выбор',
            'catalog_clear_all': 'Очистить всё',
            'catalog_sort': 'Сортировка',
            'catalog_featured': 'Рекомендуемые',
            'catalog_newest': 'Новые поступления',
            'catalog_price_low': 'Цена: по возрастанию',
            'catalog_price_high': 'Цена: по убыванию',
            'catalog_name': 'Название: А-Я',
            'catalog_results': 'Изделий',
            'catalog_empty_title': 'Ничего не найдено',
            'catalog_empty_desc': 'По вашему запросу ничего не найдено. Попробуйте изменить параметры фильтрации.',
            'catalog_empty_btn': 'Смотреть все коллекции',
            'catalog_category': 'Категория',
            'catalog_material_filter': 'Материал',
            'catalog_color': 'Цвет',
            'catalog_price_range': 'Диапазон цен',
            'catalog_availability': 'Доступность',
            'catalog_in_stock': 'В наличии',
            'catalog_made_to_order': 'На заказ',
            'catalog_limited': 'Лимитированная серия',
            'catalog_apply_price': 'Применить',

            // === PRODUCT ===
            'product_breadcrumb_home': 'Главная',
            'product_breadcrumb_collections': 'Коллекции',
            'product_collection_label': 'Коллекция Imperium',
            'product_limited_notice': 'Лимитированное производство — Всего 25 экземпляров в мире',
            'product_color': 'Цвет',
            'product_hardware': 'Фурнитура',
            'product_personalization': 'Персонализация',
            'product_add_monogram': 'Добавить монограмму (+$450)',
            'product_monogram_hint': 'До 4 символов, ручное тиснение',
            'product_add_to_cart': 'Добавить в корзину',
            'product_added_to_cart': 'Добавлено в корзину',
            'product_bespoke_link': 'Предпочитаете индивидуальную версию?',
            'product_bespoke_span': 'Заказать уникальное изделие →',
            'product_description': 'Описание и детали',
            'product_shipping': 'Доставка',
            'product_care': 'Уход и гарантия',
            'product_video_title': 'Искусство создания',
            'product_video_desc': 'Станьте свидетелем пути портфеля Imperium — от отбора кожи до финальной полировки.',
            'product_reviews': 'Отзывы клиентов',
            'product_related': 'Дополните ансамбль',
            'product_verified': 'Подтверждённая покупка',
            'product_360_view': 'Обзор 360°',
            'product_watch_video': 'Смотреть видео',
            'product_unique_handmade': 'Ручная работа одного мастера',
            'product_unique_handmade_desc': 'Более 120 часов непрерывного труда',
            'product_unique_certificate': 'Сертификат подлинности',
            'product_unique_certificate_desc': 'Подписан и пронумерован вручную',
            'product_unique_repair': 'Пожизненная реставрация',
            'product_unique_repair_desc': 'Бесплатная программа обслуживания',
            'product_unique_limited': 'Ограниченный тираж',
            'product_unique_limited_desc': 'Всего 25 экземпляров в мире',
            'product_price_note': 'Налоги и пошлины включены',

            // === CART ===
            'cart_title': 'Ваша корзина',
            'cart_empty_title': 'Корзина ждёт',
            'cart_empty_desc': 'Вы ещё не добавили ни одного изделия. Исследуйте наши коллекции, чтобы найти достойные экземпляры.',
            'cart_empty_btn': 'Смотреть коллекции',
            'cart_summary': 'Сводка заказа',
            'cart_subtotal': 'Подытог',
            'cart_shipping': 'Доставка',
            'cart_shipping_value': 'Бесплатно',
            'cart_tax': 'Налоги и пошлины',
            'cart_tax_value': 'Включено',
            'cart_total': 'Итого',
            'cart_checkout': 'Оформить заказ',
            'cart_promo': 'Промокод',
            'cart_secure': 'Безопасный платёж · Бесплатная доставка',
            'remove': 'Удалить',

            // === CHECKOUT ===
            'checkout_title': 'Завершение заказа',
            'checkout_shipping_info': 'Информация о доставке',
            'checkout_first_name': 'Имя',
            'checkout_last_name': 'Фамилия',
            'checkout_email': 'Email',
            'checkout_phone': 'Телефон',
            'checkout_address': 'Адрес',
            'checkout_city': 'Город',
            'checkout_postal': 'Почтовый индекс',
            'checkout_country': 'Страна',
            'checkout_shipping_method': 'Способ доставки',
            'checkout_white_glove': 'Премиум-доставка (Бесплатно)',
            'checkout_white_glove_desc': 'Бронированный курьер · 4-6 недель · Полная страховка',
            'checkout_express': 'Экспресс-доставка (+$450)',
            'checkout_express_desc': 'Приоритетная обработка · 2-3 недели · Полная страховка',
            'checkout_payment_method': 'Способ оплаты',
            'checkout_card': 'Банковская карта',
            'checkout_card_desc': 'Visa, Mastercard, American Express',
            'checkout_transfer': 'Банковский перевод',
            'checkout_transfer_desc': 'Реквизиты будут отправлены после подтверждения заказа',
            'checkout_card_number': 'Номер карты',
            'checkout_expiry': 'Срок действия',
            'checkout_cvc': 'CVC',
            'checkout_card_name': 'Имя на карте',
            'checkout_place_order': 'Оформить заказ',
            'checkout_secure': 'Защищено 256-битным SSL-шифрованием',
            'checkout_order_summary': 'Состав заказа',
            'checkout_select_country': 'Выберите страну',

            // === ACCOUNT ===
            'account_title': 'Личный кабинет',
            'account_orders': 'История заказов',
            'account_wishlist': 'Избранное',
            'account_addresses': 'Адреса',
            'account_measurements': 'Мерки',
            'account_profile': 'Профиль',
            'account_empty_wishlist': 'Список избранного пуст.',
            'account_primary_address': 'Основной адрес',
            'account_add_address': 'Добавить адрес',
            'account_save_measurements': 'Сохранить мерки',
            'account_update_profile': 'Обновить профиль',
            'account_chest': 'Обхват груди (см)',
            'account_waist': 'Обхват талии (см)',
            'account_shoulder': 'Ширина плеч (см)',
            'account_sleeve': 'Длина рукава (см)',
            'account_first_name': 'Имя',
            'account_last_name': 'Фамилия',
            'account_email': 'Email',
            'account_phone': 'Телефон',
            'account_track_order': 'Отследить',
            'account_status_production': 'В производстве',
            'account_status_delivered': 'Доставлен',

            // === WISHLIST ===
            'wishlist_title': 'Ваше избранное',
            'wishlist_count_zero': 'Нет сохранённых изделий',
            'wishlist_count_one': '1 изделие сохранено',
            'wishlist_count_many': 'изделий сохранено',
            'wishlist_empty_title': 'Коллекция ждёт',
            'wishlist_empty_desc': 'Сохранённые изделия появятся здесь — ваша личная галерея творений, которые вас вдохновляют.',
            'wishlist_empty_btn': 'Смотреть коллекции',

            // === TRACK ORDER ===
            'track_title': 'Отследить заказ',
            'track_subtitle': 'Введите номер заказа, чтобы следить за путём вашего изделия от ателье до ваших рук.',
            'track_placeholder': 'Номер заказа (например, SD-2026-001)',
            'track_button': 'Отследить',
            'track_not_found_title': 'Заказ не найден',
            'track_not_found_desc': 'Мы не смогли найти заказ с таким номером.',
            'track_contact': 'Связаться с консьержем',
            'track_step_confirmed': 'Заказ подтверждён',
            'track_step_confirmed_desc': 'Ваш заказ получен и подтверждён.',
            'track_step_material': 'Подбор материала',
            'track_step_material_desc': 'Наш мастер выбрал лучшую кожу для вашего изделия.',
            'track_step_crafting': 'Работа мастера',
            'track_step_crafting_desc': 'Ваше изделие создаётся вручную в нашем стамбульском ателье.',
            'track_step_inspection': 'Контроль качества',
            'track_step_inspection_desc': 'Каждое изделие проходит строгую проверку по 47 пунктам.',
            'track_step_delivery': 'Премиум-доставка',
            'track_step_delivery_desc': 'Ваше изделие будет доставлено бронированным курьером.',
            'track_status_pending': 'Ожидается',
            'track_status_progress': 'В процессе',
            'track_searching': 'Поиск...',

            // === FOOTER ===
            'footer_brand_desc': 'Вершина мастерства из подлинной экзотической кожи. С 2008 года, Стамбул.',
            'footer_customer_care': 'Поддержка',
            'footer_contact_faq': 'Контакты и FAQ',
            'footer_shipping_delivery': 'Доставка',
            'footer_returns': 'Возврат и обмен',
            'footer_track': 'Отследить заказ',
            'footer_care_guide': 'Руководство по уходу',
            'footer_maison': 'Наш Дом',
            'footer_brand_story': 'История бренда',
            'footer_materials': 'Материалы',
            'footer_bespoke': 'Индивидуальный пошив',
            'footer_careers': 'Карьера',
            'footer_legal': 'Юридическая информация',
            'footer_privacy': 'Политика конфиденциальности',
            'footer_terms': 'Условия использования',
            'footer_cookies': 'Политика cookie',
            'footer_istanbul': 'Ателье в Стамбуле',
            'footer_copyright': '© 2026 SAN DUKHAR. Все права защищены. С гордостью создано в Турции.',

            // === CONTACT ===
            'concierge': 'Консьерж',
            'concierge_subtitle': 'Мы к вашим услугам. Будь то индивидуальный заказ, вопрос или желание посетить ателье — мы будем рады вашему обращению.',
            'contact_telephone': 'Телефон',
            'contact_email': 'Email',
            'contact_press': 'Пресса и партнёрства',
            'contact_istanbul_atelier': 'Ателье в Стамбуле',
            'contact_atelier_hours': 'Понедельник – Суббота: 10:00 – 19:00',
            'contact_atelier_sunday': 'Воскресенье: Только по записи',
            'contact_available_hours': 'Доступны в часы работы ателье.',
            'contact_respond_time': 'Отвечаем на все письма в течение 24 часов.',
            'contact_nature_enquiry': 'Тема обращения',
            'contact_bespoke_commission': 'Индивидуальный заказ',
            'contact_product_information': 'Информация о товаре',
            'contact_order_status': 'Статус заказа',
            'contact_atelier_visit': 'Визит в ателье',
            'contact_press_media': 'Пресса и СМИ',
            'contact_other': 'Другое',
            'contact_your_message': 'Ваше сообщение...',
            'contact_send_enquiry': 'Отправить запрос',
            'contact_enquiry_sent': 'Запрос отправлен',
            'contact_phone_placeholder': '+90 555 123 45 67',

            // === TAILORING ===
            'tailoring_title': 'Ателье индивидуального пошива',
            'tailoring_subtitle': 'Творение, которое существует только потому, что вы его представили.',
            'tailoring_process_title': 'Процесс создания',
            'tailoring_process_desc': 'Каждый индивидуальный заказ — это сотрудничество между вами и нашим мастером. Процесс занимает 6–10 недель.',
            'tailoring_step_product': 'Изделие',
            'tailoring_step_material': 'Материал',
            'tailoring_step_color': 'Цвет',
            'tailoring_step_lining': 'Подкладка',
            'tailoring_step_hardware': 'Фурнитура',
            'tailoring_step_size': 'Размер',
            'tailoring_step_notes': 'Заметки',
            'tailoring_select_creation': 'Выберите изделие',
            'tailoring_choose_leather': 'Выберите кожу',
            'tailoring_select_color': 'Выберите цвет',
            'tailoring_interior_lining': 'Внутренняя подкладка',
            'tailoring_hardware_finish': 'Отделка фурнитуры',
            'tailoring_size_measurements': 'Размеры и мерки',
            'tailoring_final_details': 'Финальные детали',
            'tailoring_additional_notes': 'Дополнительные пожелания',
            'tailoring_describe_vision': 'Опишите детали, вдохновение или особые требования...',
            'tailoring_submit_enquiry': 'Отправить запрос',
            'tailoring_enquiry_sent': 'Запрос отправлен',
            'tailoring_continue': 'Продолжить →',
            'tailoring_back': '← Назад',
            'tailoring_jacket': 'Кожаная куртка',
            'tailoring_bag': 'Сумка / Портфель',
            'tailoring_shoes': 'Обувь',
            'tailoring_accessory': 'Аксессуар',
            'tailoring_other': 'Другое',
            'tailoring_standard_size': 'Стандартный размер',
            'tailoring_custom_measure': 'Индивидуальные мерки',
            'tailoring_atelier_visit': 'Визит в ателье',

            // === TOASTS / NOTIFICATIONS ===
            'cart_added': 'Добавлено в корзину',
            'promo_applied': 'Промокод применён',
            'wishlist_added': 'Добавлено в избранное',
            'wishlist_removed': 'Удалено из избранного',

            // === MISC ===
            'quick_view': 'Быстрый просмотр',
            'view_details': 'Подробнее',
            'limited_edition': 'Лимитированная серия',
            'made_to_order': 'На заказ',
            'in_stock': 'В наличии',
            'price_upon_request': 'Цена по запросу',
            'apply': 'Применить',
            'save': 'Сохранить',
            'cancel': 'Отмена',
            'close': 'Закрыть',
            'loading': 'Загрузка...',
            'no_image': 'Нет изображения',
            'continue_shopping': 'Продолжить покупки',
            'explore_btn': 'Смотреть коллекции',
            'send_enquiry': 'Отправить запрос',
            'enquiry_sent': 'Запрос отправлен',
            'your_message': 'Ваше сообщение...',
            'additional_notes': 'Дополнительные пожелания',
            'submit_enquiry': 'Отправить запрос',
            'select_country': 'Выберите страну',
            'newsletter_email_placeholder': 'Ваш email',
        }
    },

    /**
     * Initialize the i18n system.
     * Determines locale from: URL param > localStorage > browser language > default 'en'.
     */
    init: function(defaultLocale) {
        if (this.initialized) return;

        const urlLocale = this.getUrlParam('lang');
        const storedLocale = localStorage.getItem('sandukhar_locale');
        const browserLocale = this.getBrowserLocale();

        let locale = defaultLocale || urlLocale || storedLocale || browserLocale || 'en';

        if (!this.supportedLocales.includes(locale)) {
            locale = 'en';
        }

        this.currentLocale = locale;
        localStorage.setItem('sandukhar_locale', locale);
        this.translations = this.dictionaries[locale] || this.dictionaries['en'];

        // Initial translation
        this.translatePage();

        // Add language switcher to header
        this.addLanguageSwitcher();

        // Observe DOM for dynamically added elements
        this.startObserver();

        // Listen for cart/wishlist dynamic updates
        document.addEventListener('sd_i18n_update', () => this.translatePage());

        this.initialized = true;

        document.dispatchEvent(new CustomEvent('sd_i18n_ready', { detail: { locale: locale } }));
    },

    /**
     * Switch to a different locale and re-translate the entire page.
     */
    setLocale: function(locale) {
        if (!this.supportedLocales.includes(locale)) return;
        if (locale === this.currentLocale) return;

        this.currentLocale = locale;
        localStorage.setItem('sandukhar_locale', locale);
        this.translations = this.dictionaries[locale] || this.dictionaries['en'];

        this.translatePage();
        this.updateSwitcherButton();

        document.dispatchEvent(new CustomEvent('sd_i18n_changed', { detail: { locale: locale } }));
    },

    /**
     * Get translated string for a key.
     * Falls back to English, then to the key itself if not found.
     */
    t: function(key, params) {
        let text = this.translations[key] || this.dictionaries['en'][key] || key;

        if (params) {
            Object.keys(params).forEach(param => {
                text = text.replace(`{${param}}`, params[param]);
            });
        }

        return text;
    },

    /**
     * Translate all elements with data-i18n attribute.
     * Handles text content, placeholder, title, aria-label, and value attributes.
     */
    translatePage: function() {
        const elements = document.querySelectorAll('[data-i18n]');

        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;

            const translation = this.t(key);
            if (!translation || translation === key) return;

            const attr = el.getAttribute('data-i18n-attr');

            if (attr === 'placeholder') {
                el.setAttribute('placeholder', translation);
            } else if (attr === 'title') {
                el.setAttribute('title', translation);
            } else if (attr === 'aria-label') {
                el.setAttribute('aria-label', translation);
            } else if (attr === 'value') {
                el.setAttribute('value', translation);
            } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // For inputs without data-i18n-attr, set placeholder by default
                el.setAttribute('placeholder', translation);
            } else {
                // For regular elements, replace only direct text content
                this.replaceTextContent(el, translation);
            }
        });

        // Update HTML lang attribute
        document.documentElement.setAttribute('lang', this.currentLocale);
    },

    /**
     * Replace only the direct text content of an element,
     * preserving child elements (SVGs, spans, etc.).
     */
    replaceTextContent: function(el, text) {
        // Check if element has child elements that should be preserved
        const hasChildren = el.children.length > 0;
        const hasNestedI18n = el.querySelector('[data-i18n]');

        if (!hasChildren || hasNestedI18n) {
            // Simple case: just text, or contains nested i18n elements
            // Walk through child nodes and replace only text nodes
            for (let i = 0; i < el.childNodes.length; i++) {
                const node = el.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
                    node.textContent = text;
                    return;
                }
            }
            // If no text node found, prepend
            if (el.childNodes.length === 0) {
                el.textContent = text;
            }
        } else {
            // Has child elements but no nested i18n — replace first text node
            for (let i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === Node.TEXT_NODE) {
                    el.childNodes[i].textContent = text;
                    return;
                }
            }
        }
    },

    /**
     * Add language switcher button to header utilities.
     */
    addLanguageSwitcher: function() {
        if (document.getElementById('lang-switcher')) return;

        const headerUtilities = document.querySelector('.header-utilities');
        if (!headerUtilities) return;

        const switcher = document.createElement('button');
        switcher.id = 'lang-switcher';
        switcher.className = 'utility-btn lang-switcher';
        switcher.setAttribute('aria-label', 'Switch language');
        switcher.innerHTML = this.currentLocale === 'en' ? 'RU' : 'EN';

        switcher.addEventListener('click', () => {
            const newLocale = this.currentLocale === 'en' ? 'ru' : 'en';
            this.setLocale(newLocale);
        });

        const menuTrigger = headerUtilities.querySelector('.menu-trigger');
        if (menuTrigger) {
            headerUtilities.insertBefore(switcher, menuTrigger);
        } else {
            headerUtilities.appendChild(switcher);
        }

        this.injectSwitcherStyles();
    },

    /**
     * Update the language switcher button text and title.
     */
    updateSwitcherButton: function() {
        const switcher = document.getElementById('lang-switcher');
        if (!switcher) return;

        switcher.innerHTML = this.currentLocale === 'en' ? 'RU' : 'EN';
        switcher.setAttribute('title', this.currentLocale === 'en' ? 'Switch to Russian' : 'Switch to English');
    },

    /**
     * Inject minimal styles for the language switcher button.
     */
    injectSwitcherStyles: function() {
        if (document.getElementById('lang-switcher-styles')) return;

        const style = document.createElement('style');
        style.id = 'lang-switcher-styles';
        style.textContent = `
            .lang-switcher {
                font-family: var(--font-body, 'Inter', sans-serif);
                font-size: 0.7rem;
                font-weight: var(--font-weight-semibold, 600);
                letter-spacing: 0.08em;
                color: var(--color-gold, #c5a572) !important;
                border: 1px solid var(--color-gold-pale, rgba(197,165,114,0.15)) !important;
                border-radius: var(--border-radius-sm, 2px);
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all var(--transition-fast, 0.2s ease);
                background: transparent;
            }
            .lang-switcher:hover {
                background: var(--color-gold, #c5a572) !important;
                color: var(--color-black, #0a0a0a) !important;
                border-color: var(--color-gold, #c5a572) !important;
            }
            @media screen and (max-width: 767px) {
                .lang-switcher {
                    width: 32px;
                    height: 32px;
                    font-size: 0.6rem;
                }
            }
        `;
        document.head.appendChild(style);
    },

    /**
     * Start MutationObserver to translate dynamically added content.
     */
    startObserver: function() {
        if (this.observer) this.observer.disconnect();

        const self = this;
        this.observer = new MutationObserver(function(mutations) {
            let shouldTranslate = false;

            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                                shouldTranslate = true;
                                break;
                            }
                            if (node.querySelectorAll && node.querySelectorAll('[data-i18n]').length > 0) {
                                shouldTranslate = true;
                                break;
                            }
                        }
                    }
                }
                if (shouldTranslate) break;
            }

            if (shouldTranslate) {
                self.translatePage();
            }
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    /**
     * Get URL parameter value.
     */
    getUrlParam: function(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    },

    /**
     * Detect browser's preferred language.
     */
    getBrowserLocale: function() {
        const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
        if (lang.startsWith('ru')) return 'ru';
        return 'en';
    }
};

// Expose globally
window.SD_I18N = SD_I18N;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
    SD_I18N.init();
});