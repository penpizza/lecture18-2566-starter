import { DB } from "@/app/libs/DB";
import { NextResponse } from "next/server";
import  jwt  from "jsonwebtoken";

//POST /api/user/login
export const POST = async (request) => {
  const body = await request.json();
  const { username, password } = body;
  
  //skipping validation

  const user = DB.users.find(
    (user) => user.username  === username && user.password === password
  );

  if(!user){ 
    return NextResponse.json(
    {
      ok: false,
      message: "Username or password is incorrect",
    },
    { status: 400 }
  );}

  const token = jwt.sign(
    {
      username,
      role: user.role,
      studentId: user.studentId
    },
    process.env.JWT_SECRET,
    {expiresIn : "8h"}
  )
  return NextResponse.json({ ok: true, token });
};
