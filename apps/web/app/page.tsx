import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import { Button } from "@repo/ui/components/ui/button";

export default async function IndexPage() {
  const users = await prisma.user.findMany();
  const session = await auth();

  return (
    <div>
      <p className="text-4xl font-bold">Hello World</p>
      <pre>{JSON.stringify(users, null, 2)}</pre>
      <Button variant="default">Click me</Button>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
