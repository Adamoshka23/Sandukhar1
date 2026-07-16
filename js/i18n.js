/**
 * ============================================================
 * SAN DUKHAR — INTERNATIONALIZATION MODULE (v5.0 — COMPLETE)
 * Full dictionaries for EN & RU — All UI elements covered
 * ============================================================
 */

'use strict';

const SD_I18N = {
    currentLocale: 'en',
    supportedLocales: ['en', 'ru'],
    translations: {},
    initialized: false,
    observer: null,

    dictionaries: {
        en: {
            // Header
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
            'nav_new_arrivals': 'The Serpentine Collection — New Arrivals',

            // Hero
            'hero_line1': 'Where Nature Meets',
            'hero_line2': 'Centuries of Craft',
            'hero_subtitle': 'The finest exotic leather goods, handcrafted in the heart of Istanbul. From our atelier to the world, each piece is a statement of timeless luxury and individuality.',
            'hero_explore': 'Explore The Collection',
            'hero_bespoke': 'Bespoke Enquiry',
            'hero_discover': 'Discover',

            // Sections
            'section_featured': 'The Imperium Collection',
            'section_featured_desc': 'A study in power and precision. Crafted from the rarest Nile crocodile skins, each piece is a testament to nature\'s artistry and human skill. Limited to a series of 25 worldwide.',
            'section_view_collection': 'View Full Collection',
            'section_materials': 'Exquisite Materials',
            'section_materials_desc': 'We travel the globe to source only the finest, ethically farmed exotic leathers. Each material has a distinct character, texture, and story.',
            'section_bespoke_cta': 'Bespoke Tailoring',
            'section_bespoke_desc': 'A garment crafted solely for you. Experience the ultimate in personal expression with our master tailors, who will guide you through every detail.',
            'section_begin_journey': 'Begin Your Journey',
            'section_lookbook': 'The Visual Diary',
            'section_lookbook_follow': 'Follow',
            'section_lookbook_glimpse': 'for a glimpse into our world of craft, travel, and timeless style.',
            'section_testimonials': 'Words from Our Patrons',
            'section_newsletter': 'A Glimpse into Our World',
            'section_newsletter_desc': 'Receive exclusive previews of new collections, invitations to private events, and stories from our Istanbul atelier.',
            'section_newsletter_placeholder': 'Your Email Address',
            'section_subscribe': 'Subscribe',
            'section_privacy_note': 'We respect your privacy. Unsubscribe anytime.',

            // Brand
            'brand_title': 'The Atelier of Silent Luxury',
            'brand_desc1': 'SAN DUKHAR was born from a profound respect for nature\'s most exquisite materials. Founded in Istanbul in 2008, our maison bridges the ancient traditions of Anatolian craftsmanship with a relentless pursuit of perfection. We do not follow trends; we create heirlooms designed to transcend generations.',
            'brand_desc2': 'Every stitch, every cut, and every polish is performed by a master artisan whose hands have spent decades perfecting a single skill. We believe that true luxury is not about logos—it\'s about the unmistakable feel of genuine exotic leather, the perfect symmetry of a hand-stitched seam, and the quiet confidence it brings to the person who owns it.',
            'brand_discover': 'Discover Our Philosophy',

            // Materials
            'material_crocodile': 'Crocodile',
            'material_python': 'Python',
            'material_ostrich': 'Ostrich',
            'material_stingray': 'Stingray',
            'material_lizard': 'Lizard',
            'material_porosus': 'Porosus & Niloticus',
            'material_reticulatus': 'Reticulatus & Molurus',
            'material_full_quill': 'Full Quill Crown',
            'material_galuchat': 'Polished Galuchat',
            'material_teju': 'Teju & Varanus',

            // Promise
            'promise_handmade_title': 'Handcrafted in Istanbul',
            'promise_handmade_desc': 'Over 80 hours of meticulous labor by a single master artisan goes into every major piece.',
            'promise_certificate_title': 'Certificate of Authenticity',
            'promise_certificate_desc': 'Each creation arrives with a signed certificate and a hand-numbered identification plate.',
            'promise_repair_title': 'Lifetime Restoration',
            'promise_repair_desc': 'We offer complimentary cleaning and discounted restoration for the lifetime of your SAN DUKHAR piece.',
            'promise_limited_title': 'Limited Production',
            'promise_limited_desc': 'We intentionally limit our collections to ensure exclusivity and uncompromised quality control.',

            // Testimonials
            'testimonial_1': '"The Imperium Briefcase is not merely an accessory; it is a companion for life. The scent of the leather, the sound of the lock—it\'s pure mechanical poetry."',
            'testimonial_1_author': '— A. R. Voss, Zurich',
            'testimonial_2': '"Commissioning a bespoke jacket from SAN DUKHAR was one of the most personal and rewarding experiences I\'ve ever had. The fit is, predictably, flawless."',
            'testimonial_2_author': '— L. E. Moreau, Paris',
            'testimonial_3': '"I inherited a SAN DUKHAR wallet from my father. It\'s 15 years old and looks as magnificent as the day he bought it. This is what true luxury means."',
            'testimonial_3_author': '— K. Tanaka, Tokyo',

            // Catalog
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

            // Product
            'product_breadcrumb_home': 'Home',
            'product_breadcrumb_collections': 'Collections',
            'product_collection_label': 'The Imperium Collection',
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
            'product_video_desc': 'Witness the journey of the Imperium Briefcase.',
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

            // Product — Detailed Specs
            'product_imperium_desc': 'The Imperium Briefcase is the definitive statement of power and refinement. Crafted from a single flawless Nile crocodile skin, selected for its uniform scale pattern and rich matte finish, this briefcase requires over 120 hours of meticulous handwork by a single master artisan in our Istanbul atelier.',
            'product_imperium_spec_1': 'Genuine matte Nile crocodile leather (CITES certified)',
            'product_imperium_spec_2': 'Ruthenium-plated solid brass lock and hinges',
            'product_imperium_spec_3': 'Hand-stitched using waxed linen thread',
            'product_imperium_spec_4': 'Suede leather interior with padded laptop compartment',
            'product_imperium_spec_5': 'Two internal document pockets and card slots',
            'product_imperium_spec_6': 'Detachable shoulder strap in matching leather',
            'product_imperium_spec_7': 'Hand-numbered identification plate',
            'product_imperium_spec_8': 'Dimensions: 42cm × 30cm × 12cm',
            'product_imperium_spec_9': 'Weight: 2.4 kg',
            'product_shipping_desc': 'Each Imperium Briefcase is made to order. Please allow 4–6 weeks for our artisans to complete your piece.',
            'product_shipping_spec_1': 'Complimentary worldwide shipping via armored courier',
            'product_shipping_spec_2': 'Fully insured during transit',
            'product_shipping_spec_3': 'White-glove delivery with personal presentation',
            'product_shipping_spec_4': 'Discreet packaging with SAN DUKHAR signature box',
            'product_care_desc': 'Your SAN DUKHAR creation is designed to last for generations with proper care.',
            'product_care_spec_1': 'Complimentary cleaning and conditioning for the first 5 years',
            'product_care_spec_2': 'Lifetime repair service at a preferential rate',
            'product_care_spec_3': 'Store in the provided dust bag away from direct sunlight',
            'product_care_spec_4': 'Avoid contact with water, alcohol, and abrasive surfaces',
            'product_care_spec_5': 'Certificate of Authenticity included',
            'product_bespoke_cta_title': 'Seeking Something Truly Personal?',
            'product_bespoke_cta_desc': 'Commission a bespoke briefcase tailored to your exact specifications—leather, color, hardware, interior configuration, and personal monogram.',
            'product_bespoke_cta_btn': 'Begin Your Commission',

            // Cart
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

            // Checkout
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
            'checkout_first_name_placeholder': 'First name',
            'checkout_last_name_placeholder': 'Last name',
            'checkout_email_placeholder': 'your@email.com',
            'checkout_address_placeholder': 'Street address',
            'checkout_city_placeholder': 'City',
            'checkout_postal_placeholder': 'Postal code',
            'checkout_card_number_placeholder': '0000 0000 0000 0000',
            'checkout_expiry_placeholder': 'MM/YY',
            'checkout_cvc_placeholder': '123',
            'checkout_card_name_placeholder': 'Name as it appears',

            // Account
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

            // Wishlist
            'wishlist_title': 'Your Curated Selection',
            'wishlist_count_zero': '0 pieces saved',
            'wishlist_count_one': '1 piece saved',
            'wishlist_count_many': 'pieces saved',
            'wishlist_empty_title': 'Your Collection Awaits',
            'wishlist_empty_desc': 'Pieces you save will appear here.',
            'wishlist_empty_btn': 'Explore Collections',

            // Track Order
            'track_title': 'Track Your Creation',
            'track_subtitle': 'Enter your order number to follow the journey.',
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
            'track_step_inspection_desc': 'Every creation undergoes a rigorous 47-point inspection.',
            'track_step_delivery': 'White-Glove Delivery',
            'track_step_delivery_desc': 'Your piece will be delivered by armored courier.',
            'track_status_pending': 'Pending',
            'track_status_progress': 'In Progress',
            'track_searching': 'Searching...',

            // Footer
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

            // Contact
            'concierge': 'Concierge',
            'concierge_subtitle': 'We are at your service.',
            'contact_istanbul_atelier': 'Istanbul Atelier',
            'contact_atelier_hours': 'Monday – Saturday: 10:00 – 19:00',
            'contact_atelier_sunday': 'Sunday: By appointment only',
            'contact_telephone': 'Telephone',
            'contact_available_hours': 'Available during atelier hours.',
            'contact_email': 'Email',
            'contact_respond_time': 'We respond to all emails within 24 hours.',
            'contact_press': 'Press & Partnerships',
            'contact_first_name_placeholder': 'First Name',
            'contact_last_name_placeholder': 'Last Name',
            'contact_email_placeholder': 'Email Address',
            'contact_phone_placeholder': 'Phone Number',
            'contact_message_placeholder': 'Your message...',
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

            // Tailoring
            'tailoring_title': 'Bespoke Atelier',
            'tailoring_subtitle': 'A creation that exists only because you imagined it.',
            'tailoring_process_title': 'The Commission Process',
            'tailoring_process_desc': 'Each bespoke commission is a collaboration between you and our master artisan.',
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
            'tailoring_your_commission': 'Your Commission',
            'tailoring_continue': 'Continue →',
            'tailoring_back': '← Back',
            'tailoring_submit_enquiry': 'Submit Enquiry',
            'tailoring_enquiry_sent': 'Enquiry Sent',
            'tailoring_jacket': 'Leather Jacket',
            'tailoring_jacket_desc': 'Custom fitted',
            'tailoring_bag': 'Bag / Briefcase',
            'tailoring_bag_desc': 'Any configuration',
            'tailoring_shoes': 'Footwear',
            'tailoring_shoes_desc': 'Bespoke last',
            'tailoring_accessory': 'Accessory',
            'tailoring_accessory_desc': 'Wallets, belts, cases',
            'tailoring_other': 'Other',
            'tailoring_other_desc': 'Describe your vision',
            'tailoring_suede': 'Suede',
            'tailoring_suede_desc': 'Soft, luxurious',
            'tailoring_silk': 'Silk',
            'tailoring_silk_desc': 'Elegant sheen',
            'tailoring_smooth_leather': 'Smooth Leather',
            'tailoring_smooth_leather_desc': 'Durable, refined',
            'tailoring_cashmere': 'Cashmere',
            'tailoring_cashmere_desc': 'Ultimate softness',
            'tailoring_gold': 'Gold',
            'tailoring_gold_desc': '24K Plated',
            'tailoring_palladium': 'Palladium',
            'tailoring_palladium_desc': 'Silvery-white',
            'tailoring_ruthenium': 'Ruthenium',
            'tailoring_ruthenium_desc': 'Dark, matte',
            'tailoring_standard_size': 'Standard Size',
            'tailoring_standard_size_desc': 'Provide your usual size',
            'tailoring_custom_measure': 'Custom Measurements',
            'tailoring_custom_measure_desc': 'We\'ll send a guide',
            'tailoring_atelier_visit': 'Atelier Visit',
            'tailoring_atelier_visit_desc': 'Istanbul fitting',
            'tailoring_additional_notes': 'Additional Notes',
            'tailoring_describe_vision': 'Describe any specific details, inspiration, or requirements...',

            // About
            'about_hero_title': 'The Atelier of<br>Silent Luxury',
            'about_hero_text': 'Born in Istanbul in 2008, SAN DUKHAR bridges centuries of Anatolian craftsmanship with a contemporary vision of understated elegance.',
            'about_quote': '"True luxury does not announce itself. It is felt in the weight of a lock, seen in the symmetry of a stitch, and understood in the silence of admiration."',
            'about_quote_author': '— Dukhar San, Founder & Creative Director',
            'about_journey_title': 'Our Journey',
            'about_philosophy_title': 'Our Philosophy',
            'about_artisans_title': 'The Hands Behind the Art',
            'about_timeline_2008_title': 'The First Atelier',
            'about_timeline_2008_text': 'SAN DUKHAR opens its first workshop in Nişantaşı, Istanbul, with a team of three artisans. The inaugural collection features five crocodile briefcases.',
            'about_timeline_2014_title': 'Bespoke Program Launch',
            'about_timeline_2014_text': 'The Bespoke Atelier is established, offering clients the ability to commission completely personalized exotic leather creations.',
            'about_timeline_2017_title': 'The Imperium Collection',
            'about_timeline_2017_text': 'The iconic Imperium Collection debuts — limited-edition crocodile leather pieces that define the house\'s aesthetic.',
            'about_timeline_2020_title': 'Global Recognition',
            'about_timeline_2020_text': 'SAN DUKHAR pieces begin appearing in private collections across Europe, the Middle East, and Asia.',
            'about_timeline_2026_title': 'A New Chapter',
            'about_timeline_2026_text': 'The house unveils its renewed digital presence, bringing the atelier experience to connoisseurs worldwide.',
            'about_philosophy_one_title': 'One Artisan, One Piece',
            'about_philosophy_one_desc': 'Every major creation is the work of a single master from start to finish. This ensures continuity of vision and absolute accountability.',
            'about_philosophy_two_title': 'Intentional Scarcity',
            'about_philosophy_two_desc': 'We produce fewer than 500 pieces per year across all collections. Exclusivity is not a marketing strategy — it is a necessity of our craft.',
            'about_philosophy_three_title': 'Ethical Provenance',
            'about_philosophy_three_desc': 'Every skin is CITES-certified and sourced from farms that meet the highest standards of animal welfare and environmental responsibility.',
            'about_philosophy_four_title': 'Generational Commitment',
            'about_philosophy_four_desc': 'We stand behind our creations for life. Our restoration service ensures your SAN DUKHAR piece can be passed to the next generation.',
            'about_artisan_1_name': 'Mehmet Usta',
            'about_artisan_1_role': 'Master Cutter — 31 years',
            'about_artisan_2_name': 'Ayşe Hanım',
            'about_artisan_2_role': 'Master Stitcher — 25 years',
            'about_artisan_3_name': 'Kemal Bey',
            'about_artisan_3_role': 'Hardware & Finish — 19 years',
            'about_artisan_4_name': 'Dukhar San',
            'about_artisan_4_role': 'Creative Director — 17 years',

            // Quick View Modal
            'qv_product_preview': 'Product Preview',
            'qv_exotic_creation': 'Exotic Leather Creation',
            'qv_handcrafted_desc': 'Handcrafted in our Istanbul atelier from the finest ethically sourced exotic leather. Each piece is unique and made to order.',

            // Colors
            'color_black': 'Black',
            'color_brown': 'Brown',
            'color_cognac': 'Cognac',
            'color_graphite': 'Graphite',
            'color_natural': 'Natural',

            // Pagination
            'pagination_previous': 'Previous Page',
            'pagination_next': 'Next Page',

            // Misc
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
            'cart_added': 'Added to your selection',
            'promo_applied': 'Promo code applied',
            'wishlist_added': 'Added to wishlist',
            'wishlist_removed': 'Removed from wishlist',
        },

        ru: {
            // Header
            'nav_home': 'Главная',
            'nav_collections': 'Коллекции',
            'nav_materials': 'Материалы',
            'nav_bespoke': 'Индивидуальный пошив',
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
            'nav_new_arrivals': 'Коллекция Serpentine — Новые поступления',

            // Hero
            'hero_line1': 'Там, где природа встречает',
            'hero_line2': 'Многовековое мастерство',
            'hero_subtitle': 'Изысканные изделия из экзотической кожи, созданные вручную в самом сердце Стамбула. От нашего ателье — всему миру. Каждое изделие — воплощение вечной роскоши и индивидуальности.',
            'hero_explore': 'Смотреть коллекцию',
            'hero_bespoke': 'Заказать индивидуально',
            'hero_discover': 'Узнать больше',

            // Sections
            'section_featured': 'Коллекция Imperium',
            'section_featured_desc': 'Исследование силы и точности. Создано из редчайшей кожи нильского крокодила. Лимитированная серия из 25 экземпляров.',
            'section_view_collection': 'Смотреть всю коллекцию',
            'section_materials': 'Изысканные материалы',
            'section_materials_desc': 'Мы путешествуем по всему миру в поисках лучшей, этично выращенной экзотической кожи.',
            'section_bespoke_cta': 'Индивидуальный пошив',
            'section_bespoke_desc': 'Изделие, созданное исключительно для вас. Испытайте высшую степень самовыражения с нашими мастерами.',
            'section_begin_journey': 'Начать путешествие',
            'section_lookbook': 'Визуальный дневник',
            'section_lookbook_follow': 'Подпишитесь на',
            'section_lookbook_glimpse': 'чтобы заглянуть в наш мир мастерства, путешествий и вечного стиля.',
            'section_testimonials': 'Слова наших клиентов',
            'section_newsletter': 'Окно в наш мир',
            'section_newsletter_desc': 'Получайте эксклюзивные превью новых коллекций, приглашения на частные мероприятия.',
            'section_newsletter_placeholder': 'Ваш email',
            'section_subscribe': 'Подписаться',
            'section_privacy_note': 'Мы уважаем вашу конфиденциальность. Отписка в любое время.',

            // Brand
            'brand_title': 'Ателье тихой роскоши',
            'brand_desc1': 'SAN DUKHAR родился из глубокого уважения к самым изысканным материалам природы. Основанный в Стамбуле в 2008 году, наш Дом соединяет древние традиции анатолийского мастерства с неустанным стремлением к совершенству.',
            'brand_desc2': 'Каждый стежок, каждый срез и каждая полировка выполняются мастером, чьи руки десятилетиями оттачивали одно-единственное умение.',
            'brand_discover': 'Узнать нашу философию',

            // Materials
            'material_crocodile': 'Крокодил',
            'material_python': 'Питон',
            'material_ostrich': 'Страус',
            'material_stingray': 'Скат',
            'material_lizard': 'Ящерица',
            'material_porosus': 'Porosus & Niloticus',
            'material_reticulatus': 'Reticulatus & Molurus',
            'material_full_quill': 'Full Quill Crown',
            'material_galuchat': 'Полированный галюша',
            'material_teju': 'Teju & Varanus',

            // Promise
            'promise_handmade_title': 'Ручная работа в Стамбуле',
            'promise_handmade_desc': 'Более 80 часов кропотливого труда одного мастера вложено в каждое крупное изделие.',
            'promise_certificate_title': 'Сертификат подлинности',
            'promise_certificate_desc': 'Каждое изделие сопровождается подписанным сертификатом.',
            'promise_repair_title': 'Пожизненная реставрация',
            'promise_repair_desc': 'Бесплатная чистка и льготная реставрация на весь срок службы.',
            'promise_limited_title': 'Ограниченное производство',
            'promise_limited_desc': 'Мы намеренно ограничиваем тираж для гарантии эксклюзивности.',

            // Testimonials
            'testimonial_1': '«Портфель Imperium — не просто аксессуар, это спутник жизни. Аромат кожи, звук замка — это чистая механическая поэзия.»',
            'testimonial_1_author': '— А. Р. Восс, Цюрих',
            'testimonial_2': '«Заказ индивидуальной куртки в SAN DUKHAR стал одним из самых личных и впечатляющих событий в моей жизни.»',
            'testimonial_2_author': '— Л. Э. Моро, Париж',
            'testimonial_3': '«Я унаследовал бумажник SAN DUKHAR от отца. Ему 15 лет, и он выглядит так же великолепно, как в день покупки.»',
            'testimonial_3_author': '— К. Танака, Токио',

            // Catalog
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
            'catalog_empty_desc': 'По вашему запросу ничего не найдено.',
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

            // Product
            'product_breadcrumb_home': 'Главная',
            'product_breadcrumb_collections': 'Коллекции',
            'product_collection_label': 'Коллекция Imperium',
            'product_limited_notice': 'Лимитированное производство — Всего 25 экземпляров',
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
            'product_video_desc': 'Станьте свидетелем пути портфеля Imperium.',
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
            'product_unique_limited_desc': 'Всего 25 экземпляров',
            'product_price_note': 'Налоги и пошлины включены',

            // Product — Detailed Specs
            'product_imperium_desc': 'Портфель Imperium — это абсолютное воплощение силы и утончённости. Созданный из цельной безупречной кожи нильского крокодила, отобранной за равномерный рисунок чешуи и богатую матовую текстуру, этот портфель требует более 120 часов кропотливой ручной работы одного мастера в нашем стамбульском ателье.',
            'product_imperium_spec_1': 'Подлинная матовая кожа нильского крокодила (сертифицирована CITES)',
            'product_imperium_spec_2': 'Замок и петли из цельной латуни с родиевым покрытием',
            'product_imperium_spec_3': 'Ручная прошивка вощёной льняной нитью',
            'product_imperium_spec_4': 'Внутренняя отделка из замши с отделением для ноутбука',
            'product_imperium_spec_5': 'Два внутренних кармана для документов и слоты для карт',
            'product_imperium_spec_6': 'Съёмный плечевой ремень из той же кожи',
            'product_imperium_spec_7': 'Номерная идентификационная табличка',
            'product_imperium_spec_8': 'Размеры: 42см × 30см × 12см',
            'product_imperium_spec_9': 'Вес: 2,4 кг',
            'product_shipping_desc': 'Каждый портфель Imperium создаётся на заказ. Пожалуйста, предусмотрите 4–6 недель на изготовление вашего изделия нашими мастерами.',
            'product_shipping_spec_1': 'Бесплатная доставка по всему миру бронированным курьером',
            'product_shipping_spec_2': 'Полное страхование на время транспортировки',
            'product_shipping_spec_3': 'Премиум-доставка с личной презентацией',
            'product_shipping_spec_4': 'Дискретная упаковка в фирменную коробку SAN DUKHAR',
            'product_care_desc': 'Ваше изделие SAN DUKHAR создано, чтобы служить поколениям при правильном уходе.',
            'product_care_spec_1': 'Бесплатная чистка и кондиционирование в первые 5 лет',
            'product_care_spec_2': 'Пожизненный ремонт по льготной стоимости',
            'product_care_spec_3': 'Храните в прилагаемом пылезащитном чехле вдали от прямых солнечных лучей',
            'product_care_spec_4': 'Избегайте контакта с водой, спиртом и абразивными поверхностями',
            'product_care_spec_5': 'Сертификат подлинности прилагается',
            'product_bespoke_cta_title': 'Ищете нечто по-настоящему личное?',
            'product_bespoke_cta_desc': 'Закажите индивидуальный портфель, созданный точно по вашим спецификациям — кожа, цвет, фурнитура, внутренняя конфигурация и личная монограмма.',
            'product_bespoke_cta_btn': 'Начать индивидуальный заказ',

            // Cart
            'cart_title': 'Ваша корзина',
            'cart_empty_title': 'Корзина ждёт',
            'cart_empty_desc': 'Вы ещё не добавили ни одного изделия.',
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

            // Checkout
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
            'checkout_express_desc': 'Приоритетная обработка · 2-3 недели',
            'checkout_payment_method': 'Способ оплаты',
            'checkout_card': 'Банковская карта',
            'checkout_card_desc': 'Visa, Mastercard, American Express',
            'checkout_transfer': 'Банковский перевод',
            'checkout_transfer_desc': 'Реквизиты после подтверждения заказа',
            'checkout_card_number': 'Номер карты',
            'checkout_expiry': 'Срок действия',
            'checkout_cvc': 'CVC',
            'checkout_card_name': 'Имя на карте',
            'checkout_place_order': 'Оформить заказ',
            'checkout_secure': 'Защищено 256-битным SSL-шифрованием',
            'checkout_order_summary': 'Состав заказа',
            'checkout_select_country': 'Выберите страну',
            'checkout_first_name_placeholder': 'Имя',
            'checkout_last_name_placeholder': 'Фамилия',
            'checkout_email_placeholder': 'ваш@email.ru',
            'checkout_address_placeholder': 'Улица, дом, квартира',
            'checkout_city_placeholder': 'Город',
            'checkout_postal_placeholder': 'Почтовый индекс',
            'checkout_card_number_placeholder': '0000 0000 0000 0000',
            'checkout_expiry_placeholder': 'ММ/ГГ',
            'checkout_cvc_placeholder': '123',
            'checkout_card_name_placeholder': 'Имя как на карте',

            // Account
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

            // Wishlist
            'wishlist_title': 'Ваше избранное',
            'wishlist_count_zero': 'Нет сохранённых изделий',
            'wishlist_count_one': '1 изделие сохранено',
            'wishlist_count_many': 'изделий сохранено',
            'wishlist_empty_title': 'Коллекция ждёт',
            'wishlist_empty_desc': 'Сохранённые изделия появятся здесь.',
            'wishlist_empty_btn': 'Смотреть коллекции',

            // Track Order
            'track_title': 'Отследить заказ',
            'track_subtitle': 'Введите номер заказа, чтобы следить за путём изделия.',
            'track_placeholder': 'Номер заказа (например, SD-2026-001)',
            'track_button': 'Отследить',
            'track_not_found_title': 'Заказ не найден',
            'track_not_found_desc': 'Мы не смогли найти заказ с таким номером.',
            'track_contact': 'Связаться с консьержем',
            'track_step_confirmed': 'Заказ подтверждён',
            'track_step_confirmed_desc': 'Ваш заказ получен и подтверждён.',
            'track_step_material': 'Подбор материала',
            'track_step_material_desc': 'Наш мастер выбрал лучшую кожу.',
            'track_step_crafting': 'Работа мастера',
            'track_step_crafting_desc': 'Ваше изделие создаётся вручную в Стамбуле.',
            'track_step_inspection': 'Контроль качества',
            'track_step_inspection_desc': 'Проверка по 47 пунктам.',
            'track_step_delivery': 'Премиум-доставка',
            'track_step_delivery_desc': 'Доставка бронированным курьером.',
            'track_status_pending': 'Ожидается',
            'track_status_progress': 'В процессе',
            'track_searching': 'Поиск...',

            // Footer
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

            // Contact
            'concierge': 'Консьерж',
            'concierge_subtitle': 'Мы к вашим услугам.',
            'contact_istanbul_atelier': 'Ателье в Стамбуле',
            'contact_atelier_hours': 'Понедельник – Суббота: 10:00 – 19:00',
            'contact_atelier_sunday': 'Воскресенье: Только по записи',
            'contact_telephone': 'Телефон',
            'contact_available_hours': 'Доступны в часы работы ателье.',
            'contact_email': 'Email',
            'contact_respond_time': 'Отвечаем на все письма в течение 24 часов.',
            'contact_press': 'Пресса и партнёрства',
            'contact_first_name_placeholder': 'Имя',
            'contact_last_name_placeholder': 'Фамилия',
            'contact_email_placeholder': 'Email',
            'contact_phone_placeholder': 'Телефон',
            'contact_message_placeholder': 'Ваше сообщение...',
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

            // Tailoring
            'tailoring_title': 'Ателье индивидуального пошива',
            'tailoring_subtitle': 'Творение, которое существует только потому, что вы его представили.',
            'tailoring_process_title': 'Процесс создания',
            'tailoring_process_desc': 'Каждый заказ — сотрудничество между вами и мастером.',
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
            'tailoring_your_commission': 'Ваш заказ',
            'tailoring_continue': 'Продолжить →',
            'tailoring_back': '← Назад',
            'tailoring_submit_enquiry': 'Отправить запрос',
            'tailoring_enquiry_sent': 'Запрос отправлен',
            'tailoring_jacket': 'Кожаная куртка',
            'tailoring_jacket_desc': 'Индивидуальный пошив',
            'tailoring_bag': 'Сумка / Портфель',
            'tailoring_bag_desc': 'Любая конфигурация',
            'tailoring_shoes': 'Обувь',
            'tailoring_shoes_desc': 'Индивидуальная колодка',
            'tailoring_accessory': 'Аксессуар',
            'tailoring_accessory_desc': 'Бумажники, ремни, футляры',
            'tailoring_other': 'Другое',
            'tailoring_other_desc': 'Опишите ваше видение',
            'tailoring_suede': 'Замша',
            'tailoring_suede_desc': 'Мягкая, роскошная',
            'tailoring_silk': 'Шёлк',
            'tailoring_silk_desc': 'Элегантный блеск',
            'tailoring_smooth_leather': 'Гладкая кожа',
            'tailoring_smooth_leather_desc': 'Прочная, изысканная',
            'tailoring_cashmere': 'Кашемир',
            'tailoring_cashmere_desc': 'Высшая мягкость',
            'tailoring_gold': 'Золото',
            'tailoring_gold_desc': '24К покрытие',
            'tailoring_palladium': 'Палладий',
            'tailoring_palladium_desc': 'Серебристо-белый',
            'tailoring_ruthenium': 'Рутений',
            'tailoring_ruthenium_desc': 'Тёмный, матовый',
            'tailoring_standard_size': 'Стандартный размер',
            'tailoring_standard_size_desc': 'Укажите ваш обычный размер',
            'tailoring_custom_measure': 'Индивидуальные мерки',
            'tailoring_custom_measure_desc': 'Мы отправим инструкцию',
            'tailoring_atelier_visit': 'Визит в ателье',
            'tailoring_atelier_visit_desc': 'Примерка в Стамбуле',
            'tailoring_additional_notes': 'Дополнительные пожелания',
            'tailoring_describe_vision': 'Опишите детали, вдохновение или требования...',

            // About
            'about_hero_title': 'Ателье<br>Тихой Роскоши',
            'about_hero_text': 'Основанный в Стамбуле в 2008 году, SAN DUKHAR соединяет многовековые традиции анатолийского мастерства с современным видением.',
            'about_quote': '"Истинная роскошь не заявляет о себе. Она ощущается в весе замка, видна в симметрии стежка и понимается в тишине восхищения."',
            'about_quote_author': '— Духар Сан, основатель и креативный директор',
            'about_journey_title': 'Наш путь',
            'about_philosophy_title': 'Наша философия',
            'about_artisans_title': 'Руки, создающие искусство',
            'about_timeline_2008_title': 'Первое ателье',
            'about_timeline_2008_text': 'SAN DUKHAR открывает первую мастерскую в Нишанташи, Стамбул, с командой из трёх мастеров. Первая коллекция включает пять портфелей из крокодиловой кожи.',
            'about_timeline_2014_title': 'Запуск программы Bespoke',
            'about_timeline_2014_text': 'Создано Ателье индивидуального пошива, предлагающее клиентам возможность заказать полностью персонализированные изделия.',
            'about_timeline_2017_title': 'Коллекция Imperium',
            'about_timeline_2017_text': 'Дебютирует знаковая коллекция Imperium — лимитированная серия изделий из крокодиловой кожи.',
            'about_timeline_2020_title': 'Мировое признание',
            'about_timeline_2020_text': 'Изделия SAN DUKHAR появляются в частных коллекциях по всей Европе, Ближнему Востоку и Азии.',
            'about_timeline_2026_title': 'Новая глава',
            'about_timeline_2026_text': 'Дом представляет обновлённое цифровое присутствие, открывая опыт ателье ценителям по всему миру.',
            'about_philosophy_one_title': 'Один мастер — одно изделие',
            'about_philosophy_one_desc': 'Каждое крупное творение от начала до конца выполняет один мастер. Это гарантирует непрерывность видения и абсолютную ответственность.',
            'about_philosophy_two_title': 'Осознанная редкость',
            'about_philosophy_two_desc': 'Мы производим менее 500 изделий в год по всем коллекциям. Эксклюзивность — не маркетинговая стратегия, а необходимость нашего ремесла.',
            'about_philosophy_three_title': 'Этичное происхождение',
            'about_philosophy_three_desc': 'Каждая кожа сертифицирована CITES и поставляется с ферм, соответствующих высочайшим стандартам благополучия животных и экологической ответственности.',
            'about_philosophy_four_title': 'Обязательство на поколения',
            'about_philosophy_four_desc': 'Мы отвечаем за наши творения на протяжении всей их жизни. Наша служба реставрации гарантирует, что ваше изделие SAN DUKHAR может быть передано следующему поколению.',
            'about_artisan_1_name': 'Мехмет Уста',
            'about_artisan_1_role': 'Мастер раскроя — 31 год',
            'about_artisan_2_name': 'Айше Ханым',
            'about_artisan_2_role': 'Мастер строчки — 25 лет',
            'about_artisan_3_name': 'Кемаль Бей',
            'about_artisan_3_role': 'Фурнитура и отделка — 19 лет',
            'about_artisan_4_name': 'Духар Сан',
            'about_artisan_4_role': 'Креативный директор — 17 лет',

            // Quick View Modal
            'qv_product_preview': 'Превью изделия',
            'qv_exotic_creation': 'Изделие из экзотической кожи',
            'qv_handcrafted_desc': 'Создано вручную в нашем стамбульском ателье из лучшей этично sourced экзотической кожи. Каждое изделие уникально и создаётся на заказ.',

            // Colors
            'color_black': 'Чёрный',
            'color_brown': 'Коричневый',
            'color_cognac': 'Коньячный',
            'color_graphite': 'Графитовый',
            'color_natural': 'Натуральный',

            // Pagination
            'pagination_previous': 'Предыдущая страница',
            'pagination_next': 'Следующая страница',

            // Misc
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
            'cart_added': 'Добавлено в корзину',
            'promo_applied': 'Промокод применён',
            'wishlist_added': 'Добавлено в избранное',
            'wishlist_removed': 'Удалено из избранного',
        }
    },

    init: function(defaultLocale) {
        if (this.initialized) return;
        const urlLocale = this.getUrlParam('lang');
        const storedLocale = localStorage.getItem('sandukhar_locale');
        const browserLocale = this.getBrowserLocale();
        let locale = defaultLocale || urlLocale || storedLocale || browserLocale || 'en';
        if (!this.supportedLocales.includes(locale)) locale = 'en';
        this.currentLocale = locale;
        localStorage.setItem('sandukhar_locale', locale);
        this.translations = this.dictionaries[locale] || this.dictionaries['en'];
        this.translatePage();
        this.addLanguageSwitcher();
        this.startObserver();
        this.initialized = true;
        document.dispatchEvent(new CustomEvent('sd_i18n_ready', { detail: { locale: locale } }));
    },

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

    t: function(key, params) {
        let text = this.translations[key] || this.dictionaries['en'][key] || key;
        if (params) { Object.keys(params).forEach(param => { text = text.replace(`{${param}}`, params[param]); }); }
        return text;
    },

    translatePage: function() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const translation = this.t(key);
            if (!translation || translation === key) return;
            const attr = el.getAttribute('data-i18n-attr');
            if (attr === 'placeholder') { el.setAttribute('placeholder', translation); }
            else if (attr === 'title') { el.setAttribute('title', translation); }
            else if (attr === 'aria-label') { el.setAttribute('aria-label', translation); }
            else if (attr === 'value') { el.setAttribute('value', translation); }
            else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { el.setAttribute('placeholder', translation); }
            else { this.replaceTextContent(el, translation); }
        });
        document.documentElement.setAttribute('lang', this.currentLocale);
    },

    replaceTextContent: function(el, text) {
        const hasChildren = el.children.length > 0;
        const hasNestedI18n = el.querySelector('[data-i18n]');
        const hasLinks = el.querySelector('a');
        if (hasLinks && !hasNestedI18n) {
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            const textNodes = [];
            while (walker.nextNode()) { if (walker.currentNode.textContent.trim()) textNodes.push(walker.currentNode); }
            if (textNodes.length > 0) { textNodes[0].textContent = text; }
            return;
        }
        if (!hasChildren || hasNestedI18n) {
            for (let i = 0; i < el.childNodes.length; i++) {
                const node = el.childNodes[i];
                if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) { node.textContent = text; return; }
            }
            if (el.childNodes.length === 0) el.textContent = text;
        } else {
            for (let i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === Node.TEXT_NODE) { el.childNodes[i].textContent = text; return; }
            }
        }
    },

    addLanguageSwitcher: function() {
        if (document.getElementById('lang-switcher')) return;
        const headerUtilities = document.querySelector('.header-utilities');
        if (!headerUtilities) return;
        const switcher = document.createElement('button');
        switcher.id = 'lang-switcher';
        switcher.className = 'utility-btn lang-switcher';
        switcher.setAttribute('aria-label', 'Switch language');
        switcher.innerHTML = this.currentLocale === 'en' ? 'RU' : 'EN';
        switcher.addEventListener('click', () => { this.setLocale(this.currentLocale === 'en' ? 'ru' : 'en'); });
        const menuTrigger = headerUtilities.querySelector('.menu-trigger');
        if (menuTrigger) { headerUtilities.insertBefore(switcher, menuTrigger); } else { headerUtilities.appendChild(switcher); }
        this.injectSwitcherStyles();
    },

    updateSwitcherButton: function() {
        const switcher = document.getElementById('lang-switcher');
        if (!switcher) return;
        switcher.innerHTML = this.currentLocale === 'en' ? 'RU' : 'EN';
    },

    injectSwitcherStyles: function() {
        if (document.getElementById('lang-switcher-styles')) return;
        const style = document.createElement('style');
        style.id = 'lang-switcher-styles';
        style.textContent = `
            .lang-switcher{font-family:var(--font-body);font-size:0.7rem;font-weight:var(--font-weight-semibold);letter-spacing:0.08em;color:var(--color-gold)!important;border:1px solid var(--color-gold-pale)!important;border-radius:var(--border-radius-sm);width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all var(--transition-fast);background:transparent}
            .lang-switcher:hover{background:var(--color-gold)!important;color:var(--color-black)!important;border-color:var(--color-gold)!important}
            @media(max-width:767px){.lang-switcher{width:32px;height:32px;font-size:0.6rem}}
        `;
        document.head.appendChild(style);
    },

    startObserver: function() {
        if (this.observer) this.observer.disconnect();
        const self = this;
        this.observer = new MutationObserver(function(mutations) {
            let shouldTranslate = false;
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    for (const node of mutation.addedNodes) {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.hasAttribute && node.hasAttribute('data-i18n')) { shouldTranslate = true; break; }
                            if (node.querySelectorAll && node.querySelectorAll('[data-i18n]').length > 0) { shouldTranslate = true; break; }
                        }
                    }
                }
                if (shouldTranslate) break;
            }
            if (shouldTranslate) self.translatePage();
        });
        this.observer.observe(document.body, { childList: true, subtree: true });
    },

    getUrlParam: function(param) { return new URLSearchParams(window.location.search).get(param); },
    getBrowserLocale: function() { const lang = (navigator.language || '').toLowerCase(); if (lang.startsWith('ru')) return 'ru'; return 'en'; }
};

window.SD_I18N = SD_I18N;
document.addEventListener('DOMContentLoaded', () => { SD_I18N.init(); });