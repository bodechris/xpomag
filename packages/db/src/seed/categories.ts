import { db } from "../index"
import { categories } from "../schema/onboarding"

const seed = [
  ["Business & Entrepreneurship", "business-entrepreneurship"],
  ["Technology & AI", "technology-ai"],
  ["Design & Creativity", "design-creativity"],
  ["Food & Dining", "food-dining"],
  ["Property & Real Estate", "property-real-estate"],
  ["Health & Wellness", "health-wellness"],
  ["Fashion & Beauty", "fashion-beauty"],
  ["Culture & Entertainment", "culture-entertainment"],
  ["Travel & Hospitality", "travel-hospitality"],
  ["Finance & Investing", "finance-investing"],
  ["Careers & Work", "careers-work"],
  ["Community & Events", "community-events"],
] as const

await db
  .insert(categories)
  .values(seed.map(([name, slug]) => ({ name, slug })))
  .onConflictDoNothing()

console.log("XPOMAG categories seeded.")
