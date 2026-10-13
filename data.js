/* Shared data: generated from backend/Code.gs (used in demo mode and as offline fallback). */
window.SMILE_DATA = {
  categories: [
    { id: 'landmarks',   name: 'Landmarks',           short: 'Landmarks', icon: 'landmark', color: 'var(--c-landmarks)',   img: 'assets/cat-landmarks.jpg',   blurb: 'Heritage churches, plazas & museums' },
    { id: 'restaurants', name: 'Restaurants & Cafés', short: 'Food',      icon: 'utensils', color: 'var(--c-restaurants)', img: 'assets/cat-restaurants.jpg', blurb: 'Batchoy, pancit Molo, inasal & seafood' },
    { id: 'shops',       name: 'Shops',               short: 'Shops',     icon: 'bag',      color: 'var(--c-shops)',       img: 'assets/cat-shops.jpg',       blurb: 'Pasalubong, hablon & crafts' },
    { id: 'events',      name: 'Events',              short: 'Events',    icon: 'calendar', color: 'var(--c-events)',      img: 'assets/cat-events.jpg',      blurb: 'Dinagyang & Iloilo festivals' },
    { id: 'stays',       name: 'Hotels & Homestays',  short: 'Stays',     icon: 'bed',      color: 'var(--c-stays)',       img: 'assets/cat-stays.jpg',       blurb: 'Where to lodge in Iloilo' }
  ],
  settings: {"requireProofPhoto":true,"requirePostcard":true,"stampPoints":5,"maxStamps":2,"photoPoints":5,"deliveryFee":50,"currency":"₱","points":{"landmarks":20,"restaurants":15,"shops":10,"events":25,"stays":10}},
  ranks: [
    {
      "id": "E",
      "name": "Class E",
      "minPoints": 0,
      "color": "#8A8F98",
      "title": "Newcomer"
    },
    {
      "id": "D",
      "name": "Class D",
      "minPoints": 100,
      "color": "#22A046",
      "title": "Wanderer"
    },
    {
      "id": "C",
      "name": "Class C",
      "minPoints": 250,
      "color": "#1D7FE0",
      "title": "Explorer"
    },
    {
      "id": "B",
      "name": "Class B",
      "minPoints": 450,
      "color": "#7B2FBE",
      "title": "Adventurer"
    },
    {
      "id": "A",
      "name": "Class A",
      "minPoints": 700,
      "color": "#F26A1B",
      "title": "Trailblazer"
    },
    {
      "id": "S",
      "name": "Class S",
      "minPoints": 1000,
      "color": "#E0263B",
      "title": "Iloilo Expert"
    },
    {
      "id": "SS",
      "name": "Class SS",
      "minPoints": 1500,
      "color": "#EC2882",
      "title": "Iloilo Legend"
    },
    {
      "id": "SSS",
      "name": "Class SSS",
      "minPoints": 2200,
      "color": "#FFB000",
      "title": "SMILE Ambassador"
    }
  ],
  challenges: [
    {
      "id": "heritage-trail",
      "name": "Heritage Trail",
      "icon": "landmark",
      "description": "Visit Molo Church, Jaro Cathedral, Calle Real and Museo Iloilo.",
      "type": "places",
      "target": "lm-molo,lm-jaro,lm-calle,lm-museo",
      "count": 4,
      "bonus": 100
    },
    {
      "id": "food-crawl",
      "name": "La Paz & Molo Food Crawl",
      "icon": "utensils",
      "description": "Batchoy, Madge coffee, Deocampo barquillos and Panaderia de Molo.",
      "type": "places",
      "target": "rs-batchoy,rs-madge,sh-deocampo,sh-molo",
      "count": 4,
      "bonus": 80
    },
    {
      "id": "miagao-day",
      "name": "Miag-ao Day Trip",
      "icon": "church",
      "description": "See Miag-ao Church and the hablon weavers.",
      "type": "places",
      "target": "lm-miagao,sh-hablon",
      "count": 2,
      "bonus": 80
    },
    {
      "id": "pasalubong-run",
      "name": "Pasalubong Run",
      "icon": "gift",
      "description": "Check in at any 3 shops.",
      "type": "category",
      "target": "shops",
      "count": 3,
      "bonus": 50
    },
    {
      "id": "festival-fan",
      "name": "Festival Fan",
      "icon": "party",
      "description": "Join 2 Iloilo events, like Dinagyang.",
      "type": "category",
      "target": "events",
      "count": 2,
      "bonus": 100
    },
    {
      "id": "snap-happy",
      "name": "Snap Happy",
      "icon": "camera",
      "description": "Take 5 SMILE photos at tagged places.",
      "type": "photos",
      "target": "",
      "count": 5,
      "bonus": 60
    },
    {
      "id": "postcard-collector",
      "name": "Postcard Collector",
      "icon": "stamp",
      "description": "Fill 3 postcards with 2 stamps each.",
      "type": "fullpostcards",
      "target": "",
      "count": 3,
      "bonus": 100
    },
    {
      "id": "city-explorer",
      "name": "City Explorer",
      "icon": "compass",
      "description": "Visit 10 different places.",
      "type": "checkins",
      "target": "",
      "count": 10,
      "bonus": 150
    }
  ],
  badges: [
    {
      "id": "first-step",
      "name": "First Step",
      "icon": "footprints",
      "desc": "Your first check-in"
    },
    {
      "id": "heritage-hunter",
      "name": "Heritage Hunter",
      "icon": "landmark",
      "desc": "Visit 3 landmarks"
    },
    {
      "id": "foodie",
      "name": "Ilonggo Foodie",
      "icon": "utensils",
      "desc": "Check in at 3 restaurants or cafés"
    },
    {
      "id": "pasalubong-pro",
      "name": "Pasalubong Pro",
      "icon": "gift",
      "desc": "Visit 2 shops"
    },
    {
      "id": "festival-goer",
      "name": "Festival Goer",
      "icon": "party",
      "desc": "Join 2 events"
    },
    {
      "id": "shutterbug",
      "name": "Shutterbug",
      "icon": "camera",
      "desc": "Take 3 SMILE photos"
    },
    {
      "id": "stamp-collector",
      "name": "Stamp Collector",
      "icon": "stamp",
      "desc": "Add 4 stamps to your postcards"
    },
    {
      "id": "explorer",
      "name": "Iloilo Explorer",
      "icon": "compass",
      "desc": "One check-in in every category"
    },
    {
      "id": "smile-master",
      "name": "SMILE Master",
      "icon": "sun",
      "desc": "Earn 500 points"
    }
  ],
  badgeTests: {
    'first-step': s => s.total >= 1,
    'heritage-hunter': s => s.landmarks >= 3,
    'foodie': s => s.restaurants >= 3,
    'pasalubong-pro': s => s.shops >= 2,
    'festival-goer': s => s.events >= 2,
    'shutterbug': s => s.photos >= 3,
    'stamp-collector': s => s.stamps >= 4,
    'explorer': s => s.landmarks && s.restaurants && s.shops && s.events,
    'smile-master': s => s.points >= 500
  },
  sellers: [
    {
      "id": "smile-hq",
      "name": "SMILE Official Store",
      "type": "merchant",
      "area": "Iloilo City",
      "description": "Official SMILE postcards, stamps and merchandise."
    },
    {
      "id": "nano-pinta",
      "name": "Pinta Tees Iloilo (sample)",
      "type": "merchant",
      "area": "Jaro",
      "description": "Sample nano entrepreneur: printed souvenir shirts. Also sells SMILE postcards."
    },
    {
      "id": "nano-habi",
      "name": "Habi Hablon Crafts (sample)",
      "type": "nano",
      "area": "Miag-ao",
      "description": "Sample nano entrepreneur: hablon bags and accessories."
    },
    {
      "id": "nano-novelty",
      "name": "Iloilo Novelty Corner (sample)",
      "type": "merchant",
      "area": "City Proper",
      "description": "Sample nano entrepreneur: magnets, keychains and novelties. SMILE postcard seller."
    },
    {
      "id": "nano-barber",
      "name": "Kuya Barber Home Service (sample)",
      "type": "nano",
      "area": "Jaro",
      "description": "Sample service provider."
    },
    {
      "id": "nano-hilot",
      "name": "Hilot Haven Massage (sample)",
      "type": "nano",
      "area": "Mandurriao",
      "description": "Sample service provider."
    },
    {
      "id": "nano-host",
      "name": "Host Iloilo Events (sample)",
      "type": "nano",
      "area": "Iloilo City",
      "description": "Sample service provider."
    },
    {
      "id": "nano-tawa",
      "name": "Tawa Ilonggo Comedy (sample)",
      "type": "nano",
      "area": "Iloilo City",
      "description": "Sample service provider."
    },
    {
      "id": "nano-lens",
      "name": "Lakbay Lens Photography (sample)",
      "type": "nano",
      "area": "Iloilo City",
      "description": "Sample service provider."
    },
    {
      "id": "nano-guide",
      "name": "Calle Real Walks (sample)",
      "type": "nano",
      "area": "City Proper",
      "description": "Sample service provider."
    }
  ],
  products: [
    {
      "id": "p-postcard",
      "sellerId": "smile-hq",
      "name": "SMILE Postcard (with QR)",
      "price": 50,
      "icon": "postcard",
      "deliverable": true,
      "tags": [
        "official",
        "checkin"
      ],
      "description": "Each postcard has its own QR code. Use one postcard per check-in.",
      "image": "",
      "stock": null
    },
    {
      "id": "p-stamp",
      "sellerId": "smile-hq",
      "name": "SMILE Stamp (with QR)",
      "price": 20,
      "icon": "stamp",
      "deliverable": true,
      "tags": [
        "official"
      ],
      "description": "+5 points each. Up to 2 stamps per postcard.",
      "image": "",
      "stock": null
    },
    {
      "id": "p-cap",
      "sellerId": "smile-hq",
      "name": "SMILE Cap",
      "price": 250,
      "icon": "cap",
      "deliverable": true,
      "tags": [
        "official",
        "apparel"
      ],
      "description": "Embroidered SMILE logo cap.",
      "image": "",
      "stock": null
    },
    {
      "id": "p-tee-dinag",
      "sellerId": "nano-pinta",
      "name": "Dinagyang Souvenir Shirt",
      "price": 350,
      "icon": "shirt",
      "deliverable": true,
      "stock": 40,
      "tags": [
        "apparel"
      ],
      "description": "Cotton tee with a Dinagyang warrior print. S–XXL.",
      "image": ""
    },
    {
      "id": "p-tee-love",
      "sellerId": "nano-pinta",
      "name": "I ♥ Iloilo Shirt",
      "price": 320,
      "icon": "shirt",
      "deliverable": true,
      "stock": 40,
      "tags": [
        "apparel"
      ],
      "description": "Classic souvenir tee. S–XXL.",
      "image": ""
    },
    {
      "id": "p-tote",
      "sellerId": "nano-habi",
      "name": "Hablon Tote Bag",
      "price": 280,
      "icon": "bag",
      "deliverable": true,
      "stock": 15,
      "tags": [
        "handicraft"
      ],
      "description": "Hand-woven hablon panels on a sturdy tote.",
      "image": ""
    },
    {
      "id": "p-purse",
      "sellerId": "nano-habi",
      "name": "Hablon Coin Purse",
      "price": 120,
      "icon": "wallet",
      "deliverable": true,
      "stock": 30,
      "tags": [
        "handicraft"
      ],
      "description": "Zip pouch in colorful hablon weave.",
      "image": ""
    },
    {
      "id": "p-magnets",
      "sellerId": "nano-novelty",
      "name": "Iloilo Landmarks Magnet Set",
      "price": 150,
      "icon": "magnet",
      "deliverable": true,
      "stock": 25,
      "tags": [
        "novelty"
      ],
      "description": "Six ref magnets: Molo, Jaro, Miag-ao, Capitol, Esplanade, Dinagyang.",
      "image": ""
    },
    {
      "id": "p-keychain",
      "sellerId": "nano-novelty",
      "name": "Mini Paraw Keychain",
      "price": 60,
      "icon": "key",
      "deliverable": true,
      "stock": 50,
      "tags": [
        "novelty"
      ],
      "description": "Tiny paraw sailboat charm.",
      "image": ""
    },
    {
      "id": "p-postcard2",
      "sellerId": "nano-novelty",
      "name": "SMILE Postcard (with QR)",
      "price": 50,
      "icon": "postcard",
      "deliverable": false,
      "tags": [
        "official",
        "checkin"
      ],
      "description": "Pick up at the stall. One postcard per check-in.",
      "image": "",
      "stock": null
    }
  ],
  services: [
    {
      "id": "sv-barber",
      "sellerId": "nano-barber",
      "name": "Home-service Haircut",
      "serviceType": "Barber",
      "icon": "scissors",
      "rate": "₱150 / haircut",
      "area": "Jaro & nearby",
      "homeService": true,
      "description": "Clean cuts at your hotel or home.",
      "image": ""
    },
    {
      "id": "sv-massage",
      "sellerId": "nano-hilot",
      "name": "Hilot & Swedish Massage",
      "serviceType": "Massage Therapist",
      "icon": "hand",
      "rate": "₱400 / hour",
      "area": "Iloilo City",
      "homeService": true,
      "description": "Traditional hilot or relaxing Swedish massage after a day of walking.",
      "image": ""
    },
    {
      "id": "sv-emcee",
      "sellerId": "nano-host",
      "name": "Bilingual Event Host",
      "serviceType": "Local Emcee",
      "icon": "mic",
      "rate": "₱3,000 / event",
      "area": "Iloilo City",
      "homeService": false,
      "description": "Hiligaynon–English emcee for parties, reunions and corporate events.",
      "image": ""
    },
    {
      "id": "sv-comedy",
      "sellerId": "nano-tawa",
      "name": "Stand-up Comedy Set",
      "serviceType": "Stand-up Comedian",
      "icon": "laugh",
      "rate": "₱2,500 / 20-min set",
      "area": "Iloilo City",
      "homeService": false,
      "description": "Clean Ilonggo humor for parties and events.",
      "image": ""
    },
    {
      "id": "sv-photo",
      "sellerId": "nano-lens",
      "name": "Tour Photographer",
      "serviceType": "Photographer",
      "icon": "camera",
      "rate": "₱1,000 / 2 hours",
      "area": "Iloilo City",
      "homeService": false,
      "description": "Follow-along photos at landmarks and festivals.",
      "image": ""
    },
    {
      "id": "sv-guide",
      "sellerId": "nano-guide",
      "name": "Heritage Walking Tour",
      "serviceType": "Tour Guide",
      "icon": "compass",
      "rate": "₱500 / person",
      "area": "City Proper",
      "homeService": false,
      "description": "Two-hour walk through Calle Real and Plaza Libertad.",
      "image": ""
    }
  ],
  places: [
    {
      "id": "lm-molo",
      "category": "landmarks",
      "name": "Molo Church (St. Anne Parish)",
      "area": "Molo",
      "tags": [
        "heritage",
        "church"
      ],
      "description": "Gothic-Renaissance coral-stone church known as the \"feminist church\" for its rows of female saints.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-jaro",
      "category": "landmarks",
      "name": "Jaro Metropolitan Cathedral",
      "area": "Jaro",
      "tags": [
        "heritage",
        "church"
      ],
      "description": "Seat of the Archdiocese and home of Our Lady of the Candles, with its belfry standing across the plaza.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-miagao",
      "category": "landmarks",
      "name": "Miag-ao Church",
      "area": "Miag-ao",
      "tags": [
        "UNESCO",
        "heritage"
      ],
      "description": "UNESCO World Heritage Baroque church with a famous sculpted façade, about an hour south of the city.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-capitol",
      "category": "landmarks",
      "name": "Iloilo Provincial Capitol",
      "area": "City Proper",
      "tags": [
        "heritage",
        "government"
      ],
      "description": "The grand seat of the provincial government along Bonifacio Drive.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-calle",
      "category": "landmarks",
      "name": "Calle Real Heritage District",
      "area": "City Proper",
      "tags": [
        "heritage",
        "walk"
      ],
      "description": "J.M. Basa Street lined with restored American-era buildings. Best explored on foot.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-museo",
      "category": "landmarks",
      "name": "Museo Iloilo",
      "area": "City Proper",
      "tags": [
        "museum"
      ],
      "description": "Provincial museum of Panay's history, from pre-colonial gold to shipwreck finds.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "lm-esplanade",
      "category": "landmarks",
      "name": "Iloilo River Esplanade",
      "area": "Mandurriao",
      "tags": [
        "park",
        "sunset"
      ],
      "description": "A long riverside promenade lined with mangroves, made for jogging and sunset strolls.",
      "points": 20,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "rs-batchoy",
      "category": "restaurants",
      "name": "La Paz Batchoy at La Paz Market",
      "area": "La Paz",
      "tags": [
        "batchoy",
        "local"
      ],
      "description": "Try the original noodle soup at the market where it was born.",
      "points": 15,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "rs-breakthru",
      "category": "restaurants",
      "name": "Breakthrough Restaurant",
      "area": "Villa Arevalo",
      "tags": [
        "seafood"
      ],
      "description": "A seaside seafood favorite. Order the fresh catch grilled or as kinilaw.",
      "points": 15,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "rs-tatoys",
      "category": "restaurants",
      "name": "Tatoy's Manokan & Seafoods",
      "area": "Villa Arevalo",
      "tags": [
        "chicken",
        "seafood",
        "inasal"
      ],
      "description": "Native lechon manok and seafood by the beach.",
      "points": 15,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "rs-madge",
      "category": "restaurants",
      "name": "Madge Café",
      "area": "La Paz",
      "tags": [
        "coffee",
        "heritage"
      ],
      "description": "Old-school coffee counter inside La Paz Market.",
      "points": 15,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "rs-roberto",
      "category": "restaurants",
      "name": "Roberto's",
      "area": "City Proper",
      "tags": [
        "siopao"
      ],
      "description": "Home of the jumbo \"Queen\" siopao.",
      "points": 15,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-biscocho",
      "category": "shops",
      "name": "Biscocho Haus",
      "area": "Jaro",
      "tags": [
        "pasalubong"
      ],
      "description": "Butterscotch, biscocho and other Ilonggo pasalubong.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-hablon",
      "category": "shops",
      "name": "Miag-ao Hablon Weavers",
      "area": "Miag-ao",
      "tags": [
        "handicraft",
        "textile"
      ],
      "description": "Hand-woven hablon fabric made on traditional looms.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-molo",
      "category": "shops",
      "name": "Panaderia de Molo",
      "area": "Molo",
      "tags": [
        "bakery",
        "heritage"
      ],
      "description": "One of the oldest bakeries in the country. Try the galletas and broas.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-market",
      "category": "shops",
      "name": "Iloilo Central Market",
      "area": "City Proper",
      "tags": [
        "market"
      ],
      "description": "Dried fish, local delicacies and everyday finds.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-deocampo",
      "category": "shops",
      "name": "Deocampo Barquillos",
      "area": "Molo",
      "tags": [
        "pasalubong",
        "heritage"
      ],
      "description": "Family-run maker of thin, rolled barquillos wafers, a Molo favorite for generations.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-mansion",
      "category": "shops",
      "name": "Molo Mansion Souvenir Shop",
      "area": "Molo",
      "tags": [
        "souvenir",
        "heritage"
      ],
      "description": "Iloilo-made crafts and delicacies sold inside the restored Yusay-Consing mansion.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-lapaz",
      "category": "shops",
      "name": "La Paz Public Market",
      "area": "La Paz",
      "tags": [
        "market",
        "local"
      ],
      "description": "Fresh produce, dried goods and native snacks, steps from the batchoy stalls.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-smcity",
      "category": "shops",
      "name": "SM City Iloilo",
      "area": "Mandurriao",
      "tags": [
        "mall"
      ],
      "description": "Large mall with a pasalubong section, groceries and dining.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-festive",
      "category": "shops",
      "name": "Festive Walk Iloilo",
      "area": "Mandurriao",
      "tags": [
        "mall",
        "lifestyle"
      ],
      "description": "Open-air lifestyle mall in Iloilo Business Park with shops, cafés and events.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-robinsons",
      "category": "shops",
      "name": "Robinsons Place Iloilo",
      "area": "City Proper",
      "tags": [
        "mall"
      ],
      "description": "Downtown mall near Calle Real, handy for shopping between heritage stops.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "sh-atria",
      "category": "shops",
      "name": "Atria Park District",
      "area": "Mandurriao",
      "tags": [
        "mall",
        "dining"
      ],
      "description": "Lifestyle center with boutiques, a supermarket and restaurants.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": "",
      "priceRange": ""
    },
    {
      "id": "ev-dinagyang",
      "category": "events",
      "name": "Dinagyang Festival",
      "area": "City Proper",
      "schedule": "Fourth weekend of January",
      "tags": [
        "festival",
        "Santo Niño"
      ],
      "description": "Iloilo's biggest festival: tribes in vivid costumes dance to thundering drums in honor of the Santo Niño.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "ev-kasadyahan",
      "category": "events",
      "name": "Kasadyahan Cultural Competition",
      "area": "City Proper",
      "schedule": "January, during Dinagyang week",
      "tags": [
        "festival",
        "culture"
      ],
      "description": "Towns across Iloilo bring their own festivals to the city's streets in one colorful parade.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "ev-candelaria",
      "category": "events",
      "name": "Jaro Fiesta (Our Lady of the Candles)",
      "area": "Jaro",
      "schedule": "February 2",
      "tags": [
        "fiesta",
        "heritage"
      ],
      "description": "Feast of the Candelaria at Jaro Cathedral, with a procession, a fair and the fiesta queen.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "ev-paraw",
      "category": "events",
      "name": "Paraw Regatta Festival",
      "area": "Villa Arevalo",
      "schedule": "February",
      "tags": [
        "sailing",
        "beach"
      ],
      "description": "Traditional paraw sailboats race across the Iloilo Strait, with beach activities along the shore.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "ev-pintados",
      "category": "events",
      "name": "Pintados de Passi Festival",
      "area": "Passi City",
      "schedule": "March",
      "tags": [
        "festival",
        "dance"
      ],
      "description": "Body-painted dancers recall the tattooed warriors of old Panay.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "ev-charter",
      "category": "events",
      "name": "Iloilo City Charter Day",
      "area": "City Proper",
      "schedule": "August 25",
      "tags": [
        "civic",
        "celebration"
      ],
      "description": "The city's birthday, celebrated with programs and community activities.",
      "points": 25,
      "merchant": false,
      "bookable": false,
      "priceRange": ""
    },
    {
      "id": "st-richmonde",
      "category": "stays",
      "name": "Richmonde Hotel Iloilo",
      "area": "Iloilo Business Park, Mandurriao",
      "priceRange": "₱₱₱",
      "tags": [
        "hotel",
        "business park"
      ],
      "description": "Full-service hotel in Iloilo Business Park, near Festive Walk and the convention center.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": ""
    },
    {
      "id": "st-seda",
      "category": "stays",
      "name": "Seda Atria",
      "area": "Atria Park District, Mandurriao",
      "priceRange": "₱₱₱",
      "tags": [
        "hotel",
        "mall"
      ],
      "description": "Modern hotel inside Atria Park District, steps from shops and restaurants.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": ""
    },
    {
      "id": "st-courtyard",
      "category": "stays",
      "name": "Courtyard by Marriott Iloilo",
      "area": "Iloilo Business Park, Mandurriao",
      "priceRange": "₱₱₱",
      "tags": [
        "hotel",
        "pool"
      ],
      "description": "International-brand hotel in Iloilo Business Park, close to the convention center.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": ""
    },
    {
      "id": "st-injap",
      "category": "stays",
      "name": "Injap Tower Hotel",
      "area": "Diversion Road, Mandurriao",
      "priceRange": "₱₱",
      "tags": [
        "hotel",
        "city view"
      ],
      "description": "Tall hotel across SM City Iloilo, known for its city views.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": ""
    },
    {
      "id": "st-delrio",
      "category": "stays",
      "name": "Hotel Del Rio",
      "area": "Molo",
      "priceRange": "₱₱",
      "tags": [
        "hotel",
        "riverside"
      ],
      "description": "Long-running riverside hotel in Molo, near the heritage district.",
      "points": 10,
      "merchant": false,
      "bookable": false,
      "schedule": ""
    },
    {
      "id": "st-home-molo",
      "category": "stays",
      "name": "Molo Heritage Homestay (sample)",
      "area": "Molo",
      "priceRange": "₱",
      "bookable": true,
      "tags": [
        "homestay",
        "sample",
        "family"
      ],
      "description": "Sample listing: a family-run homestay near Molo Plaza. Replace with a real partner.",
      "points": 10,
      "merchant": false,
      "schedule": ""
    },
    {
      "id": "st-home-jaro",
      "category": "stays",
      "name": "Jaro Garden Homestay (sample)",
      "area": "Jaro",
      "priceRange": "₱",
      "bookable": true,
      "tags": [
        "homestay",
        "sample"
      ],
      "description": "Sample listing: quiet rooms with home-cooked breakfast near Jaro Plaza.",
      "points": 10,
      "merchant": false,
      "schedule": ""
    },
    {
      "id": "st-home-villa",
      "category": "stays",
      "name": "Villa Beachside Homestay (sample)",
      "area": "Villa Arevalo",
      "priceRange": "₱₱",
      "bookable": true,
      "tags": [
        "homestay",
        "sample",
        "beach"
      ],
      "description": "Sample listing: walk to the seafood restaurants and the Paraw Regatta beach.",
      "points": 10,
      "merchant": false,
      "schedule": ""
    }
  ]
};
