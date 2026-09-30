import { connectDB } from "../config/db";
import { User, UserRole, Project, ProjectStatus } from "../models";

async function run() {
  console.log("Connecting to MongoDB...");
  const conn = await connectDB();

  // Test 1: User password hashing & comparison
  const testUser = new User({
    name: "Engineering Test",
    email: `test_${Date.now()}@rawasin.sa`,
    phone: "+201000000000",
    password: "SecurePassword123!",
    role: UserRole.ADMIN,
  });

  await testUser.save();
  console.log("User created with ID:", testUser._id);

  const isMatch = await testUser.comparePassword("SecurePassword123!");
  const isWrong = await testUser.comparePassword("WrongPassword");

  console.log("Password match check (true expected):", isMatch);
  console.log("Password wrong check (false expected):", isWrong);

  // Test 2: Project auto-slug generation
  const testProject = new Project({
    name: { en: "Rawasin New Cairo", ar: "رواسن القاهرة الجديدة" },
    description: { en: "Boutique residential compound in New Cairo", ar: "كمبوند سكني راقي بالقاهرة الجديدة" },
    location: { address: "South 90th Street", city: "New Cairo", governorate: "Cairo" },
    coverImage: "https://res.cloudinary.com/test/image/upload/sample.jpg",
    startingPrice: 8500000,
    status: ProjectStatus.UNDER_CONSTRUCTION,
  });

  await testProject.save();
  console.log("Project created with generated slug:", testProject.slug);

  // Clean up
  await User.findByIdAndDelete(testUser._id);
  await Project.findByIdAndDelete(testProject._id);
  console.log("Cleaned up test documents successfully.");

  await conn.disconnect();

  if (isMatch && !isWrong && testProject.slug === "rawasin-new-cairo") {
    console.log("✅ ALL MODEL TESTS PASSED SUCCESSFULLY");
    process.exit(0);
  } else {
    console.error("❌ MODEL TEST VERIFICATION FAILED");
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
