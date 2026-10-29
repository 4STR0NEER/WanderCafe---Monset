// The full menu, transcribed from the printed menus in resources/. Prices in whole pesos.
// The cart stores item ids, so keep ids stable once orders exist.
//
// options: one pick per group, the first choice is the default. A choice's `price` is added on top,
// e.g. "Add cheese +20". Choices whose label starts with "No " are left off the receipt line.

// PLACEHOLDER HOURS: confirm with the owner. Online orders can be picked up between these times.
export const HOURS = { open: "07:00", close: "20:00", leadMinutes: 20, stepMinutes: 15 };

const pick = (name, ...labels) => ({ name, choices: labels.map((l) => (typeof l === "string" ? { label: l } : l)) });

export const FOOD = [
  {
    id: "classic",
    name: "Classic Comforts",
    img: "breakfast",
    items: [
      { id: "signature-breakfast", name: "Wander Signature Breakfast", price: 295, desc: "Fluffy eggs, toasted bread, crispy bacon, juicy sausage, tomato, beans, fresh fruit & creamy coleslaw. Add black coffee or juice for +50.",
        options: [pick("Add a drink", "No drink", { label: "Black coffee", price: 50 }, { label: "Juice", price: 50 })] },
      { id: "rise-shine", name: "Rise & Shine Breakfast", price: 295, desc: "Golden waffle or pancake, choco syrup, sunny egg, bacon, sausage, fruit & crunchy granola.",
        options: [pick("Base", "Waffle", "Pancake")] },
      { id: "ramen", name: "Ramen", price: 120, desc: "1 pack spicy or mild ramen with egg. Add cheese slice for +20.",
        options: [pick("Flavor", "Spicy", "Mild"), pick("Cheese slice", "No cheese", { label: "Add cheese slice", price: 20 })] },
    ],
  },
  {
    id: "sweet",
    name: "Sweet Morning Treats",
    img: "waffle",
    items: [
      { id: "waffle-hearts", name: "Waffle Hearts", price: 165, desc: "5 golden hearts with choco drizzle, a scoop of ice cream/whipped cream, granola & dusted with powdered sugar.",
        options: [pick("Topping", "Ice cream", "Whipped cream")] },
      { id: "pancake-haven", name: "Pancake Haven", price: 165, desc: "Fluffy double stack crowned with cherry, lightly dusted with powdered sugar and garnished with fresh fruits and strawberry jam." },
      { id: "yogurt-parfait", name: "Yogurt Parfait", price: 145, desc: "Greek yogurt layered with honey, walnut granola & sweet fresh fruits." },
    ],
  },
  {
    id: "filipino",
    name: "Filipino Comfort Plates",
    note: "With rice, sunny side up and coleslaw",
    items: ["Corned Beef", "Tocino", "Spam", "Hotdog", "Ham", "Chorizo", "Sardines Run"].map((name) => ({
      id: "plate-" + name.toLowerCase().replace(/\s+/g, "-"),
      name,
      price: 195,
    })),
  },
  {
    id: "combo",
    name: "Combo Meals",
    note: "Comes with coffee or juice",
    items: [
      { id: "bacon-longaniza", name: "Bacon + Longaniza", price: 245, desc: "3 crispy bacon, 2 juicy longaniza with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
      { id: "sausage-ham", name: "Sausage + Ham", price: 245, desc: "Hungarian sausage, 2 ham with sunny egg.", options: [pick("Drink", "Coffee", "Juice")] },
    ],
  },
  {
    id: "sandwich",
    name: "Sandwich Creations",
    items: [
      { id: "spam-jam", name: "Spam & Jam", price: 159, desc: "Crispy spam, sweet strawberry jam, and sunny side up." },
      { id: "mango-cream-cheese", name: "Mango Cream Cheese", price: 159, desc: "Toasted bread, cream cheese, mango slices, honey drizzle, walnut, granola." },
      { id: "tuna-melt", name: "Tuna Melt", price: 149, desc: "Tuna, mayo, egg, lettuce, cheese." },
      { id: "ham-egg", name: "Ham & Egg", price: 145, desc: "Ham, boiled egg, crisp lettuce." },
      { id: "egg-cheese", name: "Egg & Cheese", price: 129, desc: "Sliced boiled egg, cheddar cheese, crisp lettuce." },
    ],
  },
  {
    id: "pasta",
    name: "Pasta",
    note: "Simple ingredients. Big comfort.",
    img: "carbonara",
    items: [
      { id: "carbonara", name: "Creamy Carbonara", price: 229, desc: "Classic and creamy pasta with bacon, egg, and parmesan cheese." },
      { id: "pasta-sardines", name: "Pasta Sardines", price: 185, desc: "Flavorful pasta with sardines, garlic, and herbs. Spicy or original.", options: [pick("Flavor", "Original", "Spicy")] },
      { id: "bolognese", name: "Bolognese", price: 259, desc: "Hearty meaty sauce with a rich tomato base, slow cooked to perfection." },
      { id: "asian-beef-pasta", name: "Asian Beef Pasta", price: 259, desc: "Savory and slightly sweet stir-fry style pasta with tender beef and veggies." },
      { id: "beef-penne", name: "Beef Penne", price: 259, desc: "Penne pasta tossed in a rich, savory sauce with tender beef and herbs." },
      { id: "sotanghon", name: "Sotanghon", price: 249, desc: "Filipino-style glass noodles stir-fried with veggies, chicken strips, and savory seasoning." },
    ],
  },
  {
    id: "bowls",
    name: "Comfort Bowls",
    note: "Warm meals. Real comfort.",
    img: "ramen",
    items: [
      { id: "special-ramen", name: "Special Ramen", price: 159, desc: "Savory ramen in a rich, flavorful broth topped with a boiled egg, a slice of spam, and herbs." },
      { id: "pancit-canton", name: "Special Pancit Canton", price: 135, desc: "Classic pancit canton with a sunny egg and a spam slice. Chilimansi or original.", options: [pick("Flavor", "Original", "Chilimansi")] },
      { id: "pho", name: "Vietnamese Pho", price: 315, desc: "A light and aromatic Vietnamese beef noodle soup with tender slices of beef, herbs, and rice noodles." },
    ],
  },
  {
    id: "dessert",
    name: "Halo Halo",
    note: "A Filipino favorite. Made even better.",
    img: "halohalo",
    items: [
      { id: "halo-halo", name: "Our Classic Halo Halo", price: 120, desc: "Ube ice cream, corn flakes, saba & fruits, gulaman, ube halaya, milk & ice." },
    ],
  },
];

const drinks = (prefix, list) => list.map(([name, price]) => ({ id: prefix + "-" + name.toLowerCase().replace(/[^a-z]+/g, "-"), name, price }));

export const DRINKS = [
  {
    id: "coffee",
    name: "Coffee Drinks",
    items: drinks("coffee", [
      ["Espresso", 90], ["Americano", 105], ["Pour Over", 145], ["Latte", 130], ["Cappuccino", 139],
      ["Caramel Macchiato", 159], ["Spanish", 139], ["Hazelnut", 145], ["Vanilla", 195], ["Vietnamese", 159], ["Mocha", 145],
    ]),
  },
  {
    id: "signatures",
    name: "Signatures",
    items: drinks("sig", [
      ["Sunrise Spice", 165], ["Orange Americano", 155], ["Coconut Americano", 165],
      ["Strawberry Latte", 165], ["Rose Latte", 165], ["Mango Latte", 165],
    ]),
  },
  {
    id: "non-coffee",
    name: "Non-Coffee",
    items: drinks("nc", [
      ["Fruit Shakes", 115], ["Oreo Smoothie", 115], ["Money Business", 125], ["Strawberry Daydream", 125],
      ["Red Velvet Crush", 125], ["Matcha Latte", 135], ["Strawberry Matcha", 165], ["Golden Milk/Pink Milk", 99],
    ]).map((d) => (d.id === "nc-golden-milk-pink-milk" ? { ...d, options: [pick("Milk", "Golden milk", "Pink milk")] } : d)),
  },
];
