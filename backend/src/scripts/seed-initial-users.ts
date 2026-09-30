import { connectDB } from "../config/db";
import { User, UserRole } from "../models";

async function seedInitialUsers() {
  console.log("Connecting to MongoDB Atlas...");
  await connectDB();

  const usersToSeed = [
    {
      name: "Rawasin Executive",
      email: "admin@rawasin.sa",
      phone: "+201000000001",
      password: "AdminPassword123!",
      role: UserRole.ADMIN,
    },
    {
      name: "Sales Director",
      email: "manager@rawasin.sa",
      phone: "+201000000002",
      password: "ManagerPassword123!",
      role: UserRole.MANAGER,
    },
    {
      name: "Tarek Al-Mansoor",
      email: "sales@rawasin.sa",
      phone: "+201000000003",
      password: "SalesPassword123!",
      role: UserRole.SALES,
    },
  ];

  for (const item of usersToSeed) {
    const existing = await User.findOne({ email: item.email });
    if (!existing) {
      await User.create(item);
      console.log(`✅ Seeded user: ${item.name} (${item.email}) [${item.role}]`);
    } else {
      console.log(`ℹ️ User already exists: ${item.email}`);
    }
  }

  console.log("\nAll initial staff accounts are verified and ready for login!");
  process.exit(0);
}

seedInitialUsers().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
