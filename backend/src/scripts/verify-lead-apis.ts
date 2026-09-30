import http from "http";
import { createApp } from "../app";
import { connectDB } from "../config/db";
import { FollowUp, Lead, LeadSource, LeadStatus, Project, ProjectStatus, User, UserRole } from "../models";
import { signToken } from "../utils/jwt";

async function verifyLeadAndFollowUpApis() {
  console.log("Connecting to MongoDB Atlas...");
  await connectDB();

  // 1. Create Test Staff Users
  const timestamp = Date.now();
  const adminUser = await User.create({
    name: "CRM Admin",
    email: `crm_admin_${timestamp}@rawasin.sa`,
    phone: "+201099990001",
    password: "AdminPassword123!",
    role: UserRole.ADMIN,
  });

  const salesUser1 = await User.create({
    name: "Ahmed Sales",
    email: `sales_ahmed_${timestamp}@rawasin.sa`,
    phone: "+201099990002",
    password: "SalesPassword123!",
    role: UserRole.SALES,
  });

  const salesUser2 = await User.create({
    name: "Sara Sales",
    email: `sales_sara_${timestamp}@rawasin.sa`,
    phone: "+201099990003",
    password: "SalesPassword123!",
    role: UserRole.SALES,
  });

  // Create dummy test project
  const testProject = await Project.create({
    name: { en: "Rawasin Prime Tower", ar: "برج رواسن برايم" },
    slug: `rawasin-prime-${timestamp}`,
    description: { en: "Luxury development", ar: "مشروع فاخر" },
    location: {
      address: "New Cairo",
      city: "Cairo",
      governorate: "Cairo",
    },
    coverImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
    startingPrice: 5000000,
    status: ProjectStatus.UNDER_CONSTRUCTION,
  });

  const adminToken = signToken({
    userId: adminUser._id.toString(),
    role: adminUser.role,
    email: adminUser.email,
  });

  const sales1Token = signToken({
    userId: salesUser1._id.toString(),
    role: salesUser1.role,
    email: salesUser1.email,
  });

  const sales2Token = signToken({
    userId: salesUser2._id.toString(),
    role: salesUser2.role,
    email: salesUser2.email,
  });

  // 2. Start Test HTTP Server
  const app = createApp();
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as any;
  const baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
  console.log("✅ Test HTTP Server listening at:", baseUrl);

  let publicLeadId = "";
  let leadAId = "";
  let leadBId = "";
  let followUpId = "";

  try {
    // TEST 1: Public Lead Submission (No authentication required)
    console.log("\n--- TEST 1: Public Lead Inquiry (POST /leads/public) ---");
    const publicInquiryRes = await fetch(`${baseUrl}/leads/public`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Omar Client",
        phone: "+201001234567",
        email: "omar.client@gmail.com",
        projectId: testProject._id.toString(),
        budget: 6500000,
        message: "Interested in a 3-bedroom unit with direct skyline view",
      }),
    });
    const publicData = (await publicInquiryRes.json()) as any;
    console.log("Public inquiry status:", publicInquiryRes.status);
    console.log("Lead created:", publicData.data?.name, "Source:", publicData.data?.source);
    if (publicInquiryRes.status !== 201) throw new Error("Public inquiry failed");
    if (publicData.data.source !== LeadSource.WEBSITE_INQUIRY) throw new Error("Expected WEBSITE_INQUIRY source");
    if (publicData.data.notes.length !== 1) throw new Error("Expected initial inquiry message to be saved as note");
    publicLeadId = publicData.data._id;

    // TEST 2: Authentication Guard on Staff Lead Endpoints
    console.log("\n--- TEST 2: Unauthenticated Access Guard ---");
    const unauthRes = await fetch(`${baseUrl}/leads`);
    console.log("Unauthenticated GET /leads status (401 expected):", unauthRes.status);
    if (unauthRes.status !== 401) throw new Error("Expected 401 for unauthenticated lead access");

    // TEST 3: Staff Lead Creation & Auto-Assignment for Sales
    console.log("\n--- TEST 3: Staff Lead Creation ---");
    // Lead A created by Sales 1 (defaults to assigned to Sales 1)
    const leadARes = await fetch(`${baseUrl}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        name: "Khaled VIP",
        phone: "+201112223344",
        source: LeadSource.DIRECT_CALL,
        budget: 8000000,
        initialNote: "Met at Rawasin sales center, looking for duplex",
      }),
    });
    const leadAData = (await leadARes.json()) as any;
    console.log("Lead A created by Sales 1:", leadAData.data?.name, "AssignedTo:", leadAData.data?.assignedTo);
    if (leadARes.status !== 201) throw new Error("Failed to create Lead A");
    if (leadAData.data.assignedTo !== salesUser1._id.toString()) {
      throw new Error("Expected Lead A to be auto-assigned to Sales 1");
    }
    leadAId = leadAData.data._id;

    // Lead B created by Admin assigned to Sales 2
    const leadBRes = await fetch(`${baseUrl}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: "Mona Investor",
        phone: "+201223334455",
        source: LeadSource.CAMPAIGN,
        assignedTo: salesUser2._id.toString(),
        budget: 12000000,
      }),
    });
    const leadBData = (await leadBRes.json()) as any;
    if (leadBRes.status !== 201) throw new Error("Failed to create Lead B");
    leadBId = leadBData.data._id;

    // TEST 4: Role-Based Access Control (Sales Isolation)
    console.log("\n--- TEST 4: RBAC Isolation for Sales Representatives ---");
    // Sales 1 lists leads -> must NOT see Lead B (assigned to Sales 2)
    const sales1ListRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    const sales1List = (await sales1ListRes.json()) as any;
    console.log("Sales 1 list count:", sales1List.data.length);
    const hasLeadB = sales1List.data.some((l: any) => l._id === leadBId);
    if (hasLeadB) throw new Error("RBAC Failure: Sales 1 was able to view Lead B assigned to Sales 2!");

    // Sales 1 attempts to fetch Lead B by ID -> must receive 403 Forbidden
    const sales1LeadBRes = await fetch(`${baseUrl}/leads/${leadBId}`, {
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    console.log("Sales 1 accessing Lead B (403 expected):", sales1LeadBRes.status);
    if (sales1LeadBRes.status !== 403) throw new Error("Expected 403 Forbidden for cross-sales lead access");

    // Admin lists leads -> must see both Lead A and Lead B
    const adminListRes = await fetch(`${baseUrl}/leads`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminList = (await adminListRes.json()) as any;
    console.log("Admin list count:", adminList.data.length);
    if (adminList.data.length < 2) throw new Error("Expected Admin to view all leads");

    // TEST 5: CRM Kanban Board
    console.log("\n--- TEST 5: CRM Kanban Board ---");
    const kanbanRes = await fetch(`${baseUrl}/leads/kanban`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const kanbanData = (await kanbanRes.json()) as any;
    console.log("Kanban columns available:", Object.keys(kanbanData.data));
    if (!kanbanData.data[LeadStatus.NEW]) throw new Error("Expected NEW column in Kanban");

    // TEST 6: Adding Timeline Notes
    console.log("\n--- TEST 6: Lead Interaction Timeline Notes ---");
    const noteRes = await fetch(`${baseUrl}/leads/${leadAId}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        content: "Completed discovery call. Client prefers delivery by 2027.",
      }),
    });
    const noteData = (await noteRes.json()) as any;
    console.log("Note added, total notes count:", noteData.data?.notes?.length);
    if (noteRes.status !== 200) throw new Error("Failed to add note to lead");
    const lastNote = noteData.data.notes[noteData.data.notes.length - 1];
    if (lastNote.createdBy?.name !== "Ahmed Sales") {
      throw new Error("Expected note createdBy to be populated with Ahmed Sales");
    }

    // TEST 7: Lead Status Progression
    console.log("\n--- TEST 7: Lead Pipeline Status Progression ---");
    const updateLeadRes = await fetch(`${baseUrl}/leads/${leadAId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        status: LeadStatus.INTERESTED,
      }),
    });
    const updateLeadData = (await updateLeadRes.json()) as any;
    console.log("Lead A updated status:", updateLeadData.data?.status);
    if (updateLeadData.data.status !== LeadStatus.INTERESTED) {
      throw new Error("Failed to update lead status to INTERESTED");
    }

    // TEST 8: Scheduling Follow-Up and Synchronizing Lead nextFollowUp
    console.log("\n--- TEST 8: Follow-Up Lifecycle & NextFollowUp Synchronization ---");
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const createFollowUpRes = await fetch(`${baseUrl}/followups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        leadId: leadAId,
        scheduledDate: tomorrow.toISOString(),
        notes: "Follow up regarding mortgage eligibility",
      }),
    });
    const followUpData = (await createFollowUpRes.json()) as any;
    console.log("Follow-up scheduled status:", createFollowUpRes.status);
    if (createFollowUpRes.status !== 201) throw new Error("Failed to schedule follow up");
    followUpId = followUpData.data._id;

    // Check parent Lead A's nextFollowUp
    const refreshedLeadA = await Lead.findById(leadAId);
    console.log("Lead A nextFollowUp timestamp:", refreshedLeadA?.nextFollowUp);
    if (!refreshedLeadA?.nextFollowUp) {
      throw new Error("Expected lead nextFollowUp date to be synchronized");
    }

    // Mark Follow-Up as COMPLETED
    const completeFollowUpRes = await fetch(`${baseUrl}/followups/${followUpId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sales1Token}`,
      },
      body: JSON.stringify({
        status: "COMPLETED",
        outcome: "Client pre-approved for mortgage",
      }),
    });
    const completedData = (await completeFollowUpRes.json()) as any;
    console.log("Follow-up completed status:", completedData.data?.status, "Outcome:", completedData.data?.outcome);
    if (completedData.data.status !== "COMPLETED") throw new Error("Failed to complete follow up");

    // TEST 9: Admin Deletion & Cascading Cleanup
    console.log("\n--- TEST 9: Deletion Authorization & Cascading Cleanup ---");
    // Sales 1 tries to delete -> 403 Forbidden
    const salesDeleteRes = await fetch(`${baseUrl}/leads/${leadAId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${sales1Token}` },
    });
    console.log("Sales delete attempt (403 expected):", salesDeleteRes.status);
    if (salesDeleteRes.status !== 403) throw new Error("Expected 403 for sales deleting lead");

    // Admin deletes Lead A -> 200 OK
    const adminDeleteRes = await fetch(`${baseUrl}/leads/${leadAId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("Admin delete status (200 expected):", adminDeleteRes.status);
    if (adminDeleteRes.status !== 200) throw new Error("Failed to delete lead as admin");

    // Verify cascading cleanup of follow-ups
    const orphanFollowUps = await FollowUp.find({ leadId: leadAId });
    console.log("Orphaned follow-ups count (0 expected):", orphanFollowUps.length);
    if (orphanFollowUps.length !== 0) throw new Error("Expected follow-ups to be cascade-deleted");

    console.log("\n==============================================");
    console.log("🎉 ALL LEAD & FOLLOW-UP REST API TESTS PASSED 100%!");
    console.log("==============================================\n");
  } finally {
    // Cleanup test records
    console.log("Cleaning up test documents from database...");
    await Promise.all([
      User.deleteMany({ email: { $in: [adminUser.email, salesUser1.email, salesUser2.email] } }),
      Project.deleteOne({ _id: testProject._id }),
      Lead.deleteMany({ _id: { $in: [publicLeadId, leadAId, leadBId] } }),
      FollowUp.deleteMany({ _id: followUpId }),
    ]);
    server.close();
    process.exit(0);
  }
}

verifyLeadAndFollowUpApis().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
