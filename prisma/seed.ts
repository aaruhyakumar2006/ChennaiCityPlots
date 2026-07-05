import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const EXT = [
  "1564013799919-ab600027ffc6", "1600596542815-ffad4c1539a9", "1600585154340-be6161a56a0c",
  "1512917774080-9991f1c4c750", "1570129477492-45c003edd2be", "1599427303058-f04cbcf4756f",
  "1580587771525-78b9dba3b914", "1605146769289-440113cc3d00",
];
const INT = ["1556911220-e15b29be8c8f", "1556909114-f6e7ad7d3136", "1620626011761-996317b8d101", "1584622650111-993a426fbf0a"];
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?w=1200&q=80&auto=format&fit=crop`;

const LOCATIONS = [
  "OMR, Chennai", "ECR, Chennai", "Porur, Chennai", "Velachery, Chennai", "Anna Nagar, Chennai",
  "Tambaram, Chennai", "Sholinganallur, Chennai", "Guindy, Chennai", "Perumbakkam, Chennai", "Thoraipakkam, Chennai",
];
const NAMES = [
  "Emerald County", "Lakeview Residency", "Palm Grove Enclave", "Sapphire Heights", "Orchid Meadows",
  "The Crestwood", "Silver Oak Towers", "Maple Terrace", "Royal Pearl Residency", "Coral Bay Homes",
  "Golden Acres", "Hillcrest Gardens",
];
const AMENITIES = ["Power Backup", "24x7 Security", "Underground Drainage", "Tar Roads", "Clubhouse", "Water Supply", "Street Lighting", "Kids Play Area"];
const NEARBY_OPTIONS: [string, string][] = [
  ["Apollo Hospital", "Hospital"], ["DAV Public School", "School"], ["Phoenix Marketcity", "Shopping"],
  ["OMR Metro Station", "Metro"], ["GST Road Highway Access", "Highway"], ["Ascendas IT Park", "Tech Park"],
  ["SRM Hospital", "Hospital"], ["Global Public School", "School"],
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

async function main() {
  console.log("Seeding admin user…");
  const passwordHash = await bcrypt.hash("changeme123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@prabhadhivyahomes.in" },
    update: {},
    create: { email: "admin@prabhadhivyahomes.in", password: passwordHash, name: "Super Admin" },
  });

  console.log("Clearing existing properties…");
  await prisma.lead.deleteMany();
  await prisma.siteVisit.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.document.deleteMany();
  await prisma.nearbyPlace.deleteMany();
  await prisma.propertyVideo.deleteMany();
  await prisma.property.deleteMany();

  console.log("Seeding properties…");
  const createdProperties = [];

  for (let i = 0; i < NAMES.length; i++) {
    const isCommercial = i % 5 === 0;
    const isReady = i % 3 !== 0;
    const price = 4_500_000 + i * 1_350_000 + (i % 4) * 275_000;
    const name = `Prabhadhivya ${NAMES[i]}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const location = LOCATIONS[i % LOCATIONS.length];

    const property = await prisma.property.create({
      data: {
        propertyId: `PH-${1001 + i}`,
        name,
        slug,
        type: isCommercial ? "COMMERCIAL" : "RESIDENTIAL",
        status: isReady ? "READY_TO_MOVE" : "UNDER_CONSTRUCTION",
        location,
        price,
        areaMin: 900 + i * 60,
        areaMax: 1450 + i * 70,
        plotSizeSqft: 1800 + i * 120,
        facing: ["East", "North", "West", "North-East", "South"][i % 5],
        dimensions: `${28 + (i % 5) * 2} x ${60 + (i % 6) * 5} ft`,
        approvalStatus: "DTCP & RERA Approved",
        reraNumber: `TN/${29 + i}/0${100 + i * 3}`,
        availableUnits: 6 + ((i * 3) % 30),
        configuration: isCommercial ? "Office / Retail Units" : ["2 BHK", "2 & 3 BHK", "3 BHK", "3 & 4 BHK"][i % 4],
        description: `${name} is a thoughtfully planned ${isCommercial ? "commercial development" : "residential community"} in ${location}, designed for everyday comfort and long-term value. Wide internal roads, dedicated green belts and a transparent approval trail make this a dependable choice for end-use or investment.`,
        amenities: shuffle(AMENITIES).slice(0, 6),
        featured: i < 6,
        views: 180 + ((i * 97) % 2200),
        seoTitle: `${name} — ${location} | Prabhadhivya Homes`,
        seoDescription: `${isCommercial ? "Commercial" : "Residential"} property in ${location}. DTCP & RERA approved.`,
        images: {
          create: [
            { url: unsplash(EXT[i % EXT.length]), order: 0 },
            { url: unsplash(EXT[(i + 2) % EXT.length]), order: 1 },
            { url: unsplash(EXT[(i + 4) % EXT.length]), order: 2 },
            { url: unsplash(INT[i % INT.length]), order: 3 },
            { url: unsplash(INT[(i + 1) % INT.length]), order: 4 },
          ],
        },
        documents: {
          create: [
            { name: "Brochure.pdf", url: "#", type: "brochure" },
            { name: "DTCP Approval.pdf", url: "#", type: "dtcp" },
            { name: "RERA Certificate.pdf", url: "#", type: "rera" },
            { name: "Site Layout.pdf", url: "#", type: "layout" },
          ],
        },
        nearby: {
          create: shuffle(NEARBY_OPTIONS).slice(0, 5).map(([place, category]) => ({
            name: place,
            category,
            distanceKm: Number((0.4 + Math.random() * 4.2).toFixed(1)),
          })),
        },
      },
    });
    createdProperties.push(property);
  }

  console.log(`Created ${createdProperties.length} properties.`);

  console.log("Seeding sample leads and site visits…");
  await prisma.lead.createMany({
    data: [
      { name: "Karthik R", mobile: "9840012345", email: "karthik.r@example.com", propertyId: createdProperties[2].id, status: "NEW", notes: "Asked for floor plan" },
      { name: "Divya S", mobile: "9940098765", email: "divya.s@example.com", propertyId: createdProperties[0].id, status: "CONTACTED", notes: "Prefers East facing unit" },
      { name: "Mohammed Faiz", mobile: "9176054321", email: "faiz.m@example.com", propertyId: createdProperties[6].id, status: "NEGOTIATION", notes: "Comparing with 2 other projects" },
    ],
  });

  console.log("Seeding sample site visits…");
  await prisma.siteVisit.create({ data: { name: "Karthik R", date: new Date("2026-06-23"), timeSlot: "11:00 AM", status: "PENDING", propertyId: createdProperties[2].id } });
  await prisma.siteVisit.create({ data: { name: "Divya S", date: new Date("2026-06-21"), timeSlot: "4:30 PM", status: "APPROVED", propertyId: createdProperties[0].id } });
  await prisma.siteVisit.create({ data: { name: "Sneha P", date: new Date("2026-06-15"), timeSlot: "10:00 AM", status: "COMPLETED", propertyId: createdProperties[4].id } });
  await prisma.siteVisit.create({ data: { name: "Arvind K", date: new Date("2026-06-14"), timeSlot: "2:00 PM", status: "CANCELLED", propertyId: createdProperties[1].id } });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
