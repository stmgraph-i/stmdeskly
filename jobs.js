/* ============================================================
   DESKLY · OCCUPATIONS
   The list is internal. It never shows to users.
   Each record matches what a Nigerian types and returns
   one professional identity with a tagline, about and services.
   ============================================================ */

const JOBS = [

  /* ===================== TRADE AND CONSTRUCTION ===================== */

  {
    title: "Bricklayer",
    local: "Block Layer",
    category: "Trade",
    search: ["bricklayer","brick layer","block layer","block work","brick work"],
    variants: [
      {
        tagline: "Builds walls and structures with blocks and bricks.",
        about: "Lays blocks and bricks for houses, fences and other building work, following measurements and building plans.",
        services: ["Block laying","Wall construction","Fence walls","Block repairs"]
      }
    ]
  },
  {
    title: "Tiler",
    local: "Tile Installer",
    category: "Trade",
    search: ["tiler","tiling","tile installer","floor tiler","wall tiler"],
    variants: [
      {
        tagline: "Installs tiles on floors, walls and other surfaces.",
        about: "Measures surfaces, prepares them and lays tiles neatly in homes, shops and other buildings.",
        services: ["Floor tiling","Wall tiling","Bathroom tiling","Tile replacement"]
      }
    ]
  },
  {
    title: "Interlock Installer",
    local: "Interlocking Worker",
    category: "Trade",
    search: ["interlock installer","interlocking","interlock","interlock worker","interlock paving"],
    variants: [
      {
        tagline: "Lays interlocking blocks for compounds and walkways.",
        about: "Prepares outdoor surfaces and installs interlocking paving blocks for compounds, paths and parking areas.",
        services: ["Interlock paving","Compound paving","Walkway installation","Paving repairs"]
      }
    ]
  },
  {
    title: "Plumber",
    local: "Pipe Fitter",
    category: "Trade",
    search: ["plumber","plumbing","fix pipe","fix tap","leaking pipe","pipe fitter","water pipe"],
    variants: [
      {
        tagline: "Plumbing repairs and installations.",
        about: "Fixes leaks, blocked pipes, taps and toilets. Handles installations for homes and small businesses.",
        services: ["Pipe installation","Leak repairs","Toilet repairs","Water tank connections"]
      }
    ]
  },
  {
    title: "Carpenter",
    local: "Woodworker",
    category: "Trade",
    search: ["carpenter","carpentry","wood work","build furniture","make furniture","woodworker"],
    variants: [
      {
        tagline: "Furniture and woodwork, built to fit.",
        about: "Builds and repairs furniture, doors and wooden fittings to custom measurements.",
        services: ["Custom furniture","Door repairs","Wardrobes","Kitchen fittings"]
      }
    ]
  },
  {
    title: "Welder",
    local: "",
    category: "Trade",
    search: ["welder","welding","weld","metal work","welding work"],
    variants: [
      {
        tagline: "Joins and fabricates metal items.",
        about: "Uses welding equipment to join, repair and build metal items such as gates, frames, stands and other metalwork.",
        services: ["Gate welding","Metal frames","Metal repairs","Custom metalwork"]
      }
    ]
  },
  {
    title: "Painter",
    local: "House Painter",
    category: "Trade",
    search: ["painter","house painter","paint house","painting","building painter"],
    variants: [
      {
        tagline: "Paints houses, shops and other buildings.",
        about: "Prepares walls and applies paint on homes, shops and other buildings according to the customer's choice.",
        services: ["Interior painting","Exterior painting","Wall preparation","Repainting"]
      }
    ]
  },
  {
    title: "POP Installer",
    local: "POP Worker",
    category: "Trade",
    search: ["pop installer","pop","pop ceiling","pop worker","plaster of paris"],
    variants: [
      {
        tagline: "Installs POP ceilings and interior finishes.",
        about: "Designs and installs plaster of Paris ceilings and other interior finishing work.",
        services: ["POP ceilings","Wall designs","Ceiling repairs","Interior finishes"]
      }
    ]
  },
  {
    title: "Aluminium Fabricator",
    local: "Aluminium Worker",
    category: "Trade",
    search: ["aluminium fabricator","aluminium","aluminium worker","aluminium windows","aluminium doors"],
    variants: [
      {
        tagline: "Makes and fits aluminium doors and windows.",
        about: "Fabricates and installs aluminium windows, doors and other fittings to size.",
        services: ["Aluminium windows","Aluminium doors","Aluminium partitions","Net screens"]
      }
    ]
  },
  {
    title: "Roofing Worker",
    local: "Roofer",
    category: "Trade",
    search: ["roofing","roofer","roof work","roofing worker","roof repairs"],
    variants: [
      {
        tagline: "Installs and repairs roofs for buildings.",
        about: "Installs roofing sheets and handles common roof repairs on homes and commercial buildings.",
        services: ["Roof installation","Roof repairs","Roof sheets","Leak fixes"]
      }
    ]
  },

  /* ===================== REPAIRS AND DEVICES ===================== */

  {
    title: "Mobile Phone Repair Specialist",
    local: "Phone Engineer",
    category: "Repair",
    search: ["phone repair","fix phone","phone engineer","screen repair","gsm","repair phone"],
    variants: [
      {
        tagline: "Repairs common faults on mobile phones.",
        about: "Repairs and maintains mobile phones, including common hardware and software faults.",
        services: ["Screen replacement","Battery replacement","Charging port repair","Software troubleshooting"]
      }
    ]
  },
  {
    title: "Laptop Repair Specialist",
    local: "Laptop Engineer",
    category: "Repair",
    search: ["laptop repair","fix laptop","laptop engineer","computer repair","laptop technician"],
    variants: [
      {
        tagline: "Repairs laptops and fixes common computer problems.",
        about: "Diagnoses and repairs laptop faults, including hardware problems, charging issues and software errors.",
        services: ["Laptop repairs","Screen replacement","Keyboard replacement","Software installation"]
      }
    ]
  },
  {
    title: "Computer Technician",
    local: "Computer Engineer",
    category: "Tech",
    search: ["computer technician","computer engineer","computer repair","pc repair","computer fixer"],
    variants: [
      {
        tagline: "Repairs computers and fixes common PC problems.",
        about: "Diagnoses computer faults, replaces faulty parts and handles common software problems on desktop and laptop computers.",
        services: ["Computer repairs","Windows installation","Hardware replacement","Computer troubleshooting"]
      }
    ]
  },
  {
    title: "Generator Mechanic",
    local: "Generator Repairer",
    category: "Repair",
    search: ["generator mechanic","generator repair","fix generator","generator repairer","gen repair"],
    variants: [
      {
        tagline: "Repairs generators and troubleshoots common faults.",
        about: "Checks, repairs and maintains petrol and diesel generators used in homes, shops and workplaces.",
        services: ["Generator repairs","Generator servicing","Engine troubleshooting","Oil change"]
      }
    ]
  },
  {
    title: "Refrigerator Repairer",
    local: "Fridge Engineer",
    category: "Repair",
    search: ["fridge repair","refrigerator repair","fridge engineer","fix fridge","freezer repair"],
    variants: [
      {
        tagline: "Repairs fridges and freezers with cooling problems.",
        about: "Checks refrigeration faults and repairs fridges and freezers that are not cooling properly.",
        services: ["Fridge repairs","Freezer repairs","Gas charging","Thermostat replacement"]
      }
    ]
  },
  {
    title: "Washing Machine Repairer",
    local: "",
    category: "Repair",
    search: ["washing machine repair","washing machine fixer","fix washing machine","washer repair"],
    variants: [
      {
        tagline: "Repairs washing machines and common operating faults.",
        about: "Diagnoses and repairs washing machines that have electrical, drainage, spinning or water supply problems.",
        services: ["Washing machine repairs","Drainage repairs","Motor replacement","Electrical fault checks"]
      }
    ]
  },
  {
    title: "Air Conditioner Installer",
    local: "AC Installer",
    category: "Repair",
    search: ["ac installer","air conditioner installer","ac installation","air conditioning installer"],
    variants: [
      {
        tagline: "Installs air conditioners in homes and workplaces.",
        about: "Installs split and other common air conditioning units and checks that they are properly connected.",
        services: ["AC installation","AC relocation","Copper pipe installation","AC testing"]
      }
    ]
  },
  {
    title: "Auto Mechanic",
    local: "Car Mechanic",
    category: "Repair",
    search: ["mechanic","car mechanic","auto mechanic","fix car","engine repair","motor mechanic"],
    variants: [
      {
        tagline: "Car repairs and servicing.",
        about: "Diagnoses and repairs vehicle faults. Services engines, brakes, suspension and general running issues.",
        services: ["Engine repair","Brake service","Suspension work","General servicing"]
      }
    ]
  },
  {
    title: "Panel Beater",
    local: "Bodywork Man",
    category: "Repair",
    search: ["panel beater","body work","car body","auto body","car sprayer"],
    variants: [
      {
        tagline: "Car body repair, done properly.",
        about: "Repairs damaged panels, removes dents and prepares the bodywork for painting.",
        services: ["Dent removal","Panel replacement","Bodywork repair","Prep for spray"]
      }
    ]
  },
  {
    title: "Vulcanizer",
    local: "Tyre Repairer",
    category: "Repair",
    search: ["vulcanizer","vulcaniser","tyre repair","tyre repairer","fix tyre","tyre man","puncture"],
    variants: [
      {
        tagline: "Fixes tyres and pumps them.",
        about: "Repairs punctured tyres and pumps them, usually from a roadside stand.",
        services: ["Puncture repair","Tyre pumping","Tyre replacement","Wheel checks"]
      }
    ]
  },
  {
    title: "Bicycle Repairer",
    local: "",
    category: "Repair",
    search: ["bicycle repair","bike repair","bicycle repairer","bicycle mechanic","fix bicycle"],
    variants: [
      {
        tagline: "Repairs bicycles and their common parts.",
        about: "Fixes bicycle tyres, chains, brakes, gears and other common faults.",
        services: ["Tyre repair","Chain repair","Brake repair","General servicing"]
      }
    ]
  },
  {
    title: "Cobbler",
    local: "Shoe Repairer",
    category: "Craft",
    search: ["cobbler","shoe repair","shoe repairs","shoe fixer","repair shoe"],
    variants: [
      {
        tagline: "Repairs worn shoes and restores them for use.",
        about: "Repairs damaged footwear and replaces worn parts such as soles, heels, straps and fasteners.",
        services: ["Sole replacement","Heel repairs","Shoe stitching","Shoe cleaning"]
      }
    ]
  },
  {
    title: "Watch Repairer",
    local: "Watch Man",
    category: "Repair",
    search: ["watch repair","watch repairer","fix watch","watch man","watch technician"],
    variants: [
      {
        tagline: "Repairs watches and replaces watch parts.",
        about: "Checks and repairs wristwatches, replaces batteries and handles common movement faults.",
        services: ["Battery replacement","Strap replacement","Movement repairs","Watch servicing"]
      }
    ]
  },
  {
    title: "Goldsmith",
    local: "Jeweller",
    category: "Craft",
    search: ["goldsmith","jeweller","jeweler","gold work","jewellery maker","jewelry"],
    variants: [
      {
        tagline: "Makes and repairs gold and jewellery items.",
        about: "Makes and repairs jewellery in gold and other metals, following the customer's design or measurements.",
        services: ["Jewellery making","Jewellery repairs","Gold polishing","Custom designs"]
      }
    ]
  },

  /* ===================== CRAFT AND FASHION ===================== */

  {
    title: "Tailor",
    local: "Fashion Designer",
    category: "Fashion",
    search: ["tailor","tailoring","fashion designer","sewer","sewing","seamstress","seamster"],
    variants: [
      {
        tagline: "Makes and alters clothes to fit different styles.",
        about: "Makes new clothes from measurements and adjusts existing clothes when they need a better fit.",
        services: ["Clothes making","Clothing alterations","Native wear","School uniforms"]
      }
    ]
  },
  {
    title: "Fashion Designer",
    local: "",
    category: "Fashion",
    search: ["fashion designer","fashion design","clothing designer","design clothes","designer"],
    variants: [
      {
        tagline: "Designs and produces original clothing.",
        about: "Designs and produces original clothing, either for personal clients or for small fashion brands.",
        services: ["Clothing design","Custom outfits","Bridal wear","Fashion pieces"]
      }
    ]
  },
  {
    title: "Shoe Maker",
    local: "Shoemaker",
    category: "Craft",
    search: ["shoe maker","shoemaker","shoe making","footwear maker","make shoe"],
    variants: [
      {
        tagline: "Makes shoes by hand for different styles and sizes.",
        about: "Makes footwear from leather and other materials, taking measurements and finishing each pair to fit the customer.",
        services: ["Shoe making","Custom footwear","Shoe repairs","Leather finishing"]
      }
    ]
  },
  {
    title: "Bag Maker",
    local: "Leather Worker",
    category: "Craft",
    search: ["bag maker","bag making","leather bag maker","handbag maker","bag maker"],
    variants: [
      {
        tagline: "Makes bags for everyday use and special occasions.",
        about: "Makes bags from leather, fabric and other materials in different sizes and styles.",
        services: ["Handbag making","School bags","Leather bags","Custom bags"]
      }
    ]
  },
  {
    title: "Upholsterer",
    local: "Sofa Maker",
    category: "Craft",
    search: ["upholsterer","upholstery","sofa maker","sofa repair","chair upholstery"],
    variants: [
      {
        tagline: "Covers and repairs sofas, chairs and other furniture.",
        about: "Replaces worn fabric, foam and other coverings on furniture and restores old seats for continued use.",
        services: ["Sofa upholstery","Chair upholstery","Foam replacement","Furniture repairs"]
      }
    ]
  },
  {
    title: "Furniture Maker",
    local: "Furniture Carpenter",
    category: "Craft",
    search: ["furniture maker","furniture making","furniture carpenter","build furniture","custom furniture"],
    variants: [
      {
        tagline: "Makes wooden furniture for homes and workspaces.",
        about: "Builds furniture from wood and related materials, using measurements supplied by the customer or agreed designs.",
        services: ["Tables","Chairs","Wardrobes","Beds","Shelves"]
      }
    ]
  },
  {
    title: "Mattress Maker",
    local: "Foam Mattress Maker",
    category: "Craft",
    search: ["mattress maker","mattress making","foam mattress","mattress","mattress repairs"],
    variants: [
      {
        tagline: "Makes mattresses in different sizes and thicknesses.",
        about: "Cuts and assembles foam and covering materials to make mattresses for homes and other sleeping spaces.",
        services: ["Foam mattresses","Custom sizes","Mattress covers","Mattress repairs"]
      }
    ]
  },
  {
    title: "Bead Maker",
    local: "Bead Designer",
    category: "Craft",
    search: ["bead maker","bead making","bead designer","bead work","beaded jewellery"],
    variants: [
      {
        tagline: "Makes beaded jewellery and accessories.",
        about: "Creates beaded jewellery and decorative accessories for individual customers and events.",
        services: ["Necklaces","Bracelets","Earrings","Custom beadwork"]
      }
    ]
  },
  {
    title: "Cap Maker",
    local: "Fila Maker",
    category: "Craft",
    search: ["cap maker","cap making","fila maker","native cap","traditional cap"],
    variants: [
      {
        tagline: "Makes traditional and modern caps.",
        about: "Makes native and contemporary caps and custom headwear for ceremonies and everyday wear.",
        services: ["Native caps","Fila","Ceremonial caps","Custom caps"]
      }
    ]
  },

  /* ===================== BEAUTY ===================== */

  {
    title: "Barber",
    local: "",
    category: "Beauty",
    search: ["barber","barbing","barbering","hair barber","barb","men haircut"],
    variants: [
      {
        tagline: "Cuts and styles hair for men and boys.",
        about: "Provides haircuts and simple grooming services based on the customer's preferred style.",
        services: ["Haircuts","Beard trimming","Hairline styling","Kids haircuts"]
      }
    ]
  },
  {
    title: "Hair Braider",
    local: "Braider",
    category: "Beauty",
    search: ["hair braider","braider","braiding","hair braiding","braid hair"],
    variants: [
      {
        tagline: "Braids and styles natural and added hair.",
        about: "Creates different braided hairstyles using natural hair, extensions and other braiding materials.",
        services: ["Box braids","Cornrows","Knotless braids","Hair extensions"]
      }
    ]
  },
  {
    title: "Hair Stylist",
    local: "",
    category: "Beauty",
    search: ["hair stylist","hairstylist","hairdresser","hair dressing","hair style"],
    variants: [
      {
        tagline: "Styles hair for different occasions.",
        about: "Washes, cuts, styles and finishes hair for customers in different lengths and shapes.",
        services: ["Hair styling","Hair treatment","Hair cuts","Event hair"]
      }
    ]
  },
  {
    title: "Wig Maker",
    local: "Wig Stylist",
    category: "Beauty",
    search: ["wig maker","wig making","wig stylist","custom wig","wig"],
    variants: [
      {
        tagline: "Makes, styles and restores wigs for customers.",
        about: "Makes and styles wigs from human hair or other materials and restores wigs that need attention.",
        services: ["Wig making","Wig revamping","Wig styling","Wig installation"]
      }
    ]
  },
  {
    title: "Loc Stylist",
    local: "Dreadlock Stylist",
    category: "Beauty",
    search: ["loc stylist","dreadlock stylist","dreadlocks","locs","dread hair"],
    variants: [
      {
        tagline: "Creates and maintains loc hairstyles.",
        about: "Starts, styles and maintains locs while helping customers keep their hair neat and healthy.",
        services: ["Loc installation","Loc retwisting","Loc styling","Loc maintenance"]
      }
    ]
  },
  {
    title: "Makeup Artist",
    local: "MUA",
    category: "Beauty",
    search: ["makeup artist","make up artist","makeup","bridal makeup","face beat"],
    variants: [
      {
        tagline: "Does makeup for events, photos and special occasions.",
        about: "Applies makeup for customers attending celebrations, taking photographs or preparing for special events.",
        services: ["Event makeup","Bridal makeup","Photoshoot makeup","Traditional makeup"]
      }
    ]
  },
  {
    title: "Nail Technician",
    local: "Nail Tech",
    category: "Beauty",
    search: ["nail technician","nail tech","nails","nail artist","manicure","pedicure"],
    variants: [
      {
        tagline: "Provides nail care, polish and simple nail designs.",
        about: "Cares for fingernails and toenails and applies polish, extensions and designs according to the customer's choice.",
        services: ["Manicure","Pedicure","Gel polish","Nail extensions","Nail art"]
      }
    ]
  },
  {
    title: "Lash Technician",
    local: "Lash Tech",
    category: "Beauty",
    search: ["lash technician","lash tech","lashes","eyelash technician","lash artist"],
    variants: [
      {
        tagline: "Applies and maintains eyelash extensions.",
        about: "Applies eyelash extensions in different styles and maintains them through follow-up appointments.",
        services: ["Lash extensions","Classic lashes","Volume lashes","Lash removal"]
      }
    ]
  },
  {
    title: "Gele Stylist",
    local: "Gele Artist",
    category: "Beauty",
    search: ["gele","gele artist","gele stylist","head tie","head wear","gele tying"],
    variants: [
      {
        tagline: "Ties gele for weddings and ceremonies.",
        about: "Ties and styles gele for brides, guests and celebrants at weddings and other ceremonies.",
        services: ["Wedding gele","Event gele","Bridal party","Gele lessons"]
      }
    ]
  },
  {
    title: "Henna Artist",
    local: "Lalle Artist",
    category: "Beauty",
    search: ["henna","lalle","henna artist","henna designer","mehndi"],
    variants: [
      {
        tagline: "Draws henna designs for special occasions.",
        about: "Draws henna designs on hands and feet for weddings, festive seasons and other ceremonies.",
        services: ["Bridal henna","Festive henna","Party henna","Custom designs"]
      }
    ]
  },
  {
    title: "Massage Therapist",
    local: "",
    category: "Health",
    search: ["massage therapist","massage","massage therapy","body massage","masseuse"],
    variants: [
      {
        tagline: "Provides massage sessions for relaxation and body care.",
        about: "Provides general massage sessions using techniques suited to the customer's requested level of pressure and comfort.",
        services: ["Body massage","Back massage","Foot massage","Relaxation massage"]
      }
    ]
  },

  /* ===================== FOOD AND DRINK ===================== */

  {
    title: "Food Vendor",
    local: "Food Seller",
    category: "Food",
    search: ["food vendor","food seller","food business","cook food","street food","sell food"],
    variants: [
      {
        tagline: "Prepares and sells ready-to-eat local meals.",
        about: "Prepares cooked meals for customers who want affordable food for breakfast, lunch or dinner.",
        services: ["Cooked meals","Takeaway meals","Rice dishes","Local dishes"]
      }
    ]
  },
  {
    title: "Buka Operator",
    local: "Mama Put",
    category: "Food",
    search: ["buka operator","mama put","buka","mama put food","local restaurant"],
    variants: [
      {
        tagline: "Serves everyday Nigerian meals from a local food spot.",
        about: "Runs a local food spot serving cooked Nigerian meals to customers for dine-in or takeaway.",
        services: ["Nigerian meals","Rice meals","Soups","Takeaway food"]
      }
    ]
  },
  {
    title: "Party Caterer",
    local: "Caterer",
    category: "Food",
    search: ["party caterer","caterer","catering","event caterer","food catering"],
    variants: [
      {
        tagline: "Prepares and serves food for parties and events.",
        about: "Plans food quantities, prepares meals and serves guests at parties and other gatherings.",
        services: ["Party catering","Event meals","Buffet service","Small event catering"]
      }
    ]
  },
  {
    title: "Cake Baker",
    local: "Cake Maker",
    category: "Food",
    search: ["cake baker","cake maker","cake baking","birthday cake","custom cake"],
    variants: [
      {
        tagline: "Bakes cakes for birthdays, celebrations and events.",
        about: "Bakes and decorates cakes in different flavours, sizes and designs for personal and family celebrations.",
        services: ["Birthday cakes","Wedding cakes","Cupcakes","Custom cake designs"]
      }
    ]
  },
  {
    title: "Bread Baker",
    local: "Bread Seller",
    category: "Food",
    search: ["bread baker","bread seller","bread vendor","bake bread","bread"],
    variants: [
      {
        tagline: "Bakes and sells fresh bread.",
        about: "Bakes bread daily and sells it to homes, shops and passing customers.",
        services: ["Bread baking","Loaves","Buns","Bread delivery"]
      }
    ]
  },
  {
    title: "Akara Seller",
    local: "Akara Woman",
    category: "Food",
    search: ["akara seller","akara","bean cake seller","akara woman","akara vendor"],
    variants: [
      {
        tagline: "Makes and sells fresh akara for breakfast and meals.",
        about: "Prepares bean batter, fries akara and sells it fresh to customers.",
        services: ["Akara","Bulk akara","Breakfast orders"]
      }
    ]
  },
  {
    title: "Puff Puff Seller",
    local: "",
    category: "Food",
    search: ["puff puff","puff puff seller","puff puff vendor","snack seller","small snack"],
    variants: [
      {
        tagline: "Makes and sells fresh puff puff.",
        about: "Prepares and fries puff puff and sells it fresh at markets, roadsides and events.",
        services: ["Puff puff","Event orders","Party packs","Bulk orders"]
      }
    ]
  },
  {
    title: "Suya Vendor",
    local: "Suya Man",
    category: "Food",
    search: ["suya vendor","suya","suya man","suya seller","beef suya"],
    variants: [
      {
        tagline: "Prepares and grills suya to order.",
        about: "Cuts, seasons and grills meat over charcoal and serves it with the usual suya sides.",
        services: ["Beef suya","Chicken suya","Suya orders","Bulk suya"]
      }
    ]
  },
  {
    title: "Boli Seller",
    local: "Roasted Plantain Seller",
    category: "Food",
    search: ["boli","boli seller","roasted plantain","roast plantain","plantain seller"],
    variants: [
      {
        tagline: "Roasts and sells plantain with pepper sauce.",
        about: "Roasts plantain over fire and sells it with pepper sauce or other sides.",
        services: ["Roasted plantain","Pepper sauce","Bulk orders","Event service"]
      }
    ]
  },
  {
    title: "Roasted Corn Seller",
    local: "Corn Seller",
    category: "Food",
    search: ["roasted corn","corn seller","corn","maize seller","roast corn"],
    variants: [
      {
        tagline: "Roasts and sells fresh corn.",
        about: "Roasts fresh corn over fire and sells it plain or with pear, coconut or pepper.",
        services: ["Roasted corn","Corn with pear","Corn with coconut","Bulk orders"]
      }
    ]
  },
  {
    title: "Pepper Soup Cook",
    local: "Pepper Soup Seller",
    category: "Food",
    search: ["pepper soup cook","pepper soup","pepper soup seller","catfish pepper soup","goat meat pepper soup"],
    variants: [
      {
        tagline: "Prepares hot Nigerian pepper soup for customers.",
        about: "Prepares pepper soup with fish, meat or other ingredients and serves it fresh.",
        services: ["Catfish pepper soup","Goat meat pepper soup","Chicken pepper soup","Bulk orders"]
      }
    ]
  },
  {
    title: "Zobo Seller",
    local: "Zobo Drink Maker",
    category: "Food",
    search: ["zobo seller","zobo","zobo drink","hibiscus drink","zobo vendor"],
    variants: [
      {
        tagline: "Makes and sells chilled zobo drinks.",
        about: "Prepares hibiscus-based zobo drinks in different quantities for individual customers and small events.",
        services: ["Zobo drinks","Bottled zobo","Party packs","Bulk orders"]
      }
    ]
  },
  {
    title: "Kunu Seller",
    local: "Kunu Maker",
    category: "Food",
    search: ["kunu","kunu seller","kunu drink","millet drink","kunu maker"],
    variants: [
      {
        tagline: "Makes and sells fresh kunu drinks.",
        about: "Prepares kunu from millet or other grains and sells it chilled to customers.",
        services: ["Kunu drinks","Bottled kunu","Party packs","Bulk orders"]
      }
    ]
  },
  {
    title: "Tiger Nut Drink Maker",
    local: "Kunu Aya",
    category: "Food",
    search: ["tiger nut","tiger nut drink","kunu aya","aya drink","tiger nut milk"],
    variants: [
      {
        tagline: "Makes fresh tiger nut drinks.",
        about: "Prepares tiger nut milk and sells it chilled to individuals and small events.",
        services: ["Tiger nut drink","Bottled packs","Event supply","Bulk orders"]
      }
    ]
  },
  {
    title: "Small Chops Vendor",
    local: "Small Chops Seller",
    category: "Food",
    search: ["small chops","small chops vendor","small chops seller","spring roll","samosa"],
    variants: [
      {
        tagline: "Makes small chops for parties and everyday orders.",
        about: "Prepares popular small chops and packs them for customers, parties and other gatherings.",
        services: ["Spring rolls","Samosa","Puff puff","Small chops trays"]
      }
    ]
  },
  {
    title: "Chin Chin Maker",
    local: "Chin Chin Seller",
    category: "Food",
    search: ["chin chin maker","chin chin","chin chin seller","chin chin business"],
    variants: [
      {
        tagline: "Makes crunchy chin chin for snacks and orders.",
        about: "Prepares, cuts and fries chin chin and packs it for individual customers and bulk orders.",
        services: ["Chin chin","Party packs","Gift packs","Bulk orders"]
      }
    ]
  },
  {
    title: "Pepper Grinder",
    local: "Grinding Machine Operator",
    category: "Food",
    search: ["pepper grinder","grinding machine","grind pepper","pepper grinding","grinding engine"],
    variants: [
      {
        tagline: "Grinds pepper, tomato and other food ingredients.",
        about: "Grinds pepper, tomatoes, onions and other food ingredients for customers using a grinding machine.",
        services: ["Pepper grinding","Tomato grinding","Onion grinding","Ingredient blending"]
      }
    ]
  },

  /* ===================== TRADE AND VENDING ===================== */

  {
    title: "Okrika Seller",
    local: "Second-Hand Clothes Seller",
    category: "Trade",
    search: ["okrika","okrika seller","second hand clothes","thrift clothes","bend down boutique"],
    variants: [
      {
        tagline: "Sells affordable second-hand clothing.",
        about: "Sells imported second-hand clothes, shoes and accessories, usually from a stall or market space.",
        services: ["Second-hand clothes","Thrift wear","Shoes","Accessories"]
      }
    ]
  },
  {
    title: "Clothes Seller",
    local: "Fashion Vendor",
    category: "Trade",
    search: ["clothes seller","clothes vendor","clothing seller","sell clothes","fashion vendor"],
    variants: [
      {
        tagline: "Sells new clothes and fashion items.",
        about: "Sells new clothing and fashion items to individuals and small groups.",
        services: ["Clothing sales","Men's wear","Women's wear","Kids' clothes"]
      }
    ]
  },
  {
    title: "Fabric Seller",
    local: "Cloth Seller",
    category: "Trade",
    search: ["fabric seller","cloth seller","material seller","ankara seller","lace seller"],
    variants: [
      {
        tagline: "Sells fabric and clothing materials.",
        about: "Sells fabrics in different styles and quantities for everyday wear and ceremonies.",
        services: ["Ankara","Lace","Silk","Fabrics for ceremonies"]
      }
    ]
  },
  {
    title: "Shoe Seller",
    local: "Shoe Vendor",
    category: "Trade",
    search: ["shoe seller","shoe vendor","footwear seller","sell shoes","shoe trader"],
    variants: [
      {
        tagline: "Sells footwear in different styles and sizes.",
        about: "Sells shoes, sandals and other footwear to individual customers and small shops.",
        services: ["Shoes","Sandals","Slippers","Footwear orders"]
      }
    ]
  },
  {
    title: "Phone Accessories Seller",
    local: "Phone Accessories Vendor",
    category: "Trade",
    search: ["phone accessories","phone accessories seller","charger seller","screen guard seller","phone vendor"],
    variants: [
      {
        tagline: "Sells chargers, cases and phone accessories.",
        about: "Sells chargers, cases, screen guards, earphones and other phone accessories.",
        services: ["Chargers","Cases","Screen guards","Earphones"]
      }
    ]
  },
  {
    title: "Cosmetics Seller",
    local: "Beauty Products Seller",
    category: "Trade",
    search: ["cosmetics seller","makeup seller","beauty products seller","cosmetics vendor","skincare seller"],
    variants: [
      {
        tagline: "Sells makeup and beauty products.",
        about: "Sells makeup, skincare and other beauty products to individual customers and small shops.",
        services: ["Makeup","Skincare","Hair products","Beauty sets"]
      }
    ]
  },
  {
    title: "Perfume Seller",
    local: "Perfume Vendor",
    category: "Trade",
    search: ["perfume seller","perfume vendor","fragrance seller","oil perfume","sell perfume"],
    variants: [
      {
        tagline: "Sells perfumes, fragrances and body sprays.",
        about: "Sells perfumes, oils and body sprays in different sizes and brands.",
        services: ["Perfumes","Oil perfume","Body spray","Gift sets"]
      }
    ]
  },
  {
    title: "Provision Seller",
    local: "Provision Shop Owner",
    category: "Trade",
    search: ["provision seller","provision shop","provisions","corner shop","small shop"],
    variants: [
      {
        tagline: "Sells everyday provisions and household items.",
        about: "Runs a small shop selling common provisions, drinks and everyday household items.",
        services: ["Provisions","Soft drinks","Household items","Snacks"]
      }
    ]
  },
  {
    title: "Foodstuff Trader",
    local: "Foodstuff Seller",
    category: "Trade",
    search: ["foodstuff seller","foodstuff","garri seller","bean seller","rice seller","foodstuff trader"],
    variants: [
      {
        tagline: "Sells everyday foodstuff and staple items.",
        about: "Sells staple foods such as garri, beans, rice and other kitchen items by measure or package.",
        services: ["Garri","Beans","Rice","Staple foods"]
      }
    ]
  },
  {
    title: "Fresh Produce Seller",
    local: "Tomato Seller",
    category: "Trade",
    search: ["tomato seller","pepper seller","vegetable seller","fresh produce seller","produce seller"],
    variants: [
      {
        tagline: "Sells fresh tomatoes, peppers and vegetables.",
        about: "Sells fresh tomatoes, peppers and vegetables to homes, cooks and food businesses.",
        services: ["Tomatoes","Peppers","Vegetables","Bulk produce"]
      }
    ]
  },
  {
    title: "Fruit Seller",
    local: "Fruit Vendor",
    category: "Trade",
    search: ["fruit seller","fruit vendor","fruit trader","sell fruit","fresh fruit"],
    variants: [
      {
        tagline: "Sells fresh fruits for homes and everyday meals.",
        about: "Sells seasonal and commonly available fruits to individual customers and small businesses.",
        services: ["Fresh fruits","Fruit baskets","Bulk fruit","Fruit orders"]
      }
    ]
  },
  {
    title: "Meat Seller",
    local: "Butcher",
    category: "Trade",
    search: ["meat seller","butcher","beef seller","meat vendor","beef"],
    variants: [
      {
        tagline: "Sells fresh meat for homes and food businesses.",
        about: "Cuts and sells fresh beef and other meat products to customers in different quantities.",
        services: ["Fresh beef","Meat cuts","Bulk meat","Meat preparation"]
      }
    ]
  },
  {
    title: "Fish Seller",
    local: "Fish Trader",
    category: "Trade",
    search: ["fish seller","fish vendor","fresh fish","fish trader","fish market"],
    variants: [
      {
        tagline: "Sells fresh fish for homes and food businesses.",
        about: "Sells fresh fish in different sizes and quantities for household cooking and food businesses.",
        services: ["Fresh fish","Cleaned fish","Bulk fish","Fish orders"]
      }
    ]
  },
  {
    title: "Frozen Foods Seller",
    local: "Frozen Food Vendor",
    category: "Trade",
    search: ["frozen foods seller","frozen food","frozen foods","frozen chicken","frozen fish"],
    variants: [
      {
        tagline: "Sells frozen chicken, fish and other food items.",
        about: "Sells frozen food products to households, restaurants and other food businesses.",
        services: ["Frozen chicken","Frozen fish","Turkey","Bulk frozen foods"]
      }
    ]
  },
  {
    title: "Egg Seller",
    local: "Egg Vendor",
    category: "Trade",
    search: ["egg seller","egg vendor","egg trader","eggs","egg business"],
    variants: [
      {
        tagline: "Sells eggs to homes, shops and food businesses.",
        about: "Supplies eggs in small and bulk quantities for household use, baking and food businesses.",
        services: ["Egg sales","Crate of eggs","Bulk orders","Egg supply"]
      }
    ]
  },
  {
    title: "Street Hawker",
    local: "Hawker",
    category: "Trade",
    search: ["street hawker","hawker","mobile seller","traffic hawker","sell on street"],
    variants: [
      {
        tagline: "Sells goods on the street and in traffic.",
        about: "Moves through streets, traffic and neighbourhoods selling goods directly to passers-by.",
        services: ["Street sales","Traffic sales","Mobile vendor","Daily goods"]
      }
    ]
  },
  {
    title: "Online Seller",
    local: "Instagram Vendor",
    category: "Trade",
    search: ["online seller","instagram vendor","whatsapp vendor","sell online","online shop"],
    variants: [
      {
        tagline: "Sells products through Instagram, WhatsApp and other apps.",
        about: "Sells products online through social media, WhatsApp and other digital channels.",
        services: ["Instagram sales","WhatsApp orders","Online shop","Product delivery"]
      }
    ]
  },

  /* ===================== TRANSPORT ===================== */

  {
    title: "Keke Rider",
    local: "Keke Driver",
    category: "Transport",
    search: ["keke rider","keke driver","tricycle rider","tricycle driver","keke"],
    variants: [
      {
        tagline: "Provides local transport using a commercial tricycle.",
        about: "Carries passengers on local routes using a commercial tricycle.",
        services: ["Local transport","Short-distance trips","Passenger rides"]
      }
    ]
  },
  {
    title: "Danfo Driver",
    local: "Bus Driver",
    category: "Transport",
    search: ["danfo driver","bus driver","danfo","commercial bus driver","bus"],
    variants: [
      {
        tagline: "Drives commercial buses on local passenger routes.",
        about: "Transports passengers on established local routes using a commercial bus.",
        services: ["Passenger transport","Local routes","Charter trips"]
      }
    ]
  },
  {
    title: "Dispatch Rider",
    local: "Delivery Rider",
    category: "Transport",
    search: ["dispatch rider","delivery rider","dispatch","delivery bike","bike delivery"],
    variants: [
      {
        tagline: "Delivers food, parcels and goods by motorcycle.",
        about: "Picks up and delivers parcels, food and other items within agreed locations.",
        services: ["Parcel delivery","Food delivery","Store deliveries","Same-day delivery"]
      }
    ]
  },
  {
    title: "Driver",
    local: "Personal Driver",
    category: "Transport",
    search: ["driver","personal driver","private driver","hire driver","driving"],
    variants: [
      {
        tagline: "Provides driving services for individuals and businesses.",
        about: "Drives customers, families or business staff using the vehicle provided or agreed for the job.",
        services: ["Personal driving","Airport trips","Event driving","Local trips"]
      }
    ]
  },
  {
    title: "Okada Rider",
    local: "Bike Rider",
    category: "Transport",
    search: ["okada rider","okada","bike rider","motorcycle rider","bike man"],
    variants: [
      {
        tagline: "Carries passengers and small goods by motorcycle.",
        about: "Transports passengers and small items by motorcycle for short and medium distances.",
        services: ["Passenger rides","Goods delivery","Short trips"]
      }
    ]
  },
  {
    title: "Truck Driver",
    local: "Lorry Driver",
    category: "Transport",
    search: ["truck driver","lorry driver","truck","lorry","haulage"],
    variants: [
      {
        tagline: "Drives trucks and lorries for goods transport.",
        about: "Transports goods and materials using trucks or lorries between agreed locations.",
        services: ["Goods transport","Long-distance haulage","Bulk goods","Interstate delivery"]
      }
    ]
  },

  /* ===================== MEDIA AND CREATIVE ===================== */

  {
    title: "Photographer",
    local: "Photo Man",
    category: "Media",
    search: ["photographer","photography","photo","event photographer","photo shoot"],
    variants: [
      {
        tagline: "Takes photographs for people, events and businesses.",
        about: "Photographs people, products and events and provides edited images for personal or business use.",
        services: ["Event photography","Portrait photography","Product photography","Photo editing"]
      }
    ]
  },
  {
    title: "Videographer",
    local: "Video Man",
    category: "Media",
    search: ["videographer","video coverage","video recording","event videographer","video"],
    variants: [
      {
        tagline: "Records and edits videos for events and projects.",
        about: "Records video footage for events, businesses and personal projects and edits the finished material.",
        services: ["Event coverage","Video recording","Video editing","Short videos"]
      }
    ]
  },
  {
    title: "Graphic Designer",
    local: "Flyer Designer",
    category: "Media",
    search: ["graphic designer","graphics designer","graphic design","flyer designer","logo designer"],
    variants: [
      {
        tagline: "Creates visual designs for businesses, events and people.",
        about: "Creates digital and print designs for businesses, events, brands and personal projects.",
        services: ["Flyer design","Logo design","Social media graphics","Church programmes"]
      }
    ]
  },
  {
    title: "Video Editor",
    local: "Reels Editor",
    category: "Media",
    search: ["video editor","video editing","edit videos","reels editor","editor"],
    variants: [
      {
        tagline: "Edits raw footage into finished videos.",
        about: "Cuts and arranges video footage, adds sound and makes other edits needed for a finished video.",
        services: ["Video editing","Reels editing","Event highlights","Social media videos"]
      }
    ]
  },
  {
    title: "Content Creator",
    local: "Content Maker",
    category: "Media",
    search: ["content creator","content creation","social media content","content","creator"],
    variants: [
      {
        tagline: "Creates photos, videos and other content for audiences.",
        about: "Creates and publishes digital content for personal pages, brands, businesses or online communities.",
        services: ["Social media content","Short videos","Product content","Content planning"]
      }
    ]
  },

  /* ===================== MUSIC AND ENTERTAINMENT ===================== */

  {
    title: "Musician",
    local: "Instrumentalist",
    category: "Music",
    search: ["musician","instrumentalist","play keyboard","play piano","play drums","play guitar","session musician","play music"],
    variants: [
      {
        tagline: "Plays music for churches, events and recordings.",
        about: "Plays an instrument or performs live for churches, weddings, concerts and studio work.",
        services: ["Church services","Event performances","Studio sessions","Rehearsals"]
      }
    ]
  },
  {
    title: "Church Keyboardist",
    local: "Church Pianist",
    category: "Music",
    search: ["church keyboardist","keyboardist","keyboard player","church pianist","pianist"],
    variants: [
      {
        tagline: "Plays keyboard for church services and programmes.",
        about: "Provides keyboard accompaniment for worship, praise, choir rehearsals and church programmes.",
        services: ["Church services","Worship accompaniment","Choir rehearsals","Church programmes"]
      }
    ]
  },
  {
    title: "Drummer",
    local: "Drum Player",
    category: "Music",
    search: ["drummer","drum player","church drummer","session drummer","drumming"],
    variants: [
      {
        tagline: "Plays drums for music, church and live events.",
        about: "Provides live drum accompaniment for church services, performances, rehearsals and other musical events.",
        services: ["Church drumming","Live performances","Studio sessions","Rehearsals"]
      }
    ]
  },
  {
    title: "DJ",
    local: "Disc Jockey",
    category: "Music",
    search: ["dj","disc jockey","deejay","dj services","party dj"],
    variants: [
      {
        tagline: "Provides music and sound for parties and events.",
        about: "Selects and plays music for events while managing the flow of music throughout the occasion.",
        services: ["Party DJ","Wedding DJ","Event DJ","Music mixing"]
      }
    ]
  },
  {
    title: "Music Producer",
    local: "Producer",
    category: "Music",
    search: ["music producer","producer","music production","beat maker","beatmaker"],
    variants: [
      {
        tagline: "Produces beats and helps artists develop recorded music.",
        about: "Creates or arranges musical productions and works with artists during recording and production.",
        services: ["Beat production","Music recording","Song arrangement","Vocal production"]
      }
    ]
  },
  {
    title: "Sound Engineer",
    local: "Sound Man",
    category: "Music",
    search: ["sound engineer","sound man","audio engineer","sound technician","sound"],
    variants: [
      {
        tagline: "Handles sound setup and audio during events.",
        about: "Sets up microphones, speakers and other audio equipment and manages sound during events and performances.",
        services: ["Event sound","Church sound","Audio setup","Sound mixing"]
      }
    ]
  },
  {
    title: "Gospel Singer",
    local: "",
    category: "Music",
    search: ["gospel singer","gospel vocalist","singer","worship singer","gospel music"],
    variants: [
      {
        tagline: "Sings gospel music for services and events.",
        about: "Performs gospel and worship songs at church services, celebrations and other suitable events.",
        services: ["Church singing","Worship sessions","Gospel events","Backing vocals"]
      }
    ]
  },
  {
    title: "Master of Ceremonies",
    local: "MC",
    category: "Events",
    search: ["mc","master of ceremonies","event mc","party mc","compere"],
    variants: [
      {
        tagline: "Hosts events and guides guests through the programme.",
        about: "Introduces speakers and activities, keeps the programme moving and interacts with guests throughout an event.",
        services: ["Event hosting","Wedding MC","Party MC","Corporate event hosting"]
      }
    ]
  },

  /* ===================== TECH AND DIGITAL ===================== */

  {
    title: "Web Developer",
    local: "Website Developer",
    category: "Tech",
    search: ["web developer","website developer","web design","website designer","website development"],
    variants: [
      {
        tagline: "Builds websites for people, businesses and organisations.",
        about: "Creates and maintains websites for individuals, businesses and organisations using web technologies.",
        services: ["Website development","Landing pages","Business websites","Website updates"]
      }
    ]
  },
  {
    title: "POS Agent",
    local: "POS Operator",
    category: "Services",
    search: ["pos agent","pos operator","pos","point of sale agent","cash withdrawal"],
    variants: [
      {
        tagline: "Provides cash and payment services through POS.",
        about: "Provides everyday payment services such as cash withdrawals, transfers and other available POS transactions.",
        services: ["Cash withdrawal","Money transfer","Bill payment","POS payments"]
      }
    ]
  },
  {
    title: "Airtime Seller",
    local: "Recharge Card Seller",
    category: "Services",
    search: ["airtime seller","airtime vendor","airtime","recharge card seller","recharge card"],
    variants: [
      {
        tagline: "Sells airtime and recharge options to customers.",
        about: "Sells mobile airtime and recharge options for customers using different networks.",
        services: ["Airtime sales","Recharge cards","Airtime transfer"]
      }
    ]
  },
  {
    title: "Data Vendor",
    local: "Data Seller",
    category: "Tech",
    search: ["data vendor","data seller","data bundle","internet data seller","data"],
    variants: [
      {
        tagline: "Sells mobile data bundles across supported networks.",
        about: "Helps customers purchase mobile data bundles and other available network services.",
        services: ["Data bundles","Network recharge","Data activation","Internet bundles"]
      }
    ]
  },
  {
    title: "CCTV Installer",
    local: "Camera Installer",
    category: "Tech",
    search: ["cctv installer","cctv installation","security camera installer","camera installer"],
    variants: [
      {
        tagline: "Installs security cameras for homes and businesses.",
        about: "Installs CCTV cameras, runs the required cables and connects recording equipment for monitoring.",
        services: ["CCTV installation","Camera setup","Cable installation","Camera replacement"]
      }
    ]
  },
  {
    title: "Solar Installer",
    local: "Solar Technician",
    category: "Tech",
    search: ["solar installer","solar technician","solar installation","solar panel installer","solar"],
    variants: [
      {
        tagline: "Installs solar panels and related power equipment.",
        about: "Installs solar panels, batteries, inverters and other parts of small solar power systems.",
        services: ["Solar panel installation","Inverter installation","Battery setup","Solar system maintenance"]
      }
    ]
  },
  {
    title: "Cable TV Installer",
    local: "DSTV Installer",
    category: "Tech",
    search: ["cable tv installer","dstv installer","gotv installer","cable installer","satellite installer"],
    variants: [
      {
        tagline: "Installs and sets up satellite and cable television.",
        about: "Installs dishes, cables and decoders and helps customers get their television service working properly.",
        services: ["Decoder installation","Satellite dish installation","Cable installation","Signal adjustment"]
      }
    ]
  },

  /* ===================== CLEANING AND HOME SERVICES ===================== */

  {
    title: "Cleaner",
    local: "Cleaning Service",
    category: "Cleaning",
    search: ["cleaner","cleaning","house cleaner","home cleaner","cleaning service"],
    variants: [
      {
        tagline: "Cleans homes, offices and other everyday spaces.",
        about: "Cleans and tidies homes, offices and other spaces according to the customer's needs.",
        services: ["Home cleaning","Office cleaning","Move-out cleaning","Deep cleaning"]
      }
    ]
  },
  {
    title: "Laundry Service Provider",
    local: "Laundry Woman",
    category: "Cleaning",
    search: ["laundry","laundry service","laundry man","washing clothes","dry cleaning"],
    variants: [
      {
        tagline: "Washes, dries and prepares clothes for customers.",
        about: "Collects or receives clothes, washes and dries them, then prepares them for pickup or delivery.",
        services: ["Clothes washing","Ironing","Stain removal","Laundry pickup"]
      }
    ]
  },
  {
    title: "Fumigator",
    local: "Pest Control Worker",
    category: "Cleaning",
    search: ["fumigator","fumigation","fumigate","pest control","pest control worker"],
    variants: [
      {
        tagline: "Treats homes and buildings for common pests.",
        about: "Applies pest control treatments to help deal with insects and other common household pests.",
        services: ["Fumigation","Cockroach treatment","Mosquito treatment","Pest control"]
      }
    ]
  },
  {
    title: "Sofa and Carpet Cleaner",
    local: "Sofa Washer",
    category: "Cleaning",
    search: ["sofa cleaning","carpet cleaning","sofa washer","rug cleaner","upholstery cleaning"],
    variants: [
      {
        tagline: "Sofas and carpets, deep-cleaned.",
        about: "Deep-cleans sofas, carpets and upholstery at the customer's home. Removes stains and odours.",
        services: ["Sofa cleaning","Carpet cleaning","Stain removal","Odour treatment"]
      }
    ]
  },
  {
    title: "Car Washer",
    local: "Car Wash Operator",
    category: "Services",
    search: ["car washer","car wash","car washing","car wash operator","wash car"],
    variants: [
      {
        tagline: "Cleans cars and other vehicles for customers.",
        about: "Washes and cleans vehicles using suitable cleaning products and equipment.",
        services: ["Car washing","Interior cleaning","Vehicle detailing","Tyre cleaning"]
      }
    ]
  },
  {
    title: "Gardener",
    local: "Compound Gardener",
    category: "Services",
    search: ["gardener","garden worker","compound gardener","garden","gardening"],
    variants: [
      {
        tagline: "Maintains gardens and outdoor plants.",
        about: "Trims, waters and cares for gardens, compounds and outdoor plants at homes and businesses.",
        services: ["Garden maintenance","Lawn care","Plant care","Compound tidying"]
      }
    ]
  },

  /* ===================== EVENTS ===================== */

  {
    title: "Event Planner",
    local: "Event Organiser",
    category: "Events",
    search: ["event planner","event planning","party planner","event organiser","event organizer"],
    variants: [
      {
        tagline: "Plans and coordinates parties and other events.",
        about: "Helps customers plan events, organise suppliers and keep the different parts of the programme on track.",
        services: ["Event planning","Party planning","Supplier coordination","Event coordination"]
      }
    ]
  },
  {
    title: "Event Decorator",
    local: "Party Decorator",
    category: "Events",
    search: ["event decorator","event decoration","party decorator","venue decoration","event decor"],
    variants: [
      {
        tagline: "Decorates venues for parties and special events.",
        about: "Decorates event spaces using backdrops, fabrics, flowers, lights and other agreed decoration items.",
        services: ["Venue decoration","Birthday decoration","Wedding decoration","Backdrop setup"]
      }
    ]
  },
  {
    title: "Wedding Planner",
    local: "",
    category: "Events",
    search: ["wedding planner","wedding planning","wedding organiser","wedding organizer","wedding"],
    variants: [
      {
        tagline: "Helps couples plan and coordinate their wedding.",
        about: "Assists with wedding planning, supplier coordination, schedules and arrangements before and during the event.",
        services: ["Wedding planning","Vendor coordination","Wedding schedule","Day-of coordination"]
      }
    ]
  },
  {
    title: "Balloon Decorator",
    local: "Balloon Artist",
    category: "Events",
    search: ["balloon decorator","balloon artist","balloon decoration","balloon setup","balloon"],
    variants: [
      {
        tagline: "Creates balloon arrangements for parties and events.",
        about: "Sets up balloon arches, columns and other balloon decorations for parties and small events.",
        services: ["Balloon arches","Balloon columns","Party setups","Event balloons"]
      }
    ]
  },
  {
    title: "Event Usher",
    local: "Usher",
    category: "Events",
    search: ["event usher","usher","ushering","ushering job","event staff"],
    variants: [
      {
        tagline: "Welcomes and assists guests at events.",
        about: "Welcomes guests, guides seating and assists with the smooth running of events.",
        services: ["Guest welcoming","Seating assistance","Event support","Guest direction"]
      }
    ]
  },

  /* ===================== PROPERTY ===================== */

  {
    title: "Property Agent",
    local: "House Agent",
    category: "Property",
    search: ["real estate agent","property agent","house agent","estate agent","property"],
    variants: [
      {
        tagline: "Helps people find and transact property.",
        about: "Helps clients find suitable properties for rent or purchase and assists with property transactions.",
        services: ["Property search","House rentals","Property sales","Property viewing"]
      }
    ]
  },
  {
    title: "Land Agent",
    local: "Land Seller",
    category: "Property",
    search: ["land agent","land seller","land sales","property land","land agent nigeria"],
    variants: [
      {
        tagline: "Helps clients find and buy land.",
        about: "Connects buyers with available land and assists with viewings and the early stages of a land transaction.",
        services: ["Land search","Land sales","Property viewing","Land sourcing"]
      }
    ]
  },
  {
    title: "Caretaker",
    local: "Property Caretaker",
    category: "Property",
    search: ["caretaker","property caretaker","compound caretaker","house caretaker","caretaker job"],
    variants: [
      {
        tagline: "Looks after a property and handles everyday issues.",
        about: "Watches over a property and handles common maintenance and tenant matters.",
        services: ["Property care","Minor repairs","Tenant support","Compound upkeep"]
      }
    ]
  },

  /* ===================== EDUCATION ===================== */

  {
    title: "Home Tutor",
    local: "Private Tutor",
    category: "Education",
    search: ["home tutor","private tutor","tutor","home lessons","private lessons"],
    variants: [
      {
        tagline: "Provides one-on-one lessons for children and students.",
        about: "Teaches students at home or another agreed location and adjusts lessons to their learning needs.",
        services: ["Home lessons","One-on-one tutoring","Homework support","Exam preparation"]
      }
    ]
  },
  {
    title: "Lesson Teacher",
    local: "Lesson Tutor",
    category: "Education",
    search: ["lesson teacher","lesson tutor","after school lessons","private lesson","lesson"],
    variants: [
      {
        tagline: "Teaches students after school or during free hours.",
        about: "Provides extra lessons to help students understand school subjects and prepare for tests and examinations.",
        services: ["After-school lessons","Subject tutoring","Homework help","Exam preparation"]
      }
    ]
  },
  {
    title: "Music Teacher",
    local: "Music Tutor",
    category: "Education",
    search: ["music teacher","music tutor","music lessons","piano teacher","music teacher nigeria"],
    variants: [
      {
        tagline: "Teaches music and practical skills to learners.",
        about: "Teaches music theory or practical skills such as piano, keyboard, singing or another chosen instrument.",
        services: ["Music lessons","Piano lessons","Keyboard lessons","Music theory"]
      }
    ]
  },
  {
    title: "Dance Instructor",
    local: "Dance Teacher",
    category: "Education",
    search: ["dance instructor","dance teacher","dance lessons","dance trainer","dancing"],
    variants: [
      {
        tagline: "Teaches dance steps and routines to learners.",
        about: "Teaches dance movements and routines to individuals or groups for practice, fitness or performances.",
        services: ["Dance lessons","Choreography","Group training","Performance practice"]
      }
    ]
  },

  /* ===================== AGRICULTURE ===================== */

  {
    title: "Poultry Farmer",
    local: "Poultry Keeper",
    category: "Agriculture",
    search: ["poultry farmer","poultry","poultry keeper","chicken farmer","poultry farming"],
    variants: [
      {
        tagline: "Raises chickens for eggs, meat or breeding.",
        about: "Keeps and raises poultry birds and may sell eggs, live birds or dressed birds depending on the farm.",
        services: ["Egg production","Broiler birds","Live chicken sales","Poultry supply"]
      }
    ]
  },
  {
    title: "Fish Farmer",
    local: "Catfish Farmer",
    category: "Agriculture",
    search: ["fish farmer","fish farming","catfish farmer","fish pond","fish farmer nigeria"],
    variants: [
      {
        tagline: "Raises fish for sale and food production.",
        about: "Raises fish in ponds or tanks and sells them live or prepared according to customer needs.",
        services: ["Catfish farming","Fish sales","Fingerling supply","Live fish supply"]
      }
    ]
  },
  {
    title: "Snail Farmer",
    local: "Snail Keeper",
    category: "Agriculture",
    search: ["snail farmer","snail farming","snail keeper","snail business","snails"],
    variants: [
      {
        tagline: "Raises snails for food and local sales.",
        about: "Keeps and breeds snails and sells mature snails or young stock to customers and other farmers.",
        services: ["Snail sales","Snail breeding","Live snails","Snail stock"]
      }
    ]
  },
  {
    title: "Goat Farmer",
    local: "Goat Rearer",
    category: "Agriculture",
    search: ["goat farmer","goat rearer","goat farming","goat seller","goats"],
    variants: [
      {
        tagline: "Raises goats for sale, breeding and meat.",
        about: "Keeps goats for breeding and sale and supplies live animals to customers when ready.",
        services: ["Goat sales","Breeding goats","Live goats","Bulk goat supply"]
      }
    ]
  },
  {
    title: "Pig Farmer",
    local: "",
    category: "Agriculture",
    search: ["pig farmer","pig farming","pig farmer nigeria","piggery","pigs"],
    variants: [
      {
        tagline: "Raises pigs for breeding and meat production.",
        about: "Keeps and raises pigs and sells mature animals or young stock depending on the farm.",
        services: ["Live pig sales","Pig breeding","Piglets","Farm supply"]
      }
    ]
  },
  {
    title: "Beekeeper",
    local: "Honey Farmer",
    category: "Agriculture",
    search: ["beekeeper","beekeeping","honey farmer","honey producer","bee farmer"],
    variants: [
      {
        tagline: "Keeps bees and produces honey for sale.",
        about: "Maintains bee colonies and collects honey and other products from managed hives.",
        services: ["Honey production","Raw honey","Beehive management","Honey supply"]
      }
    ]
  },
  {
    title: "Palm Oil Processor",
    local: "Palm Oil Producer",
    category: "Agriculture",
    search: ["palm oil processor","palm oil processing","palm oil","palm oil producer","red oil"],
    variants: [
      {
        tagline: "Processes palm fruit into palm oil for sale.",
        about: "Processes harvested palm fruit and extracts palm oil for household, food and local commercial use.",
        services: ["Palm oil processing","Red palm oil","Palm kernel processing","Bulk oil supply"]
      }
    ]
  },
  {
    title: "Cassava Processor",
    local: "Garri Processor",
    category: "Agriculture",
    search: ["cassava processor","cassava processing","cassava","cassava flour","garri processing"],
    variants: [
      {
        tagline: "Processes cassava into food products for sale.",
        about: "Processes cassava into products such as garri, flour or other locally made food products.",
        services: ["Cassava processing","Garri processing","Cassava flour","Bulk supply"]
      }
    ]
  },
  {
    title: "Garri Fryer",
    local: "Garri Maker",
    category: "Agriculture",
    search: ["garri fryer","garri frying","garri","garri maker","cassava garri"],
    variants: [
      {
        tagline: "Processes and fries cassava into garri.",
        about: "Processes cassava and fries it into garri for household consumption and local sales.",
        services: ["Garri production","White garri","Yellow garri","Bulk garri"]
      }
    ]
  },
  {
    title: "Farm Produce Seller",
    local: "Produce Trader",
    category: "Agriculture",
    search: ["produce seller","farm produce seller","farm produce","produce trader","agricultural produce"],
    variants: [
      {
        tagline: "Sells farm produce to homes and food businesses.",
        about: "Buys and sells agricultural produce such as grains, fruits, vegetables and other farm goods.",
        services: ["Farm produce","Bulk produce","Market supply","Produce delivery"]
      }
    ]
  },

  /* ===================== HEALTH AND TRADITIONAL ===================== */

  {
    title: "Herbal Medicine Seller",
    local: "Herb Seller",
    category: "Health",
    search: ["herbal medicine","herb seller","traditional medicine","herbalist","herbs"],
    variants: [
      {
        tagline: "Sells herbs and traditional medicines.",
        about: "Sells herbs, roots and traditional plant preparations for common health needs.",
        services: ["Herbal remedies","Herbal mixtures","Traditional medicine","Herbal drinks"]
      }
    ]
  },
  {
    title: "Traditional Massage Worker",
    local: "Local Masseuse",
    category: "Health",
    search: ["traditional massage","local massage","masseuse","traditional masseur","massage"],
    variants: [
      {
        tagline: "Provides traditional massage for body care.",
        about: "Provides traditional massage sessions for relaxation and common body discomfort.",
        services: ["Traditional massage","Body massage","Postnatal massage","Relaxation massage"]
      }
    ]
  }
];