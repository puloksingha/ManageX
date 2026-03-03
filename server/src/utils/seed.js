import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";
import Batch from "../models/Batch.js";
import Subject from "../models/Subject.js";
import Assignment from "../models/Assignment.js";
import Submission from "../models/Submission.js";

const seedUsers = [
  {
    key: "admin",
    name: "System Admin",
    email: "admin@college.edu",
    password: "MANAGEX_ADMIN_2026",
    role: "admin",
    department: "Administration",
    emailVerified: true
  },
  {
    key: "deptCse",
    name: "Default Department CSE",
    email: "department.cse@college.edu",
    password: "Department@123",
    role: "department",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "deptEee",
    name: "Default Department EEE",
    email: "department.eee@college.edu",
    password: "Department@123",
    role: "department",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "teacherCse",
    name: "Dr. jaffar iqbal",
    email: "jaffar.iqbal@college.edu",
    password: "Teacher@123",
    role: "teacher",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "teacherEee",
    name: "Prof. Arif Hasan",
    email: "arif.hasan@college.edu",
    password: "Teacher@123",
    role: "teacher",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "studentA",
    name: "Ayesha Khan",
    email: "ayesha.khan@college.edu",
    password: "Student@123",
    role: "student",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "studentB",
    name: "Rafiul Islam",
    email: "rafiul.islam@college.edu",
    password:"Student@123",
    role: "student",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "studentC",
    name: "Nusrat Jahan",
    email: "nusrat.jahan@college.edu",
    password: "Student@123",
    role: "student",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "studentD",
    name: "Tanim Ahmed",
    email: "tanim.ahmed@college.edu",
    password: "Student@123",
    role: "student",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "studentE",
    name: "Rahul Das",
    email: "rahul.das@college.edu",
    password: "Student@123",
    role: "student",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "studentF",
    name: "Pawan Sen",
    email: "pawan.sen@college.edu",
    password: "Student@123",
    role: "student",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "studentG",
    name: "Maya Roy",
    email: "maya.roy@college.edu",
    password: "Student@123",
    role: "student",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "studentH",
    name: "Sourav Dutta",
    email: "sourav.dutta@college.edu",
    password: "Student@123",
    role: "student",
    department: "Electrical Engineering",
    emailVerified: true
  },
  {
    key: "teacherCse2",
    name: "Anika Paul",
    email: "anika.paul@college.edu",
    password: "Teacher@123",
    role: "teacher",
    department: "Computer Science",
    emailVerified: true
  },
  {
    key: "teacherEee2",
    name: "Sanjay Ghosh",
    email: "sanjay.ghosh@college.edu",
    password: "Teacher@123",
    role: "teacher",
    department: "Electrical Engineering",
    emailVerified: true
  }
];

const seedBatches = [
  { key: "cse61", name: "CSE-61", department: "Computer Science" },
  { key: "eee24", name: "EEE-24", department: "Electrical Engineering" }
];

const seedSubjects = [
  {
    key: "algo",
    name: "Algorithm Design",
    department: "Computer Science",
    teacherKey: "teacherCse"
  },
  {
    key: "dbms",
    name: "Database Systems",
    department: "Computer Science",
    teacherKey: "teacherCse"
  },
  {
    key: "circuits",
    name: "Digital Circuits",
    department: "Electrical Engineering",
    teacherKey: "teacherEee"
  }
];

const daysFromNow = (days) => {
  const dt = new Date();
  dt.setDate(dt.getDate() + days);
  return dt;
};

const seedAssignments = [
  {
    key: "algoProject",
    title: "Algorithm Analysis Project",
    description: "Analyze time complexity of divide-and-conquer algorithms.",
    subjectKey: "algo",
    createdByKey: "deptCse",
    batchKey: "cse61",
    dueDate: daysFromNow(7),
    maxMarks: 100,
    attachments: []
  },
  {
    key: "dbLab",
    title: "DBMS Lab Report",
    description: "Design ER diagram and normalize the provided dataset.",
    subjectKey: "dbms",
    createdByKey: "teacherCse",
    batchKey: "cse61",
    dueDate: daysFromNow(-2),
    maxMarks: 50,
    attachments: []
  },
  {
    key: "circuitsQuiz",
    title: "Digital Logic Quiz",
    description: "Submit answers for combinational logic design questions.",
    subjectKey: "circuits",
    createdByKey: "deptEee",
    batchKey: "eee24",
    dueDate: daysFromNow(5),
    maxMarks: 30,
    attachments: []
  }
];

const seedSubmissions = [
  {
    assignmentKey: "algoProject",
    studentKey: "studentA",
    fileUrl: "/uploads/demo-algo-ayesha.pdf",
    notes: "Added recurrence relation proofs.",
    status: "Submitted"
  },
  {
    assignmentKey: "dbLab",
    studentKey: "studentB",
    fileUrl: "/uploads/demo-dbms-rafiul.pdf",
    notes: "Normalization included up to 3NF.",
    status: "Graded",
    marks: 42,
    feedback: "Good work. Improve query optimization section."
  },
  {
    assignmentKey: "dbLab",
    studentKey: "studentA",
    fileUrl: "/uploads/demo-dbms-ayesha.pdf",
    notes: "Late due to internet issue.",
    status: "Late"
  },
  {
    assignmentKey: "circuitsQuiz",
    studentKey: "studentC",
    fileUrl: "/uploads/demo-circuits-nusrat.pdf",
    notes: "Implemented K-map simplification steps.",
    status: "Submitted"
  }
];

const upsertUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email });
  if (!existing) {
    const created = await User.create(payload);
    console.log(`Created user: ${payload.email}`);
    return created;
  }

  existing.name = payload.name;
  existing.role = payload.role;
  existing.department = payload.department;
  existing.emailVerified = true;
  existing.password = payload.password;
  await existing.save();
  console.log(`Updated user: ${payload.email}`);
  return existing;
};

const upsertBatch = async (payload) => {
  const batch = await Batch.findOneAndUpdate(
    { name: payload.name },
    { department: payload.department },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Seeded batch: ${payload.name}`);
  return batch;
};

const upsertSubject = async (payload) => {
  const subject = await Subject.findOneAndUpdate(
    { name: payload.name, department: payload.department },
    { teacher: payload.teacher },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Seeded subject: ${payload.name}`);
  return subject;
};

const upsertAssignment = async (payload) => {
  const assignment = await Assignment.findOneAndUpdate(
    { title: payload.title, batch: payload.batch },
    {
      description: payload.description,
      subject: payload.subject,
      createdBy: payload.createdBy,
      dueDate: payload.dueDate,
      maxMarks: payload.maxMarks,
      attachments: payload.attachments || []
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Seeded assignment: ${payload.title}`);
  return assignment;
};

const upsertSubmission = async (payload) => {
  const update = {
    fileUrl: payload.fileUrl,
    notes: payload.notes || "",
    status: payload.status || "Submitted",
    submittedAt: new Date()
  };

  if (typeof payload.marks !== "undefined") update.marks = payload.marks;
  if (typeof payload.feedback !== "undefined") update.feedback = payload.feedback;

  const submission = await Submission.findOneAndUpdate(
    { assignment: payload.assignment, student: payload.student },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  console.log(`Seeded submission: ${payload.student} -> ${payload.assignment}`);
  return submission;
};

const run = async () => {
  try {
    await connectDB();

    const usersByKey = {};
    for (const payload of seedUsers) {
      usersByKey[payload.key] = await upsertUser({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        department: payload.department,
        emailVerified: payload.emailVerified
      });
    }

    const batchesByKey = {};
    for (const payload of seedBatches) {
      batchesByKey[payload.key] = await upsertBatch(payload);
    }

    const cseStudents = [
      usersByKey.studentA?._id,
      usersByKey.studentB?._id,
      usersByKey.studentE?._id,
      usersByKey.studentF?._id
    ].filter(Boolean);
    const eeeStudents = [
      usersByKey.studentC?._id,
      usersByKey.studentD?._id,
      usersByKey.studentG?._id,
      usersByKey.studentH?._id
    ].filter(Boolean);
    const cseTeachers = [
      usersByKey.deptCse?._id,
      usersByKey.teacherCse?._id,
      usersByKey.teacherCse2?._id
    ].filter(Boolean);
    const eeeTeachers = [
      usersByKey.deptEee?._id,
      usersByKey.teacherEee?._id,
      usersByKey.teacherEee2?._id
    ].filter(Boolean);

    if (batchesByKey.cse61) {
      batchesByKey.cse61.students = cseStudents;
      batchesByKey.cse61.teachers = cseTeachers;
      await batchesByKey.cse61.save();
    }
    if (batchesByKey.eee24) {
      batchesByKey.eee24.students = eeeStudents;
      batchesByKey.eee24.teachers = eeeTeachers;
      await batchesByKey.eee24.save();
    }

    if (usersByKey.studentA) usersByKey.studentA.batch = batchesByKey.cse61?._id;
    if (usersByKey.studentB) usersByKey.studentB.batch = batchesByKey.cse61?._id;
    if (usersByKey.studentE) usersByKey.studentE.batch = batchesByKey.cse61?._id;
    if (usersByKey.studentF) usersByKey.studentF.batch = batchesByKey.cse61?._id;
    if (usersByKey.studentC) usersByKey.studentC.batch = batchesByKey.eee24?._id;
    if (usersByKey.studentD) usersByKey.studentD.batch = batchesByKey.eee24?._id;
    if (usersByKey.studentG) usersByKey.studentG.batch = batchesByKey.eee24?._id;
    if (usersByKey.studentH) usersByKey.studentH.batch = batchesByKey.eee24?._id;

    await Promise.all(
      [
        usersByKey.studentA,
        usersByKey.studentB,
        usersByKey.studentC,
        usersByKey.studentD,
        usersByKey.studentE,
        usersByKey.studentF,
        usersByKey.studentG,
        usersByKey.studentH
      ]
        .filter(Boolean)
        .map((student) => student.save())
    );

    const subjectsByKey = {};
    for (const payload of seedSubjects) {
      subjectsByKey[payload.key] = await upsertSubject({
        name: payload.name,
        department: payload.department,
        teacher: usersByKey[payload.teacherKey]?._id
      });
    }

    const assignmentsByKey = {};
    for (const payload of seedAssignments) {
      assignmentsByKey[payload.key] = await upsertAssignment({
        title: payload.title,
        description: payload.description,
        subject: subjectsByKey[payload.subjectKey]?._id,
        createdBy: usersByKey[payload.createdByKey]?._id,
        batch: batchesByKey[payload.batchKey]?._id,
        dueDate: payload.dueDate,
        maxMarks: payload.maxMarks,
        attachments: payload.attachments
      });
    }

    for (const payload of seedSubmissions) {
      await upsertSubmission({
        assignment: assignmentsByKey[payload.assignmentKey]?._id,
        student: usersByKey[payload.studentKey]?._id,
        fileUrl: payload.fileUrl,
        notes: payload.notes,
        status: payload.status,
        marks: payload.marks,
        feedback: payload.feedback
      });
    }

    const [users, batches, subjects, assignments, submissions] = await Promise.all([
      User.countDocuments(),
      Batch.countDocuments(),
      Subject.countDocuments(),
      Assignment.countDocuments(),
      Submission.countDocuments()
    ]);

    console.log("");
    console.log("Seed completed.");
    console.log(`Users: ${users}`);
    console.log(`Batches: ${batches}`);
    console.log(`Subjects: ${subjects}`);
    console.log(`Assignments: ${assignments}`);
    console.log(`Submissions: ${submissions}`);
  } catch (error) {
    console.error(error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
