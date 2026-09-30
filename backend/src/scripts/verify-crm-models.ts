import { connectDB } from "../config/db";
import {
  FollowUp,
  FollowUpStatus,
  FollowUpType,
  IUnitDocument,
  Lead,
  LeadSource,
  LeadStatus,
  Project,
  ProjectStatus,
  Unit,
  UnitStatus,
  UnitType,
  User,
  UserRole,
} from "../models";

async function verifyCRMModels() {
  console.log("Connecting to MongoDB Atlas...");
  const conn = await connectDB();

  // 1. Create a Project
  const testProject = await Project.create({
    name: { en: "Rawasin Signature Heights", ar: "أبراج رواسن سيجنتشر" },
    description: { en: "Premier residential towers", ar: "أبراج سكنية متميزة" },
    location: { address: "El Teseen Road", city: "New Cairo", governorate: "Cairo" },
    coverImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    startingPrice: 5400000,
    status: ProjectStatus.UNDER_CONSTRUCTION,
  });
  console.log("✅ Project created:", testProject.slug);

  // 2. Create a Unit under Project
  const testUnit = await Unit.create({
    projectId: testProject._id,
    unitNumber: "T1-1402",
    type: UnitType.PENTHOUSE,
    area: 285,
    bedrooms: 4,
    bathrooms: 4,
    floor: 14,
    price: 9800000,
    status: UnitStatus.AVAILABLE,
    features: ["Panoramic View", "Private Terrace"],
  });
  console.log("✅ Unit created:", testUnit.unitNumber, "(Type:", testUnit.type, ")");

  // 3. Test Compound Unique Constraint on Unit: duplicate unitNumber in same project must fail
  await Unit.init(); // Wait for Mongoose to build indexes on Atlas
  let duplicatePrevented = false;
  try {
    await Unit.create({
      projectId: testProject._id,
      unitNumber: "T1-1402", // Same unit number
      type: UnitType.APARTMENT,
      area: 120,
      price: 3500000,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      duplicatePrevented = true;
      console.log("✅ Compound unique index correctly prevented duplicate unitNumber in the same project");
    }
  }

  // 4. Create a Sales User
  const testAgent = await User.create({
    name: "Ahmed Mostafa",
    email: `agent_${Date.now()}@rawasin.sa`,
    phone: "+201099887766",
    password: "AgentSecurePass123!",
    role: UserRole.SALES,
  });
  console.log("✅ Sales Agent created:", testAgent.name);

  // 5. Create a Lead linked to Project & Unit and assigned to Sales Agent
  const testLead = await Lead.create({
    name: "Dr. Khaled Mansour",
    phone: "+201223344556",
    email: "dr.khaled@example.com",
    projectId: testProject._id,
    unitId: testUnit._id,
    budget: 10000000,
    source: LeadSource.WEBSITE_INQUIRY,
    status: LeadStatus.INTERESTED,
    assignedTo: testAgent._id,
    notes: [
      {
        content: "Inquired about penthouse payment plans over 7 years.",
        createdBy: testAgent._id,
        createdAt: new Date(),
      },
    ],
  });
  console.log("✅ Lead created with note:", testLead.name, "(Status:", testLead.status, ")");

  // 6. Schedule a FollowUp
  const testFollowUp = await FollowUp.create({
    leadId: testLead._id,
    assignedTo: testAgent._id,
    scheduledDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    type: FollowUpType.SITE_VISIT,
    notes: "Client requested accompanied site tour of penthouse floor 14.",
    status: FollowUpStatus.PENDING,
  });
  console.log("✅ FollowUp scheduled:", testFollowUp.type, "on", testFollowUp.scheduledDate.toISOString());

  // 7. Cleanup test documents
  await FollowUp.findByIdAndDelete(testFollowUp._id);
  await Lead.findByIdAndDelete(testLead._id);
  await Unit.findByIdAndDelete(testUnit._id);
  await Project.findByIdAndDelete(testProject._id);
  await User.findByIdAndDelete(testAgent._id);
  console.log("🧹 All test documents cleaned up successfully.");

  await conn.disconnect();

  if (duplicatePrevented) {
    console.log("🎉 ALL CRM & INVENTORY MODEL TESTS PASSED WITH 100% INTEGRITY");
    process.exit(0);
  } else {
    console.error("❌ Unique constraint check failed");
    process.exit(1);
  }
}

verifyCRMModels().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
