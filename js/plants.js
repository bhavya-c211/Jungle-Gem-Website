// Jungle Gem Plant Co. — plant data
// Edit here, not in HTML. Three lists:
//
// PLANTS  — what's for sale. Drives Shop, Home, Cart.
// GENERA  — care sheets, one per genus. QR tags link to care.html#<genus>
//           (meeting 9/17: "care sheet based on the plant's genus"), so
//           every Pothos, Monstera, etc. shares one sheet.
// SPOTLIGHT — the newsletter's plant of the issue; also shown on Home.
//
// INVENTORY: `sku` and `stock` are SAMPLE values. The plan (meetings
// 9/17 + 10/7) is HandiFox for inventory and QuickBooks for POS +
// consigner sales, with online orders pulled from the same stock. Until
// that sync exists, update `stock` here after inventory counts.
// Keep `sku` identical to the SKU in HandiFox/QuickBooks so a sync can
// match rows. stock 0 = shows "Sold out" and can't be added to cart.
//
// light:   'low' | 'medium' | 'bright'
// petSafe: per ASPCA non-toxic list (cats & dogs)
// small:   fits a desk, dorm shelf, or apartment sill
// featured: shows on the home page
// rare:    true = gets a "Rare" badge, and the Shop's Rare filter appears
//          (the shop's specialty — none of the sample plants are rare)

window.PLANTS = [
  { id: 'pothos', sku: 'JG-EPI-001', genus: 'epipremnum', photo: '1596724878582-76f1a8fdc24f',
    name: 'Pothos', botanical: 'Epipremnum aureum', price: 18, stock: 9,
    light: 'low', lightLabel: 'Low–medium', waterLabel: 'Weekly', petSafe: false, small: true, featured: true },
  { id: 'snake-plant', sku: 'JG-DRA-001', genus: 'dracaena', photo: '1599009944997-3544a939813c',
    name: 'Snake Plant', botanical: 'Dracaena trifasciata', price: 22, stock: 6,
    light: 'low', lightLabel: 'Low light', waterLabel: 'Biweekly', petSafe: false, small: true, featured: true },
  { id: 'monstera', sku: 'JG-MON-001', genus: 'monstera', photo: '1636525653613-2a3a05c00759',
    name: 'Monstera Deliciosa', botanical: 'Monstera deliciosa', price: 34, stock: 3,
    light: 'bright', lightLabel: 'Bright indirect', waterLabel: 'Weekly', petSafe: false, small: false, featured: true },
  { id: 'fiddle-leaf-fig', sku: 'JG-FIC-001', genus: 'ficus', photo: '1545239705-1564e58b9e4a',
    name: 'Fiddle Leaf Fig', botanical: 'Ficus lyrata', price: 48, stock: 2,
    light: 'bright', lightLabel: 'Bright indirect', waterLabel: 'Weekly', petSafe: false, small: false, featured: true },
  { id: 'spider-plant', sku: 'JG-CHL-001', genus: 'chlorophytum', photo: '1611527664689-d430dd2a6774',
    name: 'Spider Plant', botanical: 'Chlorophytum comosum', price: 14, stock: 12,
    light: 'medium', lightLabel: 'Medium', waterLabel: 'Weekly', petSafe: true, small: true },
  { id: 'zz-plant', sku: 'JG-ZAM-001', genus: 'zamioculcas', photo: '1501004318641-b39e6451bec6',
    name: 'ZZ Plant', botanical: 'Zamioculcas zamiifolia', price: 28, stock: 5,
    light: 'low', lightLabel: 'Low light', waterLabel: 'Biweekly', petSafe: false, small: true },
  { id: 'calathea', sku: 'JG-GOE-001', genus: 'goeppertia', photo: '1597306200021-f8e16b12fb45',
    name: 'Calathea', botanical: 'Goeppertia spp.', price: 26, stock: 4,
    light: 'medium', lightLabel: 'Medium', waterLabel: 'Weekly', petSafe: true, small: true },
  { id: 'parlor-palm', sku: 'JG-CHA-001', genus: 'chamaedorea', photo: '1687269111857-3b398711c2f4',
    name: 'Parlor Palm', botanical: 'Chamaedorea elegans', price: 24, stock: 3,
    light: 'low', lightLabel: 'Low–medium', waterLabel: 'Weekly', petSafe: true, small: false },
  { id: 'boston-fern', sku: 'JG-NEP-001', genus: 'nephrolepis', photo: '1610491536492-cee9f12c860f',
    name: 'Boston Fern', botanical: 'Nephrolepis exaltata', price: 20, stock: 7,
    light: 'medium', lightLabel: 'Medium', waterLabel: '2× weekly', petSafe: true, small: false },
  { id: 'peperomia', sku: 'JG-PEP-001', genus: 'peperomia', photo: '1631038093177-b709a7048b44',
    name: 'Baby Rubber Plant', botanical: 'Peperomia obtusifolia', price: 16, stock: 8,
    light: 'medium', lightLabel: 'Medium', waterLabel: 'Biweekly', petSafe: true, small: true },
  { id: 'pilea', sku: 'JG-PIL-001', genus: 'pilea', photo: '1742313028862-abdbc8f61827',
    name: 'Chinese Money Plant', botanical: 'Pilea peperomioides', price: 18, stock: 1,
    light: 'bright', lightLabel: 'Bright indirect', waterLabel: 'Weekly', petSafe: true, small: true },
  { id: 'hoya', sku: 'JG-HOY-001', genus: 'hoya', photo: '1771169255018-170ea17f4acd',
    name: 'Wax Plant', botanical: 'Hoya carnosa', price: 22, stock: 0,
    light: 'bright', lightLabel: 'Bright indirect', waterLabel: 'Biweekly', petSafe: true, small: true }
];

// Care sheets by genus. `common` lists the everyday names people search for.
window.GENERA = {
  epipremnum: { name: 'Epipremnum', common: 'Pothos', petSafe: false,
    light: 'Low to bright indirect. Variegation fades in low light.',
    water: 'When the top inch is dry. Droops when thirsty, perks up fast.',
    humidity: 'Average is fine.',
    local: 'Handles a north-facing apartment window through a Christiansburg winter.',
    trouble: 'Yellow leaves: too wet. Crispy brown: too dry or too much sun.' },
  dracaena: { name: 'Dracaena', common: 'Snake plant, corn plant, dragon tree', petSafe: false,
    light: 'Low to bright indirect. Tolerates fluorescent office light.',
    water: 'Let it dry out well. Every 2–3 weeks; less in winter.',
    humidity: 'Dry air is fine.',
    local: 'Good pick for dorms and rooms with forced-air heat.',
    trouble: 'Mushy base: overwatered. Brown tips: fluoride or dry soil.' },
  monstera: { name: 'Monstera', common: 'Swiss cheese plant', petSafe: false,
    light: 'Bright indirect. A few feet back from an east or south window.',
    water: 'When the top 2 inches are dry.',
    humidity: '40%+ helps. Mist or group with other plants in winter.',
    local: 'Keep it off cold glass Dec–Feb — leaves touching the window will scorch.',
    trouble: 'No splits in new leaves: needs more light.' },
  ficus: { name: 'Ficus', common: 'Fiddle leaf fig, rubber plant, weeping fig', petSafe: false,
    light: 'Bright, consistent. Pick a spot and leave it there.',
    water: 'When the top 2 inches are dry. Water thoroughly, then drain.',
    humidity: 'Average to high.',
    local: 'Drops leaves when moved inside in October. Normal — give it two weeks.',
    trouble: 'Brown spots mid-leaf: overwatering. Brown edges: dry air.' },
  chlorophytum: { name: 'Chlorophytum', common: 'Spider plant', petSafe: true,
    light: 'Medium to bright indirect.',
    water: 'Keep lightly moist spring–fall. Less in winter.',
    humidity: 'Average.',
    local: 'Brown tips are common on hard tap water — rainwater or filtered helps.',
    trouble: 'Brown tips: water minerals or dry air. Trim and move on.' },
  zamioculcas: { name: 'Zamioculcas', common: 'ZZ plant', petSafe: false,
    light: 'Low to bright indirect.',
    water: 'Every 2–3 weeks. Stores water in its rhizomes.',
    humidity: 'Dry air is fine.',
    local: 'Survives winter break unwatered — the student pick.',
    trouble: 'Yellowing stems: overwatered.' },
  goeppertia: { name: 'Goeppertia', common: 'Calathea, prayer plant', petSafe: true,
    light: 'Medium indirect. No direct sun.',
    water: 'Keep evenly moist, never soggy. Filtered water preferred.',
    humidity: 'High. 50%+ or the edges crisp.',
    local: 'Run a humidifier once the heat kicks on in November.',
    trouble: 'Curling leaves: thirsty. Crispy edges: dry air.' },
  chamaedorea: { name: 'Chamaedorea', common: 'Parlor palm, bamboo palm', petSafe: true,
    light: 'Low to medium indirect.',
    water: 'When the top inch is dry.',
    humidity: 'Average to high.',
    local: 'Pet-safe floor plant for a shaded living room.',
    trouble: 'Brown tips: dry air. Webbing under fronds: spider mites.' },
  nephrolepis: { name: 'Nephrolepis', common: 'Boston fern, sword fern', petSafe: true,
    light: 'Medium indirect.',
    water: 'Keep consistently moist.',
    humidity: 'High. Bathrooms work.',
    local: 'Porch fern May–Sept; bring it in before the mid-October frost.',
    trouble: 'Shedding fronds: too dry. Mist, or move to the bathroom.' },
  peperomia: { name: 'Peperomia', common: 'Baby rubber plant, radiator plant', petSafe: true,
    light: 'Medium to bright indirect.',
    water: 'When mostly dry. Thick leaves hold water.',
    humidity: 'Average.',
    local: 'Desk-sized and pet-safe.',
    trouble: 'Limp leaves with wet soil: root rot. Let it dry out.' },
  pilea: { name: 'Pilea', common: 'Chinese money plant, friendship plant', petSafe: true,
    light: 'Bright indirect. Rotate weekly or it leans.',
    water: 'When the top inch is dry.',
    humidity: 'Average.',
    local: 'Makes pups — bring extras back to share.',
    trouble: 'Curling leaves: too much light. Drooping: thirsty.' },
  hoya: { name: 'Hoya', common: 'Wax plant', petSafe: true,
    light: 'Bright indirect. More light, more blooms.',
    water: 'When fully dry.',
    humidity: 'Average.',
    local: 'Hang it in a south window for winter.',
    trouble: 'No flowers: more light, and don’t cut old flower spurs.' }
};

// Newsletter plant spotlight (meeting 9/17). Change each issue; Home
// shows it, and newsletter/spotlight-template.html mirrors it for email.
window.SPOTLIGHT = {
  plant: 'calathea',
  issue: 'November 2026',
  note: 'Patterned leaves that fold up at night. Pet-safe. Wants humidity once the heat comes on.'
};
