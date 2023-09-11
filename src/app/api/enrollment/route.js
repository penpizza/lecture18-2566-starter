import { DB } from "@/app/libs/DB";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const GET = async (request) => {
  const rawAuthHeader = headers().get("authorization");
  //console.log(rawAuthHeader);

  const token = rawAuthHeader.split(" ")[1];
  //spit -> array of string ['Bearer' , '......token']

  let studentId = null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(payload);
    studentId = payload.studentId;
    //console.log(studentId);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }

  const courseNoList = [];
  for (const enroll of DB.enrollments) {
    if (enroll.studentId === studentId) {
      courseNoList.push(enroll.courseNo);
    }
  }
  return NextResponse.json({
    ok: true,
    courseNoList,
  });
};

export const POST = async (request) => {
  const rawAuthHeader = headers().get("authorization");
  //console.log(rawAuthHeader);

  const token = rawAuthHeader.split(" ")[1];
  //spit -> array of string ['Bearer' , '......token']

  let studentId = null;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(payload);
    studentId = payload.studentId;
    //console.log(studentId);
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );
  }
  //read body request
  const body = await request.json();
  const { courseNo } = body;
  if (typeof courseNo !== "string" || courseNo.length !== 6) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo must contain 6 characters",
      },
      { status: 400 }
    );
  }

  //check if courseNo exists
  const foundCourse = DB.courses.find((x) => x.courseNo === courseNo);
  if (!foundCourse) {
    return NextResponse.json(
      {
        ok: false,
        message: "courseNo does not exist",
      },
      { status: 400 }
    );
  }

  //check if student enrolled that course already
  const foundEnroll = DB.enrollments.find(
    (x) => x.studentId === studentId && x.courseNo === courseNo
  );
  if (foundEnroll) {
    return NextResponse.json(
      {
        ok: false,
        message: "You already enrolled that course",
      },
      { status: 400 }
    );
  }

  //if code reach here. Everything is fine.
  //Do the DB saving
  DB.enrollments.push({
    studentId,
    courseNo,
  });

  return NextResponse.json({
    ok: true,
    message: "You has enrolled a course successfully",
  });
};