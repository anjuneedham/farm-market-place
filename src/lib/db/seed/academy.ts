import type { AcademyCourse, AcademyTrack, Lesson } from '@/lib/types';
import { slugify } from './helpers';

/**
 * Academy content.
 *
 * The core library is free forever (docs/PREMIUM_STRATEGY.md §1). Lessons carry
 * general, widely-accepted practice and repeatedly point farmers at RADA and
 * their local extension officer for parish-specific recommendations — AgriLoop
 * does not invent agronomic data, spray schedules or yield figures.
 */

const TRACKS: Array<[name: string, icon: string, description: string]> = [
  ['Getting Started', 'sprout', 'Starting a farm, choosing crops, preparing land and planning your first season.'],
  ['Crop Production', 'leaf', 'Growing the crops Jamaican farmers actually sell, crop by crop.'],
  ['Livestock', 'beef', 'Poultry, goats, pigs, cattle and fish.'],
  ['Farm Business', 'line-chart', 'Pricing, marketing, records, profitability and finding customers.'],
  ['Technology', 'cpu', 'Irrigation, farm management tools, digital marketing and what AI can and cannot do for a farm.'],
];

type LessonSeed = {
  title: string;
  minutes: number;
  access?: 'FREE' | 'PREMIUM';
  kind?: Lesson['kind'];
  body: string;
};

type CourseSeed = {
  track: string;
  title: string;
  summary: string;
  level: string;
  access?: 'FREE' | 'PREMIUM';
  /** Marketplace category slug this course most directly teaches — powers "Related on AgriLoop". */
  relatedCategory?: string;
  lessons: LessonSeed[];
};

const COURSES: CourseSeed[] = [
  {
    track: 'getting-started',
    title: 'Starting a Farm in Jamaica',
    summary:
      'What to settle before you plant: land, water, what you will grow and who is going to buy it.',
    level: 'Beginner',
    lessons: [
      {
        title: 'Before you plant anything, find your buyer',
        minutes: 7,
        body: `Most first-time farms fail on the selling side, not the growing side. People plant what they know how to grow, reap a good crop, and then discover that everyone in the district reaped the same thing in the same week.\n\nWork the other way round.\n\n## Start with demand\n\nBefore you choose a crop, spend a week finding out what buyers near you are short of. Talk to:\n\n- Shops and supermarkets in your parish\n- Restaurants and hotels within delivery distance\n- Market vendors, who know exactly what is scarce\n- Wholesalers buying in your area\n\nOn AgriLoop, read the open **Buyer Requests** for your parish. Those are buyers publishing what they cannot currently source.\n\n## Then check you can actually grow it\n\nOnce you know what is wanted, ask whether your land, rainfall and skill can produce it reliably. A crop you can grow at 70% quality every month beats one you can grow at 100% quality once a year.\n\n## Write down the arrangement\n\n"I'll take some when you have it" is not a buyer. A quantity, a frequency and a price — even informally agreed — is.\n\n> Your parish RADA extension officer can tell you what grows well on your specific soil and rainfall. That advice is free and it is specific to you in a way no article can be.`,
      },
      {
        title: 'Assessing your land and water',
        minutes: 8,
        body: `Two things decide more about your farm than anything you buy: what your soil is, and whether you can get water to it in a dry spell.\n\n## Soil\n\nWalk the land after rain and after a dry week. Dig a few holes across it — not one. Look for:\n\n- **Depth.** How far down before you hit rock or hardpan?\n- **Drainage.** Does water sit in any part of the field after rain?\n- **Variation.** Most plots are not uniform. The corner that stays wet will behave differently all season.\n\nA soil test through RADA or a private lab tells you pH and nutrient status. It costs little and it stops you spending on fertiliser the soil does not need.\n\n## Water\n\nAsk the hard question early: in a three-week dry spell, where does water come from?\n\nOptions, roughly in order of reliability: piped supply, a well or borehole, a spring or river with permission, stored rainwater, trucked water. Trucked water is the most expensive way to farm and it will eat your margin.\n\nIf your only answer is rain, plan your crop and your planting dates around that honestly rather than hoping.\n\n## Slope and access\n\nSteep land costs more to work and erodes. And if a truck cannot reach your field in wet weather, your buyer's delivery does not happen — that is a farm problem even though it sounds like a road problem.`,
      },
      {
        title: 'Planning your first season',
        minutes: 6,
        body: `A first season should be small, finished and counted. Small enough that you can complete every operation on time, and counted so you learn something you can use.\n\n## Start smaller than you want to\n\nThe most common first-season mistake is planting more than you can weed, water and reap. An acre you manage well will out-earn three acres you manage badly, and it will teach you more.\n\n## Work backwards from the sale\n\nPick your target sale date and work back: harvest window, growing period, planting date, land preparation. Now you have a calendar with real deadlines.\n\n## Budget the whole season before you start\n\nList every cost to the point of sale — planting material, land prep, fertiliser, labour, water, transport. Add 20%. That is the cash you need available, and running out mid-season is what forces farmers to sell early and cheap.\n\n## Write down what happens\n\nDates, quantities, costs, what you sold and for how much. One notebook is enough. Without it, your second season starts from the same guesswork as your first.`,
      },
    ],
  },
  {
    track: 'getting-started',
    title: 'Choosing the Right Crop',
    summary: 'Matching crop to land, season, skill and — most importantly — to a buyer.',
    level: 'Beginner',
    lessons: [
      {
        title: 'The four filters for choosing a crop',
        minutes: 6,
        body: `Run any crop you are considering through four filters, in this order.\n\n**1. Is there a buyer?** Not "could there be" — is there one now, reachable from your farm, who wants this?\n\n**2. Will it grow well here?** Your rainfall, altitude, soil and season. Your extension officer will tell you straight.\n\n**3. Can you manage it?** Some crops forgive a missed week. Others do not. Be honest about the time you actually have.\n\n**4. Does the money work?** Estimated yield × realistic price, minus every cost including your own labour and transport. If that number is thin before anything goes wrong, it will be negative when something does.\n\nA crop has to pass all four. Most farmers stop at filter 2.`,
      },
      {
        title: 'Short-cycle and long-cycle crops',
        minutes: 5,
        body: `Short-cycle crops (lettuce, callaloo, pak choi, cucumber) turn over in weeks. They return cash quickly, let you correct mistakes sooner, and suit farmers who need money moving. They also need constant attention and market access, because they will not wait.\n\nLong-cycle crops (yam, dasheen, plantain, tree crops) tie up land for months but need less intensive weekly management and often store better, which gives you some control over when you sell.\n\nMost established farms run a mix: something long in the ground for the bigger payment, something short for the weekly cash flow that keeps the farm running while you wait.\n\nIf you are starting out and cash is tight, weight towards short-cycle. If you have off-farm income and limited weekday time, long-cycle fits better.`,
      },
      {
        title: 'Planting to a market window, not to the calendar',
        minutes: 5,
        body: `Prices move on supply. When everyone in your district plants the same crop at the same time, everyone reaps in the same week and the price falls for all of them.\n\nTwo ways to avoid the crush:\n\n**Stagger your own planting.** Rather than planting your whole field at once, plant in blocks a fortnight apart. You reap over a longer window, you are not forced to sell everything in three days, and your buyer gets a steadier supply — which is what they actually want.\n\n**Aim for the gaps.** Learn when your crop is scarce locally and plan backwards from there. Protected cultivation exists largely to hit these windows, which is why greenhouse growers can hold a hotel account through the wet season.\n\nBoth require records. After two seasons of writing down what you sold and what you got, the pattern becomes obvious.`,
      },
    ],
  },
  {
    track: 'crop-production',
    title: 'Tomato Production',
    summary: 'Field and greenhouse tomato: establishment, support, water, and the problems that cost most.',
    level: 'Intermediate',
    relatedCategory: 'vegetables',
    lessons: [
      {
        title: 'Establishing a tomato crop',
        minutes: 8,
        body: `Tomato rewards preparation more than almost any other vegetable. Most of what goes wrong in week six was decided in week zero.\n\n## Seedlings\n\nRaise or buy strong, stocky seedlings. Leggy, pale seedlings never fully catch up. If whitefly pressure is high in your area, raising seedlings under fine mesh keeps them clean until transplant — this is one of the highest-value habits in tomato growing.\n\n## Land\n\nTomato needs good drainage. Standing water after rain is a serious warning sign; consider raised beds.\n\nDo not plant tomato where tomato, pepper or Irish potato grew last season. They share soil-borne diseases, and rotation is free.\n\n## Spacing\n\nGive more space than feels efficient. Crowded plants stay wet longer, and the diseases that ruin tomato crops are almost all worse in still, humid air.\n\n## Support\n\nDecide your staking or trellis system before transplanting and put it in early. Trying to lift a sprawling crop off the ground later damages plants and takes twice the labour.\n\n> Fertiliser and spray recommendations vary by soil and by what is present in your area. Get those from RADA or a qualified agronomist rather than from a general article.`,
      },
      {
        title: 'Water and feeding through the season',
        minutes: 7,
        body: `Tomato is sensitive to *inconsistent* water more than to the total amount.\n\n## Consistency\n\nSwings between dry and saturated cause fruit splitting and contribute to blossom end rot — the dark, sunken patch at the bottom of the fruit. Blossom end rot is a calcium delivery problem, and irregular water is usually the reason the calcium is not getting there, even when the soil has enough.\n\nDrip irrigation solves this better than anything else available to a small farm. It delivers steadily, uses far less water than hose or overhead, and — critically for tomato — keeps the leaves dry.\n\n## Keep water off the leaves\n\nOverhead watering spreads leaf disease. If you can only make one change to a tomato crop, make it this one.\n\n## Feeding\n\nTomato demand changes through the season: more nitrogen early for growth, more potassium as fruit sets and fills. Over-feeding nitrogen once fruit has set gives you a big green plant and a poor crop.\n\nBase quantities on a soil test, not on what worked for a neighbour on different soil.`,
      },
      {
        title: 'The problems that cost the most',
        minutes: 7,
        body: `Four problems account for most tomato losses on Jamaican farms.\n\n**Whitefly and the viruses they carry.** The insect itself is manageable; the viruses it transmits are not curable. Once a plant shows leaf curl and stunting, it will not recover. Remove and destroy affected plants, control whitefly early, keep the area free of volunteer tomato and weed hosts, and start with clean seedlings.\n\n**Leaf spot and blight.** Fungal, worse in wet, still conditions. Spacing, airflow and dry leaves prevent far more than any spray cures.\n\n**Fruit worm.** Scout regularly — walking the field looking rather than working is a real task. Catching it early is the difference between a treatable problem and a lost block.\n\n**Blossom end rot.** Covered in the previous lesson: usually water consistency, not a disease.\n\n## The habit that matters most\n\nWalk the field daily and look at plants rather than work on them. Every experienced grower says the same thing, and it costs nothing.\n\n> For product recommendations and application rates, consult RADA or a qualified agronomist. Rates differ by product and by what is registered for use.`,
      },
    ],
  },
  {
    track: 'crop-production',
    title: 'Scotch Bonnet & Sweet Pepper',
    summary: 'Pepper from nursery to harvest, and why pepper suits farmers with buyers lined up.',
    level: 'Intermediate',
    relatedCategory: 'vegetables',
    lessons: [
      {
        title: 'Why pepper suits a small farm',
        minutes: 5,
        body: `Scotch bonnet has three qualities that suit a small Jamaican farm.\n\n**It keeps producing.** A well-managed pepper plant yields over months rather than in one flush, which spreads your income and your labour.\n\n**There is processing demand.** Sauce and seasoning makers buy consistently and in volume, which means a standing arrangement rather than chasing a spot sale. Several are posting Buyer Requests on AgriLoop right now.\n\n**It travels.** Pepper handles transport better than a leafy crop, which widens the set of buyers you can reach.\n\nThe catch: pepper is slow to establish and needs steady attention. It is not a crop to plant and leave.`,
      },
      {
        title: 'Nursery and transplanting',
        minutes: 6,
        body: `Pepper germinates slowly and unevenly, and suffers more from transplant shock than tomato does.\n\n**Raise seedlings in trays** rather than in open beds. The intact root ball at transplant matters, and pepper resents root disturbance.\n\n**Be patient.** Transplant when plants are sturdy with several true leaves. Going out too small means slow establishment and a long recovery.\n\n**Transplant late in the day** so the plant has cool night hours to settle before facing full sun.\n\n**Water in immediately** and keep the soil consistently moist — not saturated — through establishment.\n\nExpect a slow first few weeks. Pepper spends that time on roots. It looks like nothing is happening and then growth accelerates.`,
      },
      {
        title: 'Harvesting and grading for buyers',
        minutes: 5,
        body: `How you pick and pack decides whether a buyer comes back.\n\n**Pick regularly.** Leaving mature fruit on the plant slows further production. A consistent picking round keeps yield up over the season.\n\n**Cut, do not pull.** Pulling damages the branch and costs you future fruit.\n\n**Grade honestly.** Buyers — especially sauce makers and supermarkets — need consistency. Mixing sizes and conditions to make weight is the fastest way to lose an account, and the account is worth far more than the extra pounds.\n\n**Handle carefully.** Pepper bruises. Bruised fruit does not keep, and the buyer sees it a day after you do.\n\n**Pack and label clearly** — weight, date, your farm name. It costs nothing and it makes a small farm look like a reliable supplier, because it is what a reliable supplier does.`,
      },
    ],
  },
  {
    track: 'crop-production',
    title: 'Yam, Sweet Potato & Ground Provisions',
    summary: 'The crops that carry Jamaican agriculture: planting material, hills, and selling in bulk.',
    level: 'Intermediate',
    relatedCategory: 'root-crops',
    lessons: [
      {
        title: 'Planting material decides your crop',
        minutes: 6,
        body: `With ground provisions, the quality of what you put in the ground sets a ceiling on what you take out.\n\n**Yam.** Select setts from healthy, clean tubers. Using material from a diseased crop carries the problem straight into the new field, and it will not be visible until it is too late to change.\n\n**Sweet potato.** Take vine cuttings from vigorous, disease-free plants. Cuttings from tired or infested vines establish poorly.\n\n**Dasheen and cassava.** Use clean suckers and mature stem cuttings from healthy plants.\n\nBuying planting material is worth it when your own is questionable. It is one of the few farm inputs where paying more reliably returns more.\n\n> Certified or clean planting material may be available through RADA programmes. Ask your extension officer what is currently available for your parish.`,
      },
      {
        title: 'Hills, sticks and labour',
        minutes: 6,
        body: `Ground provisions are labour-heavy at two points: establishment and harvest. Plan both before you plant.\n\n**Hills and mounds** give tubers room to form and improve drainage. Skimping here costs you at digging.\n\n**Sticking yam** is a significant cost that surprises new growers. Count it in your budget before you plant — sticks, transport and the labour to set them. Farmers who leave it out of the budget find the money is gone before the crop is in the ground.\n\n**Weeding** matters most early, while the crop is establishing. Once the canopy closes, pressure falls.\n\n**Digging labour** must be arranged in advance. A crop ready to dig with no crew available loses quality in the ground and value at the sale.`,
      },
      {
        title: 'Selling ground provisions in bulk',
        minutes: 5,
        body: `Ground provisions usually move in volume, to wholesalers, market vendors, institutional kitchens and exporters. That changes how you sell.\n\n**Know your cost per pound.** With bulk sales, a small difference per pound is a large difference per load. You cannot negotiate what you have not calculated.\n\n**Dig to order where you can.** Ground provisions keep reasonably well in the ground, which gives you some control over timing — a real advantage over a leafy crop that must move now.\n\n**Grade and bag consistently.** Bulk buyers are buying predictability.\n\n**Get the transport sorted early.** Haulage is a large share of the delivered cost and the part most often underestimated. On AgriLoop you can find transport providers by parish under Services.\n\n**Talk to more than one buyer.** A single wholesaler who knows you have no alternative sets the price.`,
      },
    ],
  },
  {
    track: 'livestock',
    title: 'Poultry: Broilers and Layers',
    summary: 'Housing, feed, the first two weeks, and the biosecurity that protects everything else.',
    level: 'Beginner',
    relatedCategory: 'chicken',
    lessons: [
      {
        title: 'Broilers or layers — choosing your operation',
        minutes: 5,
        body: `They are different businesses with different cash flows.\n\n**Broilers** are short cycles with a payment at the end of each batch. Capital turns over quickly, mistakes are contained to one batch, and you can scale up or pause between batches. Margins are tight and feed price movements hit you directly.\n\n**Layers** take months of investment before the first egg, then produce daily income for a long period. The daily cash is steadier, but the upfront commitment is larger and you cannot pause.\n\nMany small farms start with broilers to learn the management and build cash, then add layers once they can carry the establishment period.\n\nEither way, work out your feed cost per bird or per dozen before you start. Feed is the dominant cost in both, and an operation that is thin on paper will lose money in practice.`,
      },
      {
        title: 'The first two weeks decide the batch',
        minutes: 6,
        body: `Most of what determines a broiler batch's outcome happens in the first fourteen days.\n\n**Have the house ready before the chicks arrive.** Cleaned, disinfected, rested, bedding down, warmed. Chicks arriving into a cold house never fully recover.\n\n**Watch temperature by behaviour, not only by thermometer.** Chicks huddled together are cold. Chicks pressed to the walls away from the heat are too hot. Chicks spread evenly, moving and feeding, are comfortable. That is the reading that matters.\n\n**Water first.** Chicks must find water quickly. Check that every bird has located it within the first hours.\n\n**Ventilate even when it is cold.** Ammonia build-up damages birds early and permanently. Airflow without draught is the balance.\n\n**Count daily.** Rising mortality is information — the earlier you see the trend, the more of the batch you save.`,
      },
      {
        title: 'Biosecurity',
        minutes: 6,
        body: `Biosecurity is the cheapest insurance in livestock farming, and it is mostly habit rather than equipment.\n\n**Control who enters.** Visitors, especially anyone who keeps or handles poultry elsewhere, are the main route for disease onto a farm.\n\n**Dedicated footwear and clothing for the house.** Boots that go into town do not go into the house.\n\n**Clean and rest between batches.** Wash, disinfect, then leave empty. The rest period is doing real work even though nothing appears to be happening.\n\n**Keep feed secured.** Rodents and wild birds contaminate feed and carry disease.\n\n**Isolate new or returning birds** before mixing them with your flock.\n\n**Deal with mortality promptly and properly.** Dead birds left around are a disease source.\n\n> Vaccination programmes depend on what is circulating in your area. Get a programme from a veterinarian for your specific operation — a general schedule from an article is not a substitute.`,
      },
    ],
  },
  {
    track: 'livestock',
    title: 'Goats and Sheep',
    summary: 'Small ruminants on Jamaican pasture: stocking, parasites, breeding and selling.',
    level: 'Beginner',
    relatedCategory: 'goat',
    lessons: [
      {
        title: 'Pasture and stocking rate',
        minutes: 6,
        body: `Small ruminants are one of the most accessible livestock enterprises for a Jamaican farm: modest startup cost, they use land that will not grow vegetables, and there is steady local demand.\n\nThe most common mistake is overstocking. Too many animals on too little pasture produces thin animals, bare ground, erosion and — most expensively — a heavy internal parasite burden, because animals grazing close to the soil pick up far more worm larvae.\n\n**Rotate.** Divide your grazing and move animals between sections. Resting a paddock lets the forage recover and breaks the parasite cycle. This single practice does more for small ruminant health than most treatments.\n\n**Provide shade and clean water.** Both affect condition more than farmers expect in Jamaican heat.\n\n**Fence honestly.** Goats will find every weakness. Fencing you were not quite sure about is fencing that will fail.`,
      },
      {
        title: 'Parasites: the main cost of keeping goats',
        minutes: 6,
        body: `Internal parasites, especially barber's pole worm, are the largest health cost in Caribbean small ruminant production. Warm, wet conditions favour them year round.\n\n**Management first.** Rotational grazing, not overstocking, and keeping animals off very short grass reduce exposure far more than any treatment.\n\n**Treat individuals, not the whole flock by default.** Blanket routine dosing is how resistance develops — and once your worms are resistant to a product, it stops working permanently. Learn to assess which animals actually need treatment, using the tools your vet recommends, such as FAMACHA scoring.\n\n**Watch condition.** Pale gums, poor coat, weight loss and bottle jaw are signs to act on.\n\n> Deworming products, rotation of actives and dosing are decisions for a veterinarian who knows your area and your flock. Resistance is a real and growing problem, and getting this wrong is expensive to undo.`,
      },
      {
        title: 'Breeding and selling',
        minutes: 5,
        body: `**Select for what your buyers pay for.** Growth rate, mothering ability and hardiness in your conditions. Keep records on which does raise good kids — memory flatters favourites.\n\n**Do not breed too young.** Breeding a doe before she is grown costs you the doe's own development and usually a poor first kid.\n\n**Manage the buck.** An uncontrolled buck means kids arriving whenever, which makes planning impossible and puts kids on the ground in the worst season.\n\n**Time sales to demand.** Local demand peaks around certain seasons and events. Holding animals to hit a peak works when pasture is carrying them; it stops working the moment you are buying feed to hold them.\n\n**Know your break-even weight.** The point where the cost of holding an animal longer exceeds what the extra weight earns. Without that number you are guessing, and the guess usually favours holding too long.`,
      },
    ],
  },
  {
    track: 'farm-business',
    title: 'Pricing Your Produce',
    summary: 'Working out what it costs you to produce, and holding a price you can defend.',
    level: 'Beginner',
    lessons: [
      {
        title: 'Know your cost per pound',
        minutes: 7,
        body: `If you do not know what a pound of your crop costs you to produce, you are not pricing. You are guessing, and you will find out you guessed wrong only after the money is gone.\n\n## Count everything for one crop, one season\n\n- Planting material\n- Land preparation\n- Fertiliser and crop protection\n- Water and irrigation running costs\n- Labour — **including your own**\n- Sticks, twine, bags, crates\n- Transport to the buyer\n- A share of tools and equipment wear\n\n## Divide by what you actually reaped\n\nNot what you hoped to reap. What came off the field and was sellable.\n\nThat is your cost per pound. Most farmers doing this honestly for the first time find it is 30–50% higher than they assumed — almost always because they never counted their own labour or the transport.\n\n## Then price above it\n\nYour price must cover cost plus a margin that pays you for the risk you carried all season. Anything below your cost per pound is a loss you are funding personally, no matter how busy the sale makes you feel.`,
      },
      {
        title: 'Pricing modes: fixed, negotiable, wholesale',
        minutes: 5,
        body: `Different buyers need different pricing, and AgriLoop supports each directly on a listing.\n\n**Fixed** — a clear price per unit. Best for retail and small buyers. It removes friction and saves you conversations.\n\n**Negotiable** — you expect to discuss. Appropriate for livestock, services and anything where condition, distance or quantity genuinely changes the number.\n\n**Contact for price** — the honest choice when price genuinely depends on what the buyer needs. Do not use it to hide a price you are unsure about; buyers skip listings with no indication at all.\n\n**Wholesale and bulk tiers** — a lower unit price at higher quantity. This is the most useful mode for a farm with volume, because it does the negotiating for you: the buyer sees immediately that 500 lbs earns a better rate and asks for the bigger order.\n\nSet your tiers so that every tier still clears your cost per pound with a margin. A bulk price below cost is a bigger loss, not a bigger sale.`,
      },
      {
        title: 'Holding your price',
        minutes: 5,
        body: `Farmers drop prices for three reasons: the crop is ready and they are afraid it will spoil, they need cash this week, or they assume the buyer will go elsewhere.\n\nAll three are reduced by planning rather than by negotiating.\n\n**Stagger planting** so everything is not ready at once and you are not forced to clear the field in three days.\n\n**Line up more than one buyer.** A buyer who knows you have no alternative sets your price for you.\n\n**Agree terms before delivery.** Price, quantity and payment terms settled in advance, in writing where possible. Renegotiating at the gate with a loaded truck never goes your way.\n\n**Be willing to say no.** The farmer who holds a defensible price and explains it is respected more often than undercut. Buyers deal with unreliable, fluctuating supply constantly — a farm with a firm, consistent price is easier for them to plan around, and they know it.`,
      },
    ],
  },
  {
    track: 'farm-business',
    title: 'Selling to Restaurants, Hotels and Supermarkets',
    summary: 'What institutional buyers need, how to approach them, and how to keep the account.',
    level: 'Intermediate',
    lessons: [
      {
        title: 'What institutional buyers actually want',
        minutes: 6,
        body: `Restaurants, hotels, supermarkets and caterers are not buying produce. They are buying *predictability*. Understanding that changes how you approach them.\n\nRanked by how much it matters to them:\n\n**1. Consistency.** Can you supply the same thing, at the same quality, on the same day, every week? A chef builds a menu around supply. A buyer builds a shelf around it.\n\n**2. Quality and grading.** Same size in the same box. Mixed grades create work for them and they will not do it twice.\n\n**3. Communication.** Answer the phone. If you cannot fill an order, say so immediately — any notice at all is workable, silence is not.\n\n**4. Price.** Fourth. Not first. Being cheapest rarely wins the account and never keeps it.\n\nIf you can genuinely deliver the first three, you can charge a fair price and hold the business.`,
      },
      {
        title: 'Making the approach',
        minutes: 6,
        body: `**Find the right person.** The chef, the purchasing manager, the produce manager — not whoever answers the phone.\n\n**Go at the right time.** Never during service. Mid-morning or mid-afternoon.\n\n**Bring a sample.** Real produce, graded the way you would deliver it. This is the whole pitch.\n\n**Lead with what you can commit to**, not with everything you grow: "I can deliver 40 lbs of lettuce every Tuesday and Friday, graded like this, from now through March."\n\n**Be honest about your limits.** Promising 200 lbs when you can manage 80 ends the relationship in week three, and word travels.\n\n**Leave contact details and a price list.** Include your AgriLoop farm page — a buyer who can see your other products, your parish and your reviews can come back to you on their own time.\n\n**Follow up once**, a week later. Once. Then leave it.`,
      },
      {
        title: 'Keeping the account',
        minutes: 5,
        body: `Winning the account is the easy half.\n\n**Deliver when you said.** Every time. A supplier who is reliable for six months and then twice unreliable is remembered for the two.\n\n**Warn early.** The moment you know you will be short, tell them. Buyers forgive shortage; they do not forgive surprise.\n\n**Keep grading constant.** The most common way a good supplier loses an account is quietly letting quality slip once the relationship feels secure.\n\n**Invoice properly.** A clear, consistent invoice with your name, date, quantity and price. Small suppliers lose accounts over paperwork far more often than over produce.\n\n**Ask for feedback, once a season.** "Is there anything you would want done differently?" Buyers rarely volunteer it and almost always answer when asked.\n\n**Grow with them.** Once you are reliable on one line, ask what else they struggle to source. That question is how a single delivery turns into a standing account.`,
      },
    ],
  },
  {
    track: 'farm-business',
    title: 'Farm Records and Profitability',
    summary: 'The minimum records worth keeping, and what to do with them.',
    level: 'Beginner',
    lessons: [
      {
        title: 'The four records worth keeping',
        minutes: 5,
        body: `Farm record keeping fails when it is too ambitious. Keep four things and keep them consistently — a notebook is enough.\n\n**1. What went out.** Every expense: date, what, how much. Including cash.\n\n**2. What came in.** Every sale: date, buyer, quantity, price.\n\n**3. What you did and when.** Planting, fertilising, spraying, reaping. Dates and quantities.\n\n**4. What you reaped.** Per block or per field, not farm-wide. Farm-wide totals hide which part of your farm is actually earning.\n\nThat is the whole system. Ten minutes at the end of the day.\n\nAfter one season you can calculate your real cost per pound. After two you can see which crops and which fields make money and which have been quietly subsidised by the rest.`,
      },
      {
        title: 'Reading your own numbers',
        minutes: 6,
        body: `Records are only useful if you sit down with them.\n\n**Once a season**, work out for each crop: total cost, total revenue, and the difference. Some crops you assumed were carrying the farm will turn out to be breaking even.\n\n**Look at cost per pound over time.** If it is rising, find out which input moved.\n\n**Look at your buyers.** Which ones pay on time, buy consistently, and take the volume they said they would? That is where your attention should go next season.\n\n**Look at your losses.** How much did not sell, and why — quality, timing, no buyer? Each cause has a different fix.\n\nThen make one or two decisions for next season and write them down. Records that never change a decision are just paperwork.`,
      },
    ],
  },
  {
    track: 'farm-business',
    title: 'Farm Business Templates & Calculators',
    summary:
      'Downloadable budget, cost and break-even templates, with worked Jamaican examples.',
    level: 'Intermediate',
    access: 'PREMIUM',
    lessons: [
      {
        title: 'Crop cost and break-even calculator',
        minutes: 10,
        access: 'PREMIUM',
        kind: 'DOWNLOAD',
        body: `A worked spreadsheet for calculating cost per pound and break-even quantity for a single crop, with a completed Jamaican example alongside a blank copy.\n\nCovers planting material, land preparation, inputs, labour (including your own), transport and equipment wear, and shows the break-even price and quantity at the bottom.\n\nUse it alongside *Know your cost per pound* in the free **Pricing Your Produce** course, which explains the method this template automates.`,
      },
      {
        title: 'Season budget template',
        minutes: 8,
        access: 'PREMIUM',
        kind: 'DOWNLOAD',
        body: `A month-by-month cash flow for one season: expected costs, expected sales, and the running balance.\n\nThe purpose is to show you the month where you run out of cash — before the season starts, while you can still do something about it. Running out mid-season is what forces farmers to sell early and cheap.`,
      },
      {
        title: 'Supplier pitch and invoice pack',
        minutes: 6,
        access: 'PREMIUM',
        kind: 'DOWNLOAD',
        body: `A one-page supply offer to leave with a chef or produce manager, and a matching invoice template.\n\nSmall suppliers lose institutional accounts over paperwork more often than over produce quality. These are the two documents that prevent it.`,
      },
    ],
  },
  {
    track: 'technology',
    title: 'Irrigation for Small Farms',
    summary: 'Why drip usually wins, what a system costs, and how to size one.',
    level: 'Intermediate',
    lessons: [
      {
        title: 'Choosing an irrigation method',
        minutes: 6,
        body: `**Hose and watering can.** No capital cost, high labour cost, very uneven application. Fine for a garden, limiting for a farm.\n\n**Overhead sprinkler.** Covers area quickly and suits some crops, but wets the leaves — which spreads disease in tomato, pepper and most vegetables — and loses a lot to evaporation in Jamaican heat.\n\n**Drip.** Delivers water slowly to the root zone. Uses substantially less water than the alternatives, keeps leaves dry, applies evenly, and can carry fertiliser through the system. Higher upfront cost, needs filtration, and lines need maintenance.\n\nFor most vegetable production on a small Jamaican farm, drip is the right answer — most decisively where water is scarce or bought, and where the crop is disease-sensitive.\n\nThe question is rarely whether drip is better. It is whether you can fund the system this season or need to stage it field by field.`,
      },
      {
        title: 'Sizing and costing a drip system',
        minutes: 7,
        body: `Four things determine what you need.\n\n**1. Water source and pressure.** Gravity from a tank, or pumped? Pressure decides your layout and whether you need a pump.\n\n**2. Area and crop spacing.** Row length and plant spacing decide drip tape spacing and emitter choice.\n\n**3. Water available per day.** A system that needs more than your source delivers will disappoint you every dry week.\n\n**4. Filtration.** Non-negotiable. Blocked emitters are the most common reason a drip system fails, and they usually fail in the section you check least.\n\n## Costing honestly\n\nCount mainline, tape, filters, fittings, timer or valves, and installation. Then compare against what you currently spend on water and irrigation labour, and what a dry spell costs you in lost crop. On many farms the system pays back inside two seasons — but do the arithmetic for *your* farm rather than accepting that as a rule.\n\nSuppliers who design and install are listed under **Services → Irrigation Services** on AgriLoop. Get more than one quote.`,
      },
    ],
  },
  {
    track: 'technology',
    title: 'Marketing Your Farm Online',
    summary: 'A farm profile, photographs and messages that turn views into buyers.',
    level: 'Beginner',
    lessons: [
      {
        title: 'A farm profile that gets contacted',
        minutes: 6,
        body: `Your AgriLoop farm page is often the first thing a buyer sees. Treat it as your shopfront.\n\n**Say what you actually grow**, specifically. "Tomato, scotch bonnet, sweet pepper, cucumber" tells a buyer more than "vegetables".\n\n**Say where you are.** Parish and community. Buyers filter by distance because transport is a real cost for them.\n\n**Say what you can commit to.** Quantities and frequency. This is what a serious buyer is scanning for.\n\n**Tell your story briefly.** How long you have farmed, how you grow, what you are known for. Buyers choose people, and this is where trust starts.\n\n**Say how to reach you and answer when they do.** The best profile on the platform is worthless if messages go unanswered for a week.\n\n**Get verified.** The Verified Farmer badge measurably increases contact because it reduces the buyer's risk of dealing with a stranger.`,
      },
      {
        title: 'Photographing produce with a phone',
        minutes: 5,
        body: `Better photographs sell more produce, and a phone is enough.\n\n**Natural light, no flash.** Early morning or late afternoon. Harsh midday sun creates hard shadows.\n\n**Plain background.** A crate, a clean table, a cloth. Clutter behind the produce makes it look careless.\n\n**Get close and fill the frame.** Buyers want to see the produce, not the whole field.\n\n**Show it as it will arrive.** Graded and packed the way you deliver. Do not photograph your best three pieces if the box will not look like that.\n\n**Include scale** — a hand, a crate — so size reads correctly.\n\n**Take several angles.** Listings with multiple clear photographs get more contact than listings with one.\n\n**Never use someone else's photograph.** A buyer who receives something that does not match the picture does not come back, and says so publicly.`,
      },
      {
        title: 'Responding to buyers',
        minutes: 5,
        body: `Most lost sales on any marketplace are lost to slow or thin replies.\n\n**Answer quickly.** A buyer messaging three farms usually deals with whoever answers first with a clear reply.\n\n**Answer the actual question.** If they asked about availability, lead with availability.\n\n**Give the numbers.** Quantity, price, unit, when you can deliver. Vague replies produce another round of questions, and some buyers do not bother with the second round.\n\n**Say no clearly when it is no.** "I cannot do 200 lbs weekly, but I can do 80" keeps a relationship alive. Silence ends it.\n\n**Confirm the arrangement in writing** — in the message thread is fine. Quantity, price, date, delivery or collection. It prevents most disputes.\n\n**Follow up after delivery.** "Was that what you needed?" Two minutes, and it is how a single sale becomes a standing order.`,
      },
    ],
  },
  {
    track: 'technology',
    title: 'What AI Can and Cannot Do For Your Farm',
    summary: 'An honest look at agricultural AI — including what AgriLoop has not built yet.',
    level: 'Beginner',
    lessons: [
      {
        title: 'Where AI genuinely helps a farm today',
        minutes: 6,
        body: `AI is discussed constantly in agriculture, much of it overstated. Here is a realistic view.\n\n## Where it is genuinely useful now\n\n- **Drafting.** Writing a listing description, a supply offer or a social post from notes you provide.\n- **Explaining.** Asking what a term means, or how a process works, in plain language.\n- **Arithmetic and organisation.** Working through a budget with you, structuring your records.\n\n## Where it is not reliable\n\n- **Diagnosing a plant or animal from a photograph.** Tools exist and are improving, but confident wrong answers are common, and acting on one costs you a crop.\n- **Local recommendations.** Products, rates and timing are specific to your parish, your soil and what is registered for use in Jamaica. A general model does not know your field.\n- **Prices and demand.** Without real local data it is guessing, and a guess presented confidently is worse than no answer.\n\n## What AgriLoop has built\n\nNothing yet, deliberately. AgriLoop AI is designed and its interface exists, but it is switched off and clearly labelled as unavailable rather than shipped as something that produces plausible-sounding farm advice.\n\nWhen it launches it will be grounded in your own farm records and this Academy's content, and it will say when it does not know. Until that is true, showing you a chat box would be doing you harm.\n\n**For anything affecting a crop or an animal, ask RADA, your extension officer, or a veterinarian.**`,
      },
    ],
  },
];

export type SeededAcademy = {
  tracks: AcademyTrack[];
  courses: AcademyCourse[];
  lessons: Lesson[];
};

export function seedAcademy(): SeededAcademy {
  const tracks: AcademyTrack[] = TRACKS.map(([name, icon, description], index) => ({
    id: `track_${slugify(name)}`,
    name,
    slug: slugify(name),
    description,
    icon,
    sortOrder: index,
  }));

  const courses: AcademyCourse[] = [];
  const lessons: Lesson[] = [];

  COURSES.forEach((seed, courseIndex) => {
    const courseId = `course_${slugify(seed.title)}`;
    const totalMinutes = seed.lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

    courses.push({
      id: courseId,
      trackId: `track_${seed.track}`,
      title: seed.title,
      slug: slugify(seed.title),
      summary: seed.summary,
      access: seed.access ?? 'FREE',
      level: seed.level,
      estimatedMinutes: totalMinutes,
      countryCode: 'JM',
      relatedCategoryId: seed.relatedCategory ? `cat_${seed.relatedCategory}` : undefined,
      isPublished: true,
      sortOrder: courseIndex,
      isDemoData: true,
    });

    seed.lessons.forEach((lesson, lessonIndex) => {
      lessons.push({
        id: `lesson_${courseId}_${lessonIndex + 1}`,
        courseId,
        title: lesson.title,
        slug: slugify(lesson.title),
        kind: lesson.kind ?? 'ARTICLE',
        access: lesson.access ?? seed.access ?? 'FREE',
        body: lesson.body,
        resourceUrls: [],
        minutes: lesson.minutes,
        sortOrder: lessonIndex,
        isDemoData: true,
      });
    });
  });

  return { tracks, courses, lessons };
}
