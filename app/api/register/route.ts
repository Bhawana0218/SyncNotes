import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const { name, email, password } = body;

        if (!name || !email || !password) {
            return Response.json(
                { error: "Missing fields" },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (existingUser) {
            return Response.json(
                { error: "User already exists" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return Response.json(user);
    } catch {
        return Response.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}