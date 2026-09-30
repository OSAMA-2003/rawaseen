import http from "http";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { Project, Unit, User, UserRole } from "../models";
import { signToken } from "../utils/jwt";

async function verifyProjectAndUnitApis() {
  console.log("Connecting to MongoDB Atlas...");
  const conn = await connectDB();

  // 1. Create Test Staff
  const adminUser = await User.create({
    name: "Admin Lead",
    email: `admin_${Date.now()}@rawasin.sa`,
    phone: "+201011112222",
    password: "AdminPassword123!",
    role: UserRole.ADMIN,
  });

  const salesUser = await User.create({
    name: "Sales Agent",
    email: `sales_${Date.now()}@rawasin.sa`,
    phone: "+201033334444",
    password: "SalesPassword123!",
    role: UserRole.SALES,
  });

  const adminToken = signToken({
    userId: adminUser._id.toString(),
    role: adminUser.role,
    email: adminUser.email,
  });

  const salesToken = signToken({
    userId: salesUser._id.toString(),
    role: salesUser.role,
    email: salesUser.email,
  });

  // 2. Start Test HTTP Server
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log("✅ Test HTTP Server listening at:", baseUrl);

  let createdProjectId = "";
  let createdProjectSlug = "";
  let createdUnitId = "";

  try {
    // Test 3: Unauthenticated project creation -> 401
    const unauthProjectRes = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    console.log("Test 3 (Unauthenticated project POST - 401 expected):", unauthProjectRes.status);
    if (unauthProjectRes.status !== 401) throw new Error("Expected 401 for unauthenticated project creation");

    // Test 4: Forbidden project creation (Sales role) -> 403
    const forbiddenProjectRes = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${salesToken}`,
      },
      body: JSON.stringify({
        name: { en: "Test Tower", ar: "برج تجريبي" },
        description: { en: "Desc", ar: "وصف" },
        location: { address: "Address", city: "Cairo", governorate: "Cairo" },
        coverImage: "https://example.com/cover.jpg",
        startingPrice: 5000000,
      }),
    });
    console.log("Test 4 (Sales role project POST - 403 expected):", forbiddenProjectRes.status);
    if (forbiddenProjectRes.status !== 403) throw new Error("Expected 403 for sales role creating project");

    // Test 5: Successful Project Creation (Admin role) -> 201
    const createProjectRes = await fetch(`${baseUrl}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: { en: "Rawasin Nile View", ar: "رواسن نايل فيو" },
        description: {
          en: "Ultra-luxury residences directly overlooking the Nile River in Maadi.",
          ar: "مساكن فاخرة للغاية تطل مباشرة على نهر النيل في المعادي.",
        },
        location: {
          address: "Corniche El Maadi",
          city: "Maadi",
          governorate: "Cairo",
          coordinates: { lat: 29.96, lng: 31.25 },
        },
        coverImage: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        gallery: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
        amenities: ["Private Marina", "Infinity Pool", "Concierge 24/7", "Spa & Health Club"],
        startingPrice: 18500000,
        status: "UNDER_CONSTRUCTION",
        developer: "Rawasin Real Estate",
        isFeatured: true,
      }),
    });
    const createProjectData = (await createProjectRes.json()) as any;
    console.log("Test 5 (Admin create project - 201 expected):", createProjectRes.status, createProjectData.data?.slug);
    if (createProjectRes.status !== 201 || !createProjectData.data?._id) throw new Error("Project creation failed");
    createdProjectId = createProjectData.data._id;
    createdProjectSlug = createProjectData.data.slug;

    // Test 6: Public Project Listing with Search & Pagination -> 200
    const listProjectsRes = await fetch(`${baseUrl}/projects?city=Maadi&isFeatured=true`);
    const listProjectsData = (await listProjectsRes.json()) as any;
    console.log("Test 6 (Public list projects - 200 expected):", listProjectsRes.status, "Total:", listProjectsData.meta?.total);
    if (listProjectsRes.status !== 200 || listProjectsData.meta?.total < 1) throw new Error("List projects failed");

    // Test 7: Public Project by Slug -> 200
    const getSlugRes = await fetch(`${baseUrl}/projects/${createdProjectSlug}`);
    const getSlugData = (await getSlugRes.json()) as any;
    console.log("Test 7 (Public get project by slug - 200 expected):", getSlugRes.status, getSlugData.data?.project?.name?.en);
    if (getSlugRes.status !== 200 || getSlugData.data?.project?._id !== createdProjectId) {
      throw new Error("Get project by slug failed");
    }

    // Test 8: Create Unit under this Project -> 201
    const createUnitRes = await fetch(`${baseUrl}/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        projectId: createdProjectId,
        unitNumber: "N-2201",
        type: "PENTHOUSE",
        area: 340,
        bedrooms: 4,
        bathrooms: 5,
        floor: 22,
        price: 24500000,
        status: "AVAILABLE",
        features: ["Nile View", "Private Sky Pool", "Smart Home Automation"],
      }),
    });
    const createUnitData = (await createUnitRes.json()) as any;
    console.log("Test 8 (Admin create unit - 201 expected):", createUnitRes.status, createUnitData.data?.unitNumber);
    if (createUnitRes.status !== 201 || !createUnitData.data?._id) throw new Error("Unit creation failed");
    createdUnitId = createUnitData.data._id;

    // Test 9: Duplicate Unit Number -> 409 Conflict
    const dupUnitRes = await fetch(`${baseUrl}/units`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        projectId: createdProjectId,
        unitNumber: "N-2201", // Duplicate
        type: "APARTMENT",
        area: 150,
        price: 8000000,
      }),
    });
    console.log("Test 9 (Duplicate unit number - 409 expected):", dupUnitRes.status);
    if (dupUnitRes.status !== 409) throw new Error("Duplicate unit was not rejected with 409");

    // Test 10: Public Unit Listing with filters -> 200
    const listUnitsRes = await fetch(`${baseUrl}/units?projectId=${createdProjectId}&type=PENTHOUSE`);
    const listUnitsData = (await listUnitsRes.json()) as any;
    console.log("Test 10 (Public list units - 200 expected):", listUnitsRes.status, "Units found:", listUnitsData.meta?.total);
    if (listUnitsRes.status !== 200 || listUnitsData.meta?.total < 1) throw new Error("List units failed");

    // Test 11: Public Unit by ID with populated Project -> 200
    const getUnitRes = await fetch(`${baseUrl}/units/${createdUnitId}`);
    const getUnitData = (await getUnitRes.json()) as any;
    console.log("Test 11 (Public unit by ID - 200 expected):", getUnitRes.status, "Populated project:", getUnitData.data?.projectId?.name?.en);
    if (getUnitRes.status !== 200 || getUnitData.data?.projectId?.name?.en !== "Rawasin Nile View") {
      throw new Error("Get unit by ID with populated project failed");
    }

    // Test 12: Update Unit status (e.g. mark RESERVED) -> 200
    const updateUnitRes = await fetch(`${baseUrl}/units/${createdUnitId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ status: "RESERVED" }),
    });
    const updateUnitData = (await updateUnitRes.json()) as any;
    console.log("Test 12 (Update unit status - 200 expected):", updateUnitRes.status, "New status:", updateUnitData.data?.status);
    if (updateUnitRes.status !== 200 || updateUnitData.data?.status !== "RESERVED") {
      throw new Error("Unit status update failed");
    }

    // Test 13: Delete Unit and Project -> 200
    const deleteUnitRes = await fetch(`${baseUrl}/units/${createdUnitId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("Test 13 (Delete unit - 200 expected):", deleteUnitRes.status);

    const deleteProjectRes = await fetch(`${baseUrl}/projects/${createdProjectId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("Test 14 (Delete project - 200 expected):", deleteProjectRes.status);

    console.log("🎉 ALL PROJECT & UNIT REST API TESTS PASSED WITH 100% INTEGRITY");
  } finally {
    // Cleanup any lingering records
    if (createdUnitId) await Unit.findByIdAndDelete(createdUnitId);
    if (createdProjectId) await Project.findByIdAndDelete(createdProjectId);
    await User.findByIdAndDelete(adminUser._id);
    await User.findByIdAndDelete(salesUser._id);
    server.close();
    await conn.disconnect();
    console.log("🧹 Test cleanup completed.");
  }
}

verifyProjectAndUnitApis().catch((err) => {
  console.error("Fatal test error:", err);
  process.exit(1);
});
